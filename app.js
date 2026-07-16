import { fetchAirQuality, fetchCurrentByCity, fetchCurrentByCoords, fetchForecast } from "./js/api.js";
import { getCurrentPosition } from "./js/location.js";
import { planTrip } from "./js/planner.js";
import {
  addRecent,
  clearRecents,
  getFavorites,
  getRecents,
  toggleFavorite
} from "./js/storage.js";
import { initTheme, toggleTheme } from "./js/theme.js";
import {
  renderAirQuality,
  renderCityLists,
  renderCurrentWeather,
  renderForecasts,
  renderMap,
  renderPlannerResult,
  showToast
} from "./js/ui.js";

const state = {
    current: null,
    forecast: [],
    air: null
};

const elements = {
  searchForm: document.querySelector("#search-form"),
  cityInput: document.querySelector("#city-input"),
  locationBtn: document.querySelector("#location-btn"),
  plannerForm: document.querySelector("#planner-form"),
  destinationInput: document.querySelector("#destination-input"),
  travelDateInput: document.querySelector("#travel-date-input"),
  tripType: document.querySelector("#trip-type"),
  tripDuration: document.querySelector("#trip-duration"),
  addFavoriteBtn: document.querySelector("#add-favorite-btn"),
  clearRecentsBtn: document.querySelector("#clear-recents-btn"),
  themeToggle: document.querySelector("#theme-toggle")
};

function setTodayDate() {
  const today = new Date();
  const localDate = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0")
  ].join("-");
  elements.travelDateInput.value = localDate;
  elements.travelDateInput.min = localDate;
  document.querySelector("#planner-date-label").textContent = today.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric"
  });
}

function renderLists() {
  renderCityLists(getFavorites(), getRecents(), loadCity);
}

async function loadWeather(currentResult) {
  const { data: current, isDemo } = currentResult;
  state.current = current;
  elements.destinationInput.value = current.city.name;
  renderCurrentWeather(current, isDemo);

  const { lat, lon } = current.city.coord;
  const [forecastResult, airResult] = await Promise.all([
    fetchForecast(lat, lon),
    fetchAirQuality(lat, lon)
  ]);

  state.forecast = forecastResult.data;
  renderForecasts(state.forecast);
  renderAirQuality(airResult.data, current);
  state.air = airResult.data;
  renderMap(current.city);

  if (isDemo || forecastResult.isDemo || airResult.isDemo) {
    showToast("Showing demo data. Add your OpenWeatherMap key in js/api.js for live weather.");
  }
}

async function loadCity(city) {
  const query = city.trim();
  if (!query) {
    showToast("Enter a city to search.");
    return;
  }

  elements.cityInput.value = query;
  addRecent(query);
  renderLists();
  await loadWeather(await fetchCurrentByCity(query));
}

async function loadCurrentLocation() {
  try {
    showToast("Requesting your location...");
    const position = await getCurrentPosition();
    await loadWeather(await fetchCurrentByCoords(position.lat, position.lon));
    if (state.current?.city?.name) {
      addRecent(state.current.city.name);
      renderLists();
    }
  } catch (error) {
    showToast(error.message);
  }
}

function bindEvents() {
  elements.searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    loadCity(elements.cityInput.value);
  });

  elements.locationBtn.addEventListener("click", loadCurrentLocation);

  elements.themeToggle.addEventListener("click", () => {
    const theme = toggleTheme();
    showToast(`${theme === "light" ? "Light" : "Dark"} mode enabled.`);
  });

  elements.addFavoriteBtn.addEventListener("click", () => {
    if (!state.current?.city?.name) {
      showToast("Search for a city before adding a favorite.");
      return;
    }

    toggleFavorite(state.current.city.name);
    renderLists();
  });

  elements.clearRecentsBtn.addEventListener("click", () => {
    clearRecents();
    renderLists();
  });

  elements.plannerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!state.current || !state.forecast.length) {
      showToast("Load weather before planning a trip.");
      return;
    }

    const result = planTrip({
      destination: elements.destinationInput.value.trim() || state.current.city.name,
      date: elements.travelDateInput.value,
       tripType: elements.tripType.value,
       tripDuration: Number(elements.tripDuration.value),
      current: state.current,
      forecast: state.forecast
      ,air: state.air
    });
    renderPlannerResult(result);
  });

  elements.tripDuration.addEventListener("change", () => {
  if (!state.current) return;

  const result = planTrip({
    destination: elements.destinationInput.value,
    date: elements.travelDateInput.value,
    tripType: elements.tripType.value,
    tripDuration: Number(elements.tripDuration.value),
    current: state.current,
    forecast: state.forecast
    ,air: state.air
  });

  renderPlannerResult(result);
});

}

async function init() {
  initTheme();
  setTodayDate();
  bindEvents();
  renderLists();
  await loadCity(getRecents()[0] ?? "Bengaluru");
}

init();
