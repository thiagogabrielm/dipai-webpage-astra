import { createEnquiryHandler, MAX_BODY_BYTES } from './enquiries.mjs';
const handle = createEnquiryHandler();
/** Adapt Node's HTTP interface to the same handler used by the Netlify Function. */
export async function serveEnquiry(req, res) {
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) {
      res.writeHead(413, { 'Content-Type': 'application/json', Connection: 'close' });
      res.end(
        JSON.stringify({
          ok: false,
          code: 'invalid_request',
          message: 'Your message is too large.',
        }),
      );
      return;
    }
    chunks.push(chunk);
  }
  const endpoint = `${process.env.SITE_ORIGIN || `http://${req.headers.host}`}/api/enquiries`;
  const request = new Request(endpoint, {
    method: req.method,
    headers: req.headers,
    ...(!['GET', 'HEAD'].includes(req.method) ? { body: Buffer.concat(chunks) } : {}),
  });
  const response = await handle(request, req.socket.remoteAddress);
  res.writeHead(response.status, Object.fromEntries(response.headers));
  res.end(await response.text());
}
