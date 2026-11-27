// Observe a real receiver write fault leaving a reporting-only retry; fixtures supply no completion state.
import { readFileSync, existsSync } from "node:fs";
import { expect } from "@playwright/test";
import type { ReportingContext } from "../../src/launchRequest.ts";
import { stored } from "./codexStart.ts";
import {
  reportingChild,
  retainedSubmission,
  type completionWriteFault,
  quote,
} from "./completionRecovery.ts";

async function unacknowledgedCompletion(
  context: ReportingContext,
  cwd: string,
  home: string,
  env: NodeJS.ProcessEnv,
) {
  const unacknowledged = await reportingChild(
    `${context.command} --outcome completed`,
    cwd,
    env,
  );
  expect(unacknowledged.ok).toBe(false);
  expect(unacknowledged.stdout).toBe("");
  expect(unacknowledged.stderr).toContain(
    "Completion delivery was not acknowledged",
  );
  // Incomplete completion after accepted work stays a reporting-only recovery:
  // identify the unfinished completion operation and keep the exact pending input.
  expect(unacknowledged.stderr).toMatch(/Retained completion: /);
  expect(unacknowledged.stderr).toMatch(
    /Retry reporting only: .+['"]--retry['"] /,
  );
  expect(unacknowledged.stderr).toContain(
    "Keep the message and retry without repeating the work.",
  );
  const pending = retainedSubmission(unacknowledged.stderr);
  const submission = JSON.parse(readFileSync(pending, "utf8")) as {
    delivery: string;
    message: string;
    outcome: string;
  };
  expect(submission).toMatchObject({ message: "", outcome: "completed" });
  expect(stored(home)[0]?.doneAt).toBeUndefined();
  return {
    pending,
    delivery: submission.delivery,
    retry: `${context.command} --retry ${quote(pending)}`,
  };
}

// A real initial-server write failure leaves the installed exact retry callable
// from a surviving directory after actual worktree retirement.
export async function failedCompletionRetry(
  context: ReportingContext,
  cwd: string,
  home: string,
  fault: ReturnType<typeof completionWriteFault>,
  env: NodeJS.ProcessEnv,
) {
  const previous = stored(home)[0]?.completion;
  fault.arm();
  const saved = await unacknowledgedCompletion(context, cwd, home, env);
  expect(existsSync(fault.marker)).toBe(false);
  expect(stored(home)[0]?.completion).toEqual(previous);
  return saved.retry;
}
