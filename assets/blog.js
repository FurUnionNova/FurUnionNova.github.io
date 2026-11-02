(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ---------- 主题 ---------- */
  const root = document.documentElement;
  const stored = (() => {
    try { return localStorage.getItem('blog-theme'); } catch { return null; }
  })();
  const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  if (stored === 'light' || stored === 'dark') root.dataset.theme = stored;
  else if (prefersLight) root.dataset.theme = 'light';

  const toggle = $('.theme-toggle');
  if (toggle) {
    const sync = () => {
      const light = root.dataset.theme === 'light';
      toggle.textContent = light ? '☀' : '☾';
      toggle.setAttribute('aria-label', light ? '切换到深色模式' : '切换到浅色模式');
    };
    sync();
    toggle.addEventListener('click', () => {
      root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
      try { localStorage.setItem('blog-theme', root.dataset.theme); } catch { /* 忽略 */ }
      sync();
    });
  }

  /* ---------- 阅读时长 ---------- */
  const prose = $('.prose');
  const readingTime = $('[data-reading-time]');
  if (prose && readingTime) {
    const text = prose.textContent || '';
    const han = (text.match(/[\u4e00-\u9fff]/g) || []).length;
    const words = (text.match(/[A-Za-z0-9]+/g) || []).length;
    const minutes = Math.max(1, Math.round(han / 300 + words / 200));
    readingTime.textContent = `${minutes} 分钟`;
  }

  /* ---------- 标签筛选 ---------- */
  const chips = $$('[data-filter]');
  const postCards = $$('[data-post-tag]');
  const filterCount = $('.filter-count');
  const emptyState = $('.empty');
  if (chips.length) {
    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        const filter = chip.dataset.filter;
        chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
        let visible = 0;
        postCards.forEach((card) => {
          const tags = (card.dataset.postTag || '').split(/\s+/);
          const show = filter === 'all' || tags.includes(filter);
          card.hidden = !show;
          if (show) visible += 1;
        });
        if (filterCount) filterCount.textContent = `共 ${visible} 篇`;
        if (emptyState) emptyState.hidden = visible > 0;
      });
    });
  }

  /* ---------- 目录 ---------- */
  const tocRoot = $('[data-toc]');
  if (tocRoot && prose) {
    const heads = $$('h2, h3', prose);
    if (heads.length) {
      const list = document.createElement('div');
      list.className = 'toc-list';
      heads.forEach((h, i) => {
        if (!h.id) h.id = `sec-${i + 1}`;
        const a = document.createElement('a');
        a.href = `#${h.id}`;
        a.textContent = h.textContent.trim();
        if (h.tagName === 'H3') a.className = 'h3';
        list.appendChild(a);
      });
      const details = document.createElement('details');
      details.open = true;
      const summary = document.createElement('summary');
      summary.textContent = '目录';
      details.append(summary, list);
      tocRoot.appendChild(details);

      const links = $$('a', list);
      const byId = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          links.forEach((a) => a.classList.remove('active'));
          const link = byId.get(e.target.id);
          if (link) link.classList.add('active');
        });
      }, { rootMargin: '-20% 0px -70% 0px' });
      heads.forEach((h) => observer.observe(h));
    }
  }

  /* ---------- 阅读进度 ---------- */
  const bar = $('.progress');
  if (bar) {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      bar.style.width = `${p * 100}%`;
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
  }

  /* ---------- 代码复制 ---------- */
  $$('.prose pre').forEach((pre) => {
    const btn = document.createElement('button');
    btn.className = 'copy';
    btn.type = 'button';
    btn.textContent = '复制';
    btn.addEventListener('click', async () => {
      const code = pre.querySelector('code') || pre;
      try {
        await navigator.clipboard.writeText(code.innerText);
        btn.textContent = '已复制';
      } catch {
        btn.textContent = '复制失败';
      }
      setTimeout(() => { btn.textContent = '复制'; }, 1400);
    });
    pre.appendChild(btn);
  });

  /* ---------- 返回顶部 ---------- */
  const toTop = $('.to-top');
  if (toTop) {
    const sync = () => toTop.classList.toggle('show', window.scrollY > 500);
    sync();
    window.addEventListener('scroll', sync, { passive: true });
    toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ---------- 缺图占位 ---------- */
  $$('.gallery img').forEach((img) => {
    img.addEventListener('error', () => {
      const fig = img.closest('figure');
      if (fig) fig.classList.add('is-missing');
    });
  });

  /* ---------- 年份 ---------- */
  $$('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });
})();
