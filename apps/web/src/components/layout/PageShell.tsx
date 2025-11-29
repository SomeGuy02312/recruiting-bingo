import { Link } from "react-router-dom";
import type { PropsWithChildren } from "react";
import { useThemeMode } from "../../theme/theme-context";

interface PageShellProps extends PropsWithChildren {
  hideHeader?: boolean;
  mainClassName?: string;
}

export function PageShell({ children, hideHeader = false, mainClassName }: PageShellProps) {
  const { mode, toggle } = useThemeMode();
  const isDark = mode === "dark";

  const headerClass = isDark
    ? "border-b border-slate-800 bg-slate-900/80 text-slate-50 backdrop-blur"
    : "border-b border-slate-200 bg-white/80 text-slate-900 backdrop-blur";

  const toggleClass = isDark
    ? "inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-xs font-medium text-slate-100 hover:border-sky-400"
    : "inline-flex items-center gap-1 rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:border-sky-400";

  const betaClass = isDark ? "text-xs uppercase tracking-[0.3em] text-slate-400" : "text-xs uppercase tracking-[0.3em] text-slate-500";
  const brandClass = isDark ? "text-lg font-semibold tracking-tight text-slate-50" : "text-lg font-semibold tracking-tight text-slate-900";
  const shellClass = `${isDark ? "text-slate-100" : "text-slate-900"} w-full max-w-full overflow-x-hidden`;
  const resolvedMainClass = mainClassName ?? "mx-auto w-full max-w-6xl px-4 py-8";

  return (
    <div className={shellClass}>
      {!hideHeader ? (
        <header className={headerClass}>
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
            <Link to="/" className={brandClass}>
              Recruiting Bingo
            </Link>
            <div className="flex items-center gap-3">
              <Link
                to="/about"
                className={isDark ? "text-sm font-medium text-slate-200 hover:text-sky-300" : "text-sm font-medium text-slate-700 hover:text-sky-600"}
              >
                About & FAQ
              </Link>
              <span className={betaClass}>beta</span>
              <button type="button" onClick={toggle} className={toggleClass}>
                {isDark ? "Dark · 🌙" : "Light · ☀︎"}
              </button>
            </div>
          </div>
        </header>
      ) : null}
      <main className={`${resolvedMainClass} w-full max-w-full`}>{children}</main>
    </div>
  );
}
