// Most-recent-first history of selected stories for the banner's Recent
// stories list. Each project and story pair appears once. This browser keeps
// the list in disposable storage (./keptPreference.ts, ADR 0008); when storage
// is unavailable the preference lasts only for the page.

import { keep, readKept } from "./keptPreference.ts";

export type RecentStory = {
  readonly project: string;
  readonly identity: string;
};

export const recentStoriesLimit = 10;

const recentStoriesKey = "open-dough.recentStories";

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

function isRecentStory(entry: unknown): entry is RecentStory {
  return (
    entry !== null &&
    typeof entry === "object" &&
    typeof (entry as { project?: unknown }).project === "string" &&
    typeof (entry as { identity?: unknown }).identity === "string"
  );
}

function usableRecentStories(kept: string): RecentStory[] | undefined {
  try {
    const parsed: unknown = JSON.parse(kept);
    if (!Array.isArray(parsed)) return undefined;
    const stories: RecentStory[] = [];
    for (const entry of parsed) {
      if (!isRecentStory(entry)) return undefined;
      stories.push({ project: entry.project, identity: entry.identity });
    }
    return stories.slice(0, recentStoriesLimit);
  } catch {
    return undefined;
  }
}

function keepRecentStories(history: readonly RecentStory[]): void {
  keep(recentStoriesKey, JSON.stringify(history));
}

// What this browser keeps under the Recent stories key, or nothing when it
// keeps none or an unusable value.
export function readRecentStories(): RecentStory[] {
  const kept = readKept(recentStoriesKey);
  if (kept === undefined) return [];
  return usableRecentStories(kept) ?? [];
}

// Remembers `story` in the history and keeps the result in this browser's
// disposable storage; when storage throws, the returned list alone still holds
// it for the page.
export function rememberKeptRecentStory(
  history: readonly RecentStory[],
  story: RecentStory,
): RecentStory[] {
  const next = rememberRecentStory(history, story);
  keepRecentStories(next);
  return next;
}
