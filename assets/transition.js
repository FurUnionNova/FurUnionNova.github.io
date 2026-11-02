/* 页面切换：淡出旧页 + 新页从左侧淡入；二级卡片可铺满全屏（无框架） */
(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const sameOrigin = (url) =>
    (url.protocol === 'file:' || url.protocol === 'http:' || url.protocol === 'https:') &&
    url.origin === location.origin;

  function wipeCard(card, url) {
    const rect = card.getBoundingClientRect();
    const style = getComputedStyle(card);
    const overlay = document.createElement('div');
    overlay.className = 'card-wipe';
    overlay.style.left = `${rect.left}px`;
    overlay.style.top = `${rect.top}px`;
    overlay.style.width = `${rect.width}px`;
    overlay.style.height = `${rect.height}px`;
    overlay.style.borderRadius = style.borderRadius;
    overlay.style.backgroundImage = style.backgroundImage;
    overlay.style.backgroundPosition = style.backgroundPosition;

    const body = card.querySelector('.entry-body');
    if (body) overlay.appendChild(body.cloneNode(true));

    document.body.appendChild(overlay);
    document.body.classList.add('is-wiping');
    void overlay.offsetWidth;

    window.requestAnimationFrame(() => {
      overlay.style.left = '0px';
      overlay.style.top = '0px';
      overlay.style.width = `${window.innerWidth}px`;
      overlay.style.height = `${window.innerHeight}px`;
      overlay.style.borderRadius = '0px';
    });

    let done = false;
    const go = () => {
      if (done) return;
      done = true;
      location.href = url.href;
    };
    overlay.addEventListener('transitionend', (event) => {
      if (event.propertyName === 'width') go();
    });
    window.setTimeout(go, 920);
  }

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

    const card = link.closest('.entry');
    if (document.body.classList.contains('menu-page') && card && !card.classList.contains('entry-empty')) {
      wipeCard(card, url);
      return;
    }

    document.body.classList.add('is-leaving');
    window.setTimeout(() => {
      location.href = url.href;
    }, 240);
  });

  window.addEventListener('pageshow', () => {
    document.body.classList.remove('is-leaving');
    document.body.classList.remove('is-wiping');
    document.querySelectorAll('.card-wipe').forEach((node) => node.remove());
  });
})();
