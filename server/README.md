# Enquiry endpoint

`enquiries.mjs` is shared by the Netlify Function and the local Node adapter. `http-enquiries.mjs` adapts requests for the Astro dev server and production-build preview. `serve.mjs` serves `dist/`; it is a local verification tool, not required on Netlify.

Delivery is disabled until a provider and verified sender are configured. See [deployment and email configuration](../docs/DEPLOYMENT.md). The root `.env.example` documents the variables. Run `npm test` for isolated validation and delivery-adapter tests; no real messages are sent.
