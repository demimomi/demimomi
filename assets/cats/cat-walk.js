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
  const storageKey = 'demimomi-cat-walk-enabled-v2';
  const cats = [
    { file: 'kitten.webp', name: '茶白の子猫', left: true },
    { file: 'tabby.webp', name: 'お散歩中のキジトラ', left: true },
    { file: 'longhair.webp', name: 'ふわふわの猫', left: false },
    { file: 'bengal.webp', name: 'ベンガル猫', left: false },
    { file: 'exotic.webp', name: 'のんびりエキゾチック', left: false },
    { file: 'maine-coon.webp', name: 'メインクーン', left: true },
    { file: 'cameo-2343.webp', name: 'お薬を出す猫', cameo: true },
    { file: 'cameo-2744.webp', name: '戸惑いこそが人生だよ', cameo: true },
    { file: 'cameo-3364.webp', name: '缶に乗る猫', cameo: true },
    { file: 'cameo-3434.webp', name: 'にゃこねっと やんばる', cameo: true },
    { file: 'cameo-3473.webp', name: '細けぇ事はの猫', cameo: true },
    { file: 'cameo-0509.webp', name: 'くつろぐ猫', cameo: true },
    { file: 'cameo-oct29-1.webp', name: 'スクーターの猫の漫画', cameo: true },
    { file: 'cameo-oct29-2.webp', name: '缶と笑顔の猫', cameo: true },
    { file: 'cameo-oct29-3.webp', name: '仕事猫の二コマ', cameo: true },
    { file: 'cameo-oct29-4-transparent.webp', name: '赤い頬の猫', cameo: true },
    { file: 'cameo-oct29-5-transparent.webp', name: 'コンのポーズ', cameo: true },
    { file: 'cameo-oct29-6.webp', name: '笑う人物の漫画', cameo: true }
  ];
  const random = (min, max) => min + Math.random() * (max - min);
  let enabled = true;
  try { enabled = localStorage.getItem(storageKey) !== 'false'; } catch (_) { /* Optional preference. */ }
  const interval = 6000;
  const active = new Set();
  const maxCats = 6;
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
  const obstructed = () => scrolling || document.getElementById('siteHeader')?.classList.contains('is-open');
  const show = async (manual) => {
    if (document.hidden || active.size >= maxCats || (!manual && (!enabled || motion.matches || obstructed()))) return;
    const cat = choose();
    if (cat.cameo && [...active].some(visit => visit.cameo)) return;
    const node = walker.cloneNode(true);
    node.removeAttribute('id');
    const picture = node.querySelector('img');
    picture.removeAttribute('id');
    walker.parentElement.appendChild(node);
    const visit = { node, animation: null, timer: null, cameo: !!cat.cameo };
    active.add(visit);
    call.disabled = active.size >= maxCats;
    picture.src = new URL(cat.file, base).href;
    picture.alt = cat.name;
    try { await picture.decode(); } catch (_) { retire(visit); return; }
    if (!active.has(visit) || document.hidden) return;
    const mobile = innerWidth <= 600;
    const width = mobile ? 80 : 104;
    const height = mobile ? 76 : 96;
    const viewportWidth = walker.parentElement.clientWidth || innerWidth;
    const viewportHeight = walker.parentElement.clientHeight || innerHeight;
    if (cat.cameo) {
      // Text-bearing cutouts stay upright and appear one at a time near an edge.
      node.classList.add('is-cameo');
      const cameoWidth = Math.min(mobile ? 200 : 290, viewportWidth * .52);
      const cameoHeight = Math.min(cameoWidth * picture.naturalHeight / picture.naturalWidth, viewportHeight * .38);
      const actualWidth = cameoHeight * picture.naturalWidth / picture.naturalHeight;
      node.style.width = actualWidth + 'px';
      node.style.height = cameoHeight + 'px';
      picture.style.transform = 'none';
      const x = Math.random() < .5 ? 12 : Math.max(12, viewportWidth - actualWidth - 12);
      const y = Math.max(90, viewportHeight - cameoHeight - 24);
      node.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      node.hidden = false;
      if (motion.matches || typeof node.animate !== 'function') {
        visit.timer = setTimeout(() => retire(visit), 11000);
        return;
      }
      visit.animation = node.animate([
        { opacity: 0, offset: 0 },
        { opacity: 1, offset: .08 },
        { opacity: 1, offset: .88 },
        { opacity: 0, offset: 1 }
      ], { duration: 11000, easing: 'linear', fill: 'forwards' });
      visit.animation.onfinish = () => retire(visit);
      if (scrolling) { visit.animation.pause(); node.classList.add('is-paused'); }
      return;
    }
    const rightwards = Math.random() > .5;
    picture.style.transform = cat.left && rightwards || !cat.left && !rightwards ? 'scaleX(-1)' : 'none';
    node.hidden = false;
    const headerHeight = document.getElementById('siteHeader')?.getBoundingClientRect().height || 76;
    const minY = Math.min(headerHeight + 22, Math.max(0, viewportHeight - height - 18));
    const maxY = Math.max(minY, viewportHeight - height - 22);
    if (motion.matches || typeof node.animate !== 'function') {
      node.style.transform = `translate3d(${rightwards ? 14 : Math.max(14, viewportWidth - width - 14)}px, ${maxY}px, 0)`;
      visit.timer = setTimeout(() => retire(visit), 9000);
      return;
    }
    const depthVisit = Math.random() < .28;
    node.classList.toggle('is-depth', depthVisit);
    const startX = rightwards ? -width * .25 : viewportWidth - width * .75;
    const endX = rightwards ? viewportWidth + width : -width * 2;
    const fromY = random(minY, maxY);
    const toY = random(minY, maxY);
    const wave = random(35, mobile ? 65 : 105);
    const frames = [];
    for (let step = 0; step <= 8; step++) {
      const t = step / 8;
      const x = startX + (endX - startX) * t;
      const y = Math.max(minY, Math.min(maxY,
        fromY + (toY - fromY) * t + Math.sin(t * Math.PI * 3) * wave * Math.sin(t * Math.PI)));
      // A flat photograph gains a little perspective only on occasional visits.
      const approach = Math.sin(t * Math.PI) ** 6;
      const z = depthVisit ? -70 + approach * 210 : 0;
      const turn = depthVisit ? Math.sin(t * Math.PI * 2) * 12 : 0;
      frames.push({
        offset: t,
        transform: `translate3d(${x}px, ${y}px, 0) perspective(700px) translateZ(${z}px) rotateY(${turn}deg)`,
        opacity: step === 8 ? 0 : 1
      });
    }
    node.style.transform = frames[0].transform;
    visit.animation = node.animate(frames, {
      duration: random(22000, 26000), easing: 'linear', fill: 'forwards'
    });
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
  schedule(3000);
})();
