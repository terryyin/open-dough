import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { storyB } from "../../../Distribution/tests/support/queued-repository.mjs";
import { agentSettingsPath } from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { expect, test } from "../../test-support/support/preparationPage.ts";
import type { DashboardServer } from "../../test-support/support/dashboardServer.ts";
import { keepLaunchRecords } from "../../test-support/support/launchStore.ts";
import { reviewLaunch } from "../../test-support/support/reviewRunRecords.ts";
import { queuedIdentity } from "../../test-support/support/startOrigin.ts";
import { git } from "../../test-support/support/storyReviewWorktree.ts";
import {
  storyResultRoute,
  storyResultSettings,
} from "../support/storyReviewResultRoute.ts";

test.use({ serverMode: "boundary" });

const subject = { source: "open-dough", identity: queuedIdentity };
const reference = "11111111-1111-4111-8111-111111111111";

function capture(
  dashboard: DashboardServer,
  { base, revision }: { base: string; revision: string },
) {
  keepLaunchRecords(dashboard, [
    reviewLaunch({
      sessionId: "retired",
      workspace: `${dashboard.home}/retired`,
      launchedAt: "2026-01-02T00:00:00.000Z",
      reference,
    })
      .withLanding(
        makeMe.aLaunchLanding
          .forLaunch(reference)
          .comparing({ base, revision })
          .please(),
      )
      .please(),
  ]);
}

test("a retained landing reads the accepted result despite newer main settings and source", async ({
  origin,
  request,
  dashboard,
}) => {
  const base = origin.revision("base");
  const accepted = await origin.publishRevision({
    files: {
      [agentSettingsPath]: storyResultSettings("first"),
      "first/first.spec.ts": "captured test\n",
      "guides/guide.txt": "captured text\n",
      "guides/image": "binary\0bytes",
    },
  });
  await origin.publishRevision({
    files: {
      [agentSettingsPath]: storyResultSettings("second"),
      "second/second.spec.ts": "newer test\n",
      "guides/guide.txt": "rewritten text\n",
    },
  });
  capture(dashboard, { base, revision: accepted });
  const review = storyResultRoute({ request, dashboard });
  const landed = await review.review({ ...subject, run: reference });
  if (landed.kind !== "landed") throw new Error("Missing retained landing");
  const read = { subject, reference, tree: landed.tree };

  expect(await review.read(read)).toMatchObject({
    kind: "inventory",
    revision: accepted,
    locations: [{ path: "first", files: ["first/first.spec.ts"] }],
  });
  expect(
    await review.read({ ...read, path: "guides/guide.txt" }),
  ).toMatchObject({
    kind: "text",
    revision: accepted,
    text: "captured text\n",
  });
  expect(await review.read({ ...read, path: "guides/image" })).toMatchObject({
    kind: "unavailable",
    revision: accepted,
    explanation: expect.stringContaining("no textual content"),
  });
  expect(
    (
      await review.result({
        ...read,
        subject: { ...subject, identity: storyB.identity },
      })
    ).status(),
  ).toBe(404);
});

test("an accepted empty tree has an empty inventory and absent settings", async ({
  origin,
  request,
  dashboard,
}) => {
  const base = origin.revision("base");
  const revision = await origin.publishRevision({
    remove: git(origin.project, "ls-files").split("\n"),
  });
  capture(dashboard, { base, revision });
  const review = storyResultRoute({ request, dashboard });
  const landed = await review.review({ ...subject, run: reference });
  if (landed.kind !== "landed") throw new Error("Missing retained landing");

  expect(await review.read({ subject, reference, tree: landed.tree })).toEqual({
    kind: "inventory",
    revision,
    paths: [],
    locations: null,
  });
});
for (const [problem, content] of [
  ["malformed", "{"],
  ["unreadable", "binary\0settings"],
] as const) {
  test(`a retained result keeps its inventory when Intent settings are ${problem}`, async ({
    origin,
    request,
    dashboard,
  }) => {
    const base = origin.revision("base");
    const revision = await origin.publishRevision({
      files: { [agentSettingsPath]: content, "guide.txt": "tracked text\n" },
    });
    capture(dashboard, { base, revision });
    const review = storyResultRoute({ request, dashboard });
    const landed = await review.review({ ...subject, run: reference });
    if (landed.kind !== "landed") throw new Error("Missing retained landing");

    expect(
      await review.read({ subject, reference, tree: landed.tree }),
    ).toMatchObject({
      kind: "inventory",
      revision,
      paths: expect.arrayContaining(["guide.txt"]),
      locations: null,
      settingsProblem: problem,
    });
  });
}
