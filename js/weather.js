/**
 * Formats a Unix timestamp as local time.
 * @param {number} timestamp
 * @param {number} timezoneOffset Offset from UTC in seconds for the selected city.
 * @returns {string}
 */
export function formatTime(timestamp, timezoneOffset = 0) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC"
  }).format(new Date((timestamp + timezoneOffset) * 1000));
}

/**
 * Creates a compact city label.
 * @param {{name: string, country: string}} city
 * @returns {string}
 */
export function cityLabel(city) {
  return [city.name, city.country].filter(Boolean).join(", ");
}

/**
 * Returns human-friendly weather summary text.
 * @param {object} current
 * @returns {string}
 */
export function weatherSummary(current) {
  const visibility = current.visibility ? `${current.visibility} km visibility` : "visibility data";
  return `${current.description} with ${current.humidity}% humidity, ${current.wind} km/h wind, and ${visibility}.`;
}
