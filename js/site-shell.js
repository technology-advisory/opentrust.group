(() => {
  'use strict';
  const current = location.pathname.replace(/index\.html$/, '');
  const isHome = current === '/' || current === '';
  const isKnowledge = current.startsWith('/conocimiento/');
  const isApps = current.startsWith('/aplicaciones/') || current.startsWith('/apps/');
  const isTrajectory = current.startsWith('/trayectoria/') || current.startsWith('/sobre-mi/');
  const isSecurity = current.startsWith('/security/');
  const isContact = current.startsWith('/contacto/');
  const isLegal = current.startsWith('/legal/');
  const items = [
    ['Ecosistema','/#ecosistema',isHome,''],
    ['Conocimiento','/conocimiento/',isKnowledge,''],
    ['Aplicaciones','/aplicaciones/',isApps,''],
    ['Trayectoria','/trayectoria/',isTrajectory,''],
    ['Seguridad','/security/',isSecurity,''],
    ['Contacto','/contacto/',isContact,''],
    ['Legal','/legal/',isLegal,'nav-legal']
  ];
  const header=document.getElementById('site-header');
  if(header){
    header.className='site-header';
    header.innerHTML=`<div class="site-header__inner">
      <a class="brand" href="/" aria-label="OpenTrust Group, volver al inicio"><img class="brand-logo" src="/assets/opentrust-logo.svg" alt="OpenTrust Group" width="260" height="72"></a>
      <nav class="main-nav" id="main-nav" aria-label="Navegación principal">${items.map(([label,href,active,cls])=>`<a href="${href}"${active?' aria-current="page"':''}${cls?` class="${cls}"`:''}>${label}</a>`).join('')}</nav>
      <a class="status-pill" href="/status/" aria-label="Abrir estado de servicios"><span class="status-dot" aria-hidden="true"></span><span>Estado de servicios</span><span aria-hidden="true">→</span></a>
      <button class="menu-toggle" id="menu-toggle" type="button" aria-label="Abrir menú" aria-expanded="false" aria-controls="main-nav"><span></span><span></span><span></span></button>
    </div>`;
  }
  const footer=document.getElementById('site-footer');
  if(footer){
    footer.className='site-footer';
    footer.innerHTML=`<div class="site-footer__bg" aria-hidden="true"></div><div class="site-footer__inner site-footer__hero">
      <div><p class="site-footer__eyebrow">OPEN TRUST GROUP</p><h2>Conocimiento. Tecnología. <span>Confianza.</span></h2></div>
      <div class="site-footer__copy">Un ecosistema independiente para compartir, desarrollar y aplicar conocimiento en entornos digitales más seguros.</div>
      <a class="site-footer__button" href="/#ecosistema">Explorar el ecosistema <span>→</span></a>
    </div>`;
  }
  const toggle=document.getElementById('menu-toggle');
  const nav=document.getElementById('main-nav');
  if(toggle&&nav){
    toggle.addEventListener('click',()=>{const open=nav.classList.toggle('active');toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Cerrar menú':'Abrir menú');});
    nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('active');toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Abrir menú');}));
  }
  document.querySelectorAll('a[href]').forEach(link=>{
    const raw=link.getAttribute('href');
    if(!raw||raw.startsWith('#')||raw.startsWith('mailto:')||raw.startsWith('tel:')||raw.startsWith('javascript:')) return;
    try{const url=new URL(raw,location.href);if(/^https?:$/.test(url.protocol)&&url.origin!==location.origin){link.target='_blank';link.rel='noopener noreferrer';}}catch(_){ }
  });
})();