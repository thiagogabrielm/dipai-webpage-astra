// Size one static network image across the closing section and footer.
// CSS crops its fixed minimum width on narrow screens instead of packing the nodes.
const cta = document.querySelector('.neural-cta');
const closingSection = cta || document.querySelector('[data-footer-network-section]');
const footer = document.querySelector('.network-footer-page .site-footer');
const artwork = footer?.querySelector('[data-footer-artwork]');

if (footer && artwork) {
  // One still image spans the CTA and footer, with no seam between sections.
  const resizeArtwork = () => {
    artwork.style.height = `${footer.offsetHeight + (closingSection?.offsetHeight || 0)}px`;
  };
  const layout = new ResizeObserver(resizeArtwork);
  layout.observe(footer);
  if (closingSection) layout.observe(closingSection);
  resizeArtwork();
}
