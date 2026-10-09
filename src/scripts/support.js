const openLinkedQuestion = () => {
  if (!location.hash) return;
  const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if (target instanceof HTMLDetailsElement) target.open = true;
};
openLinkedQuestion();
window.addEventListener('hashchange', openLinkedQuestion);
