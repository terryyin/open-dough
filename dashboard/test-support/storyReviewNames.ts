// Story review region, toolbar and card action names, named once for the
// Playwright review controls (support/reviewControls.ts, storyCardControls.ts).
export const storyReviewNames = {
  // A card's action that opens its review.
  cardAction: "Review changes",
  // The review's region: a story's or an ad hoc session's review.
  region: /(?:Story|Session) review/,
  regionExactly: /^(?:Story|Session) review$/,
  toolbar: "Review toolbar",
  // The toolbar's eye, whichever of its two names it has now.
  detailsToggle: /^(Show|Hide) review details$/,
};
