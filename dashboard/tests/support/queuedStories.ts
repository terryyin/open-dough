// Expectations shared by start journeys. The writer supplies the canonical
// queue and preparation facts from the same fixture the skill tests use.
export { writeQueuedStories } from "../../../tests/support/queued-ready-stories.mjs";

export const queuedIdentity = "SEED-A#a";
export const queuedTitle = "Prepare the queued start";
export const otherQueuedIdentity = "SEED-B#b";
