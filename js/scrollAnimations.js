const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const reveal = (element, index) => { element.classList.add('scroll-ready'); element.style.transitionDelay = `${Math.min(index * 70, 350)}ms`; };
const style = document.createElement('style');
style.textContent = '.scroll-ready{opacity:0;transform:translateY(18px);transition:opacity .55s ease,transform .55s cubic-bezier(.2,.8,.2,1)}.scroll-ready.in-view{opacity:1;transform:none}'; document.head.append(style);
document.addEventListener('DOMContentLoaded', () => {
  const items = [...document.querySelectorAll('.dashboard-grid .panel, .trip-card')];
  if (reduced || !('IntersectionObserver' in window)) return items.forEach((item) => item.classList.add('in-view'));
  const observer = new IntersectionObserver((entries) => entries.forEach(({ target, isIntersecting }) => { if (isIntersecting) { target.classList.add('in-view'); observer.unobserve(target); } }), { threshold: .12 });
  items.forEach((item, index) => { reveal(item, index); observer.observe(item); });
});
