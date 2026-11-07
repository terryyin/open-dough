import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { markdownSection as section } from "../../../../tests/support/markdown-section.mjs";

// Representative guidance walkthrough for
// SEED-010#observe-progress-revision-before-slice-done: a coordinator starting
// at the delivery checklist must find one named read-only observation after
// progress publication, reuse the attached observer through done, and keep
// complete-revision at the existing completion boundary.

const skills = join(dirname(fileURLToPath(import.meta.url)), "../..");
const read = (path) => readFileSync(join(skills, path), "utf8");
const flat = (text) => text.replace(/\s+/g, " ");

const fresh = read("dough-execute-plan/references/fresh-increment.md");
const wrapUp = read("dough-execute-plan/references/wrap-up.md");
const waitMechanics = read(
  "dough-execute-plan/references/ci-completion-wait.md",
);
const observe = flat(section(fresh, "## Observe progress proof"));

test("delivery checklist links progress publication to the named observation sequence", () => {
  const delivery = section(wrapUp, "## Deliver the change");
  const update = flat(
    delivery.slice(
      delivery.indexOf("5. For planned execution"),
      delivery.indexOf("6. Stage"),
    ),
  );
  assert.match(
    update,
    /progress: true[\s\S]+fresh-increment\.md#observe-progress-proof/,
  );
  assert.match(
    flat(delivery),
    /Never wait for CI or deployment after a normal or[\s\S]+repair publication/,
  );
});

test("accepted publication points at the progress proof observation", () => {
  const publish = flat(section(fresh, "## Publish"));
  assert.match(
    publish,
    /publication: accepted[\s\S]+`progress: true`: \[observe progress proof\]\(#observe-progress-proof\)/,
  );
});

test("guarded fresh names await-revision on the attached mailbox and accepted SHA", () => {
  assert.match(
    observe,
    /node '<installed-execute-plan>\/scripts\/ci-mailbox\.mjs' await-revision '<attached mailbox>' FULL_ACCEPTED_SHA/,
  );
  assert.match(observe, /attached mailbox from the delivery attachment/);
  assert.match(observe, /`receipt\.sha` after any rewrite/);
  assert.match(
    observe,
    /Settle open receiving obligations[\s\S]+ordinary guarded fresh without `progress`/,
  );
  assert.match(
    observe,
    /Leave the observer running[\s\S]+repairs, later slices, and the[\s\S]+completion operation/,
  );
});

test("failed evidence, Intent summary, records-only done, and completion boundaries stay explicit", () => {
  assert.match(
    observe,
    /Failed, pending, unavailable, or mismatched evidence leaves the slice[\s\S]+`planned`/,
  );
  assert.match(
    observe,
    /observe the accepted[\s\S]+repair SHA[\s\S]+before retrying ordinary done/,
  );
  assert.match(
    observe,
    /green ancestor or[\s\S]+newer tip cannot satisfy a promise that names this published revision/,
  );
  assert.match(
    observe,
    /Intent CI status read[\s\S]+custom-ci-proof\.md[\s\S]+same revision[\s\S]+attempt/,
  );
  assert.match(
    observe,
    /ignored-only revision may reuse its applicable basis[\s\S]+triggering change needs[\s\S]+own coverage/,
  );
  assert.match(
    observe,
    /Do not add an extra foreground watch solely for that done[\s\S]+paperwork/,
  );
  assert.match(
    observe,
    /Keep `complete-revision` at the existing execution\/review completion[\s\S]+boundary only/,
  );
  assert.match(
    observe,
    /hosted proof of the publication is optional or[\s\S]+observational, omit `progress`/,
  );
  assert.match(
    flat(waitMechanics),
    /`await-revision`[\s\S]+fresh-increment\.md#observe-progress-proof/,
  );
  assert.match(flat(waitMechanics), /Keep `complete-revision` at completion/);
  assert.match(
    waitMechanics,
    /Never[\s\S]+invoke it after ordinary slice delivery/,
  );
});
