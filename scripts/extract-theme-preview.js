/**
 * Source: preview-src/*.html + styles/preview/*.css (SSoT)
 * Generates:
 *   - lib/preview-body.js — body inner HTML for Next /theme-preview
 *   - theme-preview.html — offline single file (inlined preview CSS + theme.css link)
 *   - public/theme.json — copy of root theme.json
 * Optionally fixes ../wallpapers/ url in genui.css for Next/webpack.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PREVIEW_SRC = path.join(ROOT, 'preview-src');
const OUT_PREVIEW_CSS = path.join(ROOT, 'styles', 'preview');
const OUT_BODY = path.join(ROOT, 'lib', 'preview-body.js');
const OUT_HTML = path.join(ROOT, 'theme-preview.html');

const CSS_ORDER = [
  'genui.css',
  'customize-grid.css',
  'components.css',
  'gallery-overrides.css',
];

const BODY_FRAGMENTS = [
  path.join(PREVIEW_SRC, '01-shell-top.html'),
  path.join(PREVIEW_SRC, 'fragments', 'cards-grid.html'),
  path.join(PREVIEW_SRC, '02-between-cards-and-screens.html'),
  path.join(PREVIEW_SRC, 'fragments', 'screens-grid.html'),
  path.join(PREVIEW_SRC, '03-between-screens-and-components.html'),
  path.join(PREVIEW_SRC, 'fragments', 'components.html'),
  path.join(PREVIEW_SRC, '04-shell-bottom.html'),
];

/** Inline before </body> in theme-preview.html — keep in sync with pages/theme-preview.js `glance-flow-init`. */
const GLANCE_FLOW_INLINE_SCRIPT = `(function(){
  var root=document.getElementById('glance-flow');
  if(!root)return;
  var prefersReduced = false;
  try { prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch(e) {}
  var playing = false;

  function qFlipNodes(){
    return Array.prototype.slice.call(root.querySelectorAll('[data-flip]'));
  }

  function rectMap(nodes){
    var m = new Map();
    nodes.forEach(function(el){
      var k = el.getAttribute('data-flip');
      if(!k) return;
      m.set(k, el.getBoundingClientRect());
    });
    return m;
  }

  function playFlip(prevRects, nodes, duration){
    if(prefersReduced) return;
    var ease = 'cubic-bezier(0.22, 1, 0.36, 1)';
    nodes.forEach(function(el){
      var k = el.getAttribute('data-flip');
      var a = prevRects.get(k);
      if(!a) return;
      var b = el.getBoundingClientRect();
      var dx = a.left - b.left;
      var dy = a.top - b.top;
      var sx = a.width ? (a.width / b.width) : 1;
      var sy = a.height ? (a.height / b.height) : 1;
      if(!isFinite(dx) || !isFinite(dy) || !isFinite(sx) || !isFinite(sy)) return;
      el.style.transformOrigin = '0 0';
      el.style.willChange = 'transform';
      el.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(' + sx + ',' + sy + ')';
      el.getBoundingClientRect();
      el.style.transition = 'transform ' + duration + 'ms ' + ease;
      el.style.transform = 'translate(0px,0px) scale(1,1)';
      window.setTimeout(function(){
        el.style.transition = '';
        el.style.transformOrigin = '';
        el.style.willChange = '';
        el.style.transform = '';
      }, duration + 30);
    });
  }

  function collapseC5(){
    root.querySelectorAll('.component-5').forEach(function(c5){
      c5.classList.remove('glance-c5--expanded');
    });
    root.querySelectorAll('.glance-c5-toggle').forEach(function(t){
      t.setAttribute('aria-expanded','false');
    });
  }
  root.addEventListener('click',function(e){
    var c5Btn=e.target.closest('.glance-c5-toggle');
    if(c5Btn){
      e.stopPropagation();
      var c5=c5Btn.closest('.component-5');
      if(!c5)return;
      var next=!c5.classList.contains('glance-c5--expanded');
      c5.classList.toggle('glance-c5--expanded',next);
      c5Btn.setAttribute('aria-expanded',next?'true':'false');
      return;
    }
    var btn=e.target.closest('.glance-advance-hit');
    if(!btn || !root.contains(btn))return;
    if(playing) return;
    var step=parseInt(root.getAttribute('data-glance-step')||'1',10);
    if(step!==1) return;
    playing = true;
    collapseC5();

    function setStep(to, dur){
      var nodes = qFlipNodes();
      var prev = rectMap(nodes);
      root.setAttribute('data-glance-step', String(to));
      window.requestAnimationFrame(function(){
        playFlip(prev, nodes, dur);
      });
    }

    setStep(2, 520);
    window.setTimeout(function(){ setStep(3, 560); }, 520 + 120);
    window.setTimeout(function(){ playing=false; }, 520 + 120 + 560 + 60);
  });
})();`;

