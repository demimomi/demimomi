/* Cat images are self-hosted. Authors and licenses: ../../cat-credits.html */
(() => {
  'use strict';
  const base = new URL('.', document.currentScript.src);
  const walker = document.getElementById('catWalker');
  const image = document.getElementById('walkingCatImage');
  const call = document.getElementById('callCat');
  const toggle = document.getElementById('toggleCats');
  if (!walker || !image || !call || !toggle) return;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const storageKey = 'demimomi-cat-walk-enabled';
  const cats = [
    { file: 'worker.svg', name: '現場を巡回する猫', left: true },
    { file: 'engineer.svg', name: 'エンジニア猫', left: false },
    { file: 'office.svg', name: 'お仕事帰りの猫', left: false },
    { file: 'black-cat.svg', name: '黒猫', left: true },
    { file: 'kitten.webp', name: '茶白の子猫', left: true },
    { file: 'tabby.webp', name: 'お散歩中のキジトラ', left: true },
    { file: 'longhair.webp', name: 'ふわふわの猫', left: false },
    { file: 'bengal.webp', name: 'ベンガル猫', left: false },
    { file: 'exotic.webp', name: 'のんびりエキゾチック', left: false },
    { file: 'maine-coon.webp', name: 'メインクーン', left: true }
  ];
  const random = (min, max) => min + Math.random() * (max - min);
  let enabled = true;
  try { enabled = localStorage.getItem(storageKey) !== 'false'; } catch (_) { /* Optional preference. */ }
  let deck = [], lastCat, nextTimer, stillTimer, resumeTimer, animation, version = 0;
  let scrolling = false;
  const choose = () => {
    if (!deck.length) {
      deck = cats.slice();
      for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
      }
      if (deck.at(-1) === lastCat) [deck[0], deck[deck.length - 1]] = [deck.at(-1), deck[0]];
    }
    return (lastCat = deck.pop());
  };
  const schedule = (delay = random(65000, 110000)) => {
    clearTimeout(nextTimer);
    if (enabled && !motion.matches && !document.hidden) nextTimer = setTimeout(() => show(false), delay);
  };
  const refreshControls = () => {
    toggle.textContent = motion.matches ? '猫の散歩：動きを抑制中' : enabled ? '猫の散歩：ON' : '猫の散歩：OFF';
    toggle.setAttribute('aria-pressed', String(enabled && !motion.matches));
    toggle.disabled = motion.matches;
  };
  const stop = (reschedule = true) => {
    version++;
    clearTimeout(nextTimer);
    clearTimeout(stillTimer);
    if (animation) { animation.onfinish = null; animation.cancel(); animation = null; }
    walker.hidden = true;
    walker.classList.remove('is-paused');
    call.disabled = false;
    if (reschedule) schedule();
  };
  const obstructed = () => scrolling || document.getElementById('siteHeader')?.classList.contains('is-open') || document.getElementById('titan-peek')?.classList.contains('is-visible');
  const show = async (manual) => {
    if (document.hidden || !walker.hidden || (!manual && (!enabled || motion.matches))) return;
    if (!manual && obstructed()) { schedule(12000); return; }
    clearTimeout(nextTimer);
    const current = ++version;
    call.disabled = true;
    const cat = choose();
    image.src = new URL(cat.file, base).href;
    image.alt = cat.name;
    try { await image.decode(); } catch (_) { if (current === version) stop(); return; }
    if (current !== version || document.hidden) return;
    const width = walker.getBoundingClientRect().width || (innerWidth <= 600 ? 80 : 104);
    const rightwards = Math.random() > .5;
    image.style.transform = cat.left && rightwards || !cat.left && !rightwards ? 'scaleX(-1)' : 'none';
    walker.hidden = false;
    if (motion.matches || typeof walker.animate !== 'function') {
      walker.style.transform = `translateX(${rightwards ? 14 : Math.max(14, innerWidth - width - 14)}px)`;
      stillTimer = setTimeout(() => stop(), 9000);
      return;
    }
    const start = rightwards ? -width - 12 : innerWidth + 12;
    const end = rightwards ? innerWidth + 12 : -width - 12;
    walker.style.transform = `translateX(${start}px)`;
    // Constant, modest speed; no flashing, audio, or pointer interception.
    const duration = (innerWidth + width + 24) / random(48, 62) * 1000;
    animation = walker.animate([
      { transform: `translateX(${start}px)` },
      { transform: `translateX(${end}px)` }
    ], { duration, easing: 'linear', fill: 'forwards' });
    animation.onfinish = () => stop();
    if (scrolling) { animation.pause(); walker.classList.add('is-paused'); }
  };
  call.addEventListener('click', () => show(true));
  toggle.addEventListener('click', () => {
    enabled = !enabled;
    try { localStorage.setItem(storageKey, String(enabled)); } catch (_) { /* Storage can be blocked. */ }
    stop(false);
    refreshControls();
    schedule(15000);
  });
  window.addEventListener('keydown', event => { if (event.key === 'Escape') stop(); });
  window.addEventListener('demimomi-titan-peek', () => stop());
  window.addEventListener('scroll', () => {
    scrolling = true;
    if (animation) { animation.pause(); walker.classList.add('is-paused'); }
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(() => {
      scrolling = false;
      if (animation && !document.hidden) { animation.play(); walker.classList.remove('is-paused'); }
    }, 1000);
  }, { passive: true });
  window.addEventListener('resize', () => { if (!walker.hidden || call.disabled) stop(); }, { passive: true });
  document.addEventListener('visibilitychange', () => {
    stop(false);
    if (!document.hidden) schedule(random(30000, 55000));
  });
  motion.addEventListener('change', () => { stop(false); refreshControls(); schedule(); });
  refreshControls();
  schedule(random(22000, 35000));
})();
