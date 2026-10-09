# Deploying to Netlify

The site generates static HTML. Netlify runs the build, publishes `dist/` and separately bundles the enquiry Function. An Astro server adapter is unnecessary for this output. See the [Astro Netlify guide](https://docs.astro.build/en/guides/deploy/netlify/).

1. Put this project in a Git repository and connect it to a Netlify project. This workspace did not have an initialized Git repository at migration time.
2. Leave the base directory at the repository root. `netlify.toml` supplies the build command (`npm run build`), publish directory (`dist`) and Functions directory (`netlify/functions`).
3. Set `SITE_URL` to the final public origin, such as `https://dipai.no`, with build scope. It controls canonical URLs and the sitemap. Configure the custom domain and HTTPS in Netlify when ready.
4. Deploy from the connected repository. Review the preview URL before changing production DNS.

The generated `_redirects` preserves `navy-variant.html`, `index.html`, `dark-variant.html` and all existing main-page/article `.html` URLs. New internal links use clean trailing-slash URLs. A custom 404 page and sitemap are included. There is no SPA catch-all redirect.

## Contact and demo forms

The existing Resend adapter is retained. The Function handles `/api/enquiries`, using Netlify's supported [custom function path](https://docs.netlify.com/build/functions/configuration/#routing). It is not a Netlify Forms submission.

Delivery is disabled until the following variables are set in Netlify's environment-variable settings. Give them Functions scope (or all scopes), with values for the **production deploy context**:

| Variable | Value |
| --- | --- |
| `ENQUIRY_PROVIDER` | `resend` |
| `RESEND_API_KEY` | Your Resend sending key |
| `ENQUIRY_FROM` | A verified sender, for example `Dipai website <forms@dipai.no>` |
| `SITE_ORIGIN` | Exact production origin, with no trailing slash |

Keep `ENQUIRY_PROVIDER=disabled` for deploy-preview and branch-deploy contexts, and do not give those contexts production mail credentials. Runtime Function variables must be set through the Netlify UI/API/CLI; values in `netlify.toml` are only available during the build. [Netlify environment documentation](https://docs.netlify.com/build/functions/environment-variables/).

Contact messages go to `support@dipai.no`, demo requests to `contact@dipai.no`. The sender's email becomes Reply-To. Failures retain the visitor's input and do not show a false confirmation. Requests are validated, include a honeypot and have a per-instance rate limit. That limit is not distributed across Function instances.

No email account, credentials, Netlify project or production deployment was created during migration. Verify real delivery after configuring the provider; automated checks use mocks.

## Local production preview

```sh
npm ci
npm run build
npm run preview
```

To test an explicitly configured local environment, use `node --env-file=.env server/serve.mjs`. The ordinary preview leaves delivery disabled unless variables are supplied. Stop the development server first; both use port 48767 by default. A separate preview can use `PORT=48768 npm run preview`.
