export type ThemeMode = "light" | "dark";

export const darkTheme = {
  bg: {
    page: "#0F172A",
    card: "#0B1220",
    subtle: "#020617"
  },
  primary: {
    base: "#38BDF8",
    soft: "#0EA5E9"
  },
  accent: {
    purple: "#6366F1",
    pink: "#EC4899",
    yellow: "#FACC15"
  },
  neutral: {
    border: "#1E293B",
    text: "#E5E7EB",
    textMuted: "#9CA3AF"
  },
  playerSwatches: [
    "#38BDF8",
    "#22C55E",
    "#EC4899",
    "#F97316",
    "#06B6D4",
    "#A855F7",
    "#FACC15",
    "#94A3B8"
  ]
} as const;

export const lightTheme = {
  bg: {
    page: "#F9FAFB",
    card: "#FFFFFF",
    subtle: "#E5E7EB"
  },
  primary: {
    base: "#0EA5E9",
    soft: "#7DD3FC"
  },
  accent: {
    purple: "#A855F7",
    pink: "#EC4899",
    yellow: "#FBBF24"
  },
  neutral: {
    border: "#E5E7EB",
    text: "#0F172A",
    textMuted: "#6B7280"
  },
  playerSwatches: [
    "#0EA5E9",
    "#22C55E",
    "#EC4899",
    "#F97316",
    "#14B8A6",
    "#A855F7",
    "#FACC15",
    "#64748B"
  ]
} as const;

export function getTheme(mode: ThemeMode) {
  return mode === "dark" ? darkTheme : lightTheme;
}
