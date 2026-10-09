import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createEnquiryHandler, createRateLimiter, sendEmail } from '../server/enquiries.mjs';
const env = {
  ENQUIRY_PROVIDER: 'resend',
  RESEND_API_KEY: 'test-only',
  ENQUIRY_FROM: 'Dipai <forms@example.com>',
};
const base = {
  kind: 'contact',
  name: 'Test Visitor',
  email: 'visitor@example.com',
  message: 'Test enquiry',
  website: '',
};
const req = (data = base, headers = {}) =>
  new Request('https://dipai.no/api/enquiries', {
    method: 'POST',
    headers: { Origin: 'https://dipai.no', 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify({ requestId: randomUUID(), ...data }),
  });

test('unconfigured service refuses delivery and never reports success', async () => {
  let sent = false;
  const h = createEnquiryHandler({
    env: {},
    send: async () => {
      sent = true;
    },
  });
  const r = await h(req());
  assert.equal(r.status, 503);
  assert.equal((await r.json()).ok, false);
  assert.equal(sent, false);
});
test('contact and demo route to fixed recipients, never a supplied destination', async () => {
  const mail = [];
  const h = createEnquiryHandler({ env, send: async (m) => mail.push(m) });
  assert.equal((await h(req({ ...base, to: 'attacker@example.com' }))).status, 200);
  assert.equal(
    (
      await h(
        req({
          ...base,
          kind: 'demo',
          company: 'Example Fleet',
          interest: 'The full platform',
          message: '',
        }),
      )
    ).status,
    200,
  );
  assert.deepEqual(
    mail.map((m) => m.to),
    ['support@dipai.no', 'contact@dipai.no'],
  );
  assert.equal(mail[0].replyTo, base.email);
  assert.match(mail[1].text, /Company: Example Fleet/);
});
test('invalid and malicious fields never reach the mail adapter', async () => {
  let calls = 0;
  const h = createEnquiryHandler({ env, allow: () => true, send: async () => calls++ });
  for (const data of [
    { ...base, email: 'bad' },
    { ...base, name: '\r\nBcc: other@example.com' },
    { ...base, message: ' ' },
    { ...base, kind: 'demo', company: 'Test', interest: 'unknown' },
    { ...base, website: 'bot' },
    { ...base, message: 'x'.repeat(4001) },
    { ...base, email: { value: 'a@b.com' } },
    { ...base, kind: 'other' },
  ])
    assert.equal((await h(req(data))).status, 400);
  assert.equal(calls, 0);
});
test('method, cross-origin, JSON and size boundaries are enforced', async () => {
  const h = createEnquiryHandler({
    env,
    allow: () => true,
    send: async () => assert.fail('must not send'),
  });
  assert.equal((await h(new Request('https://dipai.no/api/enquiries'))).status, 405);
  assert.equal((await h(req(base, { Origin: 'https://elsewhere.example' }))).status, 403);
  assert.equal((await h(req(base, { 'Content-Type': 'text/plain' }))).status, 415);
  assert.equal((await h(req({ ...base, message: 'x'.repeat(17000) }))).status, 413);
  const malformed = new Request('https://dipai.no/api/enquiries', {
    method: 'POST',
    headers: { Origin: 'https://dipai.no', 'Content-Type': 'application/json' },
    body: '{',
  });
  assert.equal((await h(malformed)).status, 400);
});
test('delivery failure is explicit and sensitive provider errors are not returned', async () => {
  const h = createEnquiryHandler({
    env,
    send: async () => {
      throw Error('secret-provider-detail');
    },
  });
  const r = await h(req());
  assert.equal(r.status, 502);
  assert.doesNotMatch(await r.text(), /secret-provider/);
});
test('rate limit stops a burst per client', () => {
  const allow = createRateLimiter();
  for (let i = 0; i < 5; i++) assert.equal(allow('one'), true);
  assert.equal(allow('one'), false);
  assert.equal(allow('two'), true);
});
test('provider uses server credentials, reply-to and stable idempotency key', async () => {
  let sent;
  const mail = {
    id: 'dipai-test',
    to: 'support@dipai.no',
    replyTo: 'visitor@example.com',
    subject: 'Test',
    text: 'Test body',
  };
  await sendEmail(mail, env, async (url, opts) => {
    sent = { url, ...opts };
    return Response.json({ id: 'provider-test' });
  });
  assert.equal(sent.url, 'https://api.resend.com/emails');
  assert.equal(sent.headers['Idempotency-Key'], 'dipai-test');
  assert.equal(JSON.parse(sent.body).reply_to, mail.replyTo);
  assert.equal(JSON.parse(sent.body).from, env.ENQUIRY_FROM);
  await assert.rejects(
    sendEmail(mail, env, async () => Response.json({ error: 'failure' }, { status: 500 })),
  );
});
