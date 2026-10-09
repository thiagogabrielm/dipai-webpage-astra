// Shared navigation and dialogs for landing, News and article pages.
export function mountSiteUi() {
  const menuButton = document.querySelector('.mobile-menu');
  const nav = document.querySelector('#main-nav');
  // Hover opens desktop dropdowns; native-style activation remains for touch/keys.
  const dropdowns = [...nav.querySelectorAll('.nav-dropdown')];
  const hoverMenus = matchMedia('(min-width: 901px) and (hover: hover) and (pointer: fine)');
  nav.setAttribute('data-hover-dropdowns', '');
  const openDropdown = (current) => {
    dropdowns.forEach((menu) => {
      menu.open = menu === current;
    });
  };
  for (const menu of dropdowns) {
    const summary = menu.querySelector('summary');
    let closeTimer;
    menu.setAttribute('name', 'header-dropdown');
    menu.addEventListener('pointerenter', (event) => {
      if (!hoverMenus.matches || event.pointerType === 'touch') return;
      clearTimeout(closeTimer);
      openDropdown(menu);
    });
    menu.addEventListener('pointerleave', (event) => {
      if (!hoverMenus.matches || event.pointerType === 'touch') return;
      clearTimeout(closeTimer);
      closeTimer = setTimeout(() => {
        if (!menu.querySelector(':focus-visible')) menu.open = false;
      }, 180);
    });
    summary.addEventListener('click', (event) => {
      event.preventDefault();
      clearTimeout(closeTimer);
      const mouseHover = hoverMenus.matches && event.detail > 0 && event.pointerType !== 'touch';
      if (mouseHover || !menu.open) openDropdown(menu);
      else menu.open = false;
    });
    menu.addEventListener('focusin', () => clearTimeout(closeTimer));
    menu.addEventListener('focusout', (event) => {
      if (hoverMenus.matches && !menu.contains(event.relatedTarget) && !menu.matches(':hover'))
        menu.open = false;
    });
    menu.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown' && event.target === summary) {
        event.preventDefault();
        openDropdown(menu);
        menu.querySelector('a, button')?.focus();
      }
      if (event.key === 'Escape' && menu.open) {
        event.preventDefault();
        event.stopPropagation();
        menu.open = false;
        summary.focus();
      }
    });
    menu.addEventListener('click', (event) => {
      if (event.target.closest('a, button')) menu.open = false;
    });
  }
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  });
  nav.addEventListener('click', (event) => {
    if (event.target.closest('a') || event.target.closest('[data-demo]')) {
      nav.classList.remove('is-open');
      menuButton.setAttribute('aria-expanded', 'false');
      nav.querySelectorAll('details').forEach((details) => {
        details.open = false;
      });
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    nav.querySelectorAll('details').forEach((details) => {
      details.open = false;
    });
    if (nav.classList.contains('is-open')) {
      nav.classList.remove('is-open');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.focus();
    }
  });
  document.addEventListener('click', (event) => {
    if (!nav.contains(event.target))
      nav.querySelectorAll('details').forEach((details) => {
        details.open = false;
      });
  });
}
