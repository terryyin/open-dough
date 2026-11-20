// The typed review handler in-process refuses a session that is not a
// standalone ad hoc session of the project, given its typed kept state: no
// server, no machine stores. Each refusal carries its HTTP status.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { RefusedRequest } from "../../server/localOrigin.ts";
import { storyReview } from "../../server/storyReviewSnapshot.ts";

const records = [
  makeMe.aLaunchRecord
    .executing({ identity: "SEED-7#story-a", title: "Story A" })
    .inClaudeSession({ sessionId: "story-session" })
    .markedDone()
    .please(),
];
const review = (session: string) =>
  storyReview(
    makeMe.aSessionReviewRead.ofSession(session).keeping(records).please(),
    new AbortController().signal,
  );

test("Given a kept story launch's session, when its review is read as a session, then it is refused for its story", async () => {
  const refused = review("story-session");

  await expect(refused).rejects.toBeInstanceOf(RefusedRequest);
  await expect(refused).rejects.toMatchObject({
    status: 400,
    message:
      "This session belongs to a story launch and is reviewed by its story.",
  });
});

test("Given no kept launch of a session, when its review is read, then it is refused as unknown", async () => {
  const refused = review("no-such-session");

  await expect(refused).rejects.toBeInstanceOf(RefusedRequest);
  await expect(refused).rejects.toMatchObject({
    status: 404,
    message: "This dashboard launched no such session for this project.",
  });
});
