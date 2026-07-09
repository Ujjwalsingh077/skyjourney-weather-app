import { weatherIcon } from "./api.js";
import { getFiveDayForecast, getHourlyForecast } from "./forecast.js";
import { cityLabel, formatTime, weatherSummary } from "./weather.js";

let map;
let marker;
let toastTimer;

const titleCase = (value) => value.replace(/\b\w/g, (letter) => letter.toUpperCase());

const weatherMood = (description) => {
  if (/thunder|storm/i.test(description)) {
    return "storm";
  }

  if (/rain|drizzle|shower/i.test(description)) {
    return "rain";
  }

  if (/snow|sleet|ice/i.test(description)) {
    return "snow";
  }

  if (/clear|sun/i.test(description)) {
    return "clear";
  }

  return "clouds";
};

const renderWeatherAmbient = (mood) => {
  if (mood === "clear") {
    return '<div class="weather-ambient" aria-hidden="true"><span class="sun-core"></span><span class="sun-ring"></span></div>';
  }

  if (mood === "rain" || mood === "storm") {
    const drops = Array.from({ length: 30 }, (_, index) => `<span style="--i:${index}"></span>`).join("");
    return `<div class="weather-ambient ${mood === "storm" ? "has-lightning" : ""}" aria-hidden="true">${drops}</div>`;
  }

  if (mood === "snow") {
    const flakes = Array.from({ length: 24 }, (_, index) => `<span style="--i:${index}"></span>`).join("");
    return `<div class="weather-ambient" aria-hidden="true">${flakes}</div>`;
  }

  return '<div class="weather-ambient" aria-hidden="true"><span></span><span></span><span></span></div>';
};

/**
 * Shows a temporary toast message.
 * @param {string} message
 */
export function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 3200);
}

/**
 * Renders the current weather card.
 * @param {object} current
 * @param {boolean} isDemo
 */
export function renderCurrentWeather(current, isDemo = false) {
  const weatherCard = document.querySelector("#current-weather");
  const mood = weatherMood(current.description);
  weatherCard.className = `current-weather card reveal weather-${mood}`;
  weatherCard.innerHTML = `
    ${renderWeatherAmbient(mood)}
    <div class="weather-main">
      <span class="weather-eyebrow">${isDemo ? "Demo weather" : "Live weather"} · ${formatTime(current.timestamp)}</span>
      <div>
        <div class="temperature-row">
          <img class="weather-icon" src="${weatherIcon(current.icon)}" alt="" />
          <div class="temperature">${Math.round(current.temp)}°</div>
        </div>
        <div class="weather-copy">
          <h1>${cityLabel(current.city)}</h1>
          <p>${titleCase(weatherSummary(current))}</p>
        </div>
      </div>
    </div>
    <div class="weather-stats">
      ${[
        ["Feels Like", `${Math.round(current.feelsLike)}°C`],
        ["Humidity", `${current.humidity}%`],
        ["Wind", `${current.wind} km/h`],
        ["Pressure", `${current.pressure} hPa`],
        ["Visibility", `${current.visibility} km`],
        ["Sunrise", formatTime(current.sunrise)],
        ["Sunset", formatTime(current.sunset)]
      ].map(([label, value]) => `<div class="stat"><span>${label}</span><strong>${value}</strong></div>`).join("")}
    </div>
  `;
}

/**
 * Renders hourly and five-day forecasts.
 * @param {object[]} forecast
 */
export function renderForecasts(forecast) {
  const hourly = getHourlyForecast(forecast);
  document.querySelector("#hourly-forecast").innerHTML = hourly.map((item) => `
    <button class="hour-card" type="button" aria-label="${item.description}, ${item.temp} degrees">
      <span>${new Date(item.time).toLocaleTimeString(undefined, { hour: "numeric" })}</span>
      <img src="${weatherIcon(item.icon)}" alt="" />
      <strong>${item.temp}°C</strong>
      <span>${titleCase(item.description)}</span>
    </button>
  `).join("");

  document.querySelector("#daily-forecast").innerHTML = getFiveDayForecast(forecast).map((day) => `
    <div class="day-card">
      <span>${day.label}</span>
      <img src="${weatherIcon(day.icon)}" alt="" />
      <strong>${day.high}° / ${day.low}°C</strong>
      <span>${titleCase(day.description)}</span>
      <span>Humidity ${day.humidity}%</span>
    </div>
  `).join("");
}

