// The shared coverage-gap table, over every classification of a host
// coordinator's observers and every command that reports one: each reason
// states that classification alone and ends in a step the coordinator runs.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { ownerGapReason } from "./execution-increment-observation-gaps.mjs";

// Every command that reports a gap.
const ownerGapCommands = ["deliver", "resume", "finish"];
// Every classification `classifyOwnedObservation` returns for a coordinator's
// observers, read from the one function that returns them.
const classifier = readFileSync(
  new URL("./ci-mailbox-match.mjs", import.meta.url),
  "utf8",
).match(/\nfunction classifyObservers\(.*?\n}\n/s)[0];
// Each kind with the fields that function returns beside it, and no others: a
// reason may read only what its kind's classification carries.
const ownerGapFields = new Map(
  Array.from(
    classifier.matchAll(/return \{\s*kind: "([^"]+)"([^}]*)\}/g),
    ([, kind, rest]) => [
      kind,
      rest
        .split(",")
        .map((field) => field.split(":")[0].trim())
        .filter(Boolean),
    ],
  ),
);
const ownerGapKinds = [...ownerGapFields.keys()];
const fieldValues = {
  directory: "/observers/one",
  directories: ["/observers/one", "/observers/two"],
  terminal: { status: "stopped", coverage: { reason: "worker exited" } },
};
const owned = (kind) => ({
  kind,
  ...Object.fromEntries(
    ownerGapFields.get(kind).map((field) => [field, fieldValues[field]]),
  ),
});
const reasonFor = (command, kind, extra = {}) =>
  ownerGapReason(command, {
    repo: "owner/project",
    branch: "main",
    host: "claude",
    owned: owned(kind),
    ...extra,
  });
// A kind's reason for each command, split where the commands part: the
// meaning they share, which says what the observers are, and the step each one
// ends in. A reason names its own command as `<command>` here, so only a
// difference in what to do parts them; the split falls on the clause boundary
// before it, or before the last clause when the commands agree throughout.
const naming = (command, reason) =>
  reason.replaceAll(new RegExp(`\\b${command}\\b`, "g"), "<command>");
const commandReasons = (kind) => {
  const reasons = ownerGapCommands.map((command) =>
    naming(command, reasonFor(command, kind)),
  );
  const shared = Array.from(reasons[0]).findIndex((character, index) =>
    reasons.some((reason) => reason[index] !== character),
  );
  const boundary = reasons[0].lastIndexOf(
    "; ",
    shared < 0 ? reasons[0].length : shared,
  );
  return reasons.map((reason, index) => ({
    command: ownerGapCommands[index],
    meaning: reason.slice(0, Math.max(boundary, 0)),
    step: boundary < 0 ? "" : reason.slice(boundary + 2),
  }));
};

test("the kinds are every classification of a coordinator's observers, each with only the fields its classification carries", () => {
  assert.equal(
    ownerGapKinds.length,
    Array.from(classifier.matchAll(/kind: "/g)).length,
    classifier,
  );
  assert.ok(ownerGapKinds.length > 1, classifier);
  const fields = [...ownerGapFields.values()];
  // Every field read here has a value, and no kind carries them all.
  for (const field of fields.flat()) assert.ok(field in fieldValues, field);
  assert.ok(
    fields.every((own) => own.length < Object.keys(fieldValues).length),
    JSON.stringify([...ownerGapFields]),
  );
  assert.ok(fields.some((own) => own.length === 0));
});

test("every kind's reason for deliver, resume, and finish ends in a step naming a command to run", () => {
  for (const kind of ownerGapKinds)
    for (const { command, meaning, step } of commandReasons(kind)) {
      const reason = reasonFor(command, kind);
      assert.doesNotMatch(reason, /undefined/, `${command} ${kind}`);
      // The commands share what the reason says of the observers.
      assert.notEqual(meaning, "", `${command} ${kind}: ${reason}`);
      // Its own command, or another the coordinator runs first.
      assert.match(step, /<command>|`[^`]+`/, `${command} ${kind}: ${reason}`);
    }
});

test("each kind's meaning is its own, and only ambiguous means several live observers", () => {
  const meanings = ownerGapKinds.map((kind) => commandReasons(kind)[0].meaning);
  assert.equal(new Set(meanings).size, ownerGapKinds.length);
  for (const [index, kind] of ownerGapKinds.entries())
    assert.equal(
      /owns 2 live observers/.test(meanings[index]),
      kind === "ambiguous",
      kind,
    );
});

test("finish over several ended observers that each registered the revision keeps the ended meaning and step, and names every one", () => {
  const registered = ["/observers/one", "/observers/two"];
  const { meaning, step } = commandReasons("ended").find(
    ({ command }) => command === "finish",
  );
  const reason = naming("finish", reasonFor("finish", "ended", { registered }));
  assert.ok(reason.startsWith(meaning), reason);
  assert.ok(reason.endsWith(`; ${step}`), reason);
  assert.equal(
    reason.slice(meaning.length, -`; ${step}`.length),
    "; 2 of its observers each registered this revision and none is live (/observers/one, /observers/two)",
  );
  assert.doesNotMatch(reason, /live observers|undefined/);
});
