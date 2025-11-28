import { useRef } from "react";
import { getTheme } from "../theme/colors";
import { useThemeMode } from "../theme/theme-context";

export interface BingoCardProps {
  card: string[];
  marked: boolean[];
  playerColor?: string;
  interactive?: boolean;
  onToggleCell?: (index: number) => void;
  variant?: "full" | "preview";
}

const LETTERS = "BINGO".split("");

function hexToRgba(hex: string, alpha: number): string | null {
  if (!hex) return null;
  const normalized = hex.replace("#", "");
  if (![3, 6].includes(normalized.length)) return null;
  const chunk = normalized.length === 3 ? normalized.split("").map((c) => c + c) : normalized.match(/.{2}/g);
  if (!chunk) return null;
  const [r, g, b] = chunk.map((value) => parseInt(value, 16));
  if ([r, g, b].some((value) => Number.isNaN(value))) return null;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function randomInRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

type StrokeVariation = {
  rotateA: number;
  rotateB: number;
  offsetAX: number;
  offsetBX: number;
  thicknessA: number;
  thicknessB: number;
  lengthScaleA: number;
  lengthScaleB: number;
  tipStartA: [number, number, number];
  tipEndA: [number, number, number];
  tipStartB: [number, number, number];
  tipEndB: [number, number, number];
};

function generateStrokeVariation(): StrokeVariation {
  return {
    rotateA: randomInRange(40, 47),
    rotateB: randomInRange(-47, -40),
    offsetAX: randomInRange(-0.6, 0.6),
    offsetBX: randomInRange(-0.6, 0.6),
    thicknessA: randomInRange(0.16, 0.22),
    thicknessB: randomInRange(0.18, 0.24),
    lengthScaleA: randomInRange(1.05, 1.18),
    lengthScaleB: randomInRange(1.05, 1.18),
    tipStartA: [
      randomInRange(-3, 3),
      randomInRange(-3, 3),
      randomInRange(-3, 3),
    ] as [number, number, number],
    tipEndA: [
      randomInRange(-3, 3),
      randomInRange(-3, 3),
      randomInRange(-3, 3),
    ] as [number, number, number],
    tipStartB: [
      randomInRange(-3, 3),
      randomInRange(-3, 3),
      randomInRange(-3, 3),
    ] as [number, number, number],
    tipEndB: [
      randomInRange(-3, 3),
      randomInRange(-3, 3),
      randomInRange(-3, 3),
    ] as [number, number, number],
  };
}

export function BingoCard({ card, marked, playerColor, interactive = false, onToggleCell, variant = "full" }: BingoCardProps) {
  const { mode } = useThemeMode();
  const isDark = mode === "dark";
  const palette = getTheme(mode);
  const strokeVariationsRef = useRef<Record<number, StrokeVariation>>({});

  const isPreview = variant === "preview";

  const handleToggle = (index: number) => {
    if (!interactive || !onToggleCell) return;
    onToggleCell(index);
  };

  const cardWrapperClasses = isPreview
    ? isDark
      ? "border border-slate-700 bg-slate-900/80 shadow lg:shadow-md"
      : "border border-slate-200 bg-white shadow"
    : isDark
    ? "border border-slate-700 bg-slate-900/70 shadow-xl"
    : "border border-slate-200 bg-white shadow-md";
  const headerContainerClass = `rounded-t-2xl bg-gradient-to-r from-sky-500 via-violet-500 to-pink-500 ${
    isPreview ? "px-2 pt-2 pb-1" : "px-4 pt-3 pb-2"
  }`;
  const headerGridClass = `grid grid-cols-5 gap-2 text-center font-bold tracking-[0.35em] text-white ${
    isPreview ? "text-sm" : "text-2xl sm:text-[1.65rem]"
  }`;
  const bodyWrapperClass = isPreview ? "px-2 pb-2 pt-1" : "px-4 pb-4 pt-3";
  const gridContainerClass = isDark
    ? `grid grid-cols-5 rounded-b-2xl bg-slate-900/40 ${isPreview ? "gap-0.5" : "gap-1"}`
    : `grid grid-cols-5 rounded-b-2xl bg-slate-50 ${isPreview ? "gap-0.5" : "gap-1"}`;

  const baseTextClass = isDark ? "text-slate-50" : "text-slate-900";
  const unmarkedClasses = isDark ? "bg-slate-900/90 border-slate-700" : "bg-white border-slate-200";
  const markedClasses = isDark ? "bg-slate-900/80 border-slate-600" : "bg-slate-50 border-slate-300";
  const baseCellClasses =
    isPreview
      ? "relative flex aspect-square items-start justify-center rounded-xl border px-1 py-1 text-center"
      : "relative flex min-h-[70px] items-center justify-center rounded-xl border px-2 py-2 text-center text-xs leading-snug transition duration-150 sm:min-h-[90px] sm:text-sm";

  const textTone = isDark ? "text-slate-100" : "text-slate-900";

  return (
    <section className={`w-full max-w-2xl rounded-2xl p-1 backdrop-blur sm:p-2 ${cardWrapperClasses} ${textTone}`}>
      <div className={headerContainerClass}>
        <div className={headerGridClass}>
          {LETTERS.map((letter) => (
            <div key={letter} className="flex items-center justify-center">
              {letter}
            </div>
          ))}
        </div>
      </div>
      <div className={bodyWrapperClass}>
        <div className={`${gridContainerClass} text-xs font-semibold sm:text-sm`}>
          {card.map((entry, index) => {
          const isMarked = Boolean(marked[index]);
          const dabColor = playerColor ?? palette.primary.base;
          const baseStyles = `${baseCellClasses} ${isMarked ? markedClasses : unmarkedClasses}`;
          const hoverStyles = interactive
            ? "hover:border-sky-400 hover:shadow-md hover:shadow-sky-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            : "";
          let variation = strokeVariationsRef.current[index];
          if (isMarked) {
            if (!variation) {
              variation = generateStrokeVariation();
              strokeVariationsRef.current[index] = variation;
            }
          } else if (variation) {
            delete strokeVariationsRef.current[index];
            variation = undefined;
          }

          if (interactive) {
            return (
              <button
                key={`${entry}-${index}`}
                type="button"
                className={`${baseStyles} ${isPreview ? "" : hoverStyles}`}
                aria-pressed={isMarked}
                aria-label={`${entry}${isMarked ? " (marked)" : ""}`}
                onClick={() => handleToggle(index)}
              >
                <CellContent
                  entry={entry}
                  marked={isMarked}
                  dabColor={dabColor}
                  textClass={baseTextClass}
                  variation={variation}
                  variant={variant}
                />
              </button>
            );
          }

          return (
            <div key={`${entry}-${index}`} className={baseStyles}>
              <CellContent
                entry={entry}
                marked={isMarked}
                dabColor={dabColor}
                textClass={baseTextClass}
                variation={variation}
                variant={variant}
              />
            </div>
          );
        })}
        </div>
      </div>
    </section>
  );
}

function CellContent({
  entry,
  marked,
  dabColor,
  textClass,
  variation,
  variant = "full",
}: {
  entry: string;
  marked: boolean;
  dabColor: string;
  textClass: string;
  variation?: StrokeVariation;
  variant?: "full" | "preview";
}) {
  const outerColor = hexToRgba(dabColor, 0.9) ?? dabColor;
  const centerColor = hexToRgba(dabColor, 0.5) ?? dabColor;
  return (
    <span className="relative flex h-full w-full items-center justify-center text-center">
      <span
        className={`relative z-10 block w-full px-0.5 text-pretty text-center ${
          variant === "preview" ? "text-[8px] leading-[1.1] break-words text-slate-800" : "leading-snug"
        } ${textClass}`}
      >
        {entry}
      </span>
      {marked && variation ? (
        <span className={`pointer-events-none absolute flex items-center justify-center ${variant === "preview" ? "inset-[9%]" : "inset-[6%]"}`}>
          <MarkerStroke
            outerColor={outerColor}
            centerColor={centerColor}
            rotate={variation.rotateA}
            offsetX={variation.offsetAX}
            thicknessRatio={variation.thicknessA}
            lengthScale={variation.lengthScaleA}
            tipStart={variation.tipStartA}
            tipEnd={variation.tipEndA}
            variant={variant}
          />
          <MarkerStroke
            outerColor={outerColor}
            centerColor={centerColor}
            rotate={variation.rotateB}
            offsetX={variation.offsetBX}
            thicknessRatio={variation.thicknessB}
            lengthScale={variation.lengthScaleB}
            tipStart={variation.tipStartB}
            tipEnd={variation.tipEndB}
            variant={variant}
          />
        </span>
      ) : null}
    </span>
  );
}

function MarkerStroke({
  outerColor,
  centerColor,
  rotate,
  offsetX,
  thicknessRatio,
  lengthScale,
  tipStart,
  tipEnd,
  variant = "full",
}: {
  outerColor: string;
  centerColor: string;
  rotate: number;
  offsetX: number;
  thicknessRatio: number;
  lengthScale: number;
  tipStart: [number, number, number];
  tipEnd: [number, number, number];
  variant?: "full" | "preview";
}) {
  const gradient = `linear-gradient(90deg, ${outerColor} 0%, ${centerColor} 50%, ${outerColor} 100%)`;
  const clipPath = buildRaggedClipPath(tipStart, tipEnd);
  const scaleFactor = variant === "preview" ? 0.8 : 1;
  return (
    <span
      className="absolute rounded-full opacity-85 shadow-[0_0_12px_rgba(0,0,0,0.25)]"
      style={{
        backgroundImage: gradient,
        width: `${lengthScale * 110 * scaleFactor}%`,
        height: `${thicknessRatio * 100 * scaleFactor}%`,
        transform: `rotate(${rotate}deg) translateX(${offsetX}%)`,
        filter: "blur(0.4px)",
        clipPath,
      }}
    />
  );
}

function buildRaggedClipPath(
  tipStart: [number, number, number],
  tipEnd: [number, number, number]
): string {
  const [s1, s2, s3] = tipStart;
  const [e1, e2, e3] = tipEnd;
  return `
    polygon(
      0% 0%,
      1.5% ${Math.max(0, 8 + s1)}%,
      3% ${Math.max(0, 3 + s2)}%,
      6% ${Math.max(0, 10 + s3)}%,
      10% 0%,
      90% 0%,
      94% ${Math.max(0, 4 + e1)}%,
      97% ${Math.max(0, 10 + e2)}%,
      99% ${Math.max(0, 6 + e3)}%,
      100% 0%,
      100% 100%,
      99% ${Math.min(100, 94 - e1)}%,
      97% ${Math.min(100, 88 - e2)}%,
      94% ${Math.min(100, 96 - e3)}%,
      90% 100%,
      10% 100%,
      6% ${Math.min(100, 92 - s3)}%,
      3% ${Math.min(100, 97 - s2)}%,
      1.5% ${Math.min(100, 90 - s1)}%,
      0% 100%
    )
  `.trim();
}
