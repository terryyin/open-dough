// A test's end control for a running launch wait (../../server/launchWait.ts),
// and what a Claude launch answers when that control ends its wait.
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, onTestFinished, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { launchClaudeStartedBy } from "../../server/hosts/claude/launch.ts";
import { launchWait } from "../../server/launchWait.ts";

// A fresh control file a test writes to end the wait.
const anEndControl = (): string => {
  const directory = mkdtempSync(path.join(tmpdir(), "dough-wait-"));
  onTestFinished(() => {
    rmSync(directory, { recursive: true, force: true });
  });
  return path.join(directory, "end");
};

test("the launch-wait control ends a pending launch wait once and is taken", async () => {
  const control = anEndControl();
  let ended = 0;
  onTestFinished(
    launchWait(() => {
      ended += 1;
    }, control),
  );
  writeFileSync(control, "");
  await expect.poll(() => ended, { interval: 5 }).toBe(1);
  expect(existsSync(control)).toBe(false);
});

test("a Claude launch whose wait the control ends is uncertain, timed out", async () => {
  const control = anEndControl();
  const wait = new AbortController();
  onTestFinished(
    launchWait(() => {
      wait.abort();
    }, control),
  );
  // Claude Code never answers until the wait ends.
  const neverAnswers = (
    ...[, , , signal]: [unknown, unknown, unknown, AbortSignal]
  ) =>
    new Promise<{ error: null; stdout: string; stderr: string }>((resolve) => {
      signal.addEventListener("abort", () => {
        resolve({ error: null, stdout: "", stderr: "" });
      });
    });
  const outcome = launchClaudeStartedBy(neverAnswers)(
    makeMe.aPublishedSource.openDough.please(),
    { ...makeMe.aLaunchRequest.adHoc().please(), title: "An ad-hoc launch" },
    { path: "/work/open-dough", shown: "~/open-dough" },
    wait.signal,
  );
  writeFileSync(control, "");
  expect(await outcome).toMatchObject({
    kind: "uncertain",
    reason: "timed-out",
  });
});
