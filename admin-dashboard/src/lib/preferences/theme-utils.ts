import type { ResolvedThemeMode, ThemeMode } from "./theme";

export function resolveThemeMode(mode: ThemeMode): ResolvedThemeMode {
  if (mode === "dark") return "dark";
  if (mode === "light") return "light";
  if (typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

export function applyThemeMode(mode: ThemeMode): ResolvedThemeMode {
  const resolved = resolveThemeMode(mode);
  const doc = document.documentElement;
  doc.setAttribute("data-theme-mode", mode);
  doc.classList.add("disable-transitions");
  if (resolved === "dark") {
    doc.classList.add("dark");
    doc.style.colorScheme = "dark";
  } else {
    doc.classList.remove("dark");
    doc.style.colorScheme = "light";
  }
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
