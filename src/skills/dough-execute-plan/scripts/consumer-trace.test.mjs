import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { consumerKind } from "./consumer-trace-record.mjs";

const script = join(
  dirname(fileURLToPath(import.meta.url)),
  "consumer-trace.mjs",
);

function repository(t, files, untracked = {}) {
  const root = mkdtempSync(join(tmpdir(), "dough-consumer-trace-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const write = (entries) => {
    for (const [path, content] of Object.entries(entries)) {
      mkdirSync(dirname(join(root, path)), { recursive: true });
      writeFileSync(join(root, path), content);
    }
  };
  const git = (...args) =>
    execFileSync("git", ["-C", root, ...args], { encoding: "utf8" });
  git("init", "-q");
  write(files);
  git("add", "-A");
  git(
    "-c",
    "user.name=Fixture",
    "-c",
    "user.email=fixture@example.com",
    "commit",
    "-q",
    "-m",
    "fixture",
  );
  write(untracked);
  return root;
}

function trace(...args) {
  return spawnSync(process.execPath, [script, ...args], { encoding: "utf8" });
}

function section(output, heading) {
  const start = output.indexOf(`### ${heading}\n`);
  assert.notEqual(start, -1, `missing section ${heading}`);
  const end = output.indexOf("\n### ", start + 1);
  return output.slice(start, end === -1 ? undefined : end);
}

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

test("readers of a changed shared text are found in every kind across the whole checkout, untracked included and ignored excluded", (t) => {
  const root = repository(t, consumerShapes, {
    "src/skills/greet/scripts/draft.mjs": "// untracked: reads message.md\n",
    "build/render.mjs": "// ignored copy reading message.md\n",
  });
  const result = trace(
    "--checkout",
    root,
    "--path",
    sharedText,
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
    /Whole checkout at `[0-9a-f]{12}`, including uncommitted and untracked files: 10 tracked and untracked non-ignored files searched/,
  );

  const production = section(output, "Production");
  assert.match(
    production,
    /`src\/skills\/greet\/scripts\/render\.mjs` \| `message\.md` \| 2: /,
  );
  assert.match(production, /`src\/skills\/greet\/scripts\/draft\.mjs`/);
  assert.doesNotMatch(production, /unrelated/);
  assert.match(
    section(output, "Test"),
    /`src\/skills\/greet\/scripts\/message-guidance\.test\.mjs` \| `src\/skills\/greet\/references\/message\.md`, `message\.md` \| 1: /,
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
    "src/skills/greet/scripts/draft.mjs",
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
});

test("a rename inside one file that nothing else observes yields every kind empty", (t) => {
  const root = repository(t, {
    "src/calc.mjs": "function total(values) { return values.length }\n",
    "src/calc.test.mjs": 'import { sum } from "./sum.mjs";\n',
    "README.md": "# Calculator\n",
  });
  writeFileSync(
    join(root, "src/calc.mjs"),
    "function count(values) { return values.length }\n",
  );
  const result = trace(
    "--checkout",
    root,
    "--path",
    "src/calc.mjs",
    "--term",
    "total(",
  );
  assert.equal(result.status, 0, result.stderr);
  for (const heading of kinds)
    assert.match(section(result.stdout, heading), /none found/, heading);
  assert.match(result.stdout, /2 tracked and untracked non-ignored files/);
});

test("a missing checkout, no effect to search, or a changed path outside the checkout exits 2", (t) => {
  const root = repository(t, { "a.mjs": "export {}\n" });
  const outside = mkdtempSync(join(tmpdir(), "dough-consumer-trace-plain-"));
  t.after(() => rmSync(outside, { recursive: true, force: true }));
  for (const args of [
    ["--checkout", join(root, "missing"), "--term", "a"],
    ["--checkout", outside, "--term", "a"],
    ["--checkout", root],
    ["--path", "a.mjs"],
    ["--checkout", root, "--path", "../elsewhere.mjs"],
    ["--checkout", root, "--path", join(outside, "b.mjs")],
    ["--checkout", root, "--term", ""],
  ]) {
    const result = trace(...args);
    assert.equal(result.status, 2, args.join(" "));
    assert.match(result.stderr, /usage: consumer-trace\.mjs/);
    assert.equal(result.stdout, "");
  }
});

test("kind follows one documented precedence so each file has exactly one kind", () => {
  for (const [path, kind] of [
    ["e2e_test/features/recall.feature", "journey"],
    ["e2e_test/start/pageObjects/recallPage.ts", "journey"],
    ["e2e_test/step_definitions/recall.ts", "journey"],
    ["dashboard/tests/support/cursorRunnerHeldReads.ts", "stand-in"],
    ["src/scripts/ci-github-test-fixtures.mjs", "stand-in"],
    ["src/testing/mocks/clock.ts", "stand-in"],
    ["tests/support/delivery.test.mjs", "test"],
    ["src/scripts/ci-monitor-guidance.test.mjs", "test"],
    ["web/src/App.spec.ts", "test"],
    ["pkg/reader_test.go", "test"],
    ["tests/install.sh", "test"],
    ["tests/README.md", "test"],
    ["docs/adrs/0006.md", "guidance"],
    ["src/skills/x/SKILL.md", "guidance"],
    ["src/server/supported-hosts.ts", "production"],
    ["install.sh", "production"],
  ])
    assert.equal(consumerKind(path), kind, path);
});
