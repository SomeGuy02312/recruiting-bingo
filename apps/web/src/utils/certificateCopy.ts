export const certificateSummaryTemplates = {
  linkedin: [
    `{winnerName} wrapped up the round in {formattedDuration} on {formattedEndTime}, proving once again that recruiting really *is* a contact sport.`,
    `At {formattedEndTime}, {winnerName} clinched the win in {formattedDuration} — demonstrating peak recruiter resilience.`,
    `{winnerName} completed this game in {formattedDuration}, expertly navigating the modern recruiting landscape one chaotic square at a time.`,
    `Won by {winnerName} in {formattedDuration} — a testament to adaptability, grit, and a healthy sense of humor.`,
  ],
  lightHumor: [
    `At {formattedEndTime}, {winnerName} won this round in {formattedDuration} — surviving every classic recruiting curveball along the way.`,
    `{winnerName} prevailed in {formattedDuration}, overcoming inbox avalanches and interview chaos like a true TA champion.`,
    `{winnerName} won this game in {formattedDuration} — proving once again that recruiters are built different.`,
    `{winnerName} took the win in {formattedDuration}, narrowly avoiding at least three existential crises in the process.`,
  ],
  snarky: [
    `{winnerName} survived {formattedDuration} of recruiting chaos to win this game — truly a master of controlled panic.`,
    `In {formattedDuration}, {winnerName} achieved what hiring managers often cannot: a decisive outcome.`,
    `{winnerName} secured victory after {formattedDuration} — and without creating a single new interview loop.`,
    `{winnerName} conquered {formattedDuration} of TA mayhem, marking the only thing today that stayed on schedule.`,
  ],
  wildcard: [
    `{winnerName} won this game in {formattedDuration}. Somewhere, a hiring manager just changed the job requirements again.`,
    `{winnerName} took the crown after {formattedDuration}. Sources confirm LinkedIn will not let them rest now.`,
    `Victory goes to {winnerName} in {formattedDuration} — the true definition of “other duties as assigned.”`,
    `{winnerName} finished in {formattedDuration}. HR is preparing a celebratory email with a typo.`,
  ],
};

export function getRandomCertificateSummary({
  winnerName,
  formattedDuration,
  formattedEndTime,
  customRoomName,
}: {
  winnerName: string;
  formattedDuration: string;
  formattedEndTime: string;
  customRoomName?: string | null;
}) {
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
    .replaceAll("{formattedEndTime}", formattedEndTime);

  if (customRoomName) {
    result += ` This round was played in “${customRoomName}.”`;
  }

  return result;
}
