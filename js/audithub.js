(() => {
  const viewer = document.querySelector('#viewer');
  const viewerImage = viewer ? viewer.querySelector('img') : null;

  const bindLightbox = () => {
    if (!viewer || !viewerImage) return;
    document.querySelectorAll('[data-image]').forEach(button => {
      button.addEventListener('click', () => {
        viewerImage.src = button.dataset.image;
        viewer.showModal();
      });
    });
    document.querySelector('#closeViewer')?.addEventListener('click', () => viewer.close());
    viewer.addEventListener('click', event => { if (event.target === viewer) viewer.close(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && viewer.open) viewer.close(); });
  };

  const initSecurityStory = () => {
    const story = document.querySelector('[data-carousel="security"]');
    if (!story) return;
    const slides = [...story.querySelectorAll('.security-slide')];
    const counter = story.querySelector('.carousel-counter');
    let index = 0;
    const render = () => {
      slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
      if (counter) counter.textContent = `${String(index + 1).padStart(2,'0')} / ${String(slides.length).padStart(2,'0')}`;
    };
    story.querySelector('.carousel-prev')?.addEventListener('click', () => { index = (index - 1 + slides.length) % slides.length; render(); });
    story.querySelector('.carousel-next')?.addEventListener('click', () => { index = (index + 1) % slides.length; render(); });
    render();
  };

  const initGalleryCarousels = () => {
    document.querySelectorAll('.modern-gallery .showcase').forEach((showcase, groupIndex) => {
      const slides = [...showcase.querySelectorAll(':scope > .shot')];
      if (!slides.length) return;
      let index = 0;
      const nav = document.createElement('div');
      nav.className = 'gallery-carousel-nav';
      const prev = document.createElement('button');
      prev.type = 'button'; prev.className = 'carousel-arrow'; prev.setAttribute('aria-label','Vista anterior'); prev.textContent = '←';
      const dots = document.createElement('div'); dots.className = 'gallery-dots';
      const counter = document.createElement('span'); counter.className = 'gallery-counter';
      const next = document.createElement('button');
      next.type = 'button'; next.className = 'carousel-arrow'; next.setAttribute('aria-label','Vista siguiente'); next.textContent = '→';
      const dotButtons = slides.map((_, i) => {
        const dot = document.createElement('button'); dot.type='button'; dot.setAttribute('aria-label',`Ir a vista ${i+1}`);
        dot.addEventListener('click',()=>{index=i;render();}); dots.appendChild(dot); return dot;
      });
      nav.append(prev, dots, counter, next);
      showcase.after(nav);
      const render = () => {
        slides.forEach((slide, i) => {
          slide.classList.toggle('carousel-active', i === index);
          slide.setAttribute('aria-hidden', i === index ? 'false' : 'true');
        });
        dotButtons.forEach((d,i)=>d.classList.toggle('is-active',i===index));
        counter.textContent = `${index+1} / ${slides.length}`;
      };
      prev.addEventListener('click',()=>{index=(index-1+slides.length)%slides.length;render();});
      next.addEventListener('click',()=>{index=(index+1)%slides.length;render();});
      showcase.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){prev.click();}if(e.key==='ArrowRight'){next.click();}});
      showcase.tabIndex=0;
      render();
    });
  };

  bindLightbox();
  initSecurityStory();
  initGalleryCarousels();
})();

// v20260904.3 · horizontal Security rail (desktop shows multiple real screenshots)
(() => {
  const rail = document.querySelector('.security-rail');
  if (!rail) return;
  const move = dir => {
    const card = rail.querySelector('.security-card');
    const step = card ? card.getBoundingClientRect().width + 18 : rail.clientWidth * .7;
    rail.scrollBy({left: dir * step, behavior: 'smooth'});
  };
  document.querySelector('.security-rail-prev')?.addEventListener('click', () => move(-1));
  document.querySelector('.security-rail-next')?.addEventListener('click', () => move(1));
})();
