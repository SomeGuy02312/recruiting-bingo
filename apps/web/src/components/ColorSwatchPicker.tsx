import { useCallback } from "react";
import { darkTheme } from "../theme/colors";

export interface ColorSwatchPickerProps {
  value: string;
  onChange: (color: string) => void;
  options?: string[];
  label?: string;
}

export function ColorSwatchPicker({ value, onChange, options, label }: ColorSwatchPickerProps) {
  const colors = options ?? darkTheme.playerSwatches;

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>, color: string) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onChange(color);
      }
    },
    [onChange]
  );

  return (
    <div>
      {label ? <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</p> : null}
      <div className="mt-2 flex flex-wrap gap-2">
        {colors.map((hex) => {
          const isSelected = value.toLowerCase() === hex.toLowerCase();
          const ringClass = isSelected
            ? "ring-2 ring-offset-2 ring-offset-white ring-slate-700 dark:ring-offset-slate-950 dark:ring-slate-100"
            : "ring-1 ring-slate-300 dark:ring-slate-700/60";
          return (
            <button
              type="button"
              key={hex}
              onClick={() => onChange(hex)}
              onKeyDown={(event) => handleKeyDown(event, hex)}
              className={`h-8 w-8 rounded-full ${ringClass} transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400`}
              style={{ backgroundColor: hex }}
              aria-label={`Choose color ${hex}`}
            />
          );
        })}
      </div>
    </div>
  );
}