/**
 * Renders air quality and environmental metrics.
 * @param {object} air
 * @param {object} current
 */
export function renderAirQuality(air, current) {
  document.querySelector("#aqi-label").textContent = air.label;
  document.querySelector("#air-quality").innerHTML = `
    <div class="metric-tile"><span>AQI</span><strong>${air.aqi} · ${air.label}</strong></div>
    <div class="metric-tile"><span>UV Index</span><strong>${air.uvIndex}</strong></div>
    <div class="metric-tile"><span>Visibility</span><strong>${current.visibility} km</strong></div>
    <div class="metric-tile"><span>PM2.5</span><strong>${Math.round(air.components.pm2_5 ?? 0)}</strong></div>
    <div class="metric-tile"><span>PM10</span><strong>${Math.round(air.components.pm10 ?? 0)}</strong></div>
    <div class="metric-tile"><span>Pressure</span><strong>${current.pressure} hPa</strong></div>
  `;
}

/**
 * Renders favorites and recent search chips.
 * @param {string[]} favorites
 * @param {string[]} recents
 * @param {(city: string) => void} onSelect
 */
export function renderCityLists(favorites, recents, onSelect) {
  const render = (items, empty) => items.length
    ? items.map((city) => `<button class="chip" type="button" data-city="${city}">${city}</button>`).join("")
    : `<span class="chip">${empty}</span>`;

  const favoriteEl = document.querySelector("#favorite-cities");
  const recentEl = document.querySelector("#recent-searches");
  favoriteEl.innerHTML = render(favorites, "No favorites yet");
  recentEl.innerHTML = render(recents, "No recent searches");

  [...favoriteEl.querySelectorAll("[data-city]"), ...recentEl.querySelectorAll("[data-city]")]
    .forEach((button) => button.addEventListener("click", () => onSelect(button.dataset.city)));
}

/**
 * Renders the travel planner result.
 * @param {object} result
 */
export function renderPlannerResult(result) {
  document.querySelector("#planner-output").innerHTML = `
    <span class="status-pill status-${result.status}">${result.status.toUpperCase()}</span>
    <div class="advice-card">
      <h3>${result.title}</h3>
      <p>${result.advice}</p>
    </div>
    <div class="advice-card">
      <h3>Weather Warning</h3>
      <p>${result.warning}</p>
    </div>
    <div class="advice-card">
      <h3>Packing Suggestions</h3>
      <ul>${result.packing.map((item) => `<li>${item}</li>`).join("")}</ul>
    </div>
  `;
}

/**
 * Updates the Leaflet city map.
 * @param {object} city
 */
export function renderMap(city) {
  const lat = city.coord?.lat;
  const lon = city.coord?.lon;
  if (!window.L || typeof lat !== "number" || typeof lon !== "number") {
    document.querySelector("#weather-map").textContent = "Map unavailable for this location.";
    return;
  }

  if (!map) {
    map = L.map("weather-map", { zoomControl: true }).setView([lat, lon], 10);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap"
    }).addTo(map);
  } else {
    map.setView([lat, lon], 10);
  }

  if (marker) {
    marker.setLatLng([lat, lon]).setPopupContent(cityLabel(city));
  } else {
    marker = L.marker([lat, lon]).addTo(map);
  }

  marker.bindPopup(cityLabel(city)).openPopup();
  document.querySelector("#map-label").textContent = cityLabel(city);
  setTimeout(() => map.invalidateSize(), 100);
}
