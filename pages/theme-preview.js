import Head from 'next/head';
import Script from 'next/script';
import previewBody from '../lib/preview-body';

export default function ThemePreviewPage() {
  return (
    <>
      <Head>
        <title>그라디언트 — preview gallery</title>
      </Head>
      <div
        id="theme-preview-mount"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: previewBody }}
      />
      <Script id="glance-flow-init" strategy="afterInteractive">
        {`(function(){
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
      el.getBoundingClientRect(); // force reflow
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
})();`}
      </Script>
    </>
  );
}
