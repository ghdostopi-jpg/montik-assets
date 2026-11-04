(function(){
/* TIA "Amber Noir" caption engine v2: the MicroInfusion caption-style treatments
   (stomp, editorial, box tiles, marker, dynamic, split, tilt3d, cinematic title, stack)
   in one identity. Stable phrase groups, word-by-word reveal, soft exits, readable holds.
   cfg: mode, words [[text,s,e]] clip seconds, keys, tone ink|cream, x,y,w, align, anchor, size, max,
   lines (stomp rows), plate (tilt), items (stack), title/kicker/s (title). */
var C = {{cfg_json}};
if (typeof C === 'string') { try { C = JSON.parse(C); } catch (e) { C = {}; } }
var mode = C.mode || 'dynamic'; if (mode === 'word') mode = 'dynamic';
var words = C.words || [], tone = C.tone || 'ink';
var norm = function (s) { return String(s).toLowerCase().replace(/[.,!?;:"“”„®]/g, ''); };
var keys = (C.keys || []).map(norm);
var PAL = {
  ink: { text: '#121014', lead: '#94601F', on: '#121014', grad: 'linear-gradient(100deg,#B07A2E 0%,#6E4314 42%,#B9853E 66%,#7A4C17 100%)',
    glow: '0 0 22px rgba(246,239,228,.8), 0 0 3px rgba(246,239,228,.7)', drop: 'drop-shadow(0 0 10px rgba(246,239,228,.85))', tile: '#E4D4B2', line: '#B9853E' },
  cream: { text: '#F6EFE4', lead: '#E2BD78', on: '#121014', grad: 'linear-gradient(100deg,#F6E3BC 0%,#D8B26E 38%,#B5843E 62%,#F0D9A6 100%)',
    glow: '0 3px 18px rgba(18,16,20,.6), 0 1px 3px rgba(18,16,20,.5)', drop: 'drop-shadow(0 3px 12px rgba(18,16,20,.6))', tile: '#E4D4B2', line: '#D8B26E' }
};
var P = PAL[tone] || PAL.ink;
var DISP = '"IBM Plex Sans Condensed", "IBM Plex Sans", sans-serif', BODY = '"IBM Plex Sans", sans-serif', SERIF = '"IBM Plex Serif", Georgia, serif';
var size = C.size || ({ stomp: 120, dynamic: 76, editorial: 46, marker: 66, tilt: 72, box: 60, split: 96, stack: 60, title: 92 })[mode] || 64;
var x = C.x != null ? C.x : 180, w = C.w != null ? C.w : 720, y = C.y != null ? C.y : 400;
var align = C.align || 'center', anchor = C.anchor || 'center';
var J = align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center';

var cl = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };
var ip = function (t, a, b, v0, v1, ease) { var p = cl((t - a) / (b - a)); return v0 + (v1 - v0) * (ease ? ease(p) : p); };
var oExpo = function (p) { return p >= 1 ? 1 : 1 - Math.pow(2, -10 * p); };
var oQuart = function (p) { return 1 - Math.pow(1 - p, 4); };
var iQuart = function (p) { return p * p * p * p; };
var ioCubic = function (p) { return p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; };
var spring = function (p, k) { k = k || 0.35; return p >= 1 ? 1 : 1 - Math.exp(-6 * p) * Math.cos(p * Math.PI * (1 + k * 6) * 0.5) ; };
var gradCss = function (g) { return 'color:transparent;background-image:' + g + ';-webkit-background-clip:text;background-clip:text;'; };
var NS = 'http://www.w3.org/2000/svg';
function E(tag, css, parent, txt) { var e = document.createElement(tag); if (css) e.style.cssText = css; if (txt != null) e.textContent = txt; if (parent) parent.appendChild(e); return e; }

var root = document.getElementById('root');
var box = E('div', 'position:absolute;left:' + x + 'px;width:' + w + 'px;top:' + y + 'px;text-align:' + align + ';' +
  (anchor === 'center' ? 'transform:translateY(-50%);' : anchor === 'bottom' ? 'transform:translateY(-100%);' : ''), root);

/* ---------- phrase groups ---------- */
var max = C.max || 9, pages = [], cur = [];
words.forEach(function (wd) {
  var prev = cur[cur.length - 1];
  if (cur.length && (cur.length >= max || /[.?!]$/.test(prev[0]) || (C.breakComma === true && /,$/.test(prev[0]) && cur.length >= 2))) { pages.push(cur); cur = []; }
  cur.push(wd);
});
if (cur.length) pages.push(cur);
var isKey = function (t) { return keys.indexOf(norm(t)) >= 0; };
var lastKeyT = function (pg) { for (var i = pg.length - 1; i >= 0; i--) if (isKey(pg[i][0])) return pg[i][1]; return null; };

var spans = [], pageEls = [];
pages.forEach(function (pg, pi) {
  var el = E('div', 'position:relative;display:none;', box);
  var hairline = null, rows = [];
  var line = E('div', 'font-size:' + size + 'px;display:inline-flex;flex-wrap:wrap;align-items:baseline;position:relative;justify-content:' + J + ';max-width:' + w + 'px;' +
    'gap:' + (({ editorial: '0.12em 0.42em', box: '0.08em 0.1em', marker: '0.06em 0.3em', split: '0', stomp: '0', tilt: '0.04em 0.28em' })[mode] || '0.04em 0.26em') + ';', el);
  if (mode === 'tilt') line.style.perspective = '900px';
  if (mode === 'stomp' || mode === 'split') { line.style.flexDirection = 'column'; line.style.alignItems = align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center'; line.style.gap = mode === 'split' ? '0.02em' : '0.04em'; }
  var plate = null;
  if (C.plate) {
    line.style.padding = '0.26em 0.48em 0.32em';
    plate = E('div', 'position:absolute;inset:0;background:rgba(18,16,20,.9);border-radius:14px;box-shadow:0 10px 40px rgba(18,16,20,.25);', line);
  }
  var rowLens = mode === 'split' ? [Math.ceil(pg.length / 2), 99] : (C.lines || []);
  var rowEl = null, li = 0, cnt = 0, rowIdx = -1;
  var lk = lastKeyT(pg);
  pg.forEach(function (wd, wi) {
    var k = isKey(wd[0]);
    var caps = mode === 'stomp' || mode === 'box' || mode === 'dynamic' || mode === 'split' || mode === 'tilt' || (mode === 'editorial' && !k);
    var txt = caps ? wd[0].toUpperCase() : wd[0];
    var serif = k && (mode === 'editorial' || mode === 'marker' && false);
    var plateTxt = !!C.plate;
    var fam = serif ? SERIF : (mode === 'editorial' || mode === 'marker') ? BODY : DISP;
    var fw = serif ? 400 : mode === 'editorial' ? 500 : mode === 'marker' ? 700 : 700;
    var fs = serif ? size * 1.7 : size;
    var wrap = E('span', 'position:relative;display:inline-block;' + (mode === 'editorial' ? 'overflow:hidden;padding:0.16em 0.04em 0.14em;margin:-0.16em -0.04em -0.14em;' : ''));
    var col = plateTxt ? (k ? '#E2BD78' : '#F6EFE4') : (k ? P.lead : P.text);
    var css = 'position:relative;display:inline-block;white-space:nowrap;font-family:' + fam + ';font-style:' + (serif ? 'italic' : 'normal') + ';font-weight:' + fw + ';font-size:' + fs + 'px;' +
      'line-height:' + (mode === 'stomp' ? 0.94 : 1.06) + ';letter-spacing:' + (mode === 'editorial' && !serif ? '0.14em' : serif ? '-0.01em' : mode === 'stomp' ? '0' : '0.01em') + ';z-index:1;';
    if (serif) css += gradCss(P.grad) + 'filter:' + P.drop + ';';
    else if (mode === 'box') css += 'color:#F6EFE4;';
    else if (mode === 'marker' && k) css += 'color:#121014;';
    else css += 'color:' + col + ';text-shadow:' + (plateTxt ? 'none' : mode === 'tilt' ? tiltShadow() : P.glow) + ';';
    var s = E('span', css, null, txt);
    var o = { s: s, wrap: wrap, t0: wd[1], t1: wd[2], key: k, page: pi, i: wi, base: css };
    if (mode === 'box') {
      wrap.style.cssText += 'padding:0.2em 0.28em 0.12em;border-radius:7px;transform-origin:50% 100%;background:rgba(18,16,20,.92);margin-top:-1px;';
      o.tile = wrap;
    }
    if (mode === 'marker' && k) {
      var sv = document.createElementNS(NS, 'svg'); sv.setAttribute('viewBox', '0 0 240 60'); sv.setAttribute('preserveAspectRatio', 'none');
      sv.style.cssText = 'position:absolute;left:-6%;top:10%;width:112%;height:92%;overflow:visible;z-index:0;';
      var pth = document.createElementNS(NS, 'path'); pth.setAttribute('d', 'M4 26 C 60 14, 140 18, 236 10 L 238 46 C 150 52, 70 50, 2 56 Z'); pth.setAttribute('fill', tone === 'ink' ? '#C98B3B' : '#D8B26E'); pth.setAttribute('opacity', '.95');
      sv.appendChild(pth); wrap.appendChild(sv); o.swipe = sv;
      if (wd[1] === lk) {
        var sc = document.createElementNS(NS, 'svg'); sc.setAttribute('viewBox', '0 0 240 30'); sc.setAttribute('preserveAspectRatio', 'none');
        sc.style.cssText = 'position:absolute;left:0;bottom:-0.32em;width:100%;height:0.3em;overflow:visible;z-index:0;';
        var sp = document.createElementNS(NS, 'path'); sp.setAttribute('d', 'M6 14 C 70 4, 150 22, 236 8 M18 22 C 90 16, 160 26, 226 18');
        sp.setAttribute('fill', 'none'); sp.setAttribute('stroke', tone === 'ink' ? '#121014' : '#F6EFE4'); sp.setAttribute('stroke-width', '4'); sp.setAttribute('stroke-linecap', 'round');
        sp.setAttribute('pathLength', '1'); sp.setAttribute('stroke-dasharray', '1 1'); sp.setAttribute('vector-effect', 'non-scaling-stroke');
        sc.appendChild(sp); wrap.appendChild(sc); o.scrib = sp;
      }
    }
    if (mode === 'dynamic') { o.u = E('span', 'position:absolute;left:0;right:0;bottom:-0.06em;height:0.09em;border-radius:0.05em;background:' + P.lead + ';transform:scaleX(0);transform-origin:0 50%;', wrap); }
    if (mode === 'stomp') { o.ring = E('span', css + 'position:absolute;left:0;top:0;color:transparent;text-shadow:none;-webkit-text-stroke:3px ' + (k ? P.lead : P.text) + ';opacity:0;', wrap, txt); }
    wrap.appendChild(s);
    if (mode === 'stomp' || mode === 'split') {
      if (!rowEl || cnt >= (rowLens[li] || 99)) { if (rowEl) li++; cnt = 0; rowIdx++; rowEl = E('div', 'display:flex;white-space:nowrap;justify-content:' + J + ';gap:0.24em;' + (mode === 'split' ? 'overflow:hidden;padding:0 0.1em;' : ''), line); rows.push({ el: rowEl, t0: wd[1], idx: rowIdx, key: false }); }
      rowEl.appendChild(wrap); cnt++; o.row = rows[rows.length - 1]; if (k) o.row.key = true;
    } else line.appendChild(wrap);
    spans.push(o);
  });
  if (mode === 'split') rows.forEach(function (r) { if (r.key) r.el.querySelectorAll('span > span:last-child').forEach(function (n) { n.style.color = P.lead; }); });
  if (mode === 'editorial') hairline = E('div', 'height:2px;width:260px;margin:16px ' + (align === 'center' ? 'auto' : align === 'right' ? '0 0 auto' : '0') + ' 0;background:' + P.grad + ';transform:scaleX(0);', el);
  pageEls.push({ el: el, plate: plate, t0: pg[0][1], rows: rows, hair: hairline });
});
function tiltShadow() {
  var d = []; for (var k = 0; k < 5; k++) d.push('0 ' + (k + 1) + 'px 0 rgba(' + (tone === 'ink' ? '148,96,31,' : '0,0,0,') + (0.22 - k * 0.03).toFixed(2) + ')');
  return d.join(', ') + ', ' + (tone === 'ink' ? '0 0 22px rgba(246,239,228,.75)' : '0 10px 26px rgba(0,0,0,.35)');
}
function fitRows(rows) { // stomp + split rows: each row fills the column width (typographic lockup)
  rows.forEach(function (r) {
    var kids = r.el.querySelectorAll('span > span'); kids.forEach(function (k) { k.style.fontSize = size + 'px'; });
    var f = Math.min((C.maxSize || 200) / size, w / (r.el.scrollWidth || 1));
    kids.forEach(function (k) { k.style.fontSize = (size * f).toFixed(1) + 'px'; });
    r.el.style.gap = (0.24 * size * f).toFixed(1) + 'px';
  });
}

/* ---------- stack + cinematic title ---------- */
var items = [];
if (mode === 'stack') {
  (C.items || []).forEach(function (it, i) {
    var row = E('div', 'position:relative;overflow:hidden;padding:0.1em 0 0.22em;' + (i ? 'margin-top:0.04em;' : ''), box);
    var serif = !!it[2];
    var t = E('div', 'display:inline-block;white-space:nowrap;font-family:' + (serif ? SERIF : DISP) + ';font-style:' + (serif ? 'italic' : 'normal') + ';font-weight:' + (serif ? 400 : 700) + ';' +
      'font-size:' + (serif ? size * 1.25 : size) + 'px;line-height:1.05;' + (serif ? gradCss(P.grad) + 'filter:' + P.drop + ';' : 'text-transform:uppercase;letter-spacing:0.02em;color:' + P.text + ';text-shadow:' + P.glow + ';'), row, it[0]);
    var rule = E('div', 'height:2px;width:' + Math.round(size * 1.8) + 'px;background:' + P.grad + ';margin-top:0.14em;transform-origin:' + (align === 'right' ? '100%' : '0') + ' 50%;' + (align === 'right' ? 'margin-left:auto;' : ''), row);
    items.push({ t: t, rule: rule, s: it[1] });
  });
}
var title = null;
if (mode === 'title') {
  var kick = C.kicker ? E('div', 'font-family:' + BODY + ';font-weight:600;font-size:30px;text-transform:uppercase;color:' + P.text + ';text-shadow:' + P.glow + ';margin-bottom:18px;padding-left:0.5em;', box, C.kicker) : null;
  var rowT = E('div', 'display:flex;align-items:center;justify-content:center;gap:22px;', box);
  var hl = E('div', 'height:2px;width:56px;background:' + P.grad + ';transform-origin:100% 50%;', rowT);
  var TG = tone === 'ink' ? 'linear-gradient(100deg,#2A1D10 0%,#7A4C17 46%,#9C6A27 56%,#2A1D10 100%)' : P.grad;
  var tl = E('div', 'display:flex;font-family:' + SERIF + ';font-weight:500;font-size:' + size + 'px;line-height:1;white-space:nowrap;', rowT);
  var hr = E('div', 'height:2px;width:56px;background:' + P.grad + ';transform-origin:0 50%;', rowT);
  var chars = Array.from(String(C.title || ''));
  var cs = chars.map(function (c, i) {
    return E('span', 'display:inline-block;white-space:pre;' + gradCss(TG) + 'background-size:' + (chars.length * 100) + '% 100%;background-position:' + (i / Math.max(chars.length - 1, 1) * 100) + '% 0;', tl, c);
  });
  title = { kick: kick, hl: hl, hr: hr, tl: tl, cs: cs, s: C.s || 0 };
}

/* ---------- seek ---------- */
window.montikSeek = function (t, dur) {
  dur = dur || 1e9;
  var outP = ip(t, dur - 0.3, dur, 0, 1, oQuart);
  box.style.opacity = String(1 - outP);
  box.style.filter = outP > 0.01 ? 'blur(' + (outP * 6).toFixed(2) + 'px)' : 'none';
  var active = -1;
  for (var i = 0; i < pageEls.length; i++) if (t >= pageEls[i].t0 - 0.12) active = i;
  pageEls.forEach(function (p, i) {
    p.el.style.display = i === active ? 'block' : 'none';
    if (i !== active) return;
    if (p.rows.length) fitRows(p.rows);
    var nx = pageEls[i + 1] ? pageEls[i + 1].t0 - 0.12 : 1e9;
    var ex = ip(t, nx - 0.24, nx, 0, 1, oQuart);
    p.el.style.opacity = String(1 - ex);
    p.el.style.transform = 'translateY(' + (-14 * ex).toFixed(1) + 'px)';
    p.el.style.filter = ex > 0.01 ? 'blur(' + (ex * 5).toFixed(2) + 'px)' : 'none';
    if (p.plate) { // plate grows with the revealed lines
      var pp = ip(t, p.t0 - 0.12, p.t0 + 0.3, 0, 1, oExpo), L = p.plate.parentNode, H = L.offsetHeight, maxB = 0, minL = 1e9, maxR = 0, pad = parseFloat(getComputedStyle(L).paddingBottom) || 0;
      spans.forEach(function (o) { if (o.page === i && t >= o.t0 - 0.12) { maxB = Math.max(maxB, o.wrap.offsetTop + o.wrap.offsetHeight); } });
      var target = Math.max(0, H - maxB - pad);
      p._b = p._b == null ? target : target; // seekable: no history, just the current target
      p.plate.style.clipPath = 'inset(0 ' + ((1 - pp) * 100).toFixed(2) + '% ' + target.toFixed(1) + 'px 0 round 14px)';
      p.plate.style.transition = 'none';
    }
    if (p.hair) p.hair.style.transform = 'scaleX(' + ip(t, p.t0 + 0.12, p.t0 + 0.65, 0, 1, ioCubic).toFixed(3) + ')';
    if (mode === 'box') p.el.firstChild.style.transform = 'rotate(' + (i % 2 ? 1 : -1.1) + 'deg)';
    if (mode === 'split') p.rows.forEach(function (r) {
      var lf = t - r.t0 + 0.1, pr = oExpo(cl(lf / 0.5));
      r.el.firstChild && (r.el.style.transform = 'translateX(' + ((r.idx ? 1 : -1) * 420 * (1 - pr)).toFixed(1) + 'px)');
      r.el.style.opacity = lf < 0 ? '0' : ip(lf, 0, 0.16, 0, 1).toFixed(3);
      r.el.style.filter = pr < 0.99 ? 'blur(' + ((1 - oQuart(cl(lf / 0.28))) * 8).toFixed(2) + 'px)' : 'none';
    });
  });
  // the spoken word of the page (for box + dynamic)
  var spoken = -1;
  spans.forEach(function (o, k) { if (o.page === active && t >= o.t0 - 0.03) spoken = k; });
  spans.forEach(function (o, k) {
    if (o.page !== active) return;
    var lt = t - o.t0, s = o.s, op = 1, ty = 0, sc = 1, sx = 1, sy = 1, rx = 0, rz = 0, bl = 0, tr = '';
    var act = k === spoken && t <= (spans[k + 1] && spans[k + 1].page === active ? spans[k + 1].t0 : o.t1 + 0.35);
    if (mode === 'stomp') {
      var p = cl((lt + 0.04) / 0.17); op = cl((lt + 0.04) / 0.06);
      sc = 1 + 0.75 * (1 - iQuart(p)); bl = p < 1 ? (sc - 1) * 6 : 0;
      if (lt > 0.13) { var q = cl((lt - 0.13) / 0.32); sx = 1 + 0.06 * Math.sin(q * Math.PI) * (1 - q); sy = 1 - 0.07 * Math.sin(q * Math.PI) * (1 - q); }
      if (o.ring) { var r = cl((lt - 0.13) / 0.5); o.ring.style.opacity = lt < 0.13 ? '0' : String(0.7 * (1 - oQuart(r))); o.ring.style.transform = 'scale(' + (1 + 0.3 * oExpo(r)).toFixed(3) + ')'; o.ring.style.fontSize = s.style.fontSize; }
    } else if (mode === 'editorial') {
      var pe = cl((lt + 0.12) / 0.5); ty = (1 - oExpo(pe)) * 100; op = lt < -0.12 ? 0 : 1; bl = (1 - oQuart(cl((lt + 0.12) / 0.36))) * 6;
      tr = 'translateY(' + ty.toFixed(1) + '%)';
    } else if (mode === 'box') {
      var g = spring(cl((lt + 0.08) / 0.45)); op = lt < -0.08 ? 0 : 1;
      o.tile.style.opacity = String(op); o.tile.style.transform = 'scaleY(' + Math.max(0.001, g).toFixed(3) + ')';
      o.tile.style.background = act ? '#D8B26E' : o.key ? P.tile : 'rgba(18,16,20,.92)';
      s.style.color = act || o.key ? '#121014' : '#F6EFE4';
      ty = (1 - oExpo(cl((lt + 0.05) / 0.3))) * 40; tr = 'translateY(' + ty.toFixed(1) + '%)';
    } else if (mode === 'marker') {
      var pm = oExpo(cl((lt + 0.07) / 0.36)); op = cl((lt + 0.07) / 0.14);
      rz = (o.i % 2 ? 4 : -4) * (1 - pm); ty = 26 * (1 - pm);
      if (o.swipe) o.swipe.style.clipPath = 'inset(0 ' + ((1 - ioCubic(cl((lt - 0.0) / 0.3))) * 100).toFixed(2) + '% 0 0)';
      if (o.scrib) o.scrib.setAttribute('stroke-dashoffset', (1 - ioCubic(cl((lt - 0.3) / 0.36))).toFixed(3));
    } else if (mode === 'dynamic') {
      var pd = spring(cl((lt + 0.07) / 0.42), 0.25); op = lt < -0.07 ? 0 : 1;
      sc = (0.6 + 0.4 * pd) * (act ? 1.08 : 1);
      s.style.color = act || o.key ? P.lead : P.text;
      if (o.u) { var ui = oExpo(cl((lt + 0.03) / 0.2)); var show = act || o.key; o.u.style.transform = 'scaleX(' + (show ? ui : 0).toFixed(3) + ')'; o.u.style.opacity = o.key && !act ? '0.65' : '1'; }
    } else if (mode === 'tilt') {
      var pt = spring(cl((lt + 0.1) / 0.6), 0.2); op = cl((lt + 0.1) / 0.14);
      tr = 'rotateX(' + (-85 * (1 - pt)).toFixed(1) + 'deg) rotateY(' + ((o.i - 1) * 6 * (1 - pt)).toFixed(1) + 'deg)';
      s.style.transformOrigin = '50% 100%';
    } else if (mode === 'split') { op = 1; }
    s.style.opacity = op.toFixed(3);
    if (mode !== 'box' || true) s.style.transform = (tr ? tr + ' ' : 'translateY(' + ty.toFixed(1) + 'px) ') + 'rotate(' + rz.toFixed(2) + 'deg) scale(' + (sc * sx).toFixed(3) + ',' + (sc * sy).toFixed(3) + ')';
    if (mode !== 'editorial' || !o.key) s.style.filter = bl > 0.05 ? 'blur(' + bl.toFixed(2) + 'px)' : (o.key && mode === 'editorial' ? P.drop : 'none');
    else s.style.filter = (bl > 0.05 ? 'blur(' + bl.toFixed(2) + 'px) ' : '') + P.drop;
  });
  items.forEach(function (it) {
    var p = cl((t - it.s + 0.1) / 0.6);
    it.t.style.transform = 'translateY(' + ((1 - oExpo(p)) * 110).toFixed(1) + '%)';
    it.rule.style.transform = 'scaleX(' + ip(t, it.s + 0.12, it.s + 0.7, 0, 1, oExpo).toFixed(3) + ')';
  });
  if (title) {
    var f = (t - title.s) * 30, sweep = ip(f, 10, 60, -40, 140, ioCubic);
    title.tl.style.letterSpacing = ip(f, 0, 36, 0.5, -0.01, oExpo).toFixed(3) + 'em';
    title.cs.forEach(function (c, i) {
      var st = i * 1.3;
      c.style.backgroundImage = 'linear-gradient(100deg, rgba(255,255,255,0) ' + (sweep - 14) + '%, rgba(255,236,200,0.9) ' + sweep + '%, rgba(255,255,255,0) ' + (sweep + 14) + '%), ' + TG;
      c.style.opacity = ip(f, st, st + 10, 0, 1).toFixed(3);
      c.style.filter = 'blur(' + ip(f, st, st + 14, 10, 0, oQuart).toFixed(2) + 'px) ' + P.drop;
      c.style.transform = 'translateY(' + ip(f, st, st + 16, 18, 0, oExpo).toFixed(1) + 'px)';
    });
    var hs = ip(f, 14, 34, 0, 1, ioCubic);
    title.hl.style.transform = 'scaleX(' + hs.toFixed(3) + ')'; title.hr.style.transform = 'scaleX(' + hs.toFixed(3) + ')';
    if (title.kick) { title.kick.style.letterSpacing = ip(f, 6, 40, 0.9, 0.5, oExpo).toFixed(3) + 'em'; title.kick.style.opacity = ip(f, 6, 18, 0, 0.9).toFixed(3); }
  }
};
window.montikSeek(0, 0);
})();
