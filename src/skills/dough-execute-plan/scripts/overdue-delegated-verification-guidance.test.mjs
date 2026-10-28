import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

// Guidance proof for checking an overdue delegated verification. Per ADR 0005
// section 2 these assertions check the intended behavior with
// paraphrase-tolerant patterns, not exact sentences.

const skill = dirname(dirname(fileURLToPath(import.meta.url)));
// Collapsed to single spaces so line wrapping does not affect matching.
const reference = (name) =>
  readFileSync(join(skill, "references", name), "utf8").replace(/\s+/g, " ");

const awaitResults = section(
  reference("delegation.md"),
  /## Await delegated results without empty calls/,
  null,
);

const overdueCheck = reference("overdue-delegated-verification.md");

function section(text, start, end) {
  const from = text.search(start);
  assert.notEqual(from, -1, `missing section start ${start}`);
  const rest = text.slice(from);
  if (!end) return rest;
  const to = rest.slice(1).search(end);
  return to === -1 ? rest : rest.slice(0, to + 1);
}

test("the coordinator wait routes an overdue proof window into a liveness check", () => {
  // Discovery from the existing wait: expected window or remaining coverage
  // triggers the overdue check rather than indefinite notification waiting.
  assert.match(awaitResults, /expected proof window/i);
  assert.match(
    awaitResults,
    /remaining applicable observation coverage|observation coverage calls for a check/i,
  );
  assert.match(
    awaitResults,
    /overdue-delegated-verification\.md#check-an-overdue-delegated-verification/,
  );
  assert.match(awaitResults, /indefinite wait|completion notifications alone/i);
});

test("an overdue delegated verification obtains bounded liveness evidence without a human status request", () => {
  assert.match(overdueCheck, /expected proof window/i);
  assert.match(
    overdueCheck,
    /remaining applicable CI observation coverage|observation coverage calls for a check/i,
  );
  assert.match(overdueCheck, /bounded liveness evidence/i);
  assert.match(overdueCheck, /(?:do not|never)[^.]{0,80}human status request/i);
  // Expectation inspects; it is not a timeout or automatic failure.
  assert.match(overdueCheck, /reason to inspect|expectation is a reason/i);
  assert.match(
    overdueCheck,
    /(?:not|never)[^.]{0,40}(?:command )?timeout|(?:not|never)[^.]{0,60}automatic interrupt/i,
  );
});

test("healthy slow work keeps its owner and real terminal result; stalled or inaccessible work hands off truthfully", () => {
  // Healthy / yielded path continues the exact command.
  assert.match(overdueCheck, /fresh progress|supported continuation/i);
  assert.match(
    overdueCheck,
    /verification ownership|delegation\.md#own-verification-to-its-terminal-result/,
  );
  assert.match(
    overdueCheck,
    /(?:do not|never)[^.]{0,40}restart|duplicate the command/i,
  );
  assert.match(
    overdueCheck,
    /progress alone[^.]{0,40}not completion|not completion[^.]{0,40}progress alone/i,
  );

  // Queued is not stuck; inaccessible ends with known state and recovery owner.
  assert.match(overdueCheck, /Queued/i);
  assert.match(
    overdueCheck,
    /(?:do not|never)[^.]{0,80}absent process[^.]{0,60}stuck|classify an absent process as a stuck/i,
  );
  assert.match(overdueCheck, /Inaccessible/i);
  assert.match(overdueCheck, /missing observation|known state/i);
  assert.match(overdueCheck, /recovery owner/i);
  assert.match(
    overdueCheck,
    /(?:do not|never)[^.]{0,60}unowned termination|(?:do not|never)[^.]{0,40}invent a PID/i,
  );
});

test("overdue check reuses expensive-proof and CI lifecycle without a second supervisor", () => {
  assert.match(
    overdueCheck,
    /choose expensive proof before launch|executable-proof\.md#choose-expensive-proof-before-launch/,
  );
  assert.match(overdueCheck, /CI monitoring|ci-monitor\.md/);
  assert.match(overdueCheck, /CI_MONITOR_UNAVAILABLE|lost coverage/i);
  assert.match(
    overdueCheck,
    /lost coverage and outstanding local proof|outstanding local proof separately/i,
  );
  assert.match(
    overdueCheck,
    /(?:do not|never)[^.]{0,80}CI worker liveness[^.]{0,80}supervisor|repurpose CI worker liveness/i,
  );
  assert.match(
    overdueCheck,
    /(?:do not|never)[^.]{0,60}universal duration|(?:do not|never)[^.]{0,60}second process supervisor/i,
  );
  assert.match(
    overdueCheck,
    /unknown[^.]{0,80}bounded next observation|retain that uncertainty/i,
  );
  assert.match(overdueCheck, /unrelated processes|Leave unrelated processes/i);
  // Runtime guidance stays free of maintainer finding codes (ADR 0006).
  assert.doesNotMatch(overdueCheck, /ODF-\d+/);
});
