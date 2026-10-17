// Start eligibility derived from the two shared readers' results over one
// in-memory canonical home: the readiness assessment and the dependency
// agreement. The derivation stores nothing and imports no filesystem module.
import assert from "node:assert/strict";
import { fileURLToPath, pathToFileURL } from "node:url";
import { test } from "node:test";
import { importedModules } from "./pure-module-imports.mjs";
import { deriveStartEligibility } from "../../src/skills/dough-product-backlog/scripts/product-backlog-start-eligibility.mjs";
import {
  computeBasis,
  readStoryState,
  recordStoryState,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-story-state.mjs";
import {
  readStoryDependencies,
  updateStoryDependency,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-story-dependencies.mjs";

const modulePath = fileURLToPath(
  new URL(
    "../../src/skills/dough-product-backlog/scripts/product-backlog-start-eligibility.mjs",
    import.meta.url,
  ),
);
const href = "seeds/A.md#a";
const identity = "SEED-A#a";
const seed = `---\nid: SEED-A\n---\n\n# Seed A\n\n<a id="a"></a>\n\n### Story A\n\n**Identity:** ${identity}\n\nExecute A.\n`;
const revision = "a".repeat(40);
const supplier = (key) => ({
  supplier: {
    identity: `SEED-${key}#${key.toLowerCase()}`,
    href: `seeds/${key}.md#${key.toLowerCase()}`,
  },
  implementation: "Shared endpoint contract",
  rationale: `${key} publishes the endpoint first.`,
  condition: `${key}'s endpoint is integrated.`,
});
const waiting = (key) => ({ ...supplier(key), state: "waiting" });
const decisionNeeded = (key) => ({
  ...supplier(key),
  state: "decision-needed",
  decision: `Which ${key} compatibility does A promise?`,
});
const satisfied = (key) => ({
  ...supplier(key),
  state: "satisfied",
  resolution: {
    revision,
    path: `.planning/seeds/${key}.md`,
    summary: "Verified.",
  },
});

function home({ assessment, reasons = [], dependencies = [] }) {
  let source = seed;
  if (assessment !== undefined)
    source = recordStoryState(source, {
      href,
      identity,
      refinement: "refined",
      approach: "planless",
      assessment,
      reasons,
      expectedBasis: computeBasis(source),
    }).source;
  for (const dependency of dependencies)
    source = updateStoryDependency(source, {
      href,
      identity,
      expectedBasis: readStoryDependencies(source, href).basis,
      dependency,
    }).source;
  return source;
}

// What a consumer passes: each reader's result, or its refusal as a gap.
function read(reader, source) {
  try {
    return reader(source, href);
  } catch (error) {
    return { status: "unavailable", problem: error.message };
  }
}

function eligibilityOf(source) {
  return deriveStartEligibility({
    preparation: read(readStoryState, source),
    dependencies: read(readStoryDependencies, source),
  });
}

const dependencyBlocker = (entry) => ({
  kind: "dependency",
  supplier: entry.supplier.identity,
  href: entry.supplier.href,
  state: entry.state,
  rationale: entry.rationale,
  condition: entry.condition,
  ...(entry.decision !== undefined && { decision: entry.decision }),
});
const notReady = {
  kind: "assessment",
  status: "not-ready",
  reasons: ["Retry examples are unresolved."],
};

const cases = [
  {
    name: "ready with no dependencies is eligible",
    source: () => home({ assessment: "ready" }),
    expected: { status: "eligible", blockers: [] },
  },
  {
    name: "ready with every dependency satisfied is eligible",
    source: () =>
      home({
        assessment: "ready",
        dependencies: [satisfied("B"), satisfied("C")],
      }),
    expected: { status: "eligible", blockers: [] },
  },
  {
    name: "ready behind a waiting supplier is blocked by it",
    source: () => home({ assessment: "ready", dependencies: [waiting("B")] }),
    expected: {
      status: "blocked",
      blockers: [dependencyBlocker(waiting("B"))],
    },
  },
  {
    name: "decision-needed blocks like waiting and names the decision",
    source: () =>
      home({ assessment: "ready", dependencies: [decisionNeeded("B")] }),
    expected: {
      status: "blocked",
      blockers: [dependencyBlocker(decisionNeeded("B"))],
    },
  },
  {
    name: "two suppliers with one satisfied are blocked by the other only",
    source: () =>
      home({
        assessment: "ready",
        dependencies: [satisfied("B"), waiting("C")],
      }),
    expected: {
      status: "blocked",
      blockers: [dependencyBlocker(waiting("C"))],
    },
  },
  {
    name: "a not-ready assessment blocks with its reasons",
    source: () =>
      home({
        assessment: "not-ready",
        reasons: notReady.reasons,
        dependencies: [satisfied("B")],
      }),
    expected: { status: "blocked", blockers: [notReady] },
  },
  {
    name: "dependency and assessment both block, dependency first",
    source: () =>
      home({
        assessment: "not-ready",
        reasons: notReady.reasons,
        dependencies: [waiting("B")],
      }),
    expected: {
      status: "blocked",
      blockers: [dependencyBlocker(waiting("B")), notReady],
    },
  },
  {
    name: "unrecorded preparation is a gap",
    source: () => home({ dependencies: [satisfied("B")] }),
    expected: {
      status: "blocked",
      blockers: [
        {
          kind: "gap",
          fact: "preparation",
          problem: "Preparation is not recorded.",
        },
      ],
    },
  },
  {
    name: "a refused dependency reader is a gap, never no blockers",
    source: () =>
      home({ assessment: "ready", dependencies: [waiting("B")] }).replace(
        /```json dough-story-dependencies\n[^\n]+/,
        "```json dough-story-dependencies\n{broken",
      ),
    expected: {
      status: "blocked",
      blockers: [
        {
          kind: "gap",
          fact: "dependencies",
          problem:
            "Story dependencies: present dependency block is not valid JSON.",
        },
      ],
    },
  },
];

for (const { name, source, expected } of cases) {
  test(`start eligibility: ${name}`, () => {
    assert.deepEqual(eligibilityOf(source()), expected);
  });
}

test("start eligibility: a refused story-state reader is a preparation gap", () => {
  const source = home({ assessment: "ready" });
  const duplicated = source.replace(
    /(```json dough-story-state\n[^\n]+\n```\n)/,
    "$1$1",
  );
  const result = eligibilityOf(duplicated);
  assert.equal(result.status, "blocked");
  assert.equal(result.blockers.length, 1);
  assert.equal(result.blockers[0].kind, "gap");
  assert.equal(result.blockers[0].fact, "preparation");
  assert.match(result.blockers[0].problem, /2 story-state blocks/);
});

test("start eligibility: imports no filesystem or Node-only module", async () => {
  const { visited, specifiers } = importedModules(modulePath);
  assert.ok(
    [...visited].some((path) =>
      path.endsWith("product-backlog-start-eligibility.mjs"),
    ),
  );
  for (const specifier of specifiers) {
    assert.equal(
      specifier.startsWith("node:"),
      false,
      `unexpected Node built-in import: ${specifier}`,
    );
    assert.equal(
      /product-backlog-(store|home\.mjs|story-state-home)/.test(specifier),
      false,
      `unexpected filesystem wrapper import: ${specifier}`,
    );
  }
  const loaded = await import(pathToFileURL(modulePath).href);
  assert.equal(typeof loaded.deriveStartEligibility, "function");
});
