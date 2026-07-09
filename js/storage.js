const KEYS = {
  favorites: "skyjourney.favorites",
  recents: "skyjourney.recents",
  theme: "skyjourney.theme"
};

const readJSON = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};

const writeJSON = (key, value) => localStorage.setItem(key, JSON.stringify(value));

/**
 * Returns stored favorite city names.
 * @returns {string[]}
 */
export const getFavorites = () => readJSON(KEYS.favorites, []);

/**
 * Toggles a city in favorites.
 * @param {string} city
 * @returns {string[]}
 */
export function toggleFavorite(city) {
  const normalized = city.trim();
  const current = getFavorites();
  const exists = current.some((item) => item.toLowerCase() === normalized.toLowerCase());
  const next = exists
    ? current.filter((item) => item.toLowerCase() !== normalized.toLowerCase())
    : [normalized, ...current].slice(0, 8);
  writeJSON(KEYS.favorites, next);
  return next;
}

/**
 * Returns recent city searches.
 * @returns {string[]}
 */
export const getRecents = () => readJSON(KEYS.recents, []);

/**
 * Adds a city to recent searches.
 * @param {string} city
 * @returns {string[]}
 */
export function addRecent(city) {
  const normalized = city.trim();
  const deduped = getRecents().filter((item) => item.toLowerCase() !== normalized.toLowerCase());
  const next = [normalized, ...deduped].slice(0, 8);
  writeJSON(KEYS.recents, next);
  return next;
}

/**
 * Clears recent searches.
 */
export const clearRecents = () => writeJSON(KEYS.recents, []);

/**
 * Returns the saved theme.
 * @returns {"dark" | "light" | ""}
 */
export const getTheme = () => localStorage.getItem(KEYS.theme) ?? "";

/**
 * Saves the selected theme.
 * @param {"dark" | "light"} theme
 */
export const setTheme = (theme) => localStorage.setItem(KEYS.theme, theme);
