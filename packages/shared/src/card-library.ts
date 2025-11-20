// Static Recruiting Bingo card library.
// These entries give us a consistent tone across the app and can be tweaked over time
// as we gather feedback from recruiters.

export type CardEntry = string;

const defaultRecruitingLibrary: CardEntry[] = [
  "Candidate ghosted after accepting offer",
  "Hiring manager changed the role mid-search",
  "Found a resume with Comic Sans",
  "Interview panel asked the wrong questions",
  "Offer declined because of counter-offer",
  "Stakeholder vanished before final round",
  "Reference never called back",
  "Urgent req put on indefinite hold",
  "Candidate asked for double the budget",
  "Discovered duplicate candidates from two agencies",
  "Scheduling ping-pong took all week",
  "Candidate insisted on camera off for onsite",
  "Intake meeting stretched to two hours",
  "Offer letter typo caught at the last minute",
  "Sourcing list mysteriously disappeared",
  "Manager requested five more interviews",
  "Role renamed three times",
  "Feedback arrived after the deadline",
  "Candidate brought their cat to the Zoom call",
  "New tool rollout broke all templates",
  "Offer renegotiated after signing",
  "Interview loop forgot to submit scores",
  "Executive skipped their own interview",
  "Prospect replied all with a meme",
  "Hiring freeze announced mid-cycle",
  "Background check delayed onboarding",
  "Candidate submitted a resume PDF with no text",
  "Employee referral never filled out the form",
  "Sourcing channel produced zero leads",
  "Inbox hit 1,000 unread messages",
  "Same candidate applied to every role",
  "Requisition opened before leveling decision",
  "Candidate asked for a remote role that isn\'t",
  "Manager sent conflicting salary bands",
  "Whiteboard tool crashed mid-session",
  "Candidate only wanted answers via SMS",
  "Product demo turned into therapy session",
  "Offer packet stuck in legal review",
  "Hiring committee met without notes",
  "Candidate mistook us for a different company"
];

export function getDefaultRecruitingLibrary(): CardEntry[] {
  return [...defaultRecruitingLibrary];
}
