// The history read's glance capability, as `gap-reasons=timing-basis` names
// newer gap reasons (`../server/ciHistoryGapVocabulary.ts`). A selected Done
// or scoped read that names it answers only what the glance views read
// (`../server/ciHistoryGlance.ts`). Without it the read answers its full
// default shape, which a page opened before the capability existed parses.
export const historyGlance = { name: "history", value: "glance" } as const;
