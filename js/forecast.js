/**
 * Returns forecast items for the next 24 hours.
 * @param {object[]} forecast
 * @returns {object[]}
 */
export const getHourlyForecast = (forecast) => forecast.slice(0, 8);

/**
 * Groups 3-hour forecast records into five daily summaries.
 * @param {object[]} forecast
 * @returns {object[]}
 */
export function getFiveDayForecast(forecast) {
  const groups = new Map();

  forecast.forEach((item) => {
    const date = new Date(item.time);
    const key = date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
    const existing = groups.get(key) ?? [];
    existing.push(item);
    groups.set(key, existing);
  });

  return Array.from(groups.entries())
    .slice(0, 5)
    .map(([label, items]) => {
      const temps = items.map((item) => item.temp);
      const noonItem = items[Math.floor(items.length / 2)] ?? items[0];
      return {
        label,
        high: Math.max(...temps),
        low: Math.min(...temps),
        icon: noonItem.icon,
        description: noonItem.description,
        humidity: Math.round(items.reduce((sum, item) => sum + item.humidity, 0) / items.length)
      };
    });
}
