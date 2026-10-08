// A page outliving its dashboard process: one preview-mode page is reloaded
// across a restart on the same machine (./responsiveRecovery.ts), and shows
// the same cards, retrieved anew, from answers the first process retained
// (../server/retainedAnswers.ts) after asking GitHub only for the configured
// ref and the recorded story branch head (./retainedAnswersJourney.ts).

import { expectSettledPage, parts } from "./dashboardPage.ts";
import { restart } from "./responsiveRecovery.ts";
import { backlogPath, named } from "./revisionReuseOrigin.ts";
import { described } from "./revisionReuseCalls.ts";
import { expect, published, test } from "./retainedAnswersJourney.ts";

test.describe("a page outliving its dashboard process (preview launch mode)", () => {
  test("a reload after a restart on the same machine shows the same cards, retrieved anew, asking only the ref and the branch head", async ({
    page,
    dashboard,
    github,
    machine,
  }) => {
    test.setTimeout(90_000);
    const project = published("page", named("a5"), named("b5"));
    project.serve(github);
    await page.goto("/");
    await expectSettledPage(page);
    const { stages, source } = parts(page);
    // What the cards say, however the browser lays it out.
    const said = async () =>
      ((await stages.textContent()) ?? "").replace(/\s+/g, " ");
    const cards = await said();
    const retrievedAt = await source.locator("time").getAttribute("datetime");
    expect(github.calls.map(described)).toContain(`content ${backlogPath}@a5`);

    const before = github.calls.length;
    const restarted = await restart(dashboard, { machine }, github);
    try {
      await page.reload();
      await expectSettledPage(page);
      expect(await said()).toBe(cards);
      await expect(source.locator("time")).not.toHaveAttribute(
        "datetime",
        retrievedAt ?? "",
      );
      expect(
        github.calls
          .slice(before)
          .filter(({ request }) => request.kind !== "matching-refs")
          .map(described)
          .sort(),
      ).toEqual([`branch ${project.branch}`, "ref"]);
    } finally {
      await restarted.close();
    }
  });
});
