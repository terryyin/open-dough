// Guidance structure: accept proof states when acceptance ends and moves to
// the refactor pass; consumer-trace allows one grouped excluded disposition
// for generic or historical matches. Not proof an agent follows the text.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { markdownSection as section } from "../../support/markdown-section.mjs";

const skills = fileURLToPath(new URL("../../../src/skills/", import.meta.url));
const read = (path) => readFileSync(join(skills, path), "utf8");

const acceptProof = section(
  read("dough-execute-plan/references/wrap-up.md"),
  "## Accept proof",
);
const consumerTrace = section(
  read("dough-story-refinement/references/executable-proof.md"),
  "## Record the consumer trace",
);

test("accept proof ends once decisive evidence settles and moves to the refactor pass", () => {
  assert.match(
    acceptProof,
    /Accept the slice and start the\s+refactor pass once each source promise, affected consumer and required gate\s+has a decisive observation, the story obligations are recorded, and no\s+expected\/actual mismatch remains unresolved/,
  );
  assert.match(
    acceptProof,
    /Return a concrete expected\/actual mismatch\s+unless a real human amendment changes it/,
  );
  assert.match(
    acceptProof,
    /Further inspection needs a named\s+expected\/actual mismatch or a specific evidence gap: a promise, consumer or\s+gate without a sufficient observation/,
  );
  assert.match(
    acceptProof,
    /For filtered proof, compare actually selected tests\/observations with the claimed promises/,
  );
  assert.match(
    acceptProof,
    /A zero-exit command that selected nothing, or that selected fewer observations\s+than the claimed promises require, leaves those promises incomplete/,
  );
  assert.doesNotMatch(acceptProof, /minute|budget|timer|slice.?clock/i);
  assert.match(
    acceptProof,
    /\[consumer-trace record\]\([^)]*executable-proof\.md#record-the-consumer-trace\)/,
  );
  assert.match(acceptProof, /\[failure policy\]\(failure-policy\.md\)/);
});

test("consumer trace allows one excluded reason for a named generic or historical group", () => {
  assert.match(
    consumerTrace,
    /A named group of generic or historical matches—done records,\s+retired plans, changelog entries, or unrelated text matches—may share one\s+`excluded: <reason>` disposition/,
  );
  assert.match(
    consumerTrace,
    /Give every listed consumer\s+a disposition: `run`, `reused`, or `excluded: <reason the effect does not reach\s+its boundary>`/,
  );
  assert.match(
    consumerTrace,
    /Every\s+listed consumer still gets a disposition/,
  );
  assert.doesNotMatch(consumerTrace, /minute|budget|timer|slice.?clock/i);
});
