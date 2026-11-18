// Corrupt and retry the actual local history reader; neither contacts Actions.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { keepLandedCiHistory } from "../../test-support/support/landedCiHistory.ts";
import { withBrokenCollectedHistory } from "../../test-support/support/collectedScopeHistory.ts";
import { rawRequest } from "../../test-support/support/rawHttp.ts";
import { expect, test } from "../../test-support/support/preparationPage.ts";

test.use({ serverMode: "boundary" });

test("a failed local Done history refresh and its restored retry ask Actions nothing", async ({
  dashboard,
  github,
}) => {
  await keepLandedCiHistory(dashboard.home, makeMe.aLandedCiHistory.please());
  const query = new URLSearchParams({
    source: "open-dough",
    intent: "ci-history",
    revision: "c".repeat(40),
    through: "2026-11-09T00:00:00Z",
    "gap-reasons": "timing-basis",
    history: "glance",
  });
  const read = () =>
    rawRequest({
      url: `${dashboard.origin}/__authenticated-read?${query}`,
      headers: { Origin: dashboard.origin },
    });
  const actions = () =>
    github.calls.filter(({ request }) => request.kind.startsWith("actions-"));
  const before = actions().length;
  await withBrokenCollectedHistory(dashboard.home, async (restore) => {
    const failed = await read();
    expect(failed.status).toBe(502);
    expect(JSON.parse(failed.body)).toMatchObject({
      error:
        "The collected CI history could not be read. Retry the local history read.",
    });
    expect(actions()).toHaveLength(before);
    restore();
    const retried = await read();
    expect(retried.status).toBe(200);
    expect(JSON.parse(retried.body)).toMatchObject({
      selectedRevision: "c".repeat(40),
    });
    expect(actions()).toHaveLength(before);
  });
});
