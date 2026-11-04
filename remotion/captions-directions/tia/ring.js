(function(){
/* TIA hand-drawn ring callout: a loose double-loop drawn around a product detail, with a small four-point sparkle.
   cfg: cx, cy, rx, ry, rot (deg), color, delay (s). */
var C = {{cfg_json}};
if (typeof C === 'string') { try { C = JSON.parse(C); } catch (e) { C = {}; } }
var cx = C.cx || 540, cy = C.cy || 960, rx = C.rx || 160, ry = C.ry || 200, rot = C.rot || -8, col = C.color || '#D8B26E', d0 = C.delay || 0;
var NS = 'http://www.w3.org/2000/svg', root = document.getElementById('root');
var svg = document.createElementNS(NS, 'svg');
svg.setAttribute('width', 1080); svg.setAttribute('height', 1920); svg.setAttribute('viewBox', '0 0 1080 1920');
svg.style.cssText = 'position:absolute;inset:0;overflow:visible;';
root.appendChild(svg);
// a loose loop that overshoots its start, like a quick pen stroke
var pts = [], n = 64;
for (var i = 0; i <= n; i++) {
  var a = -Math.PI * 0.62 + (i / n) * Math.PI * 2.18;
  var wob = 1 + 0.035 * Math.sin(i * 0.9) + (i / n) * 0.07;
  pts.push([cx + Math.cos(a) * rx * wob, cy + Math.sin(a) * ry * wob]);
}
var d = 'M' + pts.map(function (p) { return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' L');
var shadow = document.createElementNS(NS, 'path');
shadow.setAttribute('d', d); shadow.setAttribute('fill', 'none'); shadow.setAttribute('stroke', 'rgba(18,16,20,.28)'); shadow.setAttribute('stroke-width', 9);
shadow.setAttribute('stroke-linecap', 'round'); shadow.setAttribute('pathLength', 1); shadow.setAttribute('stroke-dasharray', '1 1');
shadow.setAttribute('transform', 'rotate(' + rot + ' ' + cx + ' ' + cy + ') translate(2 4)');
var path = shadow.cloneNode(); path.setAttribute('stroke', col); path.setAttribute('stroke-width', 6); path.setAttribute('transform', 'rotate(' + rot + ' ' + cx + ' ' + cy + ')');
svg.appendChild(shadow); svg.appendChild(path);
var sx = cx + rx * 0.86, sy = cy - ry * 0.92;
var star = document.createElementNS(NS, 'path');
star.setAttribute('d', 'M0 -26 C3 -6 6 -3 26 0 C6 3 3 6 0 26 C-3 6 -6 3 -26 0 C-6 -3 -3 -6 0 -26 Z');
star.setAttribute('fill', col);
svg.appendChild(star);
var cl = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };
var ioCubic = function (p) { return p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; };
var oBack = function (p) { var c = 1.6; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); };
window.montikSeek = function (t, dur) {
  dur = dur || 1e9; t -= d0;
  var p = ioCubic(cl(t / 0.75));
  var out = cl((t + d0 - (dur - 0.4)) / 0.4);
  [path, shadow].forEach(function (e) { e.setAttribute('stroke-dashoffset', (1 - p).toFixed(4)); e.setAttribute('opacity', (1 - out).toFixed(3)); });
  var s = cl((t - 0.6) / 0.45);
  star.setAttribute('transform', 'translate(' + sx + ' ' + sy + ') rotate(' + (40 * (1 - s) + 8 * Math.sin(t * 2)) + ') scale(' + (s <= 0 ? 0.001 : oBack(s) * (1 - out)) + ')');
};
window.montikSeek(0, 0);
})();
