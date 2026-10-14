import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { exec } from "./publication-test-fixtures.mjs";

// Actual covered and target-only children are independent of provider facts.
export function createReuseCheckCommands(fixture, policy) {
  const executions = join(fixture.fixture, "executions.jsonl");
  const covered = join(fixture.fixture, "covered.mjs");
  writeFileSync(
    covered,
    `
import assert from 'node:assert/strict';
import { appendFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const [sha, failed] = process.argv.slice(2);
const content = execFileSync('git', ['show', sha + ':increment.txt'], {encoding:'utf8'});
assert.equal(content, 'increment\\n');
appendFileSync(${JSON.stringify(executions)}, JSON.stringify({sha,kind:'covered'})+'\\n');
if (failed === 'true') process.exit(1);
console.log('DOUGH_CI_DIRECT '+JSON.stringify({sha,...${JSON.stringify({ unit: policy.unit, configuration: policy.configuration, context: policy.context })}}));
`,
  );
  return {
    count(sha, kind = "covered") {
      if (!existsSync(executions)) return 0;
      return readFileSync(executions, "utf8")
        .trim()
        .split("\n")
        .map(JSON.parse)
        .filter((entry) => entry.sha === sha && entry.kind === kind).length;
    },
    async runCovered(sha, failed = false) {
      const result = await exec(
        process.execPath,
        [covered, sha, String(failed)],
        { cwd: fixture.execution },
      ).catch((error) => error);
      return { success: !(result instanceof Error), log: result.stdout };
    },
    async runTargetOnly(sha, failed = false) {
      const entry = `${JSON.stringify({ sha, kind: "target-only" })}\n`;
      const result = await exec(process.execPath, [
        "-e",
        `require('node:fs').appendFileSync(${JSON.stringify(executions)}, ${JSON.stringify(entry)});process.exit(${failed ? 1 : 0})`,
      ]).catch((error) => error);
      return !(result instanceof Error);
    },
  };
}
