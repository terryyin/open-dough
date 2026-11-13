import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import {
  completionRecoveryCommand,
  monitorUnavailableEvent,
  observationCause,
} from "./ci-monitor-unavailable.mjs";

const skills = join(dirname(fileURLToPath(import.meta.url)), "../..");
const waitMechanics = readFileSync(
  join(skills, "dough-execute-plan/references/ci-completion-wait.md"),
  "utf8",
);
const recoveryGuidance = readFileSync(
  join(skills, "dough-execute-plan/references/ci-completion-recovery.md"),
  "utf8",
);

test("budget-expiry notice and completion guidance name the recovery command", () => {
  assert.equal(
    completionRecoveryCommand,
    "execution-completion-recovery.mjs complete",
  );
  const expired = monitorUnavailableEvent({
    repo: "owner/repo",
    branch: "main",
    reason: "Execution observation budget expired after 5000 ms.",
    cause: observationCause.budgetExpired,
  });
  assert.equal(expired.recovery, completionRecoveryCommand);
  assert.equal(
    monitorUnavailableEvent({
      repo: "owner/repo",
      reason: "TLS handshake timeout",
      cause: observationCause.observationError,
    }).recovery,
    undefined,
  );
  assert.match(waitMechanics, /\]\(ci-completion-recovery\.md\)/);
  assert.match(recoveryGuidance, /execution-completion-recovery\.mjs complete/);
  assert.match(
    recoveryGuidance,
    /budget-expiry notice that names\s+`execution-completion-recovery\.mjs complete`/,
  );
  assert.match(
    recoveryGuidance,
    /same\s+owner input as `resume`[\s\S]+ordinary `CI_OBSERVER` completion receipt/,
  );
});
