import { expect, test, type Locator } from "@playwright/test";
import {
  commitAnswer,
  publishOrigin,
  rateLimitedAnswer,
  rawFileAnswer,
} from "./githubOrigin";

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

const emptyBacklog = `# Product backlog

## Taken

## Backlog list
`;

const claimsBeyondMembership =
  /\b(live|running|online|active|in progress|started|completed?|done|finished|owner|mode)\b/i;

async function box(locator: Locator) {
  const found = await locator.boundingBox();
  if (!found) {
    throw new Error(`No visible box for ${locator.toString()}`);
  }
  return found;
}

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

  const stages = page.getByRole("region", { name: "Work stages" });
  await test.step("reading is shown before any work or count", async () => {
    await expect(page.getByRole("status")).toHaveText(
      "Reading published work…",
    );
    await expect(stages).toHaveCount(0);
    await expect(page.getByText(/\d+ entr(y|ies)/)).toHaveCount(0);
    releaseRef();
  });

  const backlog = stages.getByRole("region", { name: "Backlog", exact: true });
  const taken = stages.getByRole("region", { name: "Taken", exact: true });
  const connector = stages.getByText("Taking work", { exact: true });

  await test.step("membership and recorded order", async () => {
    await expect(taken.getByRole("heading", { level: 3 })).toHaveText([
      "Repair the installer's update report",
      "See the project's published work in a story dashboard",
    ]);
    await expect(backlog.getByRole("heading", { level: 3 })).toHaveText([
      "Prepare stories in a clear developer workspace workflow",
      "Queue trunk integration for agents on the same machine",
      "Show <em>markup</em> in a title as the text it is",
    ]);
    await expect(page.getByRole("status")).toHaveCount(0);
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
    const [from, link, to] = await Promise.all([
      box(backlog),
      box(connector),
      box(taken),
    ]);
    expect(from.x + from.width).toBeLessThanOrEqual(link.x);
    expect(link.x + link.width).toBeLessThanOrEqual(to.x);
    await expect(stages).toContainText("not a dependency between entries");
  });

  await test.step("direction and source evidence sit outside the stage", async () => {
    const direction = page.getByRole("region", {
      name: "Near-future direction",
    });
    await expect(direction).toContainText(
      "Give developers visibility into a project's published work.",
    );
    await expect(direction).toContainText(
      "Derive it solely from Git state published to origin.",
    );
    const source = page.getByRole("region", { name: "Published Git state" });
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

  await test.step("the file is read unauthenticated at the resolved revision", () => {
    expect(requests.map((request) => new URL(request.url).pathname)).toEqual([
      "/repos/terryyin/open-dough/commits/main",
      "/repos/terryyin/open-dough/contents/.planning/PRODUCT-BACKLOG.md",
    ]);
    expect(new URL(requests[1]?.url ?? "").searchParams.get("ref")).toBe(
      revision,
    );
    expect(requests[1]?.headers["accept"]).toBe(
      "application/vnd.github.raw+json",
    );
    for (const request of requests) {
      expect(request.headers["authorization"]).toBeUndefined();
    }
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

  const stages = page.getByRole("region", { name: "Work stages" });
  const backlog = stages.getByRole("region", { name: "Backlog", exact: true });
  const taken = stages.getByRole("region", { name: "Taken", exact: true });
  await expect(taken).toContainText("No Taken entries are recorded.");
  await expect(taken).toContainText("0 entries");
  await expect(backlog).toContainText("No Backlog entries are recorded.");
  await expect(backlog).toContainText("0 entries");
  await expect(stages.getByText("Taking work", { exact: true })).toBeVisible();
  await expect(stages.getByRole("article")).toHaveCount(0);
  await expect(
    page.getByRole("region", { name: "Near-future direction" }),
  ).toContainText("No near-future direction is recorded.");
  await expect(
    page.getByRole("region", { name: "Published Git state" }),
  ).toContainText(revision);
  await expect(page.getByRole("alert")).toHaveCount(0);
});

test("published overview shows a plain read problem and no invented backlog when the initial read fails", async ({
  page,
}) => {
  await publishOrigin(page, { ref: rateLimitedAnswer() });

  await page.goto("/");

  const problem = page.getByRole("alert");
  await expect(problem).toContainText("Published work could not be read");
  await expect(problem).toContainText(
    "GitHub answered HTTP 403 while reading main of terryyin/open-dough.",
  );
  await expect(page.getByRole("status")).toHaveCount(0);
  await expect(page.getByRole("region", { name: "Work stages" })).toHaveCount(
    0,
  );
  await expect(page.getByRole("article")).toHaveCount(0);
  await expect(page.getByText(/\d+ entr(y|ies)/)).toHaveCount(0);
  await expect(page.getByText(/entries are recorded/)).toHaveCount(0);
  await expect(page.getByText("Near-future direction")).toHaveCount(0);
  const source = page.getByRole("region", { name: "Published Git state" });
  await expect(source).toContainText("terryyin/open-dough");
  await expect(source).not.toContainText("Revision");
});
