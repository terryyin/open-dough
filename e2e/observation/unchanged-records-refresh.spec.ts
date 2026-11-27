// A newly published commit that changes none of a project's planning records
// costs one verified trunk read and GitHub's account of that commit: once
// the page showed revision A, the check that finds B compares A with B and
// reads the one commit between. The backlog comes from that trunk read, and
// the page shows B with the same facts without any seed, plan, profile,
// setting, or done-record text or listing, done catalog, profile history, or
// last commit time being read again. A second tab shows the verified commit
// without a REST membership read, and a restarted dashboard process reads B
// in full. The fake GitHub only publishes the commits
// (../../dashboard/test-support/publishedFiles.ts); the local read boundary,
// its memo, and the page decide what is asked and shown.

import {
  expect,
  pausePageClockAt,
  test,
} from "../../dashboard/test-support/dashboardTest.ts";
import { publishCommittedFileHistory } from "../../dashboard/test-support/committedFiles.ts";
import { remoteBranchHead } from "../../dashboard/server/gitTargetFetch.ts";
import { gitHubRepositoryUrl } from "../../dashboard/test-support/support/fixtureOriginRoute.ts";
import { readsBesideChecks } from "../../dashboard/test-support/originObservation.ts";
import { passTimeUntilChecked } from "../../dashboard/test-support/autoRefreshJourney.ts";
import {
  sharedDashboardBuild,
  startDashboardServer,
} from "../../dashboard/test-support/support/dashboardServer.ts";
import {
  backlogPath,
  doneCatalogPath,
  donePath,
  expectSettledAt,
  opened,
  planPath,
  productCodeChange,
  refreshHistory,
  refreshDetails,
  profilePath,
  recordsReadAt,
  repository,
  seedPath,
  settingsPath,
} from "../../dashboard/test-support/unchangedRecordsRefresh.ts";

test("a commit that changes no planning record is shown without reading the unchanged records again; a second tab and a restarted dashboard cost what they did", async ({
  page,
  github,
  dashboard,
  afterGitHubStops,
}) => {
  await pausePageClockAt(page, opened);
  const origin = await publishCommittedFileHistory(page, refreshHistory(), {
    repository,
    trunk: "A",
    details: refreshDetails,
    afterGitHubStops,
  });
  const { A: revisionA, B: revisionB } = origin.revisions;
  const routed = (home: string) =>
    remoteBranchHead(gitHubRepositoryUrl(repository), "refs/heads/main", {
      cwd: home,
      env: { HOME: home },
      maxBuffer: 4096,
    });
  expect(await routed(dashboard.home)).toBe(revisionA);

  await page.goto("/");
  await expectSettledAt(page, revisionA);
  expect(recordsReadAt(readsBesideChecks(origin.requests), revisionA)).toEqual(
    expect.arrayContaining([
      `content ${seedPath}@${revisionA}`,
      `content ${planPath}@${revisionA}`,
      `listing .planning/agents@${revisionA}`,
      `content ${profilePath}@${revisionA}`,
      `content ${settingsPath}@${revisionA}`,
      `listing .planning/done@${revisionA}`,
      `content ${doneCatalogPath}@${revisionA}`,
      `content ${donePath}@${revisionA}`,
    ]),
  );

  await test.step("the check finds B and the page shows it after its backlog, one comparison, and one commit read, reading no other record, history, or commit time", async () => {
    const before = origin.requests.length;
    origin.moveTrunk(origin.published.B, [
      { ...productCodeChange, sha: revisionB },
    ]);
    expect(await routed(dashboard.home)).toBe(revisionB);
    await passTimeUntilChecked(page);
    await expectSettledAt(page, revisionB);
    const asked = readsBesideChecks(origin.requests.slice(before));
    expect(
      origin.requests
        .slice(before)
        .flatMap(({ request }) =>
          request.kind === "compare"
            ? [`${request.base}...${request.head}`]
            : [],
        ),
    ).toEqual([`${revisionA}...${revisionB}`]);
    expect(asked.filter((call) => call.startsWith("commit "))).toEqual([
      `commit ${revisionB}`,
    ]);
    expect(recordsReadAt(asked, revisionB)).toEqual([
      `content ${backlogPath}@${revisionB}`,
    ]);
    // The card keeps its credited human and slice clock without listing the
    // profile's history or asking the plan's last commit time again.
    expect(asked.filter((call) => call.startsWith("commit-list "))).toEqual([]);
  });

  await test.step("a second tab shows the verified commit without a REST membership read", async () => {
    const before = origin.requests.length;
    const second = await page.context().newPage();
    await second.goto("/");
    await expectSettledAt(second, revisionB);
    expect(readsBesideChecks(origin.requests.slice(before))).toEqual([]);
    await second.close();
  });

  await test.step("a restarted dashboard process holds nothing, so it reads B in full and compares nothing", async () => {
    const restarted = await startDashboardServer({
      mode: "preview",
      prebuilt: sharedDashboardBuild,
      github,
    });
    try {
      expect(await routed(restarted.home)).toBe(revisionB);
      const before = origin.requests.length;
      await page.goto(restarted.baseURL);
      await expectSettledAt(page, revisionB);
      const asked = readsBesideChecks(origin.requests.slice(before));
      expect(asked).not.toContain("compare");
      expect(recordsReadAt(asked, revisionB)).toEqual(
        expect.arrayContaining([
          `content ${seedPath}@${revisionB}`,
          `content ${planPath}@${revisionB}`,
          `listing .planning/agents@${revisionB}`,
          `content ${profilePath}@${revisionB}`,
          `listing .planning/done@${revisionB}`,
          `content ${doneCatalogPath}@${revisionB}`,
          `content ${donePath}@${revisionB}`,
        ]),
      );
    } finally {
      await restarted.close();
    }
  });
});
