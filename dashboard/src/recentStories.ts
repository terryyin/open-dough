// Most-recent-first history of selected stories for the banner's Recent
// stories list. Each project and story pair appears once. Persistence through
// keptPreference belongs to a later slice; this module only shapes the list.

export type RecentStory = {
  readonly project: string;
  readonly identity: string;
};

export const recentStoriesLimit = 10;

// Whether two project and story pairs name the same story (ADR 0008 Selected
// story / Recent stories). `a` may be absent when nothing is selected.
export const sameRecentStory = (a: RecentStory | undefined, b: RecentStory) =>
  a !== undefined && a.project === b.project && a.identity === b.identity;

// Puts `story` first, drops any earlier copy of the same pair, and keeps at
// most `limit` entries.
export function rememberRecentStory(
  history: readonly RecentStory[],
  story: RecentStory,
  limit = recentStoriesLimit,
): RecentStory[] {
  return [
    story,
    ...history.filter((entry) => !sameRecentStory(entry, story)),
  ].slice(0, limit);
}
