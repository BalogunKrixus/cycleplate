/* CyclePlate logo system — generates the mark, wordmark and lockups as SVG.
   The mark is a ring built from four arc segments: it reads simultaneously as
   a menstrual cycle (four phases moving around) and a plate seen from above. */

(function () {
  const PHASE = {
    menstrual:  '#B23A4B', // Replenish & Rest
    follicular: '#7C9A65', // Build & Energise
    ovulatory:  '#E0A33E', // Peak & Protect
    luteal:     '#96617F', // Nourish & Calm
  };
  const CLAY = '#C2410C';
  const INK  = '#3A2418';
  const CREAM = '#FBF4EC';

  // point on a circle, degrees measured clockwise from 12 o'clock
  function pt(cx, cy, r, deg) {
    const a = (deg - 90) * Math.PI / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  }
  function arcPath(cx, cy, r, start, end) {
    const [sx, sy] = pt(cx, cy, r, start);
    const [ex, ey] = pt(cx, cy, r, end);
    const large = (end - start) > 180 ? 1 : 0;
    return `M ${sx.toFixed(2)} ${sy.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${ex.toFixed(2)} ${ey.toFixed(2)}`;
  }

  /* Build the mark.
     opts: { size, mode:'phase'|'mono'|'cream', color, well:true, gap, weight } */
  function mark(opts = {}) {
    const size = opts.size || 120;
    const mode = opts.mode || 'phase';
    const gap = opts.gap == null ? 16 : opts.gap;     // degrees of empty space per junction
    const r = 42;
    const sw = opts.weight || 14;                      // arc thickness
    const well = opts.well !== false;
    const order = ['menstrual', 'follicular', 'ovulatory', 'luteal'];

    const half = gap / 2;
    let arcs = '';
    order.forEach((k, i) => {
      const start = i * 90 + half;
      const end = (i + 1) * 90 - half;
      let col = PHASE[k];
      if (mode === 'mono') col = opts.color || INK;
      if (mode === 'cream') col = opts.color || CREAM;
      arcs += `<path d="${arcPath(60, 60, r, start, end)}" stroke="${col}" stroke-width="${sw}" stroke-linecap="round" fill="none"/>`;
    });

    let wellEl = '';
    if (well) {
      const wc = mode === 'cream' ? (opts.color || CREAM) : (mode === 'mono' ? (opts.color || INK) : INK);
      wellEl = `<circle cx="60" cy="60" r="${r - sw - 6}" fill="none" stroke="${wc}" stroke-width="2.5" opacity="${mode === 'phase' ? 0.32 : 0.5}"/>`;
    }

    return `<svg viewBox="0 0 120 120" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="CyclePlate mark">${arcs}${wellEl}</svg>`;
  }

  /* Wordmark as inline SVG-free HTML so it uses the live font. */
  function wordmark(opts = {}) {
    const size = opts.size || 40;
    const onDark = opts.onDark;
    const cycleCol = onDark ? CREAM : INK;
    const plateCol = CLAY;
    return `<span class="cp-wordmark" style="font-size:${size}px"><span style="color:${cycleCol}">Cycle</span><span style="color:${plateCol}">Plate</span></span>`;
  }

  function lockup(opts = {}) {
    const dir = opts.dir || 'h'; // 'h' horizontal, 'v' vertical
    const m = opts.markSize || 56;
    const w = opts.wordSize || 34;
    const mk = mark({ size: m, mode: opts.mode || 'phase', color: opts.color, weight: opts.weight, gap: opts.gap });
    const wm = wordmark({ size: w, onDark: opts.onDark });
    if (dir === 'v') {
      return `<span class="cp-lock cp-lock-v">${mk}${wm}</span>`;
    }
    return `<span class="cp-lock cp-lock-h" style="gap:${opts.gap2 || 0.34}em">${mk}${wm}</span>`;
  }

  // Hydrate any element with data-cp attributes.
  function hydrate(root = document) {
    root.querySelectorAll('[data-cp]').forEach((el) => {
      if (el.dataset.cpDone) return;
      const type = el.dataset.cp;
      const o = {};
      ['size', 'markSize', 'wordSize', 'weight', 'gap', 'gap2'].forEach((k) => {
        if (el.dataset[k] != null) o[k] = parseFloat(el.dataset[k]);
      });
      ['mode', 'color', 'dir'].forEach((k) => { if (el.dataset[k] != null) o[k] = el.dataset[k]; });
      if (el.dataset.ondark != null) o.onDark = el.dataset.ondark === 'true';
      if (el.dataset.well != null) o.well = el.dataset.well === 'true';
      if (type === 'mark') el.innerHTML = mark(o);
      else if (type === 'wordmark') el.innerHTML = wordmark(o);
      else if (type === 'lockup') el.innerHTML = lockup(o);
      el.dataset.cpDone = '1';
    });
  }

  window.CyclePlate = { PHASE, CLAY, INK, CREAM, mark, wordmark, lockup, hydrate };
  if (document.readyState !== 'loading') hydrate();
  else document.addEventListener('DOMContentLoaded', () => hydrate());
})();
