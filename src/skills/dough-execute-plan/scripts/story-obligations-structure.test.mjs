import assert from "node:assert/strict";
import test from "node:test";
import { readStoryObligations } from "./story-obligations.mjs";
import {
  fixture,
  holdings,
  obligation,
  searchProjection,
  slicePlan,
} from "./story-obligations-test-fixtures.mjs";
import { check, refuses } from "./story-obligations-test-cli.mjs";

test("receiving ownership allows the origin done but blocks its selected or done receiver", (t) => {
  const { plan, writePlan } = fixture(
    t,
    searchProjection,
    "receiving slice 4",
    { done: [1] },
  );
  assert.equal(check(plan, "--slice", "1").ok, true);
  refuses(check(plan, "--slice", "4"), "open-obligation");
  writePlan(
    slicePlan(obligation(searchProjection, "receiving slice 4"), {
      done: [1, 4],
    }),
  );
  refuses(check(plan), "open-obligation");
  writePlan(slicePlan(obligation(searchProjection, "receiving slice 9")));
  refuses(check(plan), "dangling-receiving-slice");
  writePlan(slicePlan(obligation(holdings, "receiving slice 1")));
  refuses(check(plan), "invalid-receiving-slice");
});

test("the reader represents all seven dispositions with one open/closed model", () => {
  const dispositions = [
    "return",
    "receiving slice 5",
    "interim until slices 5, 6",
    'excluded "Not promised."',
    'owner changed "Promise changed."',
    'no user cost "Goal unchanged.": No lost result.',
    "proved by slice 4: proof.test.mjs",
  ];
  const read = readStoryObligations(
    slicePlan(
      dispositions
        .map((text, index) => obligation(holdings, text, `G${index + 1}`))
        .join("\n\n"),
    ),
  );
  assert.deepEqual(read.problems, []);
  assert.deepEqual(
    read.entries.map((entry) => entry.disposition.open),
    [true, true, true, false, false, false, false],
  );
  assert.deepEqual(read.entries[2].disposition.slices, [5, 6]);
  assert.equal(read.entries[0].reported, holdings.reported);
  assert.equal(read.entries[0].storyClause, holdings.clause);
});

test("fenced example entries do not become obligations or slices", (t) => {
  const { plan, writePlan } = fixture(t);
  writePlan("# Legacy plan\n\nNo story obligations section.\n");
  assert.deepEqual(check(plan), { ok: true, entryCount: 0 });
  writePlan(
    `# A legacy plan\n\n\`\`\`markdown\n${slicePlan(obligation(holdings, "learning"))}\n\`\`\`\n`,
  );
  assert.deepEqual(check(plan), { ok: true, entryCount: 0 });
  writePlan(
    slicePlan(
      `\`\`\`markdown\n${obligation(holdings, "learning")}\n### 999. Example\nType: Behavior\nStatus: done\n\`\`\`\n${obligation(holdings)}`,
    ),
  );
  assert.equal(check(plan).ok, true);
  assert.equal(check(plan).entryCount, 1);
});

test("missing, malformed, and repeated fields name the affected obligation", (t) => {
  const { plan, writePlan } = fixture(t);
  const entry = obligation(holdings);
  const cases = [
    [entry.replace(/Reported:.*\n/, ""), "missing-reported"],
    [
      entry.replace("Reported: slice 4", "Reported: slice unknown"),
      "malformed-reported",
    ],
    [entry.replace(holdings.reported, " "), "malformed-reported"],
    [entry.replace(/Story clause:.*\n/, ""), "missing-story-clause"],
    [
      entry.replace(`"${holdings.clause}"`, holdings.clause),
      "malformed-story-clause",
    ],
    [
      `${entry}\nDisposition: proved by slice 4: proof.test.mjs`,
      "duplicate-field",
    ],
    [`${entry}\n\n${entry}`, "duplicate-entry"],
  ];
  for (const [text, reason] of cases) {
    writePlan(slicePlan(text));
    refuses(check(plan), reason);
  }
});

test("obligations cannot guess missing slices, story sources, or malformed slice progress", (t) => {
  const { plan, writePlan } = fixture(t);
  for (const [text, reason] of [
    [
      slicePlan(obligation(holdings), { indices: [1] }),
      "dangling-reported-slice",
    ],
    [
      slicePlan(obligation(holdings)).replace(
        "Status: planned",
        "Status: unknown",
      ),
      "unreadable-slices",
    ],
    [
      slicePlan(obligation(holdings)).replace(/\*\*Source:\*\*.*\n/, ""),
      "missing-story-source",
    ],
    [
      slicePlan(obligation(holdings)).replace("#selected", "#missing"),
      "unreadable-story-source",
    ],
    [
      slicePlan(obligation(holdings)).replace(
        "## Story obligations",
        "### 4. Duplicate\nType: Behavior\nStatus: done\n\n## Story obligations",
      ),
      "ambiguous-slice",
    ],
  ]) {
    writePlan(text);
    const result = check(plan);
    assert.equal(result.ok, false);
    assert.ok(
      result.problems.some((item) => item.reason === reason),
      JSON.stringify(result),
    );
  }
});
