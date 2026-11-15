// The history read's measure capability, as `gap-reasons=timing-basis` names
// newer gap reasons (`../server/ciHistoryGapVocabulary.ts`). A project read
// that names it answers points by CI time without runner waits kept with each
// build. Without it the read answers today's wall-time points, which a page
// opened before the capability existed parses.
export const historyMeasure = {
  name: "measure",
  value: "time-without-runner-waits",
} as const;
