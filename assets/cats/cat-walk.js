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
  const interval = 5000;
  const active = new Set();
  const maxCats = 12;
  let deck = [], lastCat, nextTimer, resumeTimer;
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
  const schedule = (delay = interval) => {
    clearTimeout(nextTimer);
    if (enabled && !motion.matches && !document.hidden) nextTimer = setTimeout(() => { schedule(); void show(false); }, delay);
  };
  const refreshControls = () => {
    toggle.textContent = motion.matches ? '猫の散歩：動きを抑制中' : enabled ? '猫の散歩：ON' : '猫の散歩：OFF';
    toggle.setAttribute('aria-pressed', String(enabled && !motion.matches));
    toggle.disabled = motion.matches;
  };
  const retire = (visit) => {
    clearTimeout(visit.timer);
    if (visit.animation) {
      visit.animation.onfinish = null;
      visit.animation.cancel();
    }
    visit.node.remove();
    active.delete(visit);
    call.disabled = active.size >= maxCats;
  };
  const stop = (reschedule = true) => {
    clearTimeout(nextTimer);
    for (const visit of [...active]) retire(visit);
    if (reschedule) schedule();
  };
  const obstructed = () => scrolling || document.getElementById('siteHeader')?.classList.contains('is-open') || document.getElementById('titan-peek')?.classList.contains('is-visible');
  const show = async (manual) => {
    if (document.hidden || active.size >= maxCats || (!manual && (!enabled || motion.matches || obstructed()))) return;
    const node = walker.cloneNode(true);
    node.removeAttribute('id');
    const picture = node.querySelector('img');
    picture.removeAttribute('id');
    walker.parentElement.appendChild(node);
    const visit = { node, animation: null, timer: null };
    active.add(visit);
    call.disabled = active.size >= maxCats;
    const cat = choose();
    picture.src = new URL(cat.file, base).href;
    picture.alt = cat.name;
    try { await picture.decode(); } catch (_) { retire(visit); return; }
    if (!active.has(visit) || document.hidden) return;
    const width = innerWidth <= 600 ? 80 : 104;
    const rightwards = Math.random() > .5;
    picture.style.transform = cat.left && rightwards || !cat.left && !rightwards ? 'scaleX(-1)' : 'none';
    node.hidden = false;
    if (motion.matches || typeof node.animate !== 'function') {
      node.style.transform = `translateX(${rightwards ? 14 : Math.max(14, innerWidth - width - 14)}px)`;
      visit.timer = setTimeout(() => retire(visit), 9000);
      return;
    }
    const start = rightwards ? -width - 12 : innerWidth + 12;
    const end = rightwards ? innerWidth + 12 : -width - 12;
    node.style.transform = `translateX(${start}px)`;
    // Each visitor walks independently while a new cat arrives every five seconds.
    const duration = (innerWidth + width + 24) / random(48, 62) * 1000;
    visit.animation = node.animate([
      { transform: `translateX(${start}px)` },
      { transform: `translateX(${end}px)` }
    ], { duration, easing: 'linear', fill: 'forwards' });
    visit.animation.onfinish = () => retire(visit);
    if (scrolling) { visit.animation.pause(); node.classList.add('is-paused'); }
  };
  call.addEventListener('click', () => show(true));
  toggle.addEventListener('click', () => {
    enabled = !enabled;
    try { localStorage.setItem(storageKey, String(enabled)); } catch (_) { /* Storage can be blocked. */ }
    stop(false);
    refreshControls();
    schedule();
  });
  window.addEventListener('keydown', event => { if (event.key === 'Escape') stop(); });
  window.addEventListener('demimomi-titan-peek', () => stop());
  window.addEventListener('scroll', () => {
    scrolling = true;
    for (const visit of active) {
      if (visit.animation) { visit.animation.pause(); visit.node.classList.add('is-paused'); }
    }
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(() => {
      scrolling = false;
      if (!document.hidden) for (const visit of active) {
        if (visit.animation) { visit.animation.play(); visit.node.classList.remove('is-paused'); }
      }
    }, 1000);
  }, { passive: true });
  window.addEventListener('resize', () => { if (active.size) stop(); }, { passive: true });
  document.addEventListener('visibilitychange', () => {
    stop(false);
    if (!document.hidden) schedule();
  });
  motion.addEventListener('change', () => { stop(false); refreshControls(); schedule(); });
  refreshControls();
  schedule();
})();
