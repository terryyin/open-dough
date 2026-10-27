// Guidance structure: every completion entry point gives completed selected
// work the current-consumer visit through one shared rule, and names one
// completion target (the integrated or closure SHA, or the last consumer
// publication).
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { markdownSection as section } from "../../../../tests/support/markdown-section.mjs";

const skills = join(dirname(fileURLToPath(import.meta.url)), "../..");
const read = (path) => readFileSync(join(skills, path), "utf8");

const procedure = read(
  "dough-product-backlog/references/supplier-dependencies.md",
);
const ruleHeading = "## Which completed work takes the visit";
const ruleAnchor =
  "supplier-dependencies.md#which-completed-work-takes-the-visit";

const entryPoints = {
  "dough-story-wrap-up/SKILL.md": "../dough-product-backlog/references/",
  "dough-story-wrap-up/references/story-branch-integration.md":
    "../../dough-product-backlog/references/",
  "dough-execute-plan/references/wrap-up-closure-publication.md":
    "../../dough-product-backlog/references/",
  "dough-execute-plan/references/preserve-published-history.md":
    "../../dough-product-backlog/references/",
  "dough-land/SKILL.md": "../dough-product-backlog/references/",
  "dough-land/references/publish-reviewed-checkout.md":
    "../../dough-product-backlog/references/",
};

test("the shared procedure states the visit trigger once", () => {
  const rule = section(procedure, ruleHeading);
  assert.match(
    rule,
    /Every completed selected work item with a recorded identity is a potential\s+supplier, including planless work/,
  );
  assert.match(rule, /\(#preserve-context-before-cleanup\)/);
  assert.match(
    rule,
    /Discovery, not the agent, decides whether consumers exist; zero consumers is ordinary/,
  );
  assert.match(
    rule,
    /`--supplier-identity` to Story Branch `integrate`\s+or Trunk `finish`, `supplierIdentity` to the Land APIs; no script defaults it/,
  );
  assert.match(rule, /`finish` never derives it from `--identity`/);
  assert.match(rule, /`integrate`\s+without it stays\s+supplier-free/);
  assert.match(
    rule,
    /Work without a recorded identity, such as a\s+context-only or\s+one-shot instruction, takes no visit/,
  );
  assert.equal(procedure.split(ruleHeading).length, 2);
});

test("every entry point links the shared rule instead of judging a supplier", () => {
  for (const [path, prefix] of Object.entries(entryPoints)) {
    const text = read(path);
    assert.ok(text.includes(`](${prefix}${ruleAnchor})`), path);
    assert.doesNotMatch(
      text,
      /completed\s+supplier|selected\s+completed\s+supplier/i,
      path,
    );
  }
});

test("Story Branch, Trunk and Land callers pass the identity explicitly", () => {
  assert.match(
    read("dough-story-wrap-up/references/story-branch-integration.md"),
    /Pass the selected identity to that integration as `--supplier-identity`[\s\S]+even when its branch shows no consumer/,
  );
  assert.match(
    read("dough-execute-plan/references/wrap-up-closure-publication.md"),
    /Pass the closed work's identity as `--supplier-identity`[\s\S]+`--identity` never supplies it/,
  );
  const land = section(
    read("dough-land/references/publish-reviewed-checkout.md"),
    "## Land completed selected work",
  );
  assert.match(land, /even when its checkout shows no consumer/);
  assert.match(
    land,
    /a generic landing or an unfinished\s+increment takes none/,
  );
  assert.match(land, /adding `supplierIdentity`/);
  assert.match(
    read("dough-execute-plan/references/preserve-published-history.md"),
    /Without the flag, integration carries no supplier meaning/,
  );
});

test("wrap-up keeps its pointer to the current-consumer visit", () => {
  assert.match(
    read("dough-story-wrap-up/SKILL.md"),
    /\[takes the current-consumer visit\]\([^)]+#which-completed-work-takes-the-visit\)[\s\S]+before final completion and retirement/,
  );
});

test("completion targets the final accepted SHA, including the last consumer publication", () => {
  const integration = read(
    "dough-story-wrap-up/references/story-branch-integration.md",
  );
  assert.match(
    integration,
    /shared completion on the final\s+accepted SHA: the integrated SHA, or the last consumer publication/,
  );
  assert.doesNotMatch(integration, /on the accepted\s+integrated SHA/);
  const monitor = read("dough-execute-plan/references/ci-monitor.md");
  assert.match(
    monitor,
    /final accepted SHA: the closure or integrated SHA, or the last consumer\s+publication/,
  );
  assert.doesNotMatch(monitor, /final accepted closure or integrated SHA/);

  const retirement = section(integration, "## Retire Story Branch resources");
  assert.match(
    retirement,
    /\[Retire the worktree\]\(\.\.\/\.\.\/dough-land\/SKILL\.md#retire-the-worktree\)/,
  );
  assert.match(
    retirement,
    /`--remote-branch <execution branch>` and `--contained <integrated SHA>`, adding\s+`--contained` for each accepted consumer publication/,
  );
  assert.match(
    retirement,
    /gate: a\s+`success` completion receipt for the final accepted SHA whose shutdown is\s+confirmed/,
  );
  assert.match(
    retirement,
    /active checkout-bound observer[\s\S]+preserve pending local work/,
  );
});
