/* 背景音乐：Web Audio 合成的轻环境音，无外部音频文件、无版权问题。 */
(() => {
  const KEY = 'blog-music';
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;

  let ctx = null;
  let master = null;
  let padBus = null;
  let delay = null;
  let wet = null;
  let playing = false;
  let chordTimer = null;
  let noteTimer = null;
  let chordIndex = 0;
  let armed = false;

  const chords = [
    [146.83, 174.61, 220.0, 261.63], // Dm7
    [130.81, 164.81, 196.0, 246.94], // Cmaj7
    [174.61, 220.0, 261.63, 329.63], // Fmaj7
    [196.0, 246.94, 293.66, 349.23], // G7
  ];
  const melody = [587.33, 659.25, 783.99, 880.0, 1046.5];

  const pref = () => {
    try { return localStorage.getItem(KEY); } catch { return null; }
  };

  function build() {
    if (ctx) return;
    ctx = new AudioCtx();
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1200;
    filter.Q.value = 0.4;

    padBus = ctx.createGain();
    padBus.gain.value = 0.9;
    padBus.connect(filter);
    filter.connect(master);

    delay = ctx.createDelay(1.0);
    delay.delayTime.value = 0.36;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.28;
    wet = ctx.createGain();
    wet.gain.value = 0.22;
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(wet);
    wet.connect(master);
  }

  function chord() {
    if (!playing) return;
    const now = ctx.currentTime;
    const notes = chords[chordIndex++ % chords.length];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(i === 0 ? 0.03 : 0.02, now + 1.8);
      gain.gain.linearRampToValueAtTime(0, now + 8.4);
      osc.connect(gain);
      gain.connect(padBus);
      osc.start(now);
      osc.stop(now + 9);
    });
  }

  function note() {
    if (!playing) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = melody[Math.floor(Math.random() * melody.length)];
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.018, now + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);
    osc.connect(gain);
    gain.connect(master);
    gain.connect(delay);
    osc.start(now);
    osc.stop(now + 2.3);
  }

  async function start() {
    build();
    try { await ctx.resume(); } catch { /* 自动播放被拦截 */ }
    if (ctx.state !== 'running') {
      update();
      arm();
      return;
    }
    if (playing) { update(); return; }
    playing = true;
    chordIndex = 0;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(0, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 1.2);
    chord();
    note();
    clearInterval(chordTimer);
    clearInterval(noteTimer);
    chordTimer = setInterval(chord, 8000);
    noteTimer = setInterval(note, 2400);
    try { localStorage.setItem(KEY, 'on'); } catch { /* ignore */ }
    update();
  }

  function stop() {
    if (!ctx) return;
    playing = false;
    clearInterval(chordTimer);
    clearInterval(noteTimer);
    chordTimer = noteTimer = null;
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(0, now + 0.5);
    try { localStorage.setItem(KEY, 'off'); } catch { /* ignore */ }
    update();
  }

  function arm() {
    if (armed) return;
    armed = true;
    const once = (event) => {
      if (event.target && event.target.closest && event.target.closest('.music-toggle')) return;
      document.removeEventListener('pointerdown', once, true);
      document.removeEventListener('keydown', once, true);
      armed = false;
      if (pref() === 'on' && !playing) start();
    };
    document.addEventListener('pointerdown', once, true);
    document.addEventListener('keydown', once, true);
  }

  let button = null;
  function update() {
    if (!button) return;
    button.setAttribute('aria-pressed', playing ? 'true' : 'false');
    button.title = playing ? '关闭背景音乐' : '开启背景音乐';
    button.textContent = playing ? '♫' : '♪';
  }

  function mount() {
    const host = document.querySelector('.site-header .nav')
      || document.querySelector('.portal-nav')
      || document.querySelector('.welcome-head');
    if (!host) return;
    button = document.createElement('button');
    button.type = 'button';
    button.className = 'music-toggle';
    button.setAttribute('aria-label', '背景音乐');
    button.setAttribute('aria-pressed', 'false');
    button.textContent = '♪';
    button.addEventListener('click', () => {
      if (playing) stop();
      else start();
    });
    const theme = host.querySelector('.theme-toggle');
    if (theme) host.insertBefore(button, theme);
    else host.appendChild(button);
    update();

    const enter = document.querySelector('[data-enter]');
    if (enter) {
      enter.addEventListener('click', () => {
        if (pref() !== 'off') {
          try { localStorage.setItem(KEY, 'on'); } catch { /* ignore */ }
        }
      });
    }

    if (pref() === 'on') start();
  }

  document.addEventListener('visibilitychange', () => {
    if (!ctx || !playing) return;
    if (document.hidden) ctx.suspend().catch(() => {});
    else ctx.resume().catch(() => {});
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount, { once: true });
  } else {
    mount();
  }
})();
