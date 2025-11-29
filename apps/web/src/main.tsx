import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, useThemeMode } from "./theme/theme-context";
import "./styles/globals.css";
import App from "./App.tsx";

function ThemedApp() {
  const { mode } = useThemeMode();
  const rootClass =
    mode === "dark"
      ? "min-h-screen bg-slate-950 text-slate-50 transition-colors"
      : "min-h-screen bg-slate-50 text-slate-900 transition-colors";

  return (
    <div className={rootClass}>
      <App />
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <ThemedApp />
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
);