const WALLPAPER_PATTERN =
  /background-image:url\(['"]?\.\.\/wallpapers\/[^'")]+['"]?\)/;
const WALLPAPER_REPLACEMENT =
  'background-image:linear-gradient(135deg,#1a2438 0%,#2d3548 45%,#1e2229 100%)';

const HTML_HEAD_AFTER_DOCTYPE = `<html lang="en"><head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>그라디언트 — preview gallery</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>
`;

const HTML_HEAD_SUFFIX = `</style>
<link rel="stylesheet" href="theme.css">
</head><body class="tp-page">
`;

const HTML_GENERATED_BANNER = `<!-- GENERATED FILE — do not edit by hand. Edit preview-src/ and styles/preview/, then run yarn extract-preview. -->
`;

function readCssFile(name) {
  const p = path.join(OUT_PREVIEW_CSS, name);
  if (!fs.existsSync(p)) throw new Error(`Missing CSS: ${p}`);
  return fs.readFileSync(p, 'utf8');
}

/** Inline bundle: safe wallpaper url for self-contained HTML */
function cssForInline() {
  return CSS_ORDER.map((name) => {
    let s = readCssFile(name);
    if (name === 'genui.css') s = s.replace(WALLPAPER_PATTERN, WALLPAPER_REPLACEMENT);
    return s.trimEnd();
  }).join('\n\n');
}

/**
 * Next/css-loader cannot resolve missing ../wallpapers — persist gradient in repo file.
 */
function ensureGenuiWebpackSafe() {
  const genuiPath = path.join(OUT_PREVIEW_CSS, 'genui.css');
  let t = fs.readFileSync(genuiPath, 'utf8');
  const next = t.replace(WALLPAPER_PATTERN, WALLPAPER_REPLACEMENT);
  if (next !== t) fs.writeFileSync(genuiPath, next + (next.endsWith('\n') ? '' : '\n'), 'utf8');
}

function assembleBodyInner() {
  const parts = BODY_FRAGMENTS.map((fragmentPath) => {
    if (!fs.existsSync(fragmentPath))
      throw new Error(`Missing preview fragment: ${fragmentPath}`);
    return fs.readFileSync(fragmentPath, 'utf8');
  });
  return parts.join('').trim();
}

function main() {
  ensureGenuiWebpackSafe();

  const inner = assembleBodyInner();

  fs.mkdirSync(path.dirname(OUT_BODY), { recursive: true });
  const bodyModule =
    '// Generated by scripts/extract-theme-preview.js — do not edit by hand.\n' +
    `export default ${JSON.stringify(inner)};\n`;
  fs.writeFileSync(OUT_BODY, bodyModule, 'utf8');

  const combinedCss = cssForInline();
  const fullHtml =
    `<!DOCTYPE html>\n` +
    HTML_GENERATED_BANNER +
    HTML_HEAD_AFTER_DOCTYPE +
    combinedCss +
    '\n' +
    HTML_HEAD_SUFFIX +
    inner +
    '\n<script>\n' +
    GLANCE_FLOW_INLINE_SCRIPT +
    '\n</script>\n' +
    '\n</body></html>\n';

  fs.writeFileSync(OUT_HTML, fullHtml, 'utf8');

  const themeJsonSrc = path.join(ROOT, 'theme.json');
  const pubDir = path.join(ROOT, 'public');
  fs.mkdirSync(pubDir, { recursive: true });
  fs.copyFileSync(themeJsonSrc, path.join(pubDir, 'theme.json'));

  console.log(
    'extract-theme-preview: wrote theme-preview.html, lib/preview-body.js, public/theme.json',
  );
}

main();
