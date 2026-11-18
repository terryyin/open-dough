// The panel reads a changed file's text beside its diff; a session's kept
// pair admits that read as it admits the diff.
import { expect, test } from "../../test-support/support/codexStart.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { materializeLocalCheckout } from "../../../Distribution/tests/support/repository-fixture.mjs";
import { reviewedFileTextSchema } from "../../src/storyReviewContract.ts";
import {
  adHocSessionFileText,
  keepSessionWithKeptRun,
} from "../../test-support/support/adHocReview.ts";

test.use({ serverMode: "boundary" });

test("a file text read naming a kept run's pair of a session's commits answers both sides, and any other pair is refused", async ({
  request,
  dashboard,
}) => {
  const repository = await materializeLocalCheckout(
    undefined,
    makeMe.aRepository
      .withRevision("base", {
        backlog: null,
        files: { "work.txt": "before\n" },
      })
      .withRevision("result", {
        backlog: null,
        files: { "work.txt": "after\n" },
      })
      .please(),
  );
  try {
    const { base, result } = repository.revisions;
    const sessionId = keepSessionWithKeptRun(
      dashboard,
      repository.integration,
      { base, revision: result },
    );
    const read = (named: object) =>
      adHocSessionFileText(request, dashboard, sessionId, {
        baseline: base,
        tree: result,
        path: "work.txt",
        ...named,
      });

    const kept = await read({});
    expect(kept.status()).toBe(200);
    expect(reviewedFileTextSchema.parse(await kept.json())).toEqual({
      kind: "text",
      baseline: "before\n",
      tree: "after\n",
    });
    const refused = await read({ baseline: result });
    expect(refused.status()).toBe(409);
    expect(await refused.json()).toEqual({
      error:
        "The file or comparison does not belong to this session's kept commits.",
    });
  } finally {
    await repository.cleanup();
  }
});
