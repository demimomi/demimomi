(() => {
  "use strict";
  const layer = document.getElementById("goldenButterflies");
  const sun = document.querySelector("#heroSystem .solar-core");
  const cat = document.querySelector(".resident-cat");
  if (!layer || !cat || typeof layer.animate !== "function") return;
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const flights = [];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const framesFor = (index) => {
    const w = innerWidth, h = innerHeight;
    const catRect = cat.getBoundingClientRect();
    const sunRect = sun?.getBoundingClientRect();
    const sunVisible = sunRect && sunRect.bottom > 90 && sunRect.top < h - 50;
    const mix = sunVisible ? index / 7 : 1;
    const sunX = sunVisible ? sunRect.left + sunRect.width * .5 : catRect.left;
    const sunY = sunVisible ? sunRect.top + sunRect.height * .65 : catRect.top;
    const x = clamp(sunX * (1 - mix) + (catRect.left + catRect.width * .4) * mix + (index % 3 - 1) * 28, 20, w - 36);
    const y = clamp(sunY * (1 - mix) + (catRect.top + catRect.height * .55) * mix, 120, h - 24);
    const rise = Math.min(y - 64, 180 + (index % 4) * 48);
    const sway = Math.min(w * .07, 46);
    return Array.from({length:9}, (_, step) => {
      const t = step / 8;
      const side = Math.sin(t * Math.PI * 3 + index * .8) * sway * Math.sin(t * Math.PI);
      return { offset:t, transform:`translate3d(${clamp(x + side, 12, w - 32)}px,${y - rise * t}px,0) scale(${.68 + (index % 3) * .15})`, opacity:step === 0 || step === 8 ? 0 : .48 + (index % 3) * .12 };
    });
  };
  const stop = () => {
    for (const flight of flights) flight.animation.cancel();
    flights.length = 0;
    layer.replaceChildren();
  };
  const syncPause = () => {
    layer.classList.toggle("is-paused", document.hidden);
    for (const flight of flights) document.hidden ? flight.animation.pause() : flight.animation.play();
  };
  const start = () => {
    stop();
    if (motion.matches) return;
    for (let index = 0; index < 8; index++) {
      const node = document.createElement("span");
      node.className = "golden-butterfly";
      node.innerHTML = '<span class="golden-butterfly-shape"><span class="golden-butterfly-wing left"></span><span class="golden-butterfly-wing right"></span><span class="golden-butterfly-body"></span></span>';
      node.firstElementChild.style.animationDelay = `-${index * .7}s`;
      layer.appendChild(node);
      const duration = 30000 + (index % 4) * 4500;
      const animation = node.animate(framesFor(index), { duration, iterations:Infinity, easing:"linear" });
      animation.currentTime = (index + .5) / 8 * duration;
      flights.push({ animation, index });
    }
    syncPause();
  };
  let queued = false;
  const update = () => {
    if (queued || !flights.length) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      for (const flight of flights) flight.animation.effect.setKeyframes(framesFor(flight.index));
    });
  };
  window.addEventListener("resize", update, {passive:true});
  window.addEventListener("scroll", update, {passive:true});
  document.addEventListener("visibilitychange", syncPause);
  motion.addEventListener("change", start);
  start();
})();
