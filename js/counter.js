const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const numericValue = (text) => { const match = text.match(/-?\d+(?:\.\d+)?/); return match ? Number(match[0]) : null; };

function countTo(element) {
  if (element.dataset.counted || reduced) return;
  const target = numericValue(element.textContent); if (target === null) return;
  element.dataset.counted = 'true';
  const suffix = element.textContent.replace(/^-?\d+(?:\.\d+)?/, ''); const start = performance.now();
  const draw = (now) => { const progress = Math.min((now - start) / 700, 1); element.textContent = `${Math.round(target * (1 - (1 - progress) ** 3))}${suffix}`; if (progress < 1) requestAnimationFrame(draw); };
  requestAnimationFrame(draw);
}

new MutationObserver(() => document.querySelectorAll('.temperature, .travel-score-value').forEach(countTo)).observe(document.body, { childList: true, subtree: true });
