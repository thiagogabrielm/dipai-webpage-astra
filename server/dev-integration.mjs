import { serveEnquiry } from './http-enquiries.mjs';
/** Local Astro development uses the same enquiry implementation as production. */
export default function enquiriesIntegration() {
  return {
    name: 'dipai-enquiries',
    hooks: {
      'astro:config:setup': ({ updateConfig }) =>
        updateConfig({
          vite: {
            plugins: [
              {
                name: 'dipai-local-api',
                configureServer(server) {
                  server.middlewares.use(async (req, res, next) => {
                    const url = new URL(req.url, 'http://localhost');
                    if (['/about-us', '/about-us/', '/about-us.html'].includes(url.pathname)) {
                      res.writeHead(301, { Location: '/team/' + url.search });
                      res.end();
                      return;
                    }
                    if (url.pathname === '/api/enquiries') {
                      try {
                        await serveEnquiry(req, res);
                      } catch {
                        res.statusCode = 500;
                        res.end(
                          JSON.stringify({ ok: false, message: 'Unable to send your message.' }),
                        );
                      }
                      return;
                    }
                    if (url.pathname.endsWith('.html')) {
                      const target = [
                        '/navy-variant.html',
                        '/index.html',
                        '/dark-variant.html',
                      ].includes(url.pathname)
                        ? '/'
                        : url.pathname.slice(0, -5) + '/';
                      res.writeHead(301, { Location: target + url.search });
                      res.end();
                      return;
                    }
                    next();
                  });
                },
              },
            ],
          },
        }),
    },
  };
}
