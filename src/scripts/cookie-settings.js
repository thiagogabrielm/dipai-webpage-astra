const dialog = document.querySelector('#cookie-settings');
if (dialog instanceof HTMLDialogElement) {
  const status = dialog.querySelector('[data-theme-status]');
  dialog.addEventListener('keydown', (event) => {
    // Keep boundary Tab presses inside the modal, including after browser tooling
    // or assistive technology restores focus to the document.
    if (event.key !== 'Tab') return;
    const controls = [...dialog.querySelectorAll('button:not([disabled]), a[href]')];
    const first = controls[0];
    const last = controls.at(-1);
    if (
      event.shiftKey &&
      (document.activeElement === first || !dialog.contains(document.activeElement))
    ) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  const update = () => {
    if (!status) return;
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
  dialog.querySelector('[data-theme-reset]')?.addEventListener('click', () => {
    window.dispatchEvent(new Event('dipai:reset-theme'));
    update();
  });
  window.addEventListener('storage', () => {
    if (dialog.open) update();
  });
}
