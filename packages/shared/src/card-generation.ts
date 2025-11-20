import type { CardEntry } from "./card-library";

const DEFAULT_CARD_SIZE = 25;

export type CardDefinition = string[];

function ensureLibraryHasEnoughEntries(library: CardEntry[], count: number) {
  if (library.length < count) {
    throw new Error(`Library must contain at least ${count} entries; received ${library.length}`);
  }
}

function pickUniqueRandomEntries<T>(items: T[], count: number, exclude: Set<T> = new Set()): T[] {
  const pool = items.filter((item) => !exclude.has(item));
  if (pool.length < count) {
    throw new Error(`Not enough unique entries available to pick ${count} items.`);
  }

  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

export function generateRandomCard(library: CardEntry[], count = DEFAULT_CARD_SIZE): CardDefinition {
  ensureLibraryHasEnoughEntries(library, count);
  return pickUniqueRandomEntries(library, count);
}

export function buildCardFromCustomInputs(
  customEntries: (string | null | undefined)[],
  library: CardEntry[],
  count = DEFAULT_CARD_SIZE
): CardDefinition {
  const result: string[] = new Array(count);
  const used = new Set<string>();
  const fillIndices: number[] = [];

  for (let i = 0; i < count; i += 1) {
    const raw = customEntries[i] ?? "";
    const normalized = typeof raw === "string" ? raw.trim() : "";

    if (normalized) {
      result[i] = normalized;
      used.add(normalized);
    } else {
      fillIndices.push(i);
    }
  }

  const needed = fillIndices.length;
  const fills = pickUniqueRandomEntries(library, needed, used);

  fills.forEach((entry, idx) => {
    const targetIndex = fillIndices[idx];
    result[targetIndex] = entry;
    used.add(entry);
  });

  if (result.some((entry) => typeof entry !== "string" || entry.length === 0)) {
    throw new Error("Failed to populate the bingo card with unique entries.");
  }

  return result;
}
