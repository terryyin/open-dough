// A same-build runner whose helper proof alone drifted keeps its held
// sessions running when another Cursor session starts. Stale-build
// observation and replacement recovery live in
// ./cursor-runner-replacement.spec.ts.
import { existsSync } from "node:fs";
import path from "node:path";
import { readCursorRunnerAddress } from "../server/hosts/cursor/runnerPaths.ts";
import { cursorRunnerSpawnHelper } from "../server/hosts/cursor/runnerSpawnHelper.ts";
import { startSessionField } from "./launchStoryCardPage.ts";
import { openRunningList } from "./runningCursorSessionsPage.ts";
import { makeRecordedHelperProofMissing } from "./support/cursorRunnerRecordedAddress.ts";
import {
  keptRecords,
  launchSecondHeldSession,
  startScopedCursorExecution,
} from "./support/cursorSessionRecovery.ts";
import { expect, workingCursorTest } from "./support/cursorStart.ts";
import { launchWaitMs } from "./support/launchWait.ts";
import { processRunning } from "./support/processGroup.ts";

const helperGoneSecondId = "a1b2c3d4-e5f6-4789-abcd-ef0123456789";
const helperGoneThirdId = "b2c3d4e5-f6a7-489a-bcde-f01234567890";

workingCursorTest(
  "a same-build runner whose helper proof drifted keeps held sessions running when another Cursor session starts",
  async ({ page, dashboard, origin, cursor }) => {
    workingCursorTest.setTimeout(180_000);
    workingCursorTest.skip(
      cursorRunnerSpawnHelper() === undefined,
      "this install's node-pty ships no separate terminal helper",
    );
    await startScopedCursorExecution(page, origin, cursor);
    await launchSecondHeldSession(
      page,
      origin,
      cursor,
      dashboard.home,
      helperGoneSecondId,
    );
    const heldPids = cursor.attaches().map((each) => each.pid);
    expect(heldPids).toHaveLength(2);
    const runnerBefore = readCursorRunnerAddress(dashboard.home);
    expect(runnerBefore?.pid).toBeGreaterThan(0);
    expect(runnerBefore?.spawnHelper).toBeTruthy();
    expect(existsSync(runnerBefore?.spawnHelper ?? "")).toBe(true);

    makeRecordedHelperProofMissing(
      dashboard.home,
      path.join(dashboard.home, "missing-spawn-helper"),
    );

    const running = await openRunningList(page);
    await expect(running.region).toContainText("The Cursor runner is running.");
    await expect(
      running.region.getByRole("button", { name: /Open Dough/ }),
    ).toHaveCount(2);
    expect(readCursorRunnerAddress(dashboard.home)?.pid).toBe(
      runnerBefore?.pid,
    );
    for (const pid of heldPids) expect(processRunning(pid)).toBe(true);

    cursor.queueCreateChatId(helperGoneThirdId);
    await page
      .getByRole("button", { name: "Start session in Open Dough" })
      .click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("combobox", { name: "Host" }).selectOption("cursor");
    await startSessionField(dialog).fill(
      "start another session after helper proof drifted",
    );
    await dialog.getByRole("button", { name: "Start", exact: true }).click();
    await expect
      .poll(() => keptRecords(dashboard.home).length, {
        timeout: launchWaitMs,
      })
      .toBe(3);
    await expect
      .poll(
        () =>
          cursor
            .attaches()
            .filter((each) => each.sessionId === helperGoneThirdId).length,
        { timeout: launchWaitMs },
      )
      .toBe(1);

    const panel = page.getByRole("region", { name: "Terminal" });
    if ((await panel.count()) > 0) {
      await panel.getByRole("button", { name: "Close", exact: true }).click();
      await expect(panel).toHaveCount(0);
    }
    expect(readCursorRunnerAddress(dashboard.home)?.pid).toBe(
      runnerBefore?.pid,
    );
    for (const pid of heldPids) expect(processRunning(pid)).toBe(true);
    expect(cursor.attaches()).toHaveLength(3);
    // Sidebar stayed open from the earlier Running Cursor sessions read;
    // wait for the new session to join the two held rows there.
    await expect(
      running.region.getByRole("button", { name: /Open Dough/ }),
    ).toHaveCount(3);
    for (const pid of heldPids) expect(processRunning(pid)).toBe(true);
  },
);
