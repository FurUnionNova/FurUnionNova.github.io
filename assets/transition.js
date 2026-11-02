/* 简单的页面过渡：旧页淡出，新页淡入；不做加载层、不预取 */
(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const sameOrigin = (url) =>
    (url.protocol === 'file:' || url.protocol === 'http:' || url.protocol === 'https:') &&
    url.origin === location.origin;

  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const target = event.target;
    if (!(target instanceof Element)) return;
    const link = target.closest('a[href]');
    if (!link) return;
    if (link.target && link.target !== '_self') return;
    if (link.hasAttribute('download')) return;

    const raw = link.getAttribute('href');
    if (!raw || raw.startsWith('#') || raw.startsWith('mailto:') || raw.startsWith('javascript:')) return;

    const url = new URL(link.href, location.href);
    if (!sameOrigin(url)) return;
    if (url.pathname === location.pathname && url.hash) return;
    if (url.href === location.href) return;

    event.preventDefault();
    document.body.classList.add('is-leaving');
    window.setTimeout(() => {
      location.href = url.href;
    }, 320);
  });

  window.addEventListener('pageshow', () => {
    document.body.classList.remove('is-leaving');
  });
})();
