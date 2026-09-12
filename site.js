const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-toggle');
const menu = document.querySelector('#mobile-menu');
function closeMenu(){menu.hidden=true;menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','Abrir menu');}
menuButton.addEventListener('click',()=>{const opening=menu.hidden;menu.hidden=!opening;menuButton.setAttribute('aria-expanded',String(opening));menuButton.setAttribute('aria-label',opening?'Fechar menu':'Abrir menu');});
menu.addEventListener('click',event=>{if(event.target.closest('a'))closeMenu();});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!menu.hidden){closeMenu();menuButton.focus();}});
document.addEventListener('click',event=>{if(!header.contains(event.target)&&!menu.hidden)closeMenu();});
const wide=matchMedia('(min-width: 1081px)');wide.addEventListener('change',event=>{if(event.matches)closeMenu();});
let framePending=false;addEventListener('scroll',()=>{if(!framePending){requestAnimationFrame(()=>{header.classList.toggle('scrolled',scrollY>32);framePending=false;});framePending=true;}},{passive:true});
// Credential fields stay empty until real professional information is supplied.
const professionalProfile={education:[],cro:null,specializations:[],courses:[],experience:null};
if('IntersectionObserver' in window){
  const navLinks=[...document.querySelectorAll('.desktop-nav a')];
  const sectionObserver=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){navLinks.forEach(link=>{if(link.hash==='#'+entry.target.id)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});}}},{rootMargin:'-10% 0px -65% 0px'});
  document.querySelectorAll('main section[id]').forEach(section=>sectionObserver.observe(section));
  const motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
  if(!motionPreference.matches){
    const motionObserver=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-revealed');motionObserver.unobserve(entry.target);}});
    },{threshold:0.12,rootMargin:'0px 0px -25px 0px'});
    document.querySelectorAll('.positioning .section-title,.about-copy .section-title,.implant h2,.reviews .section-title,.final-cta h2').forEach(element=>{element.classList.add('scroll-reveal');motionObserver.observe(element);});
    document.querySelectorAll('.about-photo,.smile-photo').forEach(element=>{element.classList.add('image-reveal');motionObserver.observe(element);});
    motionPreference.addEventListener('change',event=>{if(event.matches){motionObserver.disconnect();document.querySelectorAll('.is-revealed').forEach(element=>element.classList.remove('is-revealed'));}});
  }
}
// Manual, accessible review carousel. No automatic rotation.
const reviewTrack=document.querySelector('#review-track');
if(reviewTrack){
  const originalReviews=[...reviewTrack.querySelectorAll('.review')];
  const reviewNames=['Diogo Polastreli','Ricardo Dantas','Juliana Barbosa'];
  const reviewDots=[...document.querySelectorAll('[data-review]')];
  let activeReview=0;
  let reviewAnimating=false;
  const useMobileCards=()=>matchMedia('(max-width: 650px)').matches;
  async function selectReview(index,announce=true){
    if(reviewAnimating)return;
    const previousReview=activeReview;
    const nextReview=(index+originalReviews.length)%originalReviews.length;
    const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
    activeReview=nextReview;
    reviewDots.forEach((dot,i)=>{if(i===activeReview)dot.setAttribute('aria-current','true');else dot.removeAttribute('aria-current');});
    if(useMobileCards()){
      const card=originalReviews[activeReview];
      reviewTrack.scrollTo({left:card.offsetLeft-originalReviews[0].offsetLeft,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
    }else if(nextReview!==previousReview && !reduceMotion && reviewTrack.animate){
      reviewAnimating=true;
      const forward=(nextReview-previousReview+3)%3===1;
      const currentCards=[...reviewTrack.querySelectorAll('.review')];
      const distance=currentCards[1].getBoundingClientRect().left-currentCards[0].getBoundingClientRect().left;
      const duplicate=(forward?currentCards[0]:currentCards[2]).cloneNode(true);
      duplicate.setAttribute('aria-hidden','true');duplicate.setAttribute('inert','');
      if(forward)reviewTrack.appendChild(duplicate);else reviewTrack.prepend(duplicate);
      reviewTrack.classList.add('is-switching');
      const cards=[...reviewTrack.querySelectorAll('.review')];
      const animations=cards.map(card=>card.animate([
        {transform:forward?'translateX(0px)':`translateX(${-distance}px)`},
        {transform:forward?`translateX(${-distance}px)`:'translateX(0px)'}
      ],{duration:550,easing:'cubic-bezier(.22,1,.36,1)',fill:'forwards'}));
      await Promise.allSettled(animations.map(animation=>animation.finished));
      for(let i=0;i<originalReviews.length;i++)reviewTrack.appendChild(originalReviews[(activeReview+i)%originalReviews.length]);
      duplicate.remove();animations.forEach(animation=>animation.cancel());
      reviewTrack.classList.remove('is-switching');reviewAnimating=false;
    }else{
      for(let i=0;i<originalReviews.length;i++)reviewTrack.appendChild(originalReviews[(activeReview+i)%originalReviews.length]);
    }
    if(announce)document.querySelector('#review-status').textContent='Depoimento '+(activeReview+1)+' de 3: '+reviewNames[activeReview]+'.';
  }
  document.querySelector('.review-prev').addEventListener('click',()=>selectReview(activeReview-1));
  document.querySelector('.review-next').addEventListener('click',()=>selectReview(activeReview+1));
  reviewDots.forEach(dot=>dot.addEventListener('click',()=>selectReview(Number(dot.dataset.review))));
  reviewTrack.addEventListener('keydown',event=>{if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();selectReview(activeReview+(event.key==='ArrowRight'?1:-1));}});
  let scrollTimer;
  reviewTrack.addEventListener('scroll',()=>{if(!useMobileCards())return;clearTimeout(scrollTimer);scrollTimer=setTimeout(()=>{const left=reviewTrack.getBoundingClientRect().left;const nearest=originalReviews.reduce((best,card)=>Math.abs(card.getBoundingClientRect().left-left)<Math.abs(best.getBoundingClientRect().left-left)?card:best);activeReview=originalReviews.indexOf(nearest);reviewDots.forEach((dot,i)=>{if(i===activeReview)dot.setAttribute('aria-current','true');else dot.removeAttribute('aria-current');});},120);},{passive:true});
  matchMedia('(max-width: 650px)').addEventListener('change',()=>{originalReviews.forEach(card=>reviewTrack.appendChild(card));selectReview(0,false);});
}
