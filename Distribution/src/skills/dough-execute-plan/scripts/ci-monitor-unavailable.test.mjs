import assert from "node:assert/strict";
import { test } from "node:test";
import {
  completionRecoveryCommand,
  monitorUnavailableEvent,
  observationCause,
} from "./ci-monitor-unavailable.mjs";

test("an expired observation budget names the completion recovery command; an observation error does not", () => {
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
});
