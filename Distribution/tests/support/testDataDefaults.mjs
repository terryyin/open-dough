// Incidental timestamps shared by related launches, transcripts and usage tasks.
export const testDataTimestamp = "2026-11-14T10:00:00.000Z";

// Whole seconds, so stated times read back from Git unchanged.
const caseNow = Math.floor(Date.now() / 1000) * 1000;

// An instant this many minutes before the test run's clock, for cases whose
// records must stay fresh against real retention and Git dates.
/** @param {number} minutes */
export const minutesAgo = (minutes) =>
  new Date(caseNow - minutes * 60_000).toISOString();
