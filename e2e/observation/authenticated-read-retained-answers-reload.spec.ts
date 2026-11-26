// A page outliving its dashboard process: one preview-mode page is reloaded
// across a restart on the same machine and shows
// the same cards, retrieved anew, from answers the first process retained
// (../../dashboard/server/retainedAnswers.ts) after asking GitHub, beside membership,
// only for the recorded story branch head (../../dashboard/test-support/retainedAnswersJourney.ts).

import {
  expectSettledPage,
  parts,
  shortRevision,
} from "../../dashboard/test-support/dashboardPage.ts";
import {
  sharedDashboardBuild,
  startDashboardServer,
} from "../../dashboard/test-support/support/dashboardServer.ts";
import {
  named,
  seedPath,
} from "../../dashboard/test-support/revisionReuseOrigin.ts";
import { describedExactly } from "../../dashboard/test-support/revisionReuseCalls.ts";
import {
  expect,
  published,
  test,
} from "../../dashboard/test-support/retainedAnswersJourney.ts";

test.describe("a page outliving its dashboard process (preview launch mode)", () => {
  test("a reload after a restart on the same machine shows the same cards, retrieved anew, asking only the branch head beside membership", async ({
    page,
    dashboard,
    github,
    machine,
  }) => {
    const project = published("page", named("b5"));
    const revision = project.publication.revision;
    project.serve(github);
    project.expectRef(github);
    await page.goto("/");
    await expectSettledPage(page);
    const { board, readRevision, retrievedAt } = parts(page);
    await expect(readRevision).toContainText(shortRevision(revision));
    // What the cards say, however the browser lays it out.
    const said = async () =>
      ((await board.textContent()) ?? "").replace(/\s+/g, " ");
    const cards = await said();
    const firstRetrievedAt = await retrievedAt.getAttribute("datetime");
    expect(github.calls.map(describedExactly)).toContain(
      `content ${seedPath}@${revision}`,
    );

    const before = github.calls.length;
    await dashboard.close();
    const restarted = await startDashboardServer({
      mode: "preview",
      prebuilt: sharedDashboardBuild,
      github,
      machine,
      port: Number(new URL(dashboard.baseURL).port),
    });
    try {
      project.expectRef(restarted.github);
      await page.reload();
      await expectSettledPage(page);
      await expect(readRevision).toContainText(shortRevision(revision));
      expect(await said()).toBe(cards);
      await expect(retrievedAt).not.toHaveAttribute(
        "datetime",
        firstRetrievedAt ?? "",
      );
      expect(
        github.calls
          .slice(before)
          .filter(
            ({ request }) =>
              request.kind !== "matching-refs" && request.kind !== "ref",
          )
          .map(describedExactly)
          .sort(),
      ).toEqual([`branch ${project.branch}`]);
    } finally {
      await restarted.close();
    }
  });
});
