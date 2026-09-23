import { expect, test } from "./dashboardTest";
import { expectMembership, openDirection, parts } from "./dashboardPage";
import {
  commitAnswer,
  emptyBacklog,
  publishOrigin,
  rawFileAnswer,
} from "./publishedOrigin";
import { expectSideBySideInOrder } from "./pageLayout";

const revision = "4f2a9c1e7b3d5a6089c0d1e2f3a4b5c6d7e8f901";

const publishedBacklog = `# Product backlog

## Near-future direction

Give developers visibility into a project's published work.
Derive it solely from Git state published to origin.

## Taken

- [Repair the installer's update report](quick/059-installer-update-report/PLAN.md)
- [See the project's published work in a story dashboard](seeds/SEED-021-observe-published-story-progress.md#see-published-work) — SEED-021#see-published-work ([plan](quick/061-published-story-dashboard/PLAN.md))

## Backlog list

- [Prepare stories in a clear developer workspace workflow](seeds/SEED-008-worktree-branch-trunk-sync.md#planning-workspace-procedure) — SEED-008#planning-workspace-procedure
- [Queue trunk integration for agents on the same machine](seeds/SEED-008-worktree-branch-trunk-sync.md#same-machine-merge-queue) — SEED-008
- [Show <em>markup</em> in a title as the text it is](seeds/SEED-030-titles.md#markup-as-text) — SEED-030#markup-as-text
`;

const claimsBeyondMembership =
  /\b(live|running|online|active|in progress|started|completed?|done|finished|owner|mode)\b/i;

test("published overview shows connected Backlog and Taken work read at one revision", async ({
  page,
}) => {
  const retrievedAt = new Date("2026-09-20T08:30:00.000Z");
  await page.clock.setFixedTime(retrievedAt);
  let releaseRef: () => void = () => undefined;
  const requests = await publishOrigin(page, {
    ref: commitAnswer(revision),
    backlog: { revision, answer: rawFileAnswer(publishedBacklog) },
    refHeldUntil: new Promise<void>((resolve) => {
      releaseRef = resolve;
    }),
  });

  await page.goto("/");

  const {
    stages,
    backlog,
    taken,
    connector,
    direction,
    source,
    status,
    reading,
  } = parts(page);
  await test.step("reading is shown before any work or count", async () => {
    await expect(status).toHaveText("Reading published work…");
    await expect(stages).toHaveCount(0);
    await expect(page.getByText(/\d+ entr(y|ies)/)).toHaveCount(0);
    releaseRef();
  });

  await test.step("membership and recorded order", async () => {
    await expectMembership(page, {
      taken: [
        "Repair the installer's update report",
        "See the project's published work in a story dashboard",
      ],
      backlog: [
        "Prepare stories in a clear developer workspace workflow",
        "Queue trunk integration for agents on the same machine",
        "Show <em>markup</em> in a title as the text it is",
      ],
    });
    await expect(reading).toHaveCount(0);
  });

  await test.step("identities come from the shared backlog reader", async () => {
    // A bounded correction: a bare plan link, identified by that link.
    await expect(
      taken.getByRole("article", {
        name: "Repair the installer's update report",
      }),
    ).toContainText("quick/059-installer-update-report/PLAN.md");
    // The parenthesized plan spelling leaves the recorded identity intact.
    const planned = taken.getByRole("article", {
      name: "See the project's published work in a story dashboard",
    });
    await expect(planned).toContainText("SEED-021#see-published-work");
    await expect(planned).not.toContainText("([plan]");
    // The older shorthand is still read against the link's anchor.
    await expect(
      backlog.getByRole("article", {
        name: "Queue trunk integration for agents on the same machine",
      }),
    ).toContainText("SEED-008#same-machine-merge-queue");
  });

  await test.step("titles are text, never markup", async () => {
    await expect(stages.locator("em")).toHaveCount(0);
  });

  await test.step("backlog priority and stage counts", async () => {
    await expect(backlog.getByText(/^Priority \d+$/)).toHaveText([
      "Priority 1",
      "Priority 2",
      "Priority 3",
    ]);
    await expect(taken.getByText(/Priority/)).toHaveCount(0);
    await expect(backlog).toContainText("3 entries");
    await expect(taken).toContainText("2 entries");
  });

  await test.step("Backlog connects to Taken through taking work", async () => {
    await expect(connector).toBeVisible();
    await expect(stages.getByRole("region")).toHaveCount(2);
    await expectSideBySideInOrder([backlog, connector, taken]);
    await expect(stages).toContainText("not a dependency between entries");
  });

  await test.step("direction and source evidence sit outside the stage", async () => {
    await openDirection(page);
    await expect(direction).toContainText(
      "Give developers visibility into a project's published work.",
    );
    await expect(direction).toContainText(
      "Derive it solely from Git state published to origin.",
    );
    await expect(source).toContainText("terryyin/open-dough");
    await expect(source).toContainText("main");
    await expect(source).toContainText(revision);
    await expect(source.locator("time")).toHaveAttribute(
      "datetime",
      retrievedAt.toISOString(),
    );
    await expect(stages.getByText("Near-future direction")).toHaveCount(0);
    await expect(stages.getByText(revision)).toHaveCount(0);
  });

  await test.step("membership makes no live or completion claim", async () => {
    await expect(page.locator("body")).not.toContainText(
      claimsBeyondMembership,
    );
    await expect(page.getByRole("alert")).toHaveCount(0);
  });

  await test.step("the ref and then the file are read through the local gh at the resolved revision", () => {
    expect(requests.map((request) => request.argv)).toEqual([
      ["api", "repos/terryyin/open-dough/commits/main", "--jq", ".sha"],
      [
        "api",
        "-H",
        "Accept: application/vnd.github.raw+json",
        `repos/terryyin/open-dough/contents/.planning/PRODUCT-BACKLOG.md?ref=${revision}`,
      ],
    ]);
  });
});

test("published overview accepts successfully empty groups and no recorded direction", async ({
  page,
}) => {
  await publishOrigin(page, {
    ref: commitAnswer(revision),
    backlog: { revision, answer: rawFileAnswer(emptyBacklog) },
  });

  await page.goto("/");

  const { stages, backlog, taken, connector, direction, source } = parts(page);
  await expect(taken).toContainText("No Taken entries are recorded.");
  await expect(taken).toContainText("0 entries");
  await expect(backlog).toContainText("No Backlog entries are recorded.");
  await expect(backlog).toContainText("0 entries");
  await expect(connector).toBeVisible();
  await expect(stages.getByRole("article")).toHaveCount(0);
  await openDirection(page);
  await expect(direction).toContainText(
    "No near-future direction is recorded.",
  );
  await expect(source).toContainText(revision);
  await expect(page.getByRole("alert")).toHaveCount(0);
});
