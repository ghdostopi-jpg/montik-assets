(function(){
/* TIA "Amber Noir" end card. Top group on the bright wall (ink), action group on her black top (cream).
   cfg: lead ("kar doma."), leadAt, name, action, url, logo (bool). Stays to the last frame. */
var C = {{cfg_json}};
if (typeof C === 'string') { try { C = JSON.parse(C); } catch (e) { C = {}; } }
var root = document.getElementById('root');
var SANS = '"IBM Plex Sans", sans-serif', DISP = '"IBM Plex Sans Condensed", sans-serif', SERIF = '"IBM Plex Serif", Georgia, serif';
var TG = 'linear-gradient(100deg,#2A1D10 0%,#7A4C17 46%,#9C6A27 56%,#2A1D10 100%)';
function div(css, txt, parent) { var d = document.createElement('div'); d.style.cssText = css; if (txt != null) d.textContent = txt; (parent || root).appendChild(d); return d; }
var GLOW_INK = '0 0 26px rgba(246,239,228,.8), 0 0 3px rgba(246,239,228,.7)';
var GLOW_CREAM = '0 3px 20px rgba(18,16,20,.65)';
var top = div('position:absolute;left:180px;width:720px;top:' + (C.y || 300) + 'px;text-align:center;');
function masked(txt, css, parent) {
  var m = div('overflow:hidden;padding:0.14em 0 0.1em;margin:-0.14em 0 -0.1em;', null, parent);
  var chars = String(txt).split('');
  var line = div('white-space:nowrap;', null, m);
  return chars.map(function (ch, i) {
    var s = document.createElement('span'); s.textContent = ch === ' ' ? '\u00a0' : ch;
    s.style.cssText = 'display:inline-block;' + css + 'background-size:' + (chars.length * 100) + '% 100%;background-position:' + (i / Math.max(chars.length - 1, 1) * 100) + '% 0;';
    line.appendChild(s); return s;
  });
}
var lead = masked(C.lead || 'kar doma.', 'font-family:' + SERIF + ';font-style:italic;font-weight:400;font-size:72px;line-height:1.1;color:transparent;background-image:linear-gradient(100deg,#B07A2E 0%,#6E4314 42%,#B9853E 66%,#7A4C17 100%);-webkit-background-clip:text;background-clip:text;filter:drop-shadow(0 0 10px rgba(246,239,228,.85));', top);
div('height:14px;', null, top);
var name = masked(C.name || 'MicroInfusion Set', 'font-family:' + SERIF + ';font-weight:500;font-size:84px;line-height:1.04;color:transparent;background-image:' + TG + ';-webkit-background-clip:text;background-clip:text;filter:drop-shadow(0 0 12px rgba(246,239,228,.9));', top);
var rule = div('height:2px;width:260px;margin:22px auto 0;background:linear-gradient(90deg,rgba(185,133,62,0),#B9853E 20%,#D8B26E 50%,#B9853E 80%,rgba(185,133,62,0));transform-origin:50% 50%;', null, top);
var logo = null;
if (C.logo !== false) logo = div('height:64px;margin:22px auto 0;width:300px;background:var(--brand-logo) center/contain no-repeat;', null, top);

var act = div('position:absolute;left:180px;width:720px;top:' + (C.y2 || 1300) + 'px;text-align:center;');
var action = div('display:inline-flex;align-items:center;gap:22px;font-family:' + DISP + ';font-weight:700;font-size:52px;letter-spacing:0.22em;padding-left:0.22em;color:#F6EFE4;text-shadow:' + GLOW_CREAM + ';', null, act);
var actTxt = div('', C.action || 'ODKRIJ VEČ', action);
var arrow = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
arrow.setAttribute('width', 70); arrow.setAttribute('height', 24); arrow.setAttribute('viewBox', '0 0 70 24');
arrow.innerHTML = '<path d="M2 12 H64 M52 2 L66 12 L52 22" fill="none" stroke="#E2BD78" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1 1"/>';
action.appendChild(arrow);
var arrowPath = arrow.firstChild;
var url = div('margin-top:26px;font-family:' + SANS + ';font-weight:600;font-size:64px;letter-spacing:0.01em;color:#F6EFE4;text-shadow:' + GLOW_CREAM + ';', C.url || 'biostile.si', act);
var uline = div('height:3px;width:330px;margin:12px auto 0;background:#E2BD78;transform-origin:0 50%;', null, act);

var cl = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };
var oExpo = function (p) { return p >= 1 ? 1 : 1 - Math.pow(2, -10 * p); };
var oQuart = function (p) { return 1 - Math.pow(1 - p, 4); };
function rise(spans, t0, t, stag) { spans.forEach(function (s, i) { var p = oExpo(cl((t - t0 - i * stag) / 0.6)); s.style.transform = 'translateY(' + ((1 - p) * 105).toFixed(1) + '%)'; }); }
window.montikSeek = function (t) {
  rise(lead, C.leadAt != null ? C.leadAt : 0.05, t, 0.018);
  rise(name, 0.3, t, 0.02);
  rule.style.transform = 'scaleX(' + oExpo(cl((t - 0.7) / 0.8)).toFixed(3) + ')';
  if (logo) { var pl = oQuart(cl((t - 0.85) / 0.6)); logo.style.opacity = pl.toFixed(3); logo.style.transform = 'translateY(' + (12 * (1 - pl)).toFixed(1) + 'px)'; }
  var pa = oQuart(cl((t - 0.45) / 0.55));
  action.style.opacity = pa.toFixed(3); action.style.transform = 'translateY(' + (26 * (1 - pa)).toFixed(1) + 'px)';
  action.style.filter = pa < 0.98 ? 'blur(' + ((1 - pa) * 6).toFixed(2) + 'px)' : 'none';
  actTxt.style.letterSpacing = (0.34 - 0.12 * pa).toFixed(3) + 'em';
  arrowPath.setAttribute('stroke-dashoffset', (1 - oQuart(cl((t - 0.8) / 0.5))).toFixed(3));
  arrow.style.transform = 'translateX(' + (6 * Math.sin(Math.max(0, t - 1.4) * 3.2)).toFixed(2) + 'px)';
  var pu = oQuart(cl((t - 0.6) / 0.55));
  url.style.opacity = pu.toFixed(3); url.style.transform = 'translateY(' + (22 * (1 - pu)).toFixed(1) + 'px)';
  url.style.filter = pu < 0.98 ? 'blur(' + ((1 - pu) * 6).toFixed(2) + 'px)' : 'none';
  uline.style.transform = 'scaleX(' + oExpo(cl((t - 1.0) / 0.7)).toFixed(3) + ')';
};
window.montikSeek(0, 0);
})();
