import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { markdownSection } from "../../../../tests/support/markdown-section.mjs";

const reference = (name) =>
  readFileSync(new URL(`../references/${name}`, import.meta.url), "utf8");

test("delegation obtains the source review before the slice listing", () => {
  const delegation = reference("delegation.md");
  const beforeAssignment = delegation.slice(
    0,
    delegation.indexOf("Give the agent:"),
  );
  assert.ok(
    beforeAssignment.indexOf("## Obtain the source-only review") <
      beforeAssignment.indexOf("story-obligations.mjs' list"),
    "source review comes before the slice listing",
  );
  assert.match(
    beforeAssignment,
    /obtain-source-review\.md#before-planned-delegation/,
  );
  const obtain = reference("obtain-source-review.md");
  const beforeDelegation = markdownSection(
    obtain,
    "## Before planned delegation",
  );
  assert.match(
    obtain,
    /To obtain a source-only review, spawn a fresh general-purpose reviewer without\s+conversation inheritance/,
  );
  assert.match(
    beforeDelegation,
    /obtain that review before the first implementation\s+delegation/,
  );
  assert.match(
    beforeDelegation,
    /Retain, link, and\s+\[allocate\]\(#retain-link-and-allocate\) every id before the obligations\s+listing/,
  );
  assert.match(
    beforeDelegation,
    /Reuse a plan that already links a retained review for the\s+unchanged source/,
  );
  assert.match(
    beforeDelegation,
    /After\s+a story amendment, obtain a fresh review, replace it and allocate it again/,
  );
  assert.match(
    beforeDelegation,
    /If isolation or that evidence is unavailable, name the missing review\s+and stop this\s+delegation/,
  );
  assert.match(
    beforeAssignment,
    /story-obligations\.mjs' list --plan '<PLAN\.md>' --slice N/,
  );
  assert.match(beforeAssignment, /refusal blocks delegation/);
  assert.match(
    beforeAssignment,
    /full listing as slice\s+promises[\s\S]+required observations/,
  );
  assert.match(
    beforeAssignment,
    /returns, receiving\s+obligations, and open interims/,
  );
});

test("acceptance reuses or obtains the source review without duplicating isolation rules", () => {
  const retention = markdownSection(reference("wrap-up.md"), "## Accept proof");
  assert.match(
    retention,
    /\[source-only review at acceptance\]\(obtain-source-review\.md#at-acceptance\)/,
  );
  const atAcceptance = markdownSection(
    reference("obtain-source-review.md"),
    "## At acceptance",
  );
  assert.match(
    atAcceptance,
    /reuse the retained review while the source text\s+is unchanged; do not launch another reviewer/,
  );
  assert.match(
    atAcceptance,
    /When none is retained, obtain one\s+under the rules above/,
  );
  assert.match(
    atAcceptance,
    /\[allocate\]\(#retain-link-and-allocate\) every id before the next obligations\s+listing or check/,
  );
  assert.match(
    reference("obtain-source-review.md"),
    /## Retain, link, and allocate[\s\S]+allocate every id: to the slice whose output\s+owes it[\s\S]+\[lifecycle owner\]\(story-obligations\.md#record-the-source-review\)/,
  );
  const planning = readFileSync(
    new URL(
      "../../dough-story-refinement/references/planning.md",
      import.meta.url,
    ),
    "utf8",
  );
  assert.match(
    planning,
    /once the first planned delegation\s+\[obtains and allocates it\]\([^)]*obtain-source-review\.md#before-planned-delegation\)/,
  );
  assert.doesNotMatch(
    planning,
    /once acceptance retains it; acceptance adds and allocates it/,
  );
});
