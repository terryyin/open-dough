import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import test from "node:test";
import {
  exclusion,
  fixture,
  holdings,
  obligation,
  searchProjection,
  slicePlan,
} from "./story-obligations-test-fixtures.mjs";

import { check, refuses } from "./story-obligations-test-cli.mjs";

test("plan 303's narrower scope cannot exclude its reported Holdings omission", (t) => {
  const { plan, writePlan } = fixture(
    t,
    holdings,
    'excluded "The slice only asked for the Auto Trading Holdings section."',
  );
  refuses(
    check(plan, "--slice", "4"),
    "quote-not-in-story",
    "G1",
    "Disposition",
  );
  writePlan(slicePlan(obligation(holdings), { done: [1, 2, 3] }));
  refuses(check(plan, "--slice", "4"), "open-obligation");
  assert.equal(check(plan).ok, true, "uncommitted return remains owned");
  writePlan(slicePlan(obligation(holdings), { done: [1, 2, 3, 4] }));
  refuses(check(plan), "open-obligation");
});

test("plan 280's lost benchmark parameter cannot close as a learning or no disposition", (t) => {
  const { plan, writePlan } = fixture(t, searchProjection, "learning");
  refuses(check(plan, "--slice", "1"), "no-disposition");
  writePlan(
    slicePlan(obligation(searchProjection).replace("Disposition: return", "")),
  );
  refuses(check(plan), "no-disposition");
  writePlan(slicePlan(obligation(searchProjection)));
  refuses(check(plan, "--slice", "1"), "open-obligation");
});

test("a genuine story exclusion remains closed with the reporting slice done", (t) => {
  const { plan } = fixture(
    t,
    exclusion,
    'excluded "This story excludes the release cache budget remedy."',
    { done: [1] },
  );
  assert.deepEqual(check(plan, "--slice", "1"), { ok: true, entryCount: 1 });
});

test("an owner change must cite changed story text and leaves earlier proof done", (t) => {
  const changed = {
    ...holdings,
    story: `${holdings.story}\nOwner decision: The Holdings page is dropped from this story.`,
  };
  const { plan, writePlan } = fixture(
    t,
    changed,
    'owner changed "The Holdings page is dropped from this story."',
    { done: [1, 2, 3, 4] },
  );
  assert.deepEqual(check(plan), { ok: true, entryCount: 1 });
  assert.equal(readFileSync(plan, "utf8").match(/Status: done/g).length, 4);
  writePlan(
    slicePlan(
      obligation(
        holdings,
        'owner changed "The story now excludes all Holdings displays."',
      ),
      { done: [1, 2, 3, 4] },
    ),
  );
  refuses(check(plan), "quote-not-in-story", "G1", "Disposition");
});

test("the story clause cannot come from the plan, shared context, or sibling story", (t) => {
  const { plan, story, writePlan } = fixture(t);
  for (const clause of [
    "Holding exit settings name their source.",
    "Shared context excludes the Holdings panel.",
    "A sibling exclusion has no authority over the selected story.",
  ]) {
    writeFileSync(
      story,
      readFileSync(story, "utf8").replace(
        "# Replay stories",
        "# Replay stories\n\nShared context excludes the Holdings panel.",
      ),
    );
    writePlan(
      `${slicePlan(
        obligation(
          { ...holdings, clause },
          "proved by slice 4: tests/holdings.test.mjs",
        ),
      )}\n## Learnings\n${clause}\n`,
    );
    refuses(check(plan), "quote-not-in-story", "G1", "Story clause");
  }
});

test("whitespace and emphasis normalize without fuzzy matching identifiers", (t) => {
  const formatted = {
    ...searchProjection,
    story:
      "**candidate remains the _same_ configuration** through\n persistence, composition, Verify, Save and explicit Auto Trading selection\nThe gene is **benchmark_weight**.",
  };
  const { plan, writePlan } = fixture(
    t,
    formatted,
    'no user cost "candidate remains the same configuration": The separate cache budget does not change the candidate.',
  );
  assert.equal(check(plan).ok, true);
  writePlan(
    slicePlan(
      obligation(
        { ...formatted, clause: "benchmark weight" },
        "proved by slice 1: proof.test.mjs",
      ),
    ),
  );
  refuses(check(plan), "quote-not-in-story", "G1", "Story clause");
  writePlan(
    slicePlan(
      obligation(
        { ...formatted, clause: "* *" },
        "proved by slice 1: proof.test.mjs",
      ),
    ),
  );
  refuses(check(plan), "quote-not-in-story", "G1", "Story clause");
});

test("no user cost needs its story quote and reason, and proved needs a named slice and proof", (t) => {
  const { plan, writePlan } = fixture(
    t,
    holdings,
    `no user cost "${holdings.clause}": Existing rows already name the source.`,
  );
  assert.equal(check(plan).ok, true);
  writePlan(
    slicePlan(
      obligation(
        holdings,
        'no user cost "The plan asked only for Auto Trading.": No change.',
      ),
    ),
  );
  refuses(check(plan), "quote-not-in-story", "G1", "Disposition");
  for (const disposition of [
    `no user cost "${holdings.clause}":`,
    "proved by slice 4:",
    "proved",
  ]) {
    writePlan(slicePlan(obligation(holdings, disposition)));
    refuses(check(plan), "no-disposition");
  }
  writePlan(
    slicePlan(
      obligation(holdings, "proved by slice 4: tests/holdings.test.mjs"),
      { done: [4] },
    ),
  );
  assert.equal(check(plan).ok, true);
});
