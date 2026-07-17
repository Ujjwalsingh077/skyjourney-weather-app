const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function typeSummary() {
  const heading = [...document.querySelectorAll('.advice-card h3')].find((item) => /AI Travel Summary/i.test(item.textContent));
  const text = heading?.nextElementSibling; if (!text || text.dataset.typed || reduce) return;
  text.dataset.typed = 'true'; const message = text.textContent; text.textContent = ''; let index = 0;
  const next = () => { text.textContent += message[index++] || ''; if (index <= message.length) setTimeout(next, 10); };
  next();
}
new MutationObserver(typeSummary).observe(document.querySelector('#planner-output'), { childList: true, subtree: true });
