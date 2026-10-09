// One accessible filtering behavior for both editorial archives.
export function mountFilters({ container, buttonAttribute, itemSelector, countSelector, noun }) {
  const group = document.querySelector(container);
  if (!group) return;
  const buttons = [...group.querySelectorAll('button')],
    items = [...document.querySelectorAll(itemSelector)],
    count = document.querySelector(countSelector);
  group.hidden = false;
  for (const button of buttons)
    button.addEventListener('click', () => {
      const category = button.getAttribute(buttonAttribute);
      let visible = 0;
      for (const item of items) {
        item.hidden = category !== 'All' && item.dataset.category !== category;
        if (!item.hidden) visible++;
      }
      for (const item of buttons) item.setAttribute('aria-pressed', String(item === button));
      if (count) count.textContent = `${visible} ${noun}${visible === 1 ? '' : 's'}`;
    });
}
