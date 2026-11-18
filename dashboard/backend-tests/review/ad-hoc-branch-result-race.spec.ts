import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  deleteRecord,
  markDone,
} from "../../test-support/agentLaunchBoundary.ts";
import {
  adHocReview,
  adHocSessionFileText,
  launchIsolatedReview,
  sessionBranchPins,
} from "../../test-support/support/adHocReview.ts";
import { quote } from "../../test-support/support/completionRecovery.ts";
import { commit } from "../../test-support/support/launchLanding.ts";
import {
  expect,
  test as base,
} from "../../test-support/support/preparationPage.ts";
import { reportingThrough } from "../../test-support/support/reportedLaunch.ts";

// Holds ancestry validation after the comparison has read its literal tip.
function holdValidation(machine: string) {
  const bin = path.join(machine, "branch-validation-bin");
  const hold = path.join(bin, "hold");
  const held = path.join(bin, "held");
  const released = path.join(bin, "released");
  const actual = execFileSync("which", ["git"], { encoding: "utf8" }).trim();
  mkdirSync(bin);
  writeFileSync(
    path.join(bin, "git"),
    `#!/bin/sh
if [ "$1" = merge-base ] && [ "$2" = --is-ancestor ] && [ -f ${quote(hold)} ]; then
  touch ${quote(held)}
  while [ ! -e ${quote(released)} ] && [ -d ${quote(bin)} ]; do sleep 0.1; done
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
    held: () => existsSync(held),
    release: () => {
      writeFileSync(released, "");
    },
  };
}

const test = base.extend<{ validation: ReturnType<typeof holdValidation> }>({
  validation: async ({ origin }, use) => {
    const control = holdValidation(origin.machine);
    try {
      await use(control);
    } finally {
      control.release();
    }
  },
  pathPrefix: async ({ validation }, use) => {
    await use([validation.bin]);
  },
});
test.use({ serverMode: "boundary" });

test("reopening preserves branch evidence and a superseded capture cannot replace the newer Done", async ({
  request,
  dashboard,
  origin,
  validation,
}) => {
  const { workspace, baseline, session, sent } = await launchIsolatedReview(
    dashboard,
    "Update the branch",
  );
  const report = reportingThrough(origin, sent);
  const first = commit(workspace, "first.txt");
  await report({ message: "" });
  await expect
    .poll(() => adHocReview(request, dashboard, session))
    .toMatchObject({ kind: "branch-result", tree: first });
  const originalPins = sessionBranchPins(origin.project, session);

  await report({ outcome: "unfinished", message: "Continuing the update" });
  expect(sessionBranchPins(origin.project, session)).toEqual(originalPins);
  const oldFile = { baseline, tree: first, path: "first.txt" };
  expect(
    (await adHocSessionFileText(request, dashboard, session, oldFile)).status(),
  ).toBe(409);

  validation.hold();
  const stale = commit(workspace, "stale.txt");
  try {
    await report({ message: "" });
    await expect.poll(validation.held).toBe(true);
    expect(await adHocReview(request, dashboard, session)).toMatchObject({
      kind: "unavailable",
    });
    const latest = commit(workspace, "latest.txt");
    await report({ message: "" });
    validation.release();
    await expect
      .poll(() => adHocReview(request, dashboard, session))
      .toMatchObject({ kind: "branch-result", tree: latest });
    await expect
      .poll(() => sessionBranchPins(origin.project, session))
      .toEqual([baseline, latest]);
    expect(sessionBranchPins(origin.project, session)).not.toContain(stale);
  } finally {
    validation.release();
  }
});

test("deleting a record while its Done capture is reading leaves no evidence pins", async ({
  dashboard,
  origin,
  validation,
}) => {
  const { workspace, session } = await launchIsolatedReview(
    dashboard,
    "Update the branch",
  );
  commit(workspace, "abandoned.txt");
  validation.hold();
  const marking = markDone(dashboard, { source: "open-dough", session });
  try {
    await expect.poll(validation.held).toBe(true);
    dashboard.claudeListingFails(true);
    const response = await deleteRecord(dashboard, {
      source: "open-dough",
      session,
    });
    expect(JSON.parse(response.body)).toEqual({ kind: "deleted" });
  } finally {
    validation.release();
    await marking;
  }
  expect(sessionBranchPins(origin.project, session)).toEqual([]);
});
