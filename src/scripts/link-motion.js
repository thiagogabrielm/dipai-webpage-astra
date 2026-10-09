// One shared chevron/arrow treatment for the site's former diagonal link cues.
const svgNS = 'http://www.w3.org/2000/svg';
function arrowIcon(back = false) {
  const svg = document.createElementNS(svgNS, 'svg');
  for (const [name, value] of Object.entries({
    class: 'link-chevron',
    viewBox: '0 0 24 24',
    width: '20',
    height: '20',
    'aria-hidden': 'true',
    focusable: 'false',
  }))
    svg.setAttribute(name, value);
  if (back) svg.classList.add('link-chevron--back');
  for (const [className, d] of [
    ['link-arrow-shaft', 'M4 12H18'],
    ['link-arrow-head', 'M9 6L15 12L9 18'],
  ]) {
    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute('class', className);
    path.setAttribute('d', d);
    svg.append(path);
  }
  return svg;
}

// Work from the innermost CTA outward so a card's title/body never become one link label.
const candidates = [...document.querySelectorAll('a, button, .text-button')].reverse();
for (const host of candidates) {
  if (host.querySelector('.link-chevron')) continue;
  const back = host.matches('.article-back');
  const marker = back ? '←' : '›';
  const walker = document.createTreeWalker(host, NodeFilter.SHOW_TEXT);
  const markers = [];
  while (walker.nextNode())
    if (walker.currentNode.textContent.includes(marker)) markers.push(walker.currentNode);
  if (!markers.length) continue;
  host.classList.add('link-motion');
  for (const text of markers) {
    const parent = text.parentElement;
    const icon = arrowIcon(back);
    if (parent !== host && parent.tagName === 'SPAN' && parent.textContent.trim() === marker) {
      parent.replaceWith(icon);
    } else {
      const parts = text.textContent.split(marker);
      const fragment = document.createDocumentFragment();
      parts.forEach((part, index) => {
        if (index) fragment.append(arrowIcon(back));
        fragment.append(document.createTextNode(part));
      });
      text.replaceWith(fragment);
    }
  }
  // Preserve existing structured labels (e.g. numbered product tabs).
  for (const child of [...host.childNodes]) {
    if (child.nodeType === Node.TEXT_NODE && child.textContent.trim()) {
      const label = document.createElement('span');
      label.className = 'link-label';
      const leading = child.textContent.match(/^\s*/)[0],
        trailing = child.textContent.match(/\s*$/)[0];
      label.textContent = child.textContent.trim();
      child.replaceWith(document.createTextNode(leading), label, document.createTextNode(trailing));
    } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName === 'STRONG') {
      child.classList.add('link-label');
    }
  }
}
