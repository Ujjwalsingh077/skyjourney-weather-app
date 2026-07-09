import { getTheme, setTheme } from "./storage.js";

const prefersLight = () => window.matchMedia?.("(prefers-color-scheme: light)").matches;

/**
 * Applies the saved or system theme.
 * @returns {"dark" | "light"}
 */
export function initTheme() {
  const theme = getTheme() || (prefersLight() ? "light" : "dark");
  document.documentElement.dataset.theme = theme;
  return theme;
}

/**
 * Toggles the current color theme and persists it.
 * @returns {"dark" | "light"}
 */
export function toggleTheme() {
  const current = document.documentElement.dataset.theme === "light" ? "light" : "dark";
  const next = current === "light" ? "dark" : "light";
  document.documentElement.dataset.theme = next;
  setTheme(next);
  return next;
}
