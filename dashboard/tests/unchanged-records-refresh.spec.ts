// A newly published commit that changes none of a project's planning records
// costs the page only its backlog there and GitHub's account of that commit:
// once the page showed revision A, the check that finds B has the local read
// boundary read B's backlog, compare A with B, and read the one commit
// between, and the page shows B with the same facts without any seed, plan,
// profile, setting, or done-record text or listing, profile history, or last
// commit time being read again. A
// second tab costs what a reload does, and a restarted dashboard process reads
// B in full. The fake GitHub only publishes the commits (./publishedFiles.ts);
// the local read boundary, its memo, and the page decide what is asked and
// shown.

import { expect, pausePageClockAt, test } from "./dashboardTest.ts";
import { publishMovingFiles } from "./publishedFiles.ts";
import { readsBesideChecks } from "./originObservation.ts";
import { passTimeUntilChecked } from "./autoRefreshJourney.ts";
import { startDashboardServer } from "./support/dashboardServer.ts";
import {
  atA,
  atB,
  backlogPath,
  donePath,
  expectSettledAt,
  opened,
  planPath,
  productCodeCommit,
  profilePath,
  recordsReadAt,
  repository,
  revisionA,
  revisionB,
  seedPath,
  settingsPath,
} from "./unchangedRecordsRefresh.ts";

test("a commit that changes no planning record is shown without reading the unchanged records again; a second tab and a restarted dashboard cost what they did", async ({
  page,
  github,
}) => {
  await pausePageClockAt(page, opened);
  const origin = publishMovingFiles(page, { repository, ...atA });

  await page.goto("/");
  await expectSettledAt(page, revisionA);
  expect(recordsReadAt(readsBesideChecks(origin.requests), revisionA)).toEqual(
    expect.arrayContaining([
      `content ${backlogPath}@${revisionA}`,
      `content ${seedPath}@${revisionA}`,
      `content ${planPath}@${revisionA}`,
      `listing .planning/agents@${revisionA}`,
      `content ${profilePath}@${revisionA}`,
      `content ${settingsPath}@${revisionA}`,
      `listing .planning/done@${revisionA}`,
      `content ${donePath}@${revisionA}`,
    ]),
  );

  await test.step("the check finds B and the page shows it after its backlog, one comparison, and one commit read, reading no other record, history, or commit time", async () => {
    const before = origin.requests.length;
    origin.moveTrunk(atB, [productCodeCommit]);
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
      `commit ${productCodeCommit.sha}`,
    ]);
    expect(recordsReadAt(asked, revisionB)).toEqual([
      `content ${backlogPath}@${revisionB}`,
    ]);
    // The card keeps its credited human and slice clock without listing the
    // profile's history or asking the plan's last commit time again.
    expect(asked.filter((call) => call.startsWith("commit-list "))).toEqual([]);
  });

  await test.step("a second tab asks only which commit the ref names", async () => {
    const before = origin.requests.length;
    const second = await page.context().newPage();
    await second.goto("/");
    await expectSettledAt(second, revisionB);
    expect(readsBesideChecks(origin.requests.slice(before))).toEqual([
      "ref main",
    ]);
    await second.close();
  });

  await test.step("a restarted dashboard process holds nothing, so it reads B in full and compares nothing", async () => {
    const restarted = await startDashboardServer({ mode: "dev", github });
    try {
      const before = origin.requests.length;
      await page.goto(restarted.baseURL);
      await expectSettledAt(page, revisionB);
      const asked = readsBesideChecks(origin.requests.slice(before));
      expect(asked).not.toContain("compare");
      expect(recordsReadAt(asked, revisionB)).toEqual(
        expect.arrayContaining([
          `content ${backlogPath}@${revisionB}`,
          `content ${seedPath}@${revisionB}`,
          `content ${planPath}@${revisionB}`,
          `listing .planning/agents@${revisionB}`,
          `content ${profilePath}@${revisionB}`,
          `listing .planning/done@${revisionB}`,
          `content ${donePath}@${revisionB}`,
        ]),
      );
    } finally {
      await restarted.close();
    }
  });
});
