const card = document.querySelector('#current-weather');
const moods = ['clear', 'clouds', 'rain', 'storm', 'snow'];

function ensureSkyLayers() {
  if (!document.querySelector('.aurora-lights')) {
    const aurora = document.createElement('div');
    aurora.className = 'aurora-lights'; aurora.setAttribute('aria-hidden', 'true');
    aurora.innerHTML = '<i></i><i></i><i></i>';
    document.body.prepend(aurora);
  }
  if (!document.querySelector('.sky-cloud-layer')) {
    const clouds = document.createElement('div');
    clouds.className = 'sky-cloud-layer'; clouds.setAttribute('aria-hidden', 'true');
    clouds.innerHTML = '<i></i><i></i><i></i><i></i>';
    document.body.prepend(clouds);
  }
  if (!document.querySelector('.sky-rain-layer')) {
    const rain = document.createElement('div');
    rain.className = 'sky-rain-layer'; rain.setAttribute('aria-hidden', 'true');
    rain.innerHTML = Array.from({ length: 72 }, (_, index) => `<i style="--rain-x:${(index * 29) % 101};--rain-delay:-${(index % 14) / 10}s;--rain-speed:${.65 + (index % 6) * .11}s"></i>`).join('');
    document.body.prepend(rain);
  }
}

function updateScene() {
  ensureSkyLayers();
  const mood = moods.find((name) => card?.classList.contains(`weather-${name}`));
  document.body.classList.remove(...moods.map((name) => `weather-scene-${name}`), 'weather-scene-night');
  if (!mood) return;
  if (!card.querySelector('.weather-landscape')) {
    const landscape = document.createElement('div');
    landscape.className = `weather-landscape landscape-${mood}`;
    landscape.setAttribute('aria-hidden', 'true');
    landscape.innerHTML = '<span class="landscape-haze"></span><span class="landscape-mountain mountain-far"></span><span class="landscape-mountain mountain-near"></span><span class="landscape-ground"></span><span class="landscape-orb"></span>';
    card.prepend(landscape);
  }
  const isNight = /(?:^|\s)(?:night|clear night)(?:\s|$)/i.test(card.textContent || '');
  document.body.classList.add(isNight ? 'weather-scene-night' : `weather-scene-${mood}`);
  let stars = document.querySelector('.weather-scene-stars');
  if (isNight && !stars) {
    stars = document.createElement('div'); stars.className = 'weather-scene-stars'; stars.setAttribute('aria-hidden', 'true');
    stars.innerHTML = Array.from({ length: 32 }, (_, i) => `<i style="left:${(i * 37) % 100}%;top:${(i * 61) % 72}%;animation-delay:-${i % 3}s"></i>`).join('');
    document.body.prepend(stars);
  }
  if (!isNight) stars?.remove();
}

new MutationObserver(updateScene).observe(card, { attributes: true, childList: true, subtree: true });
updateScene();
