// While a later Done's checkout read is still in flight, HTTP review has
// no evidence for that Done. The Git shim only holds the real reflog read.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  adHocReview,
  adHocSessionFileDiff,
  adHocSessionFileText,
} from "../../tests/support/adHocReview.ts";
import { quote } from "../../tests/support/completionRecovery.ts";
import { expect, test as base } from "../../tests/support/preparationPage.ts";
import { DefaultMainSessionWork } from "../../tests/support/sessionCheckoutWork.ts";
import { git } from "../../tests/support/storyReviewWorktree.ts";

function holdCheckoutLog(machine: string) {
  const bin = path.join(machine, "held-checkout-log-bin");
  const hold = path.join(bin, "hold");
  const held = path.join(bin, "held");
  const release = path.join(bin, "release");
  const actual = execFileSync("which", ["git"], { encoding: "utf8" }).trim();
  mkdirSync(bin);
  writeFileSync(
    path.join(bin, "git"),
    `#!/bin/sh
if [ "$1" = log ] && [ "$2" = -g ] && [ -e ${quote(hold)} ]; then
  touch ${quote(held)}
  while [ ! -e ${quote(release)} ] && [ -d ${quote(bin)} ]; do sleep 0.1; done
fi
exec ${quote(actual)} "$@"
`,
    { mode: 0o755 },
  );
  return {
    bin,
    hold: () => {
      writeFileSync(hold, "");
    },
    isHeld: () => existsSync(held),
    release: () => {
      writeFileSync(release, "");
    },
  };
}

const test = base.extend<{ checkoutLog: ReturnType<typeof holdCheckoutLog> }>({
  checkoutLog: async ({ origin }, use) => {
    const held = holdCheckoutLog(origin.machine);
    try {
      await use(held);
    } finally {
      held.release();
    }
  },
  pathPrefix: async ({ checkoutLog }, use) => {
    await use([checkoutLog.bin]);
  },
});

test.use({ serverMode: "boundary" });

const notCaptured = {
  kind: "landing-unavailable",
  explanation: "This session's changes were not captured.",
};

test("a held later Done refuses the previous review and its files", async ({
  checkoutLog,
  dashboard,
  origin,
  request,
}) => {
  const work = new DefaultMainSessionWork(dashboard, origin);
  const session = await work.launchReporting("Fix the typo");
  const { sessionId } = session;
  const checkout = origin.project;
  const baseline = git(checkout, "rev-parse", "HEAD");
  const first = await work.commit("2099-01-02T12:00:00Z", "first.txt");
  dashboard.claudeSessionBecomes(sessionId, "working-idle");
  await session.report({ message: "" });
  await expect
    .poll(() => adHocReview(request, dashboard, sessionId))
    .toMatchObject({ kind: "session-commits", baseline, tree: first });

  const second = await work.commit("2099-01-02T12:05:00Z", "second.txt");
  checkoutLog.hold();
  try {
    await session.report({ message: "" });
    await expect.poll(checkoutLog.isHeld).toBe(true);

    expect(await adHocReview(request, dashboard, sessionId)).toMatchObject(
      notCaptured,
    );
    expect(await adHocReview(request, dashboard, sessionId, 0)).toMatchObject(
      notCaptured,
    );
    const file = { baseline, tree: first, path: "first.txt" };
    for (const read of [adHocSessionFileDiff, adHocSessionFileText])
      expect((await read(request, dashboard, sessionId, file)).status()).toBe(
        409,
      );
  } finally {
    checkoutLog.release();
  }
  await expect
    .poll(() => adHocReview(request, dashboard, sessionId))
    .toMatchObject({ kind: "session-commits", baseline, tree: second });
});

test("a held later Done cannot inherit the previous no-commit finding", async ({
  checkoutLog,
  dashboard,
  origin,
  request,
}) => {
  const work = new DefaultMainSessionWork(dashboard, origin);
  const session = await work.launchReporting("Fix the typo");
  const { sessionId } = session;
  dashboard.claudeSessionBecomes(sessionId, "working-idle");
  await session.report({ message: "" });
  await expect
    .poll(() => adHocReview(request, dashboard, sessionId))
    .toMatchObject({
      kind: "landing-unavailable",
      explanation: "This session made no commits in the Default main checkout.",
    });

  const committed = await work.commit("2099-01-02T12:00:00Z", "first.txt");
  checkoutLog.hold();
  try {
    await session.report({ message: "" });
    await expect.poll(checkoutLog.isHeld).toBe(true);

    expect(await adHocReview(request, dashboard, sessionId)).toMatchObject(
      notCaptured,
    );
  } finally {
    checkoutLog.release();
  }
  await expect
    .poll(() => adHocReview(request, dashboard, sessionId))
    .toMatchObject({ kind: "session-commits", tree: committed });
});
