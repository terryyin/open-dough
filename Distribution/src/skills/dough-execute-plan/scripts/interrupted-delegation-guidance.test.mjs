import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

// Guidance proof for recovering a delegated implementation or refactor call
// that was interrupted, with no return or only a later claim. Per ADR 0005
// section 2 these assertions check the intended behavior with
// paraphrase-tolerant patterns, not exact sentences.

const skill = dirname(dirname(fileURLToPath(import.meta.url)));
// Collapsed to single spaces so line wrapping does not affect matching.
const reference = (name) =>
  readFileSync(join(skill, "references", name), "utf8").replace(/\s+/g, " ");

const recovery = reference("interrupted-delegation.md");
const wrapUp = reference("wrap-up.md");
const awaitResults = reference("delegation.md");

const section = (text, start, end) => {
  const from = text.search(start);
  assert.notEqual(from, -1, `missing section start ${start}`);
  const rest = text.slice(from);
  if (!end) return rest;
  const to = rest.slice(1).search(end);
  return to === -1 ? rest : rest.slice(0, to + 1);
};

test("an interrupted delegated call leaves the slice incomplete, never done on its claim", () => {
  // Both triggers start recovery: no return at all, and a later return
  // claiming work done after the interruption.
  assert.match(
    recovery,
    /delegated (?:implementation|refactor)[^.]*interrupt/i,
  );
  assert.match(
    recovery,
    /no return|return[^.]{0,60}later[^.]{0,80}after[^.]{0,20}interrupt/i,
  );
  assert.match(recovery, /implementation or refactor/i);

  // The slice stays incomplete; neither an interrupted agent's claim nor a
  // promised return can mark it done.
  assert.match(recovery, /incomplete/i);
  assert.match(
    recovery,
    /(?:never|do not|not)[^.]{0,60}mark\w*[^.]{0,40}done[^.]{0,80}(?:claim|promised return)/i,
  );
});

test("before any replacement writer, formatter, or delivery, the coordinator inspects diff, plan, and remote", () => {
  // The inspection gates every next writer in that checkout: a replacement
  // writer, formatting, and delivery alike.
  assert.match(
    recovery,
    /before any replacement writer[^.]{0,80}formatter[^.]{0,40}delivery/i,
  );

  // The checkout itself is inspected — its uncommitted diff, the plan, and
  // the remote branch — for the interrupted agent's edits and commits.
  assert.match(recovery, /inspect[^.]{0,60}checkout/i);
  assert.match(recovery, /uncommitted diff/i);
  assert.match(recovery, /\bplan\b/i);
  assert.match(recovery, /remote branch/i);
  assert.match(recovery, /interrupt\w+ agent's edits/i);
  assert.match(recovery, /unexpected commits?/i);
});

test("focused proof is re-established from the checkout before partial edits are accepted, repaired, or discarded", () => {
  // Proof is rerun against the actual files in the checkout, not taken from
  // the interrupted agent's claim.
  assert.match(
    recovery,
    /(?:re-?establish|rerun|re-run)[^.]{0,60}focused proof/i,
  );
  assert.match(recovery, /focused proof[^.]{0,80}(?:actual files|checkout)/i);

  // That re-established proof precedes accepting, repairing, or discarding
  // the partial edits; without it they are not accepted.
  assert.match(recovery, /before accepting,? repairing,? or discarding/i);
  assert.match(
    recovery,
    /partial edits[^.]{0,80}not accepted|without[^.]{0,40}proof[^.]{0,40}not accepted/i,
  );
});

test("an unexpected commit from the interrupted agent pauses for the developer's decision", () => {
  // The commit may sit in the checkout's branch or already be on the remote.
  assert.match(recovery, /unexpected commit[^.]{0,80}interrupt/i);
  assert.match(
    recovery,
    /checkout's branch or on the remote|branch[^.]{0,40}remote/i,
  );

  // Accepting or discarding it is the developer's decision, and delivery
  // does not proceed on top of it blindly.
  assert.match(recovery, /pause/i);
  assert.match(
    recovery,
    /(?:leave|leaving)[^.]{0,80}developer'?s decision|developer decides/i,
  );
  assert.match(recovery, /accepting or discarding/i);
  assert.match(
    recovery,
    /(?:do not|never|not)[^.]{0,40}deliver[^.]{0,60}(?:blindly|on top)/i,
  );
});

test("the premise is stated honestly: interruption may not stop the delegated agent", () => {
  // The observed pattern behind the posture: the agent kept working and
  // even committed and pushed despite a delegation forbidding publication.
  assert.match(
    recovery,
    /interrupt\w*[^.]{0,40}may not stop[^.]{0,40}(?:delegated )?agent/i,
  );
  assert.match(recovery, /keep working|kept working|continue\w* working/i);
  assert.match(recovery, /commit\w* and push|commit[^.]{0,30}push/i);
  assert.match(
    recovery,
    /despite[^.]{0,100}(?:forbade|forbidden|forbidding|no commit|no-publication)/i,
  );

  // Recovery therefore rests on inspection and re-established proof, never
  // on the absence of a return.
  assert.match(recovery, /absence of a return/i);
  assert.match(
    recovery,
    /(?:checkout[^.]{0,40}remote inspection|inspection[^.]{0,60}re-?establish\w* proof)/i,
  );
  assert.match(
    recovery,
    /never on the absence of a return|absence of a return[^.]{0,60}never/i,
  );

  // The premise is described as the observed pattern for the executing
  // agent, without repository-internal finding codes (ADR 0006).
  assert.doesNotMatch(recovery, /ODF-\d+/);
});

test("proof acceptance in wrap-up routes interrupted returns through this recovery", () => {
  const acceptProof = section(wrapUp, /## Accept proof/, /## Deliver/);

  assert.match(acceptProof, /interrupt/i);
  assert.match(
    acceptProof,
    /delegation\.md#recover-an-interrupted-delegated-result/,
  );
});

test("delegation keeps a recoverable interrupted-result anchor that reaches the recovery rule", () => {
  const stub = section(
    awaitResults,
    /## Recover an interrupted delegated/,
    null,
  );
  assert.match(
    stub,
    /interrupted-delegation\.md#recover-an-interrupted-delegated-result/,
  );
});
