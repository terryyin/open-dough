import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { git, gitOk } from "./lint-runner-fixture.mjs";
import {
  defaulted,
  fixtureModule,
  head,
  hookFixture,
  required,
  stage,
} from "./pre-commit-hook-fixture.mjs";

test("a staged signature break is refused with the consumer's diagnostic and nothing is changed", (t) => {
  const fixture = hookFixture(t);
  const before = head(fixture);
  stage(fixture, fixtureModule, required);
  const stagedDiff = gitOk(fixture, "diff", "--cached");
  const status = gitOk(fixture, "status", "--porcelain");

  const commit = git(fixture, "commit", "-m", "break the consumer");

  assert.notEqual(commit.status, 0, commit.output);
  assert.match(
    commit.output,
    /src\/consumer\.ts\(\d+,\d+\): error TS2345[\s\S]*Property 'identity' is missing/,
  );
  assert.equal(head(fixture), before);
  assert.equal(readFileSync(join(fixture, fixtureModule), "utf8"), required);
  assert.equal(gitOk(fixture, "diff", "--cached"), stagedDiff);
  assert.equal(gitOk(fixture, "diff"), "");
  assert.equal(gitOk(fixture, "status", "--porcelain"), status);
});

test("a staged restored signature commits", (t) => {
  const fixture = hookFixture(t);
  stage(fixture, fixtureModule, required);
  gitOk(fixture, "commit", "--no-verify", "-qm", "break the consumer");
  stage(fixture, fixtureModule, defaulted);

  const commit = git(fixture, "commit", "-m", "restore the default");

  assert.equal(commit.status, 0, commit.output);
  assert.equal(gitOk(fixture, "show", `HEAD:${fixtureModule}`), defaulted);
});

test("a staged TypeScript file with a wrong argument type is refused with its diagnostic", (t) => {
  const fixture = hookFixture(t);
  const before = head(fixture);
  stage(
    fixture,
    "src/wrong.ts",
    'const double = (n: number) => n * 2;\n\nexport const wrong = double("two");\n',
  );

  const commit = git(fixture, "commit", "-m", "wrong argument");

  assert.notEqual(commit.status, 0, commit.output);
  assert.match(
    commit.output,
    /src\/wrong\.ts\(\d+,\d+\): error TS2345[\s\S]*'string' is not assignable to parameter of type 'number'/,
  );
  assert.equal(head(fixture), before);
});
