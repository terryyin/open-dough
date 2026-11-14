// Guidance structure, not native agent evidence: wrap-up reads lifecycle-owned
// commitments before deleting the plan and judges them against existing
// receipts at closure.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { markdownSection as section } from "../../../../tests/support/markdown-section.mjs";

const skills = join(dirname(fileURLToPath(import.meta.url)), "../..");
const read = (path) => readFileSync(join(skills, path), "utf8");
const wrapUp = read("dough-story-wrap-up/SKILL.md");
const lifecycle = read(
  "dough-story-wrap-up/references/lifecycle-commitments.md",
);
const integration = read(
  "dough-story-wrap-up/references/story-branch-integration.md",
);

test("completion reads pendingLifecycle and retains it before the plan is deleted", () => {
  const completion = section(wrapUp, "## Establish execution completion");
  assert.match(
    completion,
    /check --planned-completion`[\s\S]+`pendingLifecycle`[\s\S]+\(references\/lifecycle-commitments\.md#read-them-at-completion\)/,
  );
  assert.match(
    lifecycle,
    /story-obligations\.mjs' check --plan '<PLAN\.md>' --planned-completion/,
  );
  assert.match(lifecycle, /`pendingLifecycle` entry \(`id`, `text`, `owner`\)/);

  const retention = wrapUp.slice(
    wrapUp.indexOf("Before deleting a plan that carries"),
    wrapUp.indexOf("With supplied dashboard reporting context"),
  );
  assert.match(
    retention,
    /pending\s+\[lifecycle commitments\]\(references\/lifecycle-commitments\.md#carry-them-past-deletion\)/,
  );
  assert.match(retention, /Do not create a parallel registry/);
  assert.ok(
    wrapUp.indexOf("## Establish execution completion") <
      wrapUp.indexOf("## Delete spent history") &&
      wrapUp.indexOf("## Delete spent history") <
        wrapUp.indexOf("## Integrate committed Story Branch Mode closure"),
  );
  const carry = section(lifecycle, "## Carry them past deletion");
  assert.match(carry, /not in a new file or registry/);
  assert.match(carry, /never carries `observed:`/);
  assert.match(carry, /stop before deleting the plan/);
});

test("each owner is observed only by its existing receipt", () => {
  const observe = section(lifecycle, "## Observe each owner's receipt");
  assert.match(
    observe,
    /`landing`: the accepted integration or landing receipt[\s\S]+Story Branch integration's accepted receipt[\s\S]+`finish`/,
  );
  assert.match(
    observe,
    /refused\s+or preserved integration is not that receipt/,
  );
  assert.match(
    observe,
    /`target CI`: the `success` completion receipt for the final accepted SHA with\s+confirmed shutdown/,
  );
  assert.match(
    observe,
    /Branch CI[\s\S]+the check that enforces the\s+gate are not that receipt/,
  );
  assert.match(
    observe,
    /`reporting`: the matching receipt of the\s+\[final dashboard operation\]/,
  );
  assert.match(observe, /pending gate or the enforcing check itself/);
});

test("closure refuses success and names each unobserved commitment and owner", () => {
  const report = section(wrapUp, "## Report");
  assert.match(
    report,
    /\[lifecycle commitment\]\(references\/lifecycle-commitments\.md#report-the-outcome\)\s+without its owner's receipt prevents successful closure; name each such\s+commitment and its owner/,
  );
  const outcome = section(lifecycle, "## Report the outcome");
  assert.match(
    outcome,
    /`landing` and `target CI` entries before final wording settles[\s\S]+closure is not successful[\s\S]+`--outcome unfinished`/,
  );
  assert.match(
    outcome,
    /Never submit `--outcome completed` while such an\s+entry is unobserved/,
  );
  assert.match(
    outcome,
    /names\s+each unobserved commitment by id and text with its\s+owner/,
  );
  assert.match(
    outcome,
    /Story Branch integration or Trunk Mode\s+`finish` for `landing`/,
  );
  assert.match(
    outcome,
    /changes\s+neither\s+publication, CI observation, shutdown nor retirement/,
  );
});

test("refused Story Branch integration keeps resources and names the landing owner", () => {
  assert.match(
    integration,
    /Unresolved integration preserves the execution resources\s+and blocks completion; closure names each `landing`\s+\[lifecycle commitment\]\(lifecycle-commitments\.md#report-the-outcome\) as\s+unobserved, with Story Branch integration as its owner/,
  );
  const outcome = section(lifecycle, "## Report the outcome");
  assert.match(
    outcome,
    /Story Branch integration is refused[\s\S]+preserves the execution resources[\s\S]+names each `landing` commitment[\s\S]+does\s+not report success/,
  );
});

test("the reporting row is observed by the final operation's own receipt", () => {
  const outcome = section(lifecycle, "## Report the outcome");
  assert.match(
    outcome,
    /every `landing` and `target CI` entry's receipt holds[\s\S]+`reporting` entry is observed by the final operation\s+itself/,
  );
  assert.match(
    outcome,
    /\[final dashboard operation\]\(\.\.\/\.\.\/dough-land\/references\/dashboard-completion\.md\)\s+with `--outcome completed` and wait for its matching receipt, which is that\s+entry's observation/,
  );
  assert.match(
    outcome,
    /delivery fails or stays unacknowledged, report\s+unacknowledged delivery locally[\s\S]+`Retry reporting only` command, and do not claim successful closure: name each\s+`reporting` entry and the final dashboard operation as its owner/,
  );
  assert.match(
    outcome,
    /Without\s+supplied reporting context, each `reporting` entry stays unobserved; name it and\s+its owner[\s\S]+make no dashboard contact/,
  );
  const dashboard = read("dough-land/references/dashboard-completion.md");
  assert.match(dashboard, /Wait for a matching receipt/);
  assert.match(
    dashboard,
    /report unacknowledged delivery locally and retain the message/,
  );
  assert.match(dashboard, /`Retry reporting only`/);
});
