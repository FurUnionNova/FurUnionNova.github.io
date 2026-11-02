/* 页面切换：加载层 + 预取目标页 + 跨页淡出（无框架） */
(() => {
  const root = document.documentElement;

  function revealIncoming() {
    if (!root.classList.contains('is-loading')) return;
    window.requestAnimationFrame(() => root.classList.add('is-ready'));
  }

  if (root.classList.contains('is-loading')) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => window.setTimeout(revealIncoming, 120), { once: true });
    } else {
      window.setTimeout(revealIncoming, 120);
    }
  }

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let loader = null;
  let navigating = false;

  function showLoader() {
    loader = loader || document.querySelector('.page-loader');
    if (!loader) {
      loader = document.createElement('div');
      loader.className = 'page-loader';
      loader.setAttribute('role', 'status');
      loader.setAttribute('aria-live', 'polite');
      loader.innerHTML = '<span class="loader-star" aria-hidden="true">✦</span><p>正在加载…</p>';
      document.body.appendChild(loader);
    }
    document.body.classList.add('is-loading');
    root.classList.remove('is-ready', 'is-loading');
    loader.classList.remove('is-visible');
    window.requestAnimationFrame(() => loader.classList.add('is-visible'));
  }

  const sameOrigin = (url) =>
    (url.protocol === 'file:' || url.protocol === 'http:' || url.protocol === 'https:') &&
    url.origin === location.origin;

  const toUrl = (href) => {
    try { return new URL(href, location.href); } catch { return null; }
  };

  function prefetch(href) {
    const url = toUrl(href);
    if (!url || !sameOrigin(url)) return;
    if (url.href === location.href) return;
    const exists = [...document.querySelectorAll('link[rel="prefetch"]')].some((link) => link.href === url.href);
    if (exists) return;
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url.href;
    document.head.appendChild(link);
  }

  document.addEventListener('pointerover', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const link = target.closest('a[href]');
    if (link) prefetch(link.href);
  });

  document.addEventListener('focusin', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const link = target.closest('a[href]');
    if (link) prefetch(link.href);
  });

  document.addEventListener('click', (event) => {
    if (navigating || event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const target = event.target;
    if (!(target instanceof Element)) return;
    const link = target.closest('a[href]');
    if (!link) return;
    if (link.target && link.target !== '_self') return;
    if (link.hasAttribute('download')) return;

    const raw = link.getAttribute('href');
    if (!raw || raw.startsWith('#') || raw.startsWith('mailto:') || raw.startsWith('javascript:')) return;

    const url = toUrl(link.href);
    if (!url || !sameOrigin(url)) return;
    if (url.pathname === location.pathname && url.hash) return;
    if (url.href === location.href) return;
    if (/\.(png|jpe?g|webp|gif|svg|avif)$/i.test(url.pathname)) return;

    event.preventDefault();
    navigating = true;
    showLoader();

    const minWait = new Promise((resolve) => window.setTimeout(resolve, 380));
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 3500);
    const fetched = fetch(url.href, { credentials: 'same-origin', signal: controller.signal })
      .catch(() => null)
      .finally(() => window.clearTimeout(timeout));

    Promise.all([minWait, fetched]).then(() => {
      try { sessionStorage.setItem('page-loading', '1'); } catch { /* ignore */ }
      location.href = url.href;
    });
  });

  window.addEventListener('pageshow', (event) => {
    navigating = false;
    document.body.classList.remove('is-loading');
    if (event.persisted) {
      root.classList.remove('is-loading', 'is-ready');
      document.querySelectorAll('.page-loader').forEach((node) => node.classList.remove('is-visible'));
      if (loader) {
        loader.remove();
        loader = null;
      }
    }
  });

  const idle = window.requestIdleCallback || ((fn) => window.setTimeout(fn, 800));
  idle(() => {
    if (document.body.classList.contains('menu-page')) {
      ['blog.html', 'about.html', 'gallery.html'].forEach(prefetch);
    }
  });
})();
