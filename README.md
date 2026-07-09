# SkyJourney

SkyJourney is a smart weather and travel planning dashboard built with HTML5, CSS3, and Vanilla JavaScript ES modules. It combines current weather, hourly and five-day forecasts, air quality, an interactive map, local favorites, recent searches, theme persistence, and weather-aware packing advice.

## Features

- Search weather for any city with OpenWeatherMap.
- Use the browser Geolocation API for current-location weather.
- View current temperature, condition, humidity, wind, pressure, visibility, feels-like, sunrise, and sunset.
- Browse horizontal hourly forecast cards and responsive five-day forecast cards.
- Generate travel advice, warnings, and packing suggestions from forecast conditions.
- Display AQI, UV estimate, PM2.5, PM10, pressure, and visibility.
- Show the selected city on a Leaflet and OpenStreetMap map.
- Save favorite cities and recent searches in LocalStorage.
- Toggle light and dark mode with saved preference.
- Fall back to built-in demo weather data when no API key is configured.

## Screenshots

Add screenshots after deployment:

- `assets/images/dashboard-desktop.png`
- `assets/images/dashboard-mobile.png`
- `assets/images/travel-planner.png`

## Folder Structure

```text
SkyJourney/
├── index.html
├── style.css
├── app.js
├── css/
│   ├── weather.css
│   ├── planner.css
│   ├── forecast.css
│   ├── animations.css
│   └── responsive.css
├── js/
│   ├── api.js
│   ├── weather.js
│   ├── forecast.js
│   ├── planner.js
│   ├── location.js
│   ├── storage.js
│   ├── theme.js
│   └── ui.js
├── assets/
│   ├── icons/
│   ├── images/
│   └── logo/
└── README.md
```

## Installation

Clone or download the project, then serve it with any static web server:

```bash
python -m http.server 8080
```

Open `http://localhost:8080` in a browser.

## API Setup

1. Create a free API key at [OpenWeatherMap](https://openweathermap.org/api).
2. Open `js/api.js`.
3. Paste your key into `OPENWEATHER_API_KEY`.
4. Search a city again to fetch live weather.

The app works without a key by using demo data, which is useful for portfolio previews and GitHub Pages demos.

## Deployment

SkyJourney is a static app and can be deployed directly to GitHub Pages.

1. Push the project to a GitHub repository.
2. Open repository settings.
3. Enable Pages from the main branch root.
4. Visit the generated GitHub Pages URL.

## Roadmap

- Add weather alerts when available for the selected region.
- Add unit switching between Celsius and Fahrenheit.
- Add itinerary export for planned trips.
- Add more detailed UV data from a dedicated weather provider.
- Add tests for planner rules and forecast grouping.

## License

MIT License. Use, adapt, and extend freely.
