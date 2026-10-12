/** Legacy redirects and an explicit local-only response for hosted Netlify Forms. */
export default function localIntegration() {
  return {
    name: 'dipai-local-preview',
    hooks: {
      'astro:config:setup': ({ updateConfig }) =>
        updateConfig({
          vite: {
            plugins: [
              {
                name: 'dipai-local-preview',
                configureServer(server) {
                  server.middlewares.use(async (req, res, next) => {
                    const url = new URL(req.url, 'http://localhost');
                    if (
                      req.method === 'POST' &&
                      ['/', '/contact/', '/book-demo/'].includes(url.pathname)
                    ) {
                      res.writeHead(503, {
                        'Content-Type': 'text/plain; charset=utf-8',
                        'Cache-Control': 'no-store',
                      });
                      res.end(
                        'Form submissions are available on the deployed Netlify site. Nothing was sent.',
                      );
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
