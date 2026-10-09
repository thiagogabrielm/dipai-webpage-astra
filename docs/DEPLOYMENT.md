# Deploying to Netlify

The site generates static HTML. Netlify runs the build and publishes `dist/`; native Netlify Forms handles contact and demo submissions. An Astro server adapter is unnecessary for this output. See the [Astro Netlify guide](https://docs.astro.build/en/guides/deploy/netlify/).

1. Import `thiagogabrielm/dipai-webpage-astra` from GitHub into Netlify, deploying the `main` branch.
2. Leave the base directory at the repository root. `netlify.toml` supplies the build command (`npm run build`) and publish directory (`dist`).
3. For the testing deployment, set `SITE_INDEXING=disabled` with build scope before publishing. Once Netlify assigns the `https://your-project.netlify.app` address, set `SITE_URL` to that exact origin and redeploy. These values control indexing, canonical URLs and the sitemap; they do not change DNS.
4. Review the temporary Netlify address. Leave `dipai.no` and its DNS unchanged until launch is approved. At launch, connect the custom domain, set `SITE_URL=https://dipai.no`, remove `SITE_INDEXING=disabled`, and redeploy.

Netlify calls the deployment from `main` the **production deploy context**, even while it uses a temporary `netlify.app` address. Use that context for the test project's settings; it is distinct from pull-request deploy previews.

The generated `_redirects` preserves `navy-variant.html`, `index.html`, `dark-variant.html` and all existing main-page/article `.html` URLs. New internal links use clean trailing-slash URLs. A custom 404 page and sitemap are included. There is no SPA catch-all redirect.

## Contact and demo forms

Both forms are present in the static HTML with unique names (`contact` and `demo`), Netlify detection attributes and a `website` honeypot. The shared browser helper sends URL-encoded submissions, retains input on failures and displays the existing confirmation after Netlify accepts the request. Native submission also works without JavaScript.

Complete this setup in the Netlify project dashboard:

1. Open **Forms** and enable **form detection**. Deploy or redeploy after enabling it so Netlify scans the generated HTML. Confirm that `contact` and `demo` appear. See [Netlify Forms setup](https://docs.netlify.com/manage/forms/setup/).
2. Under **Forms → Submission notifications**, add an **Email notification** for all forms, addressed to **thiago.g.monteiro@dipai.no**. Alternatively, add one rule for each form with that same address. An optional test subject is `[TEST] Dipai — %{formName}`. See [notification settings](https://docs.netlify.com/manage/forms/notifications/).
3. Submit a clearly labelled test through each form on the temporary `netlify.app` site. Confirm the entry in Netlify and the notification in the test inbox; check Netlify's spam list if a test is missing.

The visitor's `email` field supplies Reply-To. Netlify manages spam filtering and notifications; no custom Function, Resend account or email API key is needed. If the old `ENQUIRY_PROVIDER`, `RESEND_API_KEY`, `ENQUIRY_FROM` or `SITE_ORIGIN` environment variables were configured, remove them because this build no longer uses them.

Before launch, replace the test notification rule with separate destinations as needed (`contact` to `support@dipai.no`, `demo` to `contact@dipai.no`). Recipient settings stay in Netlify rather than the public HTML. Review stored submissions and retention in the Netlify dashboard.

Code checks do not confirm account configuration or email delivery. Automated tests use mocked responses or rejected local requests; the live test in step 3 remains necessary.

## Local production preview

```sh
npm ci
npm run build
npm run preview
```

Local development and preview reject form submissions with a clear error and send nothing. Test real delivery on Netlify after completing the form setup above. Stop the development server first; both use port 48767 by default. A separate preview can use `PORT=48768 npm run preview`.

## Pre-launch checks

See [Launch readiness](READINESS.md) for cookie storage, the analytics decision, SEO/AI-search metadata, image handling and accessibility checks. During testing, use the temporary Netlify origin for `SITE_URL` and keep `SITE_INDEXING=disabled`. After launch, use `SITE_URL=https://dipai.no` in production and previews so canonical URLs stay consistent. Netlify non-production build contexts are marked noindex automatically. Leave analytics off until the provider and data handling have been selected.
