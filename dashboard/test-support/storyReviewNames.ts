// Story review region and toolbar names, named once for the Playwright review
// controls (support/reviewControls.ts) and the mounted review page
// (mounted-dashboard/mountedStoryReviewPage.ts). Imports neither engine.
export const storyReviewNames = {
  // The review's region: a story's or an ad hoc session's review.
  region: /(?:Story|Session) review/,
  regionExactly: /^(?:Story|Session) review$/,
  toolbar: "Review toolbar",
  // The toolbar's eye, whichever of its two names it has now.
  detailsToggle: /^(Show|Hide) review details$/,
};
