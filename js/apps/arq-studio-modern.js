document.addEventListener('DOMContentLoaded',()=>{
  const viewer=document.getElementById('viewer');
  const viewerImg=viewer?.querySelector('img');
  const close=document.getElementById('closeViewer');
  document.querySelectorAll('.arq-zoom[data-image]').forEach(btn=>btn.addEventListener('click',()=>{
    if(!viewer||!viewerImg)return;
    viewerImg.src=btn.dataset.image;
    viewerImg.alt=btn.querySelector('img')?.alt||'Vista ampliada de Arq Studio';
    if(typeof viewer.showModal==='function') viewer.showModal(); else viewer.setAttribute('open','');
  }));
  const closeViewer=()=>{if(!viewer)return;if(typeof viewer.close==='function'&&viewer.open)viewer.close();else viewer.removeAttribute('open');if(viewerImg)viewerImg.removeAttribute('src');};
  close?.addEventListener('click',closeViewer);
  viewer?.addEventListener('click',e=>{if(e.target===viewer)closeViewer();});

  document.querySelectorAll('[data-carousel]').forEach(carousel=>{
    const track=carousel.querySelector('[data-track]');
    const slides=[...carousel.querySelectorAll('.arq-slide')];
    const counter=carousel.querySelector('[data-counter]');
    const step=()=>slides[0]?.getBoundingClientRect().width+16||320;
    const update=()=>{
      const index=Math.max(0,Math.min(slides.length-1,Math.round(track.scrollLeft/step())));
      if(counter)counter.textContent=`${String(index+1).padStart(2,'0')} / ${String(slides.length).padStart(2,'0')}`;
    };
    carousel.querySelector('[data-prev]')?.addEventListener('click',()=>track.scrollBy({left:-step(),behavior:'smooth'}));
    carousel.querySelector('[data-next]')?.addEventListener('click',()=>track.scrollBy({left:step(),behavior:'smooth'}));
    track?.addEventListener('scroll',()=>requestAnimationFrame(update),{passive:true});
    update();
  });

  const tabs=[...document.querySelectorAll('[data-doc]')];
  const panels=[...document.querySelectorAll('[data-doc-panel]')];
  tabs.forEach(tab=>tab.addEventListener('click',()=>{
    const key=tab.dataset.doc;
    tabs.forEach(t=>{const active=t===tab;t.classList.toggle('is-active',active);t.setAttribute('aria-selected',String(active));});
    panels.forEach(p=>{const active=p.dataset.docPanel===key;p.classList.toggle('is-active',active);p.hidden=!active;});
  }));
});
