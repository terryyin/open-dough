// A page outliving its dashboard process: one preview-mode page is reloaded
// across a restart on the same machine (../../dashboard/tests/responsiveRecovery.ts), and shows
// the same cards, retrieved anew, from answers the first process retained
// (../../dashboard/server/retainedAnswers.ts) after asking GitHub only for the configured
// ref and the recorded story branch head (../../dashboard/tests/retainedAnswersJourney.ts).

import {
  expectSettledPage,
  parts,
} from "../../dashboard/tests/dashboardPage.ts";
import { restart } from "../../dashboard/tests/responsiveRecovery.ts";
import {
  backlogPath,
  named,
} from "../../dashboard/tests/revisionReuseOrigin.ts";
import { described } from "../../dashboard/tests/revisionReuseCalls.ts";
import {
  expect,
  published,
  test,
} from "../../dashboard/tests/retainedAnswersJourney.ts";

test.describe("a page outliving its dashboard process (preview launch mode)", () => {
  test("a reload after a restart on the same machine shows the same cards, retrieved anew, asking only the ref and the branch head", async ({
    page,
    dashboard,
    github,
    machine,
  }) => {
    const project = published("page", named("a5"), named("b5"));
    project.serve(github);
    await page.goto("/");
    await expectSettledPage(page);
    const { board } = parts(page);
    // What the cards say, however the browser lays it out.
    const said = async () =>
      ((await board.textContent()) ?? "").replace(/\s+/g, " ");
    const cards = await said();
    const retrievedAt = await parts(page).retrievedAt.getAttribute("datetime");
    expect(github.calls.map(described)).toContain(`content ${backlogPath}@a5`);

    const before = github.calls.length;
    const restarted = await restart(dashboard, { machine }, github);
    try {
      await page.reload();
      await expectSettledPage(page);
      expect(await said()).toBe(cards);
      await expect(parts(page).retrievedAt).not.toHaveAttribute(
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
