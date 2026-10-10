// The list of the journeys in which the saved sessions decide which done
// stories Recently done's first ten entries hold
// (./recently-done-progressive-after-sessions.spec.ts,
// ./recently-done-progressive-added-project.spec.ts): 14 entries
// (./recentlyDoneProgressive.ts), ad hoc sessions at 2, 7 and 11. Nothing
// here chooses which entries show or which records are read.

import {
  progressiveEntries,
  type ProgressiveEntry,
} from "./recentlyDoneProgressive.ts";

export const entries = progressiveEntries(14, [2, 7, 11]);

// The done record paths of the stories among `shown`.
export const storiesOf = (shown: readonly ProgressiveEntry[]) =>
  shown.flatMap((entry) => (entry.kind === "story" ? [entry.path] : []));

// With the sessions, the first ten entries hold eight stories.
export const firstTen = entries.slice(0, 10);

// Without them, the ten stories through the thirteenth entry show.
export const shownWithoutSessions = entries
  .filter((entry) => entry.kind === "story")
  .slice(0, 10);
const last = shownWithoutSessions.at(-1);
if (last?.kind !== "story" || last.place !== 13) {
  throw new Error("No story at 13");
}
// Among the first ten only while the sessions are not placed.
export const thirteenth = last;
