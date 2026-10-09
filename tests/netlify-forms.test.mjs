import { test } from 'node:test';
import assert from 'node:assert/strict';
import { submitEnquiry } from '../src/scripts/enquiry-form.js';

function data(kind) {
  const fields = new FormData();
  fields.set('form-name', kind);
  fields.set('name', 'Åse & Søren');
  fields.set('email', 'visitor+fleet@example.com');
  fields.set('message', 'First line\nFuel & maintenance = better results');
  fields.set('website', '');
  if (kind === 'demo') {
    fields.set('company', 'Test Fleet');
    fields.set('interest', 'Operations & fuel efficiency');
  }
  return fields;
}

test('both forms send URL-encoded data accepted by Netlify, including special characters', async () => {
  for (const kind of ['contact', 'demo']) {
    const fields = data(kind);
    await submitEnquiry(fields, async (url, options) => {
      assert.equal(url, '/');
      assert.equal(options.method, 'POST');
      assert.equal(options.credentials, 'same-origin');
      assert.equal(options.headers['Content-Type'], 'application/x-www-form-urlencoded');
      assert.deepEqual([...new URLSearchParams(options.body)], [...fields]);
      assert.ok(options.signal instanceof AbortSignal);
      // Netlify returns HTML; success must not depend on the old API's JSON body.
      return new Response('<html><body>Thank you</body></html>', { status: 200 });
    });
  }
});

test('unavailable forms, rate limits and provider failures do not report success', async () => {
  for (const [status, message] of [
    [404, /not enabled/],
    [405, /not enabled/],
    [503, /not enabled/],
    [429, /Too many attempts/],
    [500, /could not confirm/],
  ]) {
    await assert.rejects(
      submitEnquiry(data('contact'), async () => new Response('Provider internals', { status })),
      message,
    );
  }
});

test('failed network requests propagate so the form can retain the visitor input', async () => {
  const fields = data('demo');
  const before = [...fields];
  await assert.rejects(
    submitEnquiry(fields, async () => {
      throw new TypeError('Network error');
    }),
    /Network error/,
  );
  assert.deepEqual([...fields], before);
});

test('a filled honeypot is rejected without submitting anything', async () => {
  const fields = data('contact');
  fields.set('website', 'bot value');
  await assert.rejects(
    submitEnquiry(fields, async () => assert.fail('Must not send')),
    /Unable to submit/,
  );
});
