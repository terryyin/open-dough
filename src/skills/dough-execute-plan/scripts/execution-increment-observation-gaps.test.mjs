// The shared coverage-gap table, over every classification of a host
// coordinator's observers and every command that reports one: each reason
// states that classification alone and ends in a step the coordinator runs.
import assert from "node:assert/strict";
import { test } from "node:test";
import { ownerGapReason } from "./execution-increment-observation-gaps.mjs";

// Every command that reports a gap, and every classification
// `classifyOwnedObservation` returns for a coordinator's observers.
const ownerGapCommands = ["deliver", "resume", "finish"];
const ownerGapKinds = [
  "missing",
  "ended",
  "lost",
  "unavailable",
  "ambiguous",
  "live",
];
const terminal = { status: "stopped", coverage: { reason: "worker exited" } };
const owned = (kind) => ({
  kind,
  directory: "/observers/one",
  directories: ["/observers/one", "/observers/two"],
  terminal,
});
const reasonFor = (command, kind, extra = {}) =>
  ownerGapReason(command, {
    repo: "owner/project",
    branch: "main",
    host: "claude",
    owned: owned(kind),
    ...extra,
  });
// Where a reason's step begins: the command the coordinator runs next.
const stepStart =
  /; (?:resume starts no observer: )?(?:this coordinator's next `deliver` |keep the one whose directory it retained, |rerunning this )/;
const step = (reason) => reason.slice(reason.search(stepStart) + 2);
// What the reason says of the observers, apart from the step and its command.
const meaning = (command, reason) =>
  reason
    .slice(0, reason.search(stepStart))
    .replaceAll(`this ${command}`, "this command");

test("every kind's reason for deliver, resume, and finish ends in a step naming a command to run", () => {
  for (const kind of ownerGapKinds)
    for (const command of ownerGapCommands) {
      const reason = reasonFor(command, kind);
      assert.doesNotMatch(reason, /undefined/, `${command} ${kind}`);
      assert.match(reason, stepStart, `${command} ${kind}: ${reason}`);
      assert.match(
        step(reason),
        new RegExp(
          `establishes its own|the next ${command} reuses it$|^rerunning this ${command} registers on it$`,
        ),
        `${command} ${kind}: ${reason}`,
      );
    }
});

test("each ownership value keeps one meaning across commands, and only ambiguous means several live observers", () => {
  const meanings = ownerGapKinds.map((kind) => {
    const [first, ...rest] = ownerGapCommands.map((command) =>
      meaning(command, reasonFor(command, kind)),
    );
    for (const other of rest) assert.equal(other, first, kind);
    return first;
  });
  assert.equal(new Set(meanings).size, ownerGapKinds.length);
  for (const [index, kind] of ownerGapKinds.entries())
    assert.equal(
      /owns 2 live observers/.test(meanings[index]),
      kind === "ambiguous",
      kind,
    );
});

test("several ended observers that each registered the revision keep their kind's meaning and step, and name every one", () => {
  const registered = ["/observers/one", "/observers/two"];
  for (const command of ownerGapCommands) {
    const reason = reasonFor(command, "ended", { registered });
    assert.match(
      reason,
      /observer at \/observers\/one ended \(stopped\); 2 of its observers each registered this revision and none is live \(\/observers\/one, \/observers\/two\); /,
    );
    assert.equal(step(reason), step(reasonFor(command, "ended")));
    assert.doesNotMatch(reason, /live observers|undefined/);
  }
});
