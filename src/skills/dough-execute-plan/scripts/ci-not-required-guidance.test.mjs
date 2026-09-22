import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

// Representative guidance walkthrough for slice 4 of
// path-filter-aware-ci-observation: a reader following ci-monitor.md's
// `not_required` guidance, given the exact terminal-report shape
// ci-mailbox-store.mjs actually produces (proved in
// ci-revision-coverage-stop-states.test.mjs), must be able to tell
// `not_required` apart from success and act only on a genuinely delivered
// applicable failure. This follows this directory's established pattern for
// testing published guidance prose (see ci-custom-guidance.test.mjs's
// "runtime setup selects custom CI..." test) rather than inventing a new one;
// the behavioral half of the walkthrough — that a pending/incomplete
// ancestor's evidence is retained with its source while a proved terminal
// one is fully omitted, and that only the delivered failure needs action —
// is exercised end to end by ci-revision-coverage-stop-states.test.mjs's
// "shutdown retains a not_required revision's pending/incomplete
// applicable-ancestor evidence..." test.

const skill = dirname(dirname(fileURLToPath(import.meta.url)));
// Collapsed to single spaces so an assertion reads as the sentence a person
// reads, independent of this Markdown file's own line-wrap width.
const reference = (name) =>
  readFileSync(join(skill, "references", name), "utf8").replace(/\s+/g, " ");

test("ci-monitor.md guides a reader to treat not_required as an applicability fact, not a verdict", () => {
  const monitor = reference("ci-monitor.md");

  // A reader must be told this is GitHub-default-only and distinct from an
  // ordinary "quiet, still discovering" revision.
  assert.match(monitor, /`not_required` \(GitHub default only\)/);

  // No invented success: a `not_required` revision with a pending/incomplete
  // applicable ancestor (the shape ci-mailbox-store.mjs actually reports at
  // shutdown, e.g. `basis: { sha, state: "pending" }`) must not be read as a
  // skipped-and-therefore-fine pass.
  assert.match(
    monitor,
    /never treat it as a skipped-and-therefore-fine success/,
  );

  // No spurious missing-run warning: the absence of a run for a
  // `not_required` revision is proved, not a gap.
  assert.match(monitor, /never report a missing-run warning for it/);

  // The effective attempt is the applicable ancestor named by `basis.sha`,
  // and its real state — the same field terminal reporting names — is what a
  // reader must inspect.
  assert.match(monitor, /nearby applicable attempt \(`basis\.sha`\)/);
  assert.match(
    monitor,
    /inspect its own real state exactly as for any other registered\s+revision/,
  );

  // Distinguishing pending/incomplete (still no verdict) from success/failure
  // (the case is already proved) at shutdown specifically:
  assert.match(
    monitor,
    /`basis\.state: "pending"` or `"incomplete"`[\s\S]+has not reached a\s+verdict yet/,
  );
  assert.match(
    monitor,
    /`success`\s+or `failure` there means the ancestor already proved the case/,
  );

  // Only a genuinely delivered applicable failure needs action, and it is
  // delivered exactly once regardless of how many not_required revisions
  // share the ancestor; no new agent action is invented beyond that.
  assert.match(monitor, /act only on a genuinely delivered failure for it/);
  assert.match(
    monitor,
    /No new agent\s+action exists for `not_required` beyond that ordinary handling/,
  );
});
