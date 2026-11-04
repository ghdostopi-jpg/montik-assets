(function(){
/* TIA "Amber Noir" microchannel illustration: applicator presses, tiny channels open,
   serum travels into deeper layers. cfg: x, y, size (card px). Illustrative, not clinical. */
var C = {{cfg_json}};
if (typeof C === 'string') { try { C = JSON.parse(C); } catch (e) { C = {}; } }
var X = C.x != null ? C.x : 560, Y = C.y != null ? C.y : 290, S = C.size || 340;
var root = document.getElementById('root');
var NS = 'http://www.w3.org/2000/svg';
var card = document.createElement('div');
card.style.cssText = 'position:absolute;left:' + X + 'px;top:' + Y + 'px;width:' + S + 'px;height:' + S + 'px;border-radius:28px;overflow:hidden;' +
  'background:rgba(18,16,20,.9);box-shadow:0 18px 60px rgba(18,16,20,.35), inset 0 0 0 1.5px rgba(228,212,178,.55);transform-origin:100% 0;';
root.appendChild(card);
var svg = document.createElementNS(NS, 'svg');
svg.setAttribute('viewBox', '0 0 340 340'); svg.setAttribute('width', S); svg.setAttribute('height', S);
svg.style.cssText = 'position:absolute;inset:0;';
card.appendChild(svg);
function el(tag, at, parent) { var e = document.createElementNS(NS, tag); for (var k in at) e.setAttribute(k, at[k]); (parent || svg).appendChild(e); return e; }
var defs = el('defs', {});
var g1 = el('linearGradient', { id: 'derm', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
el('stop', { offset: '0', 'stop-color': '#E7B9A3' }, g1); el('stop', { offset: '1', 'stop-color': '#B8786A' }, g1);
var g2 = el('radialGradient', { id: 'glow' }, defs);
el('stop', { offset: '0', 'stop-color': '#F0C46E', 'stop-opacity': '.85' }, g2); el('stop', { offset: '1', 'stop-color': '#F0C46E', 'stop-opacity': '0' }, g2);
// skin layers
el('rect', { x: 0, y: 150, width: 340, height: 48, fill: '#F4DDCB' });
el('rect', { x: 0, y: 198, width: 340, height: 142, fill: 'url(#derm)' });
el('path', { d: 'M0 150 C 60 146, 110 154, 170 150 S 280 146, 340 151', stroke: '#FBEBDD', 'stroke-width': 3, fill: 'none' });
var glow = el('ellipse', { cx: 170, cy: 258, rx: 150, ry: 46, fill: 'url(#glow)', opacity: 0 });
// channels + drops
var xs = [86, 114, 142, 170, 198, 226, 254];
var chans = xs.map(function (x) { return el('line', { x1: x, y1: 150, x2: x, y2: 194, stroke: '#7A3E2E', 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-dasharray': '44 44', 'stroke-dashoffset': 44, opacity: .9 }); });
var drops = [];
xs.forEach(function (x, i) { for (var k = 0; k < 2; k++) drops.push({ c: el('circle', { cx: x, cy: 140, r: 5.5, fill: '#D99A3A', opacity: 0 }), d: i * 0.07 + k * 0.32, x: x }); });
// applicator head with microneedles
var head = el('g', {});
el('rect', { x: 62, y: 46, width: 216, height: 40, rx: 12, fill: '#E4D4B2' }, head);
el('rect', { x: 62, y: 46, width: 216, height: 12, rx: 6, fill: '#F6EFE4', opacity: .6 }, head);
xs.forEach(function (x) { el('path', { d: 'M' + (x - 3) + ' 86 L' + x + ' 104 L' + (x + 3) + ' 86 Z', fill: '#C9A45E' }, head); });
// labels
function label(txt, y, size) {
  var t = el('text', { x: 24, y: y, fill: '#F6EFE4', 'font-family': '"IBM Plex Sans Condensed", sans-serif', 'font-weight': 700, 'font-size': size, 'letter-spacing': '2' });
  t.textContent = txt; return t;
}
var l1 = label('MIKROKANALI', 32, 24);
var l2 = el('text', { x: 316, y: 322, fill: '#F6EFE4', 'font-family': '"IBM Plex Serif", Georgia, serif', 'font-style': 'italic', 'font-weight': 400, 'font-size': 30, 'text-anchor': 'end' });
l2.textContent = 'globlje';

var cl = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };
var oExpo = function (p) { return p >= 1 ? 1 : 1 - Math.pow(2, -10 * p); };
var oQuart = function (p) { return 1 - Math.pow(1 - p, 4); };
var ioCubic = function (p) { return p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; };
window.montikSeek = function (t, dur) {
  dur = dur || 1e9;
  var pin = oExpo(cl(t / 0.6)), pout = oQuart(cl((t - (dur - 0.45)) / 0.45));
  card.style.opacity = String(cl(t / 0.25) * (1 - pout));
  card.style.transform = 'scale(' + (0.9 + 0.1 * pin) + ') translateY(' + (-12 * pout) + 'px)';
  card.style.clipPath = 'circle(' + (150 * pin).toFixed(1) + '% at 100% 0%)';
  card.style.filter = pout > 0.01 ? 'blur(' + (pout * 6).toFixed(1) + 'px)' : 'none';
  // press 0.45-0.95, hold, lift 1.35-1.8
  var press = ioCubic(cl((t - 0.45) / 0.5)) * (1 - ioCubic(cl((t - 1.35) / 0.45)));
  head.setAttribute('transform', 'translate(0 ' + (52 * press).toFixed(2) + ')');
  chans.forEach(function (c, i) {
    var o = 44 * (1 - oQuart(cl((t - 0.8 - i * 0.03) / 0.45)));
    c.setAttribute('stroke-dashoffset', o.toFixed(2));
    c.setAttribute('opacity', (0.9 * (1 - 0.5 * cl((t - 2.6) / 0.8))).toFixed(3));
  });
  drops.forEach(function (d) {
    var p = cl((t - 1.45 - d.d) / 1.1);
    var e = ioCubic(p);
    d.c.setAttribute('cy', (140 + 120 * e).toFixed(2));
    d.c.setAttribute('opacity', (p <= 0 ? 0 : p < 0.85 ? 1 : 1 - (p - 0.85) / 0.15).toFixed(3));
  });
  glow.setAttribute('opacity', (0.9 * oQuart(cl((t - 2.2) / 0.8))).toFixed(3));
  l1.setAttribute('opacity', oQuart(cl((t - 0.9) / 0.4)).toFixed(3));
  l2.setAttribute('opacity', oQuart(cl((t - 2.3) / 0.5)).toFixed(3));
};
window.montikSeek(0, 0);
})();
