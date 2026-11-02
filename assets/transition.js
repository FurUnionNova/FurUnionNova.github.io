/* 只做图片加载失败兜底；页面跳转完全交给浏览器，避免 bfcache 返回时残留淡出状态 */
(() => {
  document.addEventListener('error', (event) => {
    const img = event.target;
    if (!(img instanceof HTMLImageElement) || img.dataset.fallback) return;
    img.dataset.fallback = '1';
    img.classList.add('is-missing');
    img.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22/%3E';
  }, true);
})();
