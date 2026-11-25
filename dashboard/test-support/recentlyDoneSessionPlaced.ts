// Each position comes from the Done catalog. The fourth story has local
// sessions, whose read can be held or fail independently of its story.
import { progressiveStories } from "./recentlyDoneProgressive.ts";

export const entries = progressiveStories(14);
export const nestedIn = 4;
export const firstTen = entries.slice(0, 10);

const last = firstTen.at(-1);
if (!last) throw new Error("Missing tenth Done story.");
export const tenth = last;

export const firstTenPaths = firstTen.map(({ path }) => path).toSorted();
