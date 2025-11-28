export const certificateSummaryTemplates = {
  linkedin: [
    `{winnerName} wrapped up the round in {formattedDuration} on {formattedNaturalDate}, proving once again that recruiting really *is* a contact sport.`,
    `On {formattedNaturalDate}, {winnerName} clinched the win in {formattedDuration} — demonstrating peak recruiter resilience.`,
    `{winnerName} completed this game in {formattedDuration} and sealed the card on {formattedNaturalDate}, expertly navigating the modern recruiting landscape one chaotic square at a time.`,
    `Won by {winnerName} in {formattedDuration} on {formattedNaturalDate} — a testament to adaptability, grit, and a healthy sense of humor.`,
  ],
  lightHumor: [
    `On {formattedNaturalDate}, {winnerName} won this round in {formattedDuration} — surviving every classic recruiting curveball along the way.`,
    `{winnerName} prevailed in {formattedDuration} on {formattedNaturalDate}, overcoming inbox avalanches and interview chaos like a true TA champion.`,
    `{winnerName} won this game in {formattedDuration} on {formattedNaturalDate} — proving once again that recruiters are built different.`,
    `{winnerName} took the win in {formattedDuration} on {formattedNaturalDate}, narrowly avoiding at least three existential crises in the process.`,
  ],
  snarky: [
    `{winnerName} survived {formattedDuration} of recruiting chaos to win this game on {formattedNaturalDate} — truly a master of controlled panic.`,
    `In {formattedDuration}, {winnerName} achieved what hiring managers often cannot on {formattedNaturalDate}: a decisive outcome.`,
    `{winnerName} secured victory after {formattedDuration} on {formattedNaturalDate} — and without creating a single new interview loop.`,
    `{winnerName} conquered {formattedDuration} of TA mayhem and finished the job on {formattedNaturalDate}, marking the only thing today that stayed on schedule.`,
  ],
  wildcard: [
    `{winnerName} won this game in {formattedDuration} on {formattedNaturalDate}. Somewhere, a hiring manager just changed the job requirements again.`,
    `{winnerName} took the crown after {formattedDuration} and stamped the card on {formattedNaturalDate}. Sources confirm LinkedIn will not let them rest now.`,
    `Victory goes to {winnerName} in {formattedDuration} on {formattedNaturalDate} — the true definition of “other duties as assigned.”`,
    `{winnerName} finished in {formattedDuration} on {formattedNaturalDate}. HR is preparing a celebratory email with a typo.`,
  ],
};

interface CertificateSummaryArgs {
  winnerName: string;
  formattedDuration: string;
  formattedEndTime: string;
  formattedNaturalDate: string;
  customRoomName?: string | null;
}

export function getRandomCertificateSummary({
  winnerName,
  formattedDuration,
  formattedEndTime,
  formattedNaturalDate,
  customRoomName,
}: CertificateSummaryArgs) {
  const categories = Object.keys(
    certificateSummaryTemplates
  ) as (keyof typeof certificateSummaryTemplates)[];
  const category =
    categories[Math.floor(Math.random() * categories.length)];
  const templates = certificateSummaryTemplates[category];
  const template =
    templates[Math.floor(Math.random() * templates.length)];

  let result = template
    .replaceAll("{winnerName}", winnerName)
    .replaceAll("{formattedDuration}", formattedDuration)
    .replaceAll("{formattedEndTime}", formattedEndTime)
    .replaceAll("{formattedNaturalDate}", formattedNaturalDate);

  if (customRoomName) {
    result += ` This round was played in “${customRoomName}.”`;
  }

  return result;
}
