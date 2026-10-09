// Shared handler for Netlify, the VM server and isolated tests. No browser secrets.
export const MAX_BODY_BYTES = 16384;
const interests = new Set([
  'Operations & fuel efficiency',
  'Maintenance decisions',
  'Emissions & SEEMP reporting',
  'The full platform',
]);
const emailPattern = /^[^\s<>@,;]+@[^\s<>@,;]+\.[^\s<>@,;]+$/;
const reply = (status, body, headers = {}) =>
  Response.json(body, { status, headers: { 'Cache-Control': 'no-store', ...headers } });
const error = (status, code, message, headers) =>
  reply(status, { ok: false, code, message }, headers);

export function createRateLimiter() {
  const clients = new Map();
  return (key) => {
    const now = Date.now();
    for (const [id, value] of clients) if (value.until <= now) clients.delete(id);
    if (!clients.has(key)) {
      if (clients.size >= 5000) return false;
      clients.set(key, { count: 0, until: now + 600000 });
    }
    return ++clients.get(key).count <= 5;
  };
}

async function readJson(request) {
  const reader = request.body?.getReader();
  if (!reader) throw new Error('json');
  const chunks = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY_BYTES) {
      await reader.cancel();
      throw new Error('size');
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  return JSON.parse(new TextDecoder().decode(bytes));
}

// Optional first provider; replacing this adapter does not change either form.
export async function sendEmail(message, env, fetcher = fetch) {
  const response = await fetcher('https://api.resend.com/emails', {
    method: 'POST',
    signal: AbortSignal.timeout(12000),
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': message.id,
    },
    body: JSON.stringify({
      from: env.ENQUIRY_FROM,
      to: [message.to],
      reply_to: message.replyTo,
      subject: message.subject,
      text: message.text,
    }),
  });
  if (!response.ok) throw new Error('delivery');
  const result = await response.json();
  if (!result.id) throw new Error('delivery');
}

export function createEnquiryHandler({
  env = process.env,
  send = sendEmail,
  allow = createRateLimiter(),
} = {}) {
  return async (request, clientIp = 'unknown') => {
    if (request.method !== 'POST')
      return error(405, 'method', 'Please use the contact or demo form.', { Allow: 'POST' });
    const origin = request.headers.get('origin');
    const allowedOrigin = env.SITE_ORIGIN || new URL(request.url).origin;
    if (
      !origin ||
      origin !== allowedOrigin ||
      request.headers.get('sec-fetch-site') === 'cross-site'
    )
      return error(403, 'origin', 'Please submit the form from this website.');
    if (request.headers.get('content-type')?.split(';')[0].trim() !== 'application/json')
      return error(415, 'content_type', 'Please submit the form again.');
    if (!allow(clientIp))
      return error(429, 'rate_limit', 'Too many attempts. Please try again in 10 minutes.', {
        'Retry-After': '600',
      });
    let data;
    try {
      data = await readJson(request);
    } catch (e) {
      return error(
        e.message === 'size' ? 413 : 400,
        'invalid_request',
        'Please check your message and try again.',
      );
    }
    if (!data || typeof data !== 'object' || Array.isArray(data))
      return error(400, 'validation', 'Please check your details.');
    if (data.website) return error(400, 'validation', 'Unable to submit this form.');
    const limits = {
      name: 120,
      email: 254,
      company: 160,
      interest: 100,
      message: data.kind === 'demo' ? 2000 : 4000,
    };
    const values = {};
    for (const [field, max] of Object.entries(limits)) {
      if (data[field] !== undefined && typeof data[field] !== 'string')
        return error(400, 'validation', 'Please check your details.');
      const raw = data[field] || '';
      if (raw.length > max || (field !== 'message' && /[\r\n\x00-\x1f\x7f]/.test(raw)))
        return error(400, 'validation', 'Please check your details and message length.');
      values[field] = raw.trim();
    }
    const { name, email, company, interest, message } = values;
    if (
      !['contact', 'demo'].includes(data.kind) ||
      !name ||
      !emailPattern.test(email) ||
      (data.kind === 'contact' && !message) ||
      (data.kind === 'demo' && (!company || !interests.has(interest))) ||
      typeof data.requestId !== 'string' ||
      !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(data.requestId)
    ) {
      return error(
        400,
        'validation',
        'Please complete the required fields with a valid email address.',
      );
    }
    if (
      env.ENQUIRY_PROVIDER !== 'resend' ||
      !env.RESEND_API_KEY ||
      !env.ENQUIRY_FROM ||
      /[\r\n]/.test(env.ENQUIRY_FROM)
    ) {
      return error(
        503,
        'not_configured',
        'Online sending is not enabled yet. Your message has not been sent. Please try again later.',
      );
    }
    const demo = data.kind === 'demo';
    const mail = {
      id: `dipai-${data.requestId}`,
      to: demo ? 'contact@dipai.no' : 'support@dipai.no',
      replyTo: email,
      subject: demo ? `Dipai demo request — ${company}` : `Dipai website enquiry — ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n${demo ? `Company: ${company}\nInterest: ${interest}\n` : ''}\n${message || 'Please contact me to arrange a demo.'}`,
    };
    try {
      await send(mail, env);
    } catch {
      return error(
        502,
        'delivery_failed',
        'We could not confirm sending. Please try again; your details are still here.',
      );
    }
    // The mail provider has accepted the email; this is not an inbox-delivery receipt.
    return reply(200, { ok: true });
  };
}
