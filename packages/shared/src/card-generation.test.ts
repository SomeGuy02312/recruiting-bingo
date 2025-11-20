import { describe, expect, it } from "vitest";
import {
  buildCardFromCustomInputs,
  generateRandomCard
} from "./index";

const library = Array.from({ length: 40 }, (_, i) => String.fromCharCode(65 + i));

const onlyFromLibrary = (card: string[]) => card.every((entry) => library.includes(entry));

const hasDuplicates = (entries: string[]) => new Set(entries).size !== entries.length;

describe("generateRandomCard", () => {
  it("returns 25 unique entries from the library", () => {
    const card = generateRandomCard(library);
    expect(card).toHaveLength(25);
    expect(onlyFromLibrary(card)).toBe(true);
    expect(hasDuplicates(card)).toBe(false);
  });

  it("throws when the library is too small", () => {
    const smallLib = library.slice(0, 20);
    expect(() => generateRandomCard(smallLib)).toThrow(/at least 25/);
  });
});

describe("buildCardFromCustomInputs", () => {
  it("returns fully custom cards unchanged", () => {
    const custom = Array.from({ length: 25 }, (_, i) => `Custom-${i}`);
    const card = buildCardFromCustomInputs(custom, library);
    expect(card).toEqual(custom);
  });

  it("fills empty slots while preserving custom entries", () => {
    const custom = new Array(25).fill("");
    custom[0] = "Candidate Wins";
    custom[5] = "Hiring Chaos";
    const card = buildCardFromCustomInputs(custom, library);
    expect(card[0]).toBe("Candidate Wins");
    expect(card[5]).toBe("Hiring Chaos");
    expect(onlyFromLibrary(card.filter((entry) => entry !== "Candidate Wins" && entry !== "Hiring Chaos"))).toBe(true);
    expect(hasDuplicates(card)).toBe(false);
  });

  it("treats whitespace entries as empty", () => {
    const custom = new Array(25).fill(" ");
    custom[10] = " Real Entry ";
    const card = buildCardFromCustomInputs(custom, library);
    expect(card[10]).toBe("Real Entry");
    expect(card.filter((entry) => entry === "")).toHaveLength(0);
  });

  it("throws when there are not enough library entries for empty slots", () => {
    const custom = new Array(25).fill("");
    custom[0] = "A";
    const tinyLibrary = ["A", "B"]; // only one new entry available
    expect(() => buildCardFromCustomInputs(custom, tinyLibrary)).toThrow(/Not enough unique entries/);
  });

  it("pads short custom entries and ignores extras", () => {
    const shortCustom = ["A", "B", "C"];
    const longCustom = Array.from({ length: 30 }, (_, i) => `Entry-${i}`);

    const padded = buildCardFromCustomInputs(shortCustom, library);
    expect(padded[0]).toBe("A");
    expect(padded[1]).toBe("B");
    expect(padded[2]).toBe("C");
    expect(padded).toHaveLength(25);

    const truncated = buildCardFromCustomInputs(longCustom, library);
    expect(truncated).toHaveLength(25);
    expect(truncated[24]).toBe(`Entry-24`);
  });
});
