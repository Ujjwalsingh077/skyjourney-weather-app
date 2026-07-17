const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function animateHeader() {
  if (reduceMotion) return;
  document.querySelector('.brand')?.animate([{ opacity: 0, transform: 'translateY(-12px)' }, { opacity: 1, transform: 'none' }], { duration: 520, easing: 'cubic-bezier(.2,.8,.2,1)' });
  document.querySelector('.search-form')?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 520, delay: 130, fill: 'both' });
  document.querySelector('.theme-toggle')?.animate([{ transform: 'scale(.7)' }, { transform: 'scale(1)' }], { duration: 380, delay: 240, easing: 'back-out' });
}

document.addEventListener('DOMContentLoaded', animateHeader, { once: true });

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#planner-form');
  const output = document.querySelector('#planner-output');
  const button = form?.querySelector('[type="submit"]');
  form?.addEventListener('submit', () => {
    button?.classList.add('is-planning');
    // Planner results render synchronously in its existing submit handler.
    requestAnimationFrame(() => button?.classList.remove('is-planning'));
  });
  new MutationObserver(() => button?.classList.remove('is-planning')).observe(output, { childList: true });
}, { once: true });
