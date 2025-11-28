import confetti, { type Options } from "canvas-confetti";

const burstDefaults: Options = {
  particleCount: 95,
  spread: 75,
  gravity: 0.9,
  startVelocity: 38,
  decay: 0.915,
  scalar: 1.08,
  ticks: 190,
  disableForReducedMotion: true,
  colors: ["#38BDF8", "#22C55E", "#F97316", "#FACC15", "#EF4444", "#A855F7"],
};

function randomInRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

/**
 * Central helper for triggering the bingo fireworks effect.
 * Fires a few cinematic bursts from the left/right sides of the screen.
 */
export function triggerBingoFireworks(overrides?: Options) {
  if (typeof window === "undefined") return;

  const duration = 2800;
  const endTime = Date.now() + duration;

  const interval = window.setInterval(() => {
    if (Date.now() > endTime) {
      window.clearInterval(interval);
      return;
    }
    const burstOptions: Options = { ...burstDefaults, ...overrides };

    const leftOriginY = randomInRange(0.1, 0.4);
    const rightOriginY = randomInRange(0.1, 0.4);

    confetti({
      ...burstOptions,
      origin: { x: randomInRange(0.1, 0.2), y: leftOriginY },
    });

    confetti({
      ...burstOptions,
      origin: { x: randomInRange(0.8, 0.9), y: rightOriginY },
    });
  }, 325);
}
