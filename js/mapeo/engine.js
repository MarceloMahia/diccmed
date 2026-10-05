// ---------------------------------------------------------------
// Motor único, data-driven, para todas las páginas de diagramas.
// Cada página solo define su LEVELS (ver *.data.js) y llama a
// DiagramEngine.init({ levels: LEVELS }).
//
// Formato de un nivel:
// {
//   label: 'Texto del tab',
//   step, title, subtitle,
//   columns: [ [nodo, nodo...], [nodo...], ... ],
//   connections: [ { from, to, label, approx?, vertical? } ],
//   compactView: <otro objeto con la misma forma>   // opcional
// }
// Un nivel puede ser `null` para mostrarlo como tab deshabilitado.
//
// "from"/"to" aceptan "nodo.campo" (ancla puntual) o "nodo"
// (ancla a la tarjeta entera). { approx: true } => línea punteada.
//
// "compactView": mientras el modo "Solo títulos" está activo, el
// motor reemplaza los datos del nivel por los de compactView.
//
// ---------------- Ruteo de líneas (sin pisar textos) -----------
// Las líneas NUNCA cruzan tarjetas: viajan solo por los huecos
// entre columnas y por "carriles" reservados arriba/abajo del
// diagrama.
//   - Columnas contiguas:  salida -> canal vertical en el hueco -> entrada.
//   - Columnas no contiguas: salida -> sube/baja a un carril
//     (arriba o abajo de todas las tarjetas) -> recorre el carril ->
//     baja/sube en el hueco previo a la columna destino -> entrada.
//   - Cada línea usa su propio canal (x distinta) dentro del hueco.
// Las etiquetas se ubican probando posiciones junto a la propia
// línea y descartando cualquiera que toque una tarjeta, otra línea
// u otra etiqueta. El ancho del hueco entre columnas se ajusta
// según cuántas líneas lo usan.
// ---------------------------------------------------------------

