const card = document.querySelector('#current-weather');
const root = document.documentElement;

const accentFor = {
  sunny: ['#fbbf24', '#f97316'], cloudy: ['#7dd3fc', '#64748b'], rain: ['#38bdf8', '#2563eb'],
  storm: ['#a78bfa', '#6d28d9'], snow: ['#bae6fd', '#38bdf8'], fog: ['#94a3b8', '#64748b'],
  night: ['#60a5fa', '#4f46e5'], sunset: ['#fb7185', '#f97316']
};

function weatherKind(description = '') {
  if (/thunder|storm/i.test(description)) return 'storm';
  if (/rain|drizzle|shower/i.test(description)) return 'rain';
  if (/snow|sleet|ice/i.test(description)) return 'snow';
  if (/mist|fog|haze|smoke/i.test(description)) return 'fog';
  if (/cloud|overcast/i.test(description)) return 'cloudy';
  return 'sunny';
}

function phaseFor(timestamp, sunrise, sunset) {
  const now = Math.floor(Date.now() / 1000);
  // Use live time after the initial render; timestamp is a graceful fallback for demos.
  const time = Number.isFinite(now) ? now : Number(timestamp);
  if (!sunrise || !sunset || time < sunrise || time >= sunset) return 'night';
  if (time < sunrise + 75 * 60) return 'sunrise';
  if (time > sunset - 100 * 60) return 'sunset';
  return 'day';
}

function applyTheme() {
  if (!card?.dataset.weatherDescription) return;
  const kind = weatherKind(card.dataset.weatherDescription);
  const phase = phaseFor(Number(card.dataset.weatherTimestamp), Number(card.dataset.weatherSunrise), Number(card.dataset.weatherSunset));
  const accentKey = phase === 'night' ? 'night' : phase === 'sunset' || phase === 'sunrise' ? 'sunset' : kind;
  const [accent, secondary] = accentFor[accentKey];
  document.body.dataset.weatherTheme = `${kind}-${phase}`;
  document.body.dataset.weatherPhase = phase;
  root.dataset.theme = 'dark';
  root.style.setProperty('--primary', accent);
  root.style.setProperty('--secondary', secondary);
  root.style.setProperty('--accent', accent);
  const toggle = document.querySelector('#theme-toggle');
  if (toggle) {
    toggle.setAttribute('aria-label', `Auto weather theme: ${kind}, ${phase}`);
    toggle.title = `Auto theme: ${kind}, ${phase}`;
    toggle.dataset.phase = phase;
  }
}

new MutationObserver(applyTheme).observe(card, { attributes: true, attributeFilter: ['data-weather-description', 'data-weather-timestamp', 'data-weather-sunrise', 'data-weather-sunset'] });
applyTheme();
setInterval(applyTheme, 60_000);
