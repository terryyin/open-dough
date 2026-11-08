// Expectations shared by start journeys. The queued identities come from the
// shared description of Stories A and B queued and Ready
// (`queuedReadyRepository`), which the skill tests use too.
import { storyA, storyB } from "../../../tests/support/queued-repository.mjs";

export const queuedIdentity = storyA.identity;
export const queuedTitle = "Prepare the queued start";
export const otherQueuedIdentity = storyB.identity;