window.DiagramEngine = (function () {
  const NS = 'http://www.w3.org/2000/svg';
  const LANE = 28;      // separación vertical entre carriles
  const LH = 12;        // alto de línea de las etiquetas
  const CH_OFF = 18;    // distancia del primer canal a la columna de destino
  const CH_STEP = 10;   // separación entre canales de un mismo hueco
  const WRAPS = [64, 30, 22, 16, 12]; // anchos de corte (chars) a probar

  let LEVELS = {};
  let current = null;
  let compact = false;
  let els = {};
  let resizeTimer;
  const widthCache = new Map();

  function init(config) {
    LEVELS = config.levels || {};
    current =
      (location.hash && location.hash.slice(1) in LEVELS && LEVELS[location.hash.slice(1)] && location.hash.slice(1)) ||
      config.initial ||
      Object.keys(LEVELS).find(k => LEVELS[k]);

    els = {
      board: document.getElementById('board'),
      svg: document.getElementById('svg'),
      flow: document.getElementById('flow'),
      step: document.getElementById('step'),
      title: document.getElementById('title'),
      subtitle: document.getElementById('subtitle'),
      tabs: document.getElementById('tabs'),
      legend: document.getElementById('legend'),
      btnCompact: document.getElementById('btnCompact'),
    };

    if (els.btnCompact) els.btnCompact.addEventListener('click', toggleCompact);
    window.addEventListener('resize', scheduleDraw);
    window.addEventListener('hashchange', () => {
      const key = location.hash.slice(1);
      if (key && LEVELS[key] && key !== current) {
        current = key;
        renderAll();
      }
    });

    renderAll();
  }

  function displayData() {
    const raw = LEVELS[current];
    if (compact && raw && raw.compactView) return raw.compactView;
    return raw;
  }

  function toggleCompact() {
    compact = !compact;
    els.board.classList.toggle('compact', compact);
    els.btnCompact.classList.toggle('on', compact);
    els.btnCompact.textContent = compact ? 'Ver todos los campos' : 'Solo títulos';
    renderAll();
  }

  function renderTabs() {
    els.tabs.innerHTML = '';
    Object.keys(LEVELS).forEach(key => {
      const data = LEVELS[key];
      const t = document.createElement('div');
      const available = !!data;
      t.className = 'tab' + (key === current ? ' active' : '') + (available ? '' : ' disabled');
      t.textContent = (data && data.label) || key.charAt(0) + key.slice(1).toLowerCase();
      if (available) {
        t.addEventListener('click', () => {
          current = key;
          if (Object.keys(LEVELS).length > 1) history.replaceState(null, '', '#' + key);
          renderAll();
        });
      }
      els.tabs.appendChild(t);
    });
  }

  function fieldRow(nodeId, f) {
    const row = document.createElement('div');
    row.className = 'field';
    row.dataset.anchor = nodeId + '.' + f.id;
    const name = document.createElement('span');
    name.className = 'fname' + (f.badge || f.cond ? '' : ' dim');
    name.textContent = f.name;
    row.appendChild(name);
    if (f.badge) {
      const b = document.createElement('span');
      b.className = 'fbadge' + (f.badge === 'PK' ? ' pk' : '');
      b.textContent = f.badge;
      row.appendChild(b);
    } else if (f.val) {
      const v = document.createElement('span');
      v.className = 'fval' + (f.cond ? ' cond' : '');
      v.textContent = f.val;
      row.appendChild(v);
    }
    return row;
  }

  function makeCard(node) {
    const card = document.createElement('div');
    card.className = 'card' + (node.accent ? ' accent-' + node.accent : '');
    card.dataset.node = node.id;
    card.innerHTML = `<div class="sys">${node.system}</div>
      <div class="title">${node.title} ${node.alias ? '<span class="alias">' + node.alias + '</span>' : ''}</div>`;
    node.fields.forEach(f => card.appendChild(fieldRow(node.id, f)));
    if (node.note) {
      const n = document.createElement('div');
      n.className = 'note';
      n.textContent = node.note;
      card.appendChild(n);
    }
    return card;
  }

  function hasApprox(data) {
    return data.connections.some(c => c.approx);
  }

  function renderAll() {
    const data = displayData();
    renderTabs();
    if (!data) {
      els.flow.innerHTML = '';
      els.svg.innerHTML = '';
      return;
    }

    els.step.textContent = data.step;
    els.title.innerHTML = data.title;
    els.subtitle.innerHTML = data.subtitle;
    if (els.legend) els.legend.style.display = hasApprox(data) ? '' : 'none';

    els.flow.innerHTML = '';
    data.columns.forEach(col => {
      const stack = document.createElement('div');
      stack.className = 'stack';
      col.forEach(node => stack.appendChild(makeCard(node)));
      els.flow.appendChild(stack);
    });

    applyGap(data);
    requestAnimationFrame(draw);
  }

  // ---------------------------------------------------------------
  // Clasificación de conexiones (solo depende de los datos)
  // ---------------------------------------------------------------
  const nodeOf = sel => sel.split('.')[0];

  function columnIndex(data) {
    const m = {};
    data.columns.forEach((col, i) => col.forEach(n => { m[n.id] = i; }));
    return m;
  }

  // kind: vertical | same (misma columna) | adj (contigua) | long (salta columnas)
  // Se normaliza para que ci <= cj (la línea no tiene flecha, da igual el sentido).
  function classify(c, colOf) {
    let from = c.from, to = c.to;
    let ci = colOf[nodeOf(from)], cj = colOf[nodeOf(to)];
    if (ci === undefined || cj === undefined) return null;
    if (c.vertical) return { c, from, to, ci, cj, kind: 'vertical' };
    if (ci > cj) { [from, to] = [to, from]; [ci, cj] = [cj, ci]; }
    const kind = ci === cj ? 'same' : (cj - ci === 1 ? 'adj' : 'long');
    return { c, from, to, ci, cj, kind };
  }

  // Huecos (entre columna g y g+1) que usa una conexión.
  function gapsOf(k, nCols) {
    if (k.kind === 'adj') return [k.ci];
    if (k.kind === 'long') return [k.ci, k.cj - 1];
    if (k.kind === 'same') {
      const g = k.ci < nCols - 1 ? k.ci : k.ci - 1;
      return g >= 0 ? [g] : [];
    }
    return [];
  }

  // Ajusta el ancho del hueco entre columnas según cuántas líneas pasan.
  function applyGap(data) {
    const colOf = columnIndex(data);
    const n = data.columns.length;
    const cnt = {};
    data.connections.forEach(c => {
      const k = classify(c, colOf);
      if (k) gapsOf(k, n).forEach(g => { cnt[g] = (cnt[g] || 0) + 1; });
    });
    let gap = 130;
    Object.values(cnt).forEach(m => { gap = Math.max(gap, 120 + 14 * m); });
    els.flow.style.gap = gap + 'px';
  }

  // ---------------------------------------------------------------
  // Geometría (todo relativo al board)
  // ---------------------------------------------------------------
  function rectOf(el) {
    const b = el.getBoundingClientRect(), r = els.board.getBoundingClientRect();
    return { x: b.left - r.left, y: b.top - r.top, w: b.width, h: b.height };
  }

  function cardRect(sel) {
    const el = document.querySelector(`[data-node="${nodeOf(sel)}"]`);
    return el ? rectOf(el) : null;
  }

  // sel = "nodo.campo" (ancla puntual) o "nodo" (tarjeta). Si el campo está
  // oculto (modo "Solo títulos") cae a la tarjeta.
  function anchorPoint(sel, side) {
    let el = null;
    if (sel.includes('.')) {
      el = document.querySelector(`[data-anchor="${sel}"]`);
      if (el && el.getClientRects().length === 0) el = null;
      if (!el) el = document.querySelector(`[data-node="${nodeOf(sel)}"]`);
    } else {
      el = document.querySelector(`[data-node="${sel}"]`);
    }
    if (!el) return null;
    const b = el.getBoundingClientRect(), r = els.board.getBoundingClientRect();
    return {
      x: side === 'right' ? b.right - r.left : b.left - r.left,
      y: b.top - r.top + b.height / 2,
    };
  }

  // ---------------------------------------------------------------
  // Helpers de trazado
  // ---------------------------------------------------------------
  function clean(pts) {
    const out = [];
    pts.forEach(p => {
      const l = out[out.length - 1];
      if (!l || Math.abs(l.x - p.x) > 0.5 || Math.abs(l.y - p.y) > 0.5) out.push(p);
    });
    return out;
  }

  function roundedPath(pts, r) {
    let d = `M${pts[0].x},${pts[0].y}`;
    for (let i = 1; i < pts.length - 1; i++) {
      const p0 = pts[i - 1], p = pts[i], p2 = pts[i + 1];
      const l1 = Math.hypot(p.x - p0.x, p.y - p0.y), l2 = Math.hypot(p2.x - p.x, p2.y - p.y);
      const rr = Math.min(r, l1 / 2, l2 / 2);
      const s = { x: p.x + (p0.x - p.x) / l1 * rr, y: p.y + (p0.y - p.y) / l1 * rr };
      const e = { x: p.x + (p2.x - p.x) / l2 * rr, y: p.y + (p2.y - p.y) / l2 * rr };
      d += ` L${s.x},${s.y} Q${p.x},${p.y} ${e.x},${e.y}`;
    }
    const last = pts[pts.length - 1];
    return d + ` L${last.x},${last.y}`;
  }

  const segmentsOf = pts => pts.slice(1).map((p, i) => ({ x1: pts[i].x, y1: pts[i].y, x2: p.x, y2: p.y }));
  const segRect = s => ({
    x: Math.min(s.x1, s.x2) - 1.5, y: Math.min(s.y1, s.y2) - 1.5,
    w: Math.abs(s.x2 - s.x1) + 3, h: Math.abs(s.y2 - s.y1) + 3,
  });

  // ---------------------------------------------------------------
  // Etiquetas
  // ---------------------------------------------------------------
  // Parte una etiqueta larga en varias líneas. Pega el operador (=, →, ↔)
  // a la palabra siguiente.
  function wrapLabel(text, max) {
    const words = text.replace(/ ([=→↔]) /g, ' $1\u00A0').split(' ');
    const lines = [];
    let cur = '';
    words.forEach(w => {
      if (cur && (cur + ' ' + w).length > max) { lines.push(cur); cur = w; }
      else cur = cur ? cur + ' ' + w : w;
    });
    if (cur) lines.push(cur);
    return lines.map(l => l.replace(/\u00A0/g, ' '));
  }

  function textWidth(s) {
    if (widthCache.has(s)) return widthCache.get(s);
    const t = document.createElementNS(NS, 'text');
    t.textContent = s;
    els.svg.appendChild(t);
    const w = t.getComputedTextLength();
    els.svg.removeChild(t);
    widthCache.set(s, w);
    return w;
  }

  // Posiciones candidatas junto a los tramos de la línea (arriba/abajo de los
  // horizontales, a los costados de los verticales), empezando por el centro.
  function candidates(segs, w, h) {
    const out = [], G = 5;
    const len = s => Math.abs(s.x2 - s.x1) + Math.abs(s.y2 - s.y1);
    const hor = segs.filter(s => s.y1 === s.y2 && s.x1 !== s.x2).sort((p, q) => len(q) - len(p));
    const ver = segs.filter(s => s.x1 === s.x2 && s.y1 !== s.y2).sort((p, q) => len(q) - len(p));

    hor.forEach(s => {
      const x0 = Math.min(s.x1, s.x2), x1 = Math.max(s.x1, s.x2);
      const mid = (x0 + x1) / 2 - w / 2, xs = [];
      for (let x = x0 + 2; x <= x1 - 2 - w; x += 6) xs.push(x);
      xs.sort((p, q) => Math.abs(p - mid) - Math.abs(q - mid));
      xs.forEach(x => {
        out.push({ x, y: s.y1 - G - h, w, h });
        out.push({ x, y: s.y1 + G, w, h });
      });
    });
    ver.forEach(s => {
      const y0 = Math.min(s.y1, s.y2), y1 = Math.max(s.y1, s.y2);
      const mid = (y0 + y1) / 2 - h / 2, ys = [];
      for (let y = y0 + 2; y <= y1 - 2 - h; y += 4) ys.push(y);
      ys.sort((p, q) => Math.abs(p - mid) - Math.abs(q - mid));
      ys.forEach(y => {
        out.push({ x: s.x1 + G + 3, y, w, h });
        out.push({ x: s.x1 - G - 3 - w, y, w, h });
      });
    });
    return out;
  }

  function countHits(box, obs, bounds) {
    const b = { x: box.x - 2, y: box.y - 2, w: box.w + 4, h: box.h + 4 }; // margen del halo
    let n = 0;
    if (b.x < 0 || b.y < 0 || b.x + b.w > bounds.w || b.y + b.h > bounds.h) n += 5;
    for (const o of obs) {
      if (b.x < o.x + o.w && b.x + b.w > o.x && b.y < o.y + o.h && b.y + b.h > o.y) n++;
    }
    return n;
  }

  // Prueba de menos a más líneas de texto; devuelve la primera posición sin
  // choques. Si no hay ninguna, la de menos choques.
  function placeLabel(text, segs, obs, bounds) {
    const variants = [...new Set(WRAPS.map(m => JSON.stringify(wrapLabel(text, m))))].map(s => JSON.parse(s));
    let best = null;
    for (const lines of variants) {
      const w = Math.max(...lines.map(textWidth)), h = lines.length * LH;
      for (const box of candidates(segs, w, h)) {
        const n = countHits(box, obs, bounds);
        if (n === 0) return { lines, box };
        if (!best || n < best.n) best = { lines, box, n };
      }
    }
    if (!best && segs.length) {
      const lines = wrapLabel(text, 22);
      const w = Math.max(...lines.map(textWidth)), h = lines.length * LH, s = segs[0];
      best = { lines, box: { x: (s.x1 + s.x2) / 2 - w / 2, y: (s.y1 + s.y2) / 2 - h - 5, w, h } };
    }
    return best;
  }

  function drawLabel(pick, approx) {
    const t = document.createElementNS(NS, 'text');
    t.setAttribute('text-anchor', 'middle');
    if (approx) t.setAttribute('class', 'approx');
    pick.lines.forEach((ln, i) => {
      const ts = document.createElementNS(NS, 'tspan');
      ts.setAttribute('x', pick.box.x + pick.box.w / 2);
      ts.setAttribute('y', pick.box.y + i * LH + LH - 3);
      ts.textContent = ln;
      t.appendChild(ts);
    });
    els.svg.appendChild(t);
  }

  // ---------------------------------------------------------------
  // Dibujo
  // ---------------------------------------------------------------
  function draw() {
    const data = displayData();
    if (!data) return;
    const colOf = columnIndex(data);
    const nCols = data.columns.length;
    const items = data.connections.map(c => classify(c, colOf)).filter(Boolean);

    // 1) Carriles: se elige arriba/abajo según la altura de los extremos y
    //    se reserva el espacio como padding del board.
    const fr0 = rectOf(els.flow);
    let nTop = 0, nBot = 0;
    items.forEach(k => {
      if (k.kind !== 'long') return;
      const a = anchorPoint(k.from, 'right'), b = anchorPoint(k.to, 'left');
      if (!a || !b) { k.skip = true; return; }
      const top = (a.y + b.y) / 2 - fr0.y < fr0.h / 2;
      k.lane = top ? 'top' : 'bottom';
      k.laneIdx = top ? nTop++ : nBot++;
    });
    els.board.style.paddingTop = (nTop ? 20 + nTop * LANE : 20) + 'px';
    els.board.style.paddingBottom = (nBot ? 24 + nBot * LANE : 30) + 'px';

    // 2) Geometría final (ya con el padding aplicado)
    els.svg.innerHTML = '';
    const br = els.board.getBoundingClientRect();
    const bounds = { w: br.width, h: br.height };
    const stacks = Array.from(els.flow.children).map(rectOf);
    const fr = rectOf(els.flow);
    const used = {};
    const slotX = g => {
      const k = used[g] || 0;
      used[g] = k + 1;
      return stacks[g + 1].x - CH_OFF - k * CH_STEP;
    };

    const paths = [];
    items.forEach(k => {
      if (k.skip) return;
      let pts = null;

      if (k.kind === 'vertical') {
        const ra = cardRect(k.from), rb = cardRect(k.to);
        if (!ra || !rb) return;
        const down = ra.y <= rb.y;
        const a = { x: ra.x + ra.w / 2, y: down ? ra.y + ra.h : ra.y };
        const b = { x: rb.x + rb.w / 2, y: down ? rb.y : rb.y + rb.h };
        const my = (a.y + b.y) / 2;
        pts = Math.abs(a.x - b.x) < 1 ? [a, b] : [a, { x: a.x, y: my }, { x: b.x, y: my }, b];

      } else if (k.kind === 'same') {
        const side = k.ci < nCols - 1 ? 'right' : 'left';
        const g = side === 'right' ? k.ci : k.ci - 1;
        if (g < 0) return;
        const a = anchorPoint(k.from, side), b = anchorPoint(k.to, side);
        if (!a || !b) return;
        const x = slotX(g);
        pts = [a, { x, y: a.y }, { x, y: b.y }, b];

      } else {
        const a = anchorPoint(k.from, 'right'), b = anchorPoint(k.to, 'left');
        if (!a || !b) return;
        if (k.kind === 'adj') {
          const x = slotX(k.ci);
          pts = [a, { x, y: a.y }, { x, y: b.y }, b];
        } else {
          const x1 = slotX(k.ci), x2 = slotX(k.cj - 1);
          const ly = k.lane === 'top' ? 20 + k.laneIdx * LANE : fr.y + fr.h + 24 + k.laneIdx * LANE;
          pts = [a, { x: x1, y: a.y }, { x: x1, y: ly }, { x: x2, y: ly }, { x: x2, y: b.y }, b];
        }
      }

      pts = clean(pts);
      if (pts.length >= 2) paths.push({ k, pts, segs: segmentsOf(pts) });
    });

    // 3) Líneas
    paths.forEach(p => {
      const el = document.createElementNS(NS, 'path');
      el.setAttribute('d', roundedPath(p.pts, 7));
      if (p.k.c.approx) el.setAttribute('class', 'approx');
      els.svg.appendChild(el);
    });

    // 4) Etiquetas: obstáculos = tarjetas + todas las líneas + etiquetas ya puestas
    const obs = [];
    els.flow.querySelectorAll('.card').forEach(el => {
      const r = rectOf(el);
      obs.push({ x: r.x - 3, y: r.y - 3, w: r.w + 6, h: r.h + 6 });
    });
    paths.forEach(p => p.segs.forEach(s => obs.push(segRect(s))));

    paths.forEach(p => {
      const pick = placeLabel(p.k.c.label, p.segs, obs, bounds);
      if (!pick) return;
      drawLabel(pick, p.k.c.approx);
      obs.push(pick.box);
    });
  }

  function scheduleDraw() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(draw, 50);
  }

  return { init };
})();