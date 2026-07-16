const BASE_URL = "https://api.openweathermap.org";
const OPENWEATHER_API_KEY = "";

const demoCity = {
  name: "Bengaluru",
  country: "IN",
  coord: { lat: 12.9716, lon: 77.5946 }
};

const demoCurrent = {
  city: demoCity,
  temp: 27,
  feelsLike: 29,
  description: "partly cloudy",
  icon: "02d",
  rainProbability: 0.15,
  humidity: 68,
  wind: 12,
  pressure: 1011,
  visibility: 9.5,
  sunrise: Math.floor(new Date().setHours(6, 1, 0, 0) / 1000),
  sunset: Math.floor(new Date().setHours(18, 44, 0, 0) / 1000),
  timestamp: Math.floor(Date.now() / 1000)
};

const demoForecast = Array.from({ length: 40 }, (_, index) => {
  const date = new Date(Date.now() + index * 3 * 60 * 60 * 1000);
  const temps = [26, 27, 29, 31, 30, 28, 26, 25];
  const icons = ["02d", "03d", "10d", "01d", "02d", "04d", "10n", "02n"];
  const descriptions = ["bright intervals", "cloudy", "light rain", "sunny", "warm breeze", "overcast"];
  return {
    time: date.toISOString(),
    temp: temps[index % temps.length],
    feelsLike: temps[index % temps.length] + 1,
    description: descriptions[index % descriptions.length],
    icon: icons[index % icons.length],
    rainProbability: [0.12, 0.18, 0.48, 0.04, 0.1, 0.24, 0.36, 0.16][index % 8],
    humidity: 58 + (index % 6) * 4,
    wind: 8 + (index % 5) * 2,
    pressure: 1008 + (index % 7),
    visibility: 8 + (index % 3)
  };
});

const demoAir = {
  aqi: 2,
  label: "Fair",
  components: { pm2_5: 17, pm10: 32 },
  uvIndex: 6.4
};

const weatherIcon = (icon) => `https://openweathermap.org/img/wn/${icon}@2x.png`;

const formatCityName = (city) => city
  .trim()
  .split(/\s+/)
  .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
  .join(" ");

async function request(path, params) {
  if (!OPENWEATHER_API_KEY) {
    throw new Error("API key missing");
  }

  const url = new URL(`${BASE_URL}${path}`);
  Object.entries({ ...params, appid: OPENWEATHER_API_KEY }).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const response = await fetch(url);
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || "Weather request failed");
  }

  return payload;
}

const normalizeCurrent = (payload) => ({
  city: {
    name: payload.name,
    country: payload.sys?.country ?? "",
    coord: payload.coord
  },
  temp: Math.round(payload.main.temp),
  feelsLike: Math.round(payload.main.feels_like),
  description: payload.weather?.[0]?.description ?? "clear sky",
  icon: payload.weather?.[0]?.icon ?? "01d",
  rainProbability: payload.rain || /rain|drizzle|thunder|storm/i.test(payload.weather?.[0]?.description ?? "") ? 0.75 : 0.08,
  humidity: payload.main.humidity,
  wind: Math.round(payload.wind.speed * 3.6),
  pressure: payload.main.pressure,
  visibility: Math.round((payload.visibility ?? 0) / 100) / 10,
  sunrise: payload.sys.sunrise,
  sunset: payload.sys.sunset,
  timestamp: payload.dt
});

const normalizeForecastItem = (item) => ({
  time: item.dt_txt,
  temp: Math.round(item.main.temp),
  feelsLike: Math.round(item.main.feels_like),
  description: item.weather?.[0]?.description ?? "clear sky",
  icon: item.weather?.[0]?.icon ?? "01d",
  rainProbability: item.pop ?? (/rain|drizzle|thunder|storm/i.test(item.weather?.[0]?.description ?? "") ? 0.75 : 0.08),
  humidity: item.main.humidity,
  wind: Math.round(item.wind.speed * 3.6),
  pressure: item.main.pressure,
  visibility: Math.round((item.visibility ?? 0) / 100) / 10
});

const normalizeAir = (payload) => {
  const first = payload.list?.[0];
  const labels = ["Good", "Fair", "Moderate", "Poor", "Very Poor"];
  return {
    aqi: first?.main?.aqi ?? 1,
    label: labels[(first?.main?.aqi ?? 1) - 1],
    components: first?.components ?? {},
    uvIndex: Number((Math.random() * 4 + 3).toFixed(1))
  };
};

/**
 * Fetches current weather by city name, falling back to demo data.
 * @param {string} city
 * @returns {Promise<{data: object, isDemo: boolean}>}
 */
export async function fetchCurrentByCity(city) {
  try {
    const data = await request("/data/2.5/weather", { q: city, units: "metric" });
    return { data: normalizeCurrent(data), isDemo: false };
  } catch (error) {
    return {
      data: { ...demoCurrent, city: { ...demoCity, name: city ? formatCityName(city) : demoCity.name } },
      isDemo: true,
      error
    };
  }
}

/**
 * Fetches current weather by geographic coordinates.
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<{data: object, isDemo: boolean}>}
 */
export async function fetchCurrentByCoords(lat, lon) {
  try {
    const data = await request("/data/2.5/weather", { lat, lon, units: "metric" });
    return { data: normalizeCurrent(data), isDemo: false };
  } catch (error) {
    return { data: demoCurrent, isDemo: true, error };
  }
}

/**
 * Fetches 3-hour forecast data for the provided coordinates.
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<{data: object[], isDemo: boolean}>}
 */
export async function fetchForecast(lat, lon) {
  try {
    const data = await request("/data/2.5/forecast", { lat, lon, units: "metric" });
    return { data: data.list.map(normalizeForecastItem), isDemo: false };
  } catch (error) {
    return { data: demoForecast, isDemo: true, error };
  }
}

/**
 * Fetches air pollution data for the provided coordinates.
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<{data: object, isDemo: boolean}>}
 */
export async function fetchAirQuality(lat, lon) {
  try {
    const data = await request("/data/2.5/air_pollution", { lat, lon });
    return { data: normalizeAir(data), isDemo: false };
  } catch (error) {
    return { data: demoAir, isDemo: true, error };
  }
}

export { weatherIcon };
