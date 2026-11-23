// Session review region, toolbar and Review changes action names, named once for the
// Playwright review controls (support/reviewControls.ts, storyCardControls.ts).
export const storyReviewNames = {
  // A card's action that opens its review.
  cardAction: "Review changes",
  // The Side panel review belongs to a session.
  region: /Session review/,
  regionExactly: /^Session review$/,
  toolbar: "Review toolbar",
  // The toolbar's eye, whichever of its two names it has now.
  detailsToggle: /^(Show|Hide) review details$/,
};
