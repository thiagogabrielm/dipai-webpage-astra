# Local preview servers

`dev-integration.mjs` supplies legacy redirects for the Astro dev server and rejects local form submissions. `serve.mjs` serves `dist/` with redirects and rejects POST requests. These are local verification tools, not required on Netlify. The deployed site uses native Netlify Forms; see [deployment instructions](../docs/DEPLOYMENT.md).

Run `npm test` for isolated form transport checks. Browser tests verify success and failure handling and native submission without JavaScript. These checks do not send real messages.
