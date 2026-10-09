// Apply before CSS paints, then attach the footer controls once the DOM is ready.
(() => {
  const key = 'dipai-color-theme';
  const params = new URLSearchParams(location.search);
  const preview = params.get('preview') === '1';
  const valid = (value) => value === 'light' || value === 'dark';
  const system = matchMedia('(prefers-color-scheme: dark)');
  let saved;
  try {
    saved = localStorage.getItem(key);
  } catch {
    /* Storage can be unavailable in local previews. */
  }
  let explicit = valid(params.get('theme')) ? params.get('theme') : valid(saved) ? saved : null;
  let current = explicit || (system.matches ? 'dark' : 'light');
  let controls;
  const apply = (theme) => {
    current = theme;
    document.documentElement.dataset.theme = theme;
    if (!controls) return;
    controls.querySelectorAll('[data-theme-choice]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.themeChoice === theme));
    });
    const logo = document.querySelector('.footer-brand img');
    if (logo)
      logo.src = theme === 'dark' ? '/assets/dipai-logo-light.svg' : '/assets/dipai-logo.svg';
  };
  apply(current);
  window.addEventListener('dipai:reset-theme', () => {
    explicit = null;
    try {
      localStorage.removeItem(key);
    } catch {
      /* Device theme also works when storage is unavailable. */
    }
    params.delete('theme');
    const url = new URL(location.href);
    url.searchParams.delete('theme');
    try {
      history.replaceState(null, '', url);
    } catch {
      /* Some file previews restrict history. */
    }
    apply(system.matches ? 'dark' : 'light');
  });
  system.addEventListener('change', (event) => {
    if (!explicit) apply(event.matches ? 'dark' : 'light');
  });
  document.addEventListener(
    'DOMContentLoaded',
    () => {
      const footer = document.querySelector('.footer-bottom');
      if (!footer) return;
      controls = footer.querySelector('.theme-switcher');
      if (!controls) return;
      controls.addEventListener('click', (event) => {
        const button = event.target.closest('[data-theme-choice]');
        if (!button) return;
        explicit = button.dataset.themeChoice;
        apply(explicit);
        if (!preview) {
          try {
            localStorage.setItem(key, explicit);
          } catch {
            /* The switch still works without storage. */
          }
        }
        // Keep explicit preview links consistent with the choice on reload.
        if (params.has('theme')) {
          const url = new URL(location.href);
          url.searchParams.set('theme', explicit);
          try {
            history.replaceState(null, '', url);
          } catch {
            /* Some file previews restrict history. */
          }
        }
      });
      apply(current);
    },
    { once: true },
  );
  // Keep open site tabs consistent without changing isolated comparison panes.
  window.addEventListener('storage', (event) => {
    if (preview || params.has('theme') || event.key !== key) return;
    explicit = valid(event.newValue) ? event.newValue : null;
    apply(explicit || (system.matches ? 'dark' : 'light'));
  });
})();
