import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { consumerKind } from "../../../src/skills/dough-execute-plan/scripts/consumer-trace-record.mjs";
import { repository, section, trace } from "./consumer-trace-test-fixtures.mjs";

const kinds = [
  "Production",
  "Test",
  "Test support or stand-in",
  "Journey or feature",
  "Guidance reader",
];

const sharedText = "src/skills/greet/references/message.md";

const consumerShapes = {
  [sharedText]: "Say hello. This file is message.md itself.\n",
  "src/skills/greet/scripts/render.mjs":
    'import { readFileSync } from "node:fs";\nexport const text = readFileSync("../references/message.md", "utf8");\n',
  "src/skills/greet/scripts/message-guidance.test.mjs":
    'const guidance = read("src/skills/greet/references/message.md");\nassert.match(guidance, /hello/);\n',
  "tests/support/fakeRenderer.mjs":
    "// stands in for render.mjs reading message.md\nexport const text = 'hello';\n",
  "journeys/greeting.feature":
    "Feature: Greeting\n  Scenario: ordinary greeting\n    Then I see the greeting\n",
  "journeys/step_definitions/greeting.ts":
    "Then('I see the greeting', () => page.expectGreeting())\n",
  "journeys/pageObjects/greetingPage.ts":
    "export const page = {\n  expectGreeting() { return true }\n}\n",
  "docs/greeting.md":
    "The skill says hello through [its message](../src/skills/greet/references/message.md).\n",
  "src/unrelated.mjs": "export const nothing = 1;\n",
  ".gitignore": "build/\n",
};

