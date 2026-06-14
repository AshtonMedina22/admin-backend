import type { ResolvedThemeMode, ThemeMode } from "./theme";

export function resolveThemeMode(_mode: ThemeMode): ResolvedThemeMode {
  return "dark";
}

export function applyThemeMode(_mode: ThemeMode): ResolvedThemeMode {
  const resolved: ResolvedThemeMode = "dark";
  const doc = document.documentElement;
  doc.setAttribute("data-theme-mode", "dark");
  doc.classList.add("disable-transitions");
  doc.classList.add("dark");
  doc.style.colorScheme = "dark";
  requestAnimationFrame(() => {
    doc.classList.remove("disable-transitions");
  });
  return resolved;
}

export function applyThemePreset(value: string) {
  document.documentElement.setAttribute("data-theme-preset", value);
}

export function subscribeToSystemTheme(onChange: (mode: ResolvedThemeMode) => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  const media = window.matchMedia?.("(prefers-color-scheme: dark)");
  if (!media) return () => undefined;

  const listener = (event: MediaQueryListEvent) => {
    onChange(event.matches ? "dark" : "light");
  };

  media.addEventListener("change", listener);

  return () => {
    media.removeEventListener("change", listener);
  };
}
