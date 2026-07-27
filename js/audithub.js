const viewer=document.querySelector('#viewer');
const viewerImage=viewer.querySelector('img');
document.querySelectorAll('[data-image]').forEach(button=>{
  button.addEventListener('click',()=>{
    viewerImage.src=button.dataset.image;
    viewer.showModal();
  });
});
document.querySelector('#closeViewer').addEventListener('click',()=>viewer.close());
viewer.addEventListener('click',event=>{if(event.target===viewer)viewer.close();});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&viewer.open)viewer.close();});