test("base-derived and supplied effects find readers across the whole checkout", async (t) => {
  const root = await repository(t, consumerShapes, {
    "src/skills/greet/scripts/draft.mjs": "// untracked: reads message.md\n",
    "build/render.mjs": "// ignored copy reading message.md\n",
  });
  writeFileSync(join(root, sharedText), "Say hello in the current message.\n");
  const result = trace(
    "--checkout",
    root,
    "--base",
    "HEAD",
    "--term",
    "ordinary greeting",
    "--term",
    "expectGreeting",
  );
  assert.equal(result.status, 0, result.stderr);
  const output = result.stdout;

  assert.match(
    output,
    /\| `src\/skills\/greet\/references\/message\.md` \| changed path \|/,
  );
  assert.match(output, /\| `message\.md` \| basename of /);
  assert.match(output, /\| `ordinary greeting` \| supplied \|/);
  assert.match(
    output,
    /Whole checkout at `[0-9a-f]{12}`, including uncommitted and untracked files: \d+ tracked and untracked non-ignored files searched/,
  );

  const production = section(output, "Production");
  assert.match(
    production,
    /`src\/skills\/greet\/scripts\/render\.mjs` \| `message\.md`[^|]*\| 2: /,
  );
  assert.doesNotMatch(production, /draft\.mjs/);
  assert.match(
    output,
    /\| `src\/skills\/greet\/scripts\/draft\.mjs` \| changed path \|/,
  );
  assert.doesNotMatch(production, /unrelated/);
  assert.match(
    section(output, "Test"),
    /`src\/skills\/greet\/scripts\/message-guidance\.test\.mjs` \| `src\/skills\/greet\/references\/message\.md`, `message\.md`[^|]*\| 1: /,
  );
  assert.match(
    section(output, "Test support or stand-in"),
    /`tests\/support\/fakeRenderer\.mjs`/,
  );
  const journey = section(output, "Journey or feature");
  assert.match(
    journey,
    /`journeys\/greeting\.feature` \| `ordinary greeting` \| 2: /,
  );
  assert.match(
    journey,
    /`journeys\/step_definitions\/greeting\.ts` \| `expectGreeting` \|/,
  );
  assert.match(
    journey,
    /`journeys\/pageObjects\/greetingPage\.ts` \| `expectGreeting` \| 2: /,
  );
  assert.match(section(output, "Guidance reader"), /`docs\/greeting\.md`/);

  assert.doesNotMatch(output, /none found/);
  assert.doesNotMatch(output, /build\/render\.mjs/, "ignored files stay out");
  for (const path of [
    "src/skills/greet/scripts/render.mjs",
    "tests/support/fakeRenderer.mjs",
    "journeys/greeting.feature",
    "docs/greeting.md",
  ])
    assert.equal(output.split(`| \`${path}\` |`).length, 2, `${path} once`);
  assert.equal(
    output.split(`| \`${sharedText}\` |`).length,
    2,
    "the changed file is listed only as a term, not as its own consumer",
  );
  assert.match(output, /Disposition \|/);
  assert.match(output, /`run`, `reused` or `excluded: <reason/);

  const termsOnly = trace("--checkout", root, "--term", "message.md");
  assert.equal(termsOnly.status, 0, termsOnly.stderr);
  assert.match(section(termsOnly.stdout, "Production"), /draft\.mjs/);
  assert.doesNotMatch(termsOnly.stdout, /build\/render\.mjs/);
});

test("a rename inside one file that nothing else observes yields every kind empty", async (t) => {
  const root = await repository(t, {
    "src/calc.mjs": "function total(values) { return values.length }\n",
    "src/calc.test.mjs": 'import { sum } from "./sum.mjs";\n',
    "README.md": "# Arithmetic\n",
  });
  writeFileSync(
    join(root, "src/calc.mjs"),
    "function count(values) { return values.length }\n",
  );
  const result = trace(
    "--checkout",
    root,
    "--base",
    "HEAD",
    "--term",
    "total(",
  );
  assert.equal(result.status, 0, result.stderr);
  for (const heading of kinds)
    assert.match(section(result.stdout, heading), /none found/, heading);
  assert.match(result.stdout, /2 tracked and untracked non-ignored files/);
});

test("invalid checkout, effect, or base inputs exit 2", async (t) => {
  const root = await repository(t, { "a.mjs": "export {}\n" });
  const outside = mkdtempSync(join(tmpdir(), "dough-consumer-trace-plain-"));
  t.after(() => rmSync(outside, { recursive: true, force: true }));
  for (const args of [
    ["--checkout", join(root, "missing"), "--term", "a"],
    ["--checkout", outside, "--term", "a"],
    ["--checkout", root],
    ["--checkout", root, "--term", ""],
    ["--checkout", root, "--base", "no-such-revision"],
    ["--checkout", root, "--base", ""],
  ]) {
    const result = trace(...args);
    assert.equal(result.status, 2, args.join(" "));
    assert.match(result.stderr, /usage: consumer-trace\.mjs/);
    assert.equal(result.stdout, "");
  }
  const retired = trace("--checkout", root, "--path", "a.mjs");
  assert.equal(retired.status, 2);
  assert.match(retired.stderr, /Unknown option '--path'/);
  assert.equal(retired.stdout, "");
});

test("kind follows one documented precedence so each file has exactly one kind", () => {
  for (const [path, kind] of [
    ["e2e_test/features/recall.feature", "journey"],
    ["e2e_test/start/pageObjects/recallPage.ts", "journey"],
    ["e2e_test/step_definitions/recall.ts", "journey"],
    ["dashboard/tests/support/cursorRunnerHeldReads.ts", "stand-in"],
    ["src/scripts/ci-github-test-fixtures.mjs", "stand-in"],
    ["src/testing/mocks/clock.ts", "stand-in"],
    ["Distribution/tests/support/delivery.test.mjs", "test"],
    ["src/scripts/ci-monitor-guidance.test.mjs", "test"],
    ["web/src/App.spec.ts", "test"],
    ["pkg/reader_test.go", "test"],
    ["Distribution/tests/installation/install.sh", "test"],
    ["Distribution/tests/README.md", "test"],
    ["docs/adrs/0006.md", "guidance"],
    ["src/skills/x/SKILL.md", "guidance"],
    ["src/server/supported-hosts.ts", "production"],
    ["install.sh", "production"],
  ])
    assert.equal(consumerKind(path), kind, path);
});
