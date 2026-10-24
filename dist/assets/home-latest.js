(() => {
  const track=document.querySelector('#launch-track');
  if(!track)return;
  const previous=document.querySelector('[data-launch-scroll="previous"]');
  const next=document.querySelector('[data-launch-scroll="next"]');
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const update=()=>{
    previous.disabled=track.scrollLeft<2;
    next.disabled=track.scrollLeft>=track.scrollWidth-track.clientWidth-2;
  };
  const move=direction=>track.scrollBy({left:direction*(track.clientWidth+16),behavior:reduced.matches?'instant':'smooth'});
  previous.addEventListener('click',()=>move(-1));
  next.addEventListener('click',()=>move(1));
  track.addEventListener('scroll',update,{passive:true});
  track.addEventListener('keydown',event=>{
    if(event.target!==track)return;
    if(event.key==='ArrowRight'||event.key==='ArrowLeft'){
      event.preventDefault();move(event.key==='ArrowRight'?1:-1);
    }
  });
  window.addEventListener('resize',update,{passive:true});
  update();
})();
