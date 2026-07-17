const card = document.querySelector('#current-weather');

function cityTime(offset) {
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric', minute: '2-digit', timeZone: 'UTC'
  }).format(new Date(Date.now() + Number(offset || 0) * 1000));
}

function updateClock() {
  const label = card?.querySelector('.weather-eyebrow');
  if (!label || !card.dataset.weatherTimezone) return;
  const status = card.dataset.weatherDemo === 'true' ? 'Demo weather' : 'Live weather';
  label.textContent = `${status} · ${cityTime(card.dataset.weatherTimezone)}`;
}

new MutationObserver(updateClock).observe(card, {
  attributes: true,
  attributeFilter: ['data-weather-timezone', 'data-weather-demo']
});
updateClock();
setInterval(updateClock, 30_000);
