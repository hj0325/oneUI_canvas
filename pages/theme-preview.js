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
    if(!btn)return;
    var step=parseInt(root.getAttribute('data-glance-step')||'1',10);
    var to=parseInt(btn.getAttribute('data-advance-to')||'0',10);
    var ok=(step===1&&to===2)||(step===2&&to===3)||(step===3&&to===1);
    if(!ok)return;
    collapseC5();
    root.setAttribute('data-glance-step',String(to));
    if(to===1){
      root.querySelectorAll('.glance-advance-hit').forEach(function(b){
        b.removeAttribute('tabindex');
        b.removeAttribute('aria-hidden');
      });
    }else{
      btn.setAttribute('tabindex','-1');
      btn.setAttribute('aria-hidden','true');
    }
  });
})();`}
      </Script>
    </>
  );
}
