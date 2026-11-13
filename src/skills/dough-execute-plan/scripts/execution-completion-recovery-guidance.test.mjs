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
const integrationObservation = readFileSync(
  join(skills, "dough-execute-plan/references/wrap-up-closure-publication.md"),
  "utf8",
);
const storyBranchIntegration = readFileSync(
  join(skills, "dough-story-wrap-up/references/story-branch-integration.md"),
  "utf8",
);

function section(markdown, heading) {
  const start = markdown.indexOf(`\n## ${heading}`);
  assert.notEqual(start, -1, heading);
  const from = start + 1;
  const end = markdown.indexOf("\n## ", from);
  return markdown.slice(from, end === -1 ? undefined : end);
}

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
  assert.match(
    recoveryGuidance,
    /On Codex, arm a fresh yielded stream[\s\S]+never restart a finished stream/,
  );
});

test("Story Branch integration names recovery for branch tip and integrated SHA", () => {
  const observe = section(
    integrationObservation,
    "Observe Story Branch integration",
  );
  assert.match(
    observe,
    /execution-completion-recovery\.mjs complete[\s\S]+branch tip/,
  );
  assert.match(
    observe,
    /execution-completion-recovery\.mjs complete[\s\S]+integrated SHA/,
  );
  assert.match(observe, /instead of polling by hand/);
  assert.doesNotMatch(observe, /ci-mailbox\.mjs' start/);
  assert.doesNotMatch(observe, /register-push[\s\S]+complete-revision/);
  assert.match(
    storyBranchIntegration,
    /execution-completion-recovery\.mjs complete[\s\S]+branch tip[\s\S]+integrated SHA/,
  );
  assert.match(storyBranchIntegration, /do not poll either target by hand/);
});

test("Trunk Mode finish guidance names recovery when observers have ended", () => {
  const finish = section(integrationObservation, "Finish Trunk Mode closure");
  assert.match(
    finish,
    /`step: "observation"`[\s\S]+execution-completion-recovery\.mjs complete/,
  );
  assert.match(
    finish,
    /none holds a verdict[\s\S]+execution-completion-recovery\.mjs complete/,
  );
});
