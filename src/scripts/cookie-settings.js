const dialog = document.querySelector('#cookie-settings');
if (dialog instanceof HTMLDialogElement) {
  const status = dialog.querySelector('[data-theme-status]');
  const update = () => {
    try {
      const theme = localStorage.getItem('dipai-color-theme');
      status.textContent = ['light', 'dark'].includes(theme)
        ? `Saved preference: ${theme} mode.`
        : 'No colour preference is saved in this browser.';
    } catch {
      status.textContent = 'Browser storage is unavailable. Your theme still works on this page.';
    }
  };
  document.querySelectorAll('[data-cookie-settings]').forEach((link) => {
    link.setAttribute('aria-haspopup', 'dialog');
    link.addEventListener('click', (event) => {
      event.preventDefault();
      update();
      dialog.showModal();
    });
  });
  dialog.querySelector('[data-theme-reset]').addEventListener('click', () => {
    window.dispatchEvent(new Event('dipai:reset-theme'));
    update();
  });
  window.addEventListener('storage', () => {
    if (dialog.open) update();
  });
}
