(() => {
  'use strict';

  const rows = Array.from(document.querySelectorAll('#travel-times tbody tr'));
  const stops = rows.map(row => row.cells[0].textContent.trim());
  const travel = rows.map((row, index) =>
    Array.from(row.cells).slice(1).map((cell, column) =>
      column === index ? 0 : Number(cell.textContent)
    )
  );
  const clinic = stops.indexOf('診療所');
  const tours = [];

  function enumerate(path, remaining) {
    if (remaining.length === 0) {
      const route = [...path, 0];
      const minutes = route.slice(1).reduce((sum, stop, i) => sum + travel[route[i]][stop], 0);
      tours.push({ route, minutes });
      return;
    }
    for (const stop of remaining) {
      enumerate([...path, stop], remaining.filter(other => other !== stop));
    }
  }

  enumerate([0], stops.slice(1).map((_, i) => i + 1));
  tours.sort((a, b) => a.minutes - b.minutes);

  const budget = document.getElementById('budget');
  const priority = document.getElementById('clinic-first');
  const verdict = document.getElementById('verdict');
  const margin = document.getElementById('margin');
  const count = document.getElementById('count');
  const itinerary = document.getElementById('itinerary');

  function render(announce) {
    const limit = Number(budget.value);
    const candidates = priority.checked ? tours.filter(tour => tour.route[1] === clinic) : tours;
    const best = candidates[0];
    const feasible = candidates.filter(tour => tour.minutes <= limit).length;
    const spare = limit - best.minutes;

    document.getElementById('budget-value').value = String(limit);
    budget.setAttribute('aria-valuetext', limit + '分');
    document.getElementById('minutes').textContent = String(best.minutes);
    verdict.textContent = spare < 0 ? '間に合いません' : '間に合います';
    verdict.classList.toggle('late', spare < 0);
    if (spare < 0) {
      margin.textContent = '最短の順路でも、締切を' + (-spare) + '分過ぎます。';
    } else if (spare === 0) {
      margin.textContent = '締切ちょうどに港へ戻れます。';
    } else {
      margin.textContent = '締切の' + spare + '分前に港へ戻れます。';
    }
    count.textContent = '条件に合う' + candidates.length + '通りのうち、制限時間内に回れる順路は' + feasible + '通りです。';
    itinerary.replaceChildren(...best.route.map((stop, i) => {
      const item = document.createElement('li');
      const leg = document.createElement('span');
      leg.className = 'leg';
      leg.textContent = i === 0 ? '出発' : travel[best.route[i - 1]][stop] + '分';
      const name = document.createElement('strong');
      name.textContent = stops[stop];
      item.append(leg, name);
      return item;
    }));
    if (announce) {
      document.getElementById('live-result').textContent =
        '制限' + limit + '分。最短' + best.minutes + '分。' + margin.textContent + count.textContent;
    }
  }

  budget.addEventListener('input', () => render(false));
  budget.addEventListener('change', () => render(true));
  priority.addEventListener('change', () => render(true));
  render(false);
  document.getElementById('settings').hidden = false;
})();
