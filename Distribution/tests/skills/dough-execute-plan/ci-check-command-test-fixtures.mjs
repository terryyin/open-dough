import {
  appendFileSync,
  existsSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { exec, git } from "./publication-test-fixtures.mjs";

// The file and bytes the fixture description's first unpublished revision
// adds: what every candidate built on that increment must still hold.
function describedIncrement({ description }) {
  const files = Object.entries(
    description.workspace?.revisions[0]?.files ?? {},
  );
  if (files.length !== 1)
    throw new Error(
      "The covered check needs a description whose first unpublished revision adds exactly one file",
    );
  const [[path, content]] = files;
  return { path, content: String(content) };
}

// The actual covered child is independent of provider facts.
export function createCheckCommands(fixture) {
  const increment = describedIncrement(fixture);
  const executions = join(fixture.fixture, "executions.jsonl");
  const covered = join(fixture.fixture, "covered.mjs");
  writeFileSync(
    covered,
    `
import assert from 'node:assert/strict';
import { appendFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const [sha, failed] = process.argv.slice(2);
const content = execFileSync('git', ['show', sha + ':' + ${JSON.stringify(increment.path)}], {encoding:'utf8'});
assert.equal(content, ${JSON.stringify(increment.content)});
appendFileSync(${JSON.stringify(executions)}, JSON.stringify({sha})+'\\n');
if (failed === 'true') process.exit(1);
`,
  );
  const coveredCommand = (sha, failed = false) => [
    process.execPath,
    covered,
    sha,
    String(failed),
  ];
  return {
    coveredCommand,
    count(sha) {
      if (!existsSync(executions)) return 0;
      return readFileSync(executions, "utf8")
        .trim()
        .split("\n")
        .map(JSON.parse)
        .filter((entry) => entry.sha === sha).length;
    },
    async runCovered(sha, failed = false) {
      const [command, ...args] = coveredCommand(sha, failed);
      const result = await exec(command, args, {
        cwd: fixture.execution,
      }).catch((error) => error);
      return { success: !(result instanceof Error), log: result.stdout };
    },
  };
}

// Keeps installed skills and project CI settings out of the checks' worktree.
export async function ignoreInstalledSkills(fixture) {
  const common = (
    await git(
      fixture.execution,
      "rev-parse",
      "--path-format=absolute",
      "--git-common-dir",
    )
  ).stdout.trim();
  appendFileSync(
    join(common, "info/exclude"),
    ".agents/\n.claude/\n.planning/open-dough.json\n",
  );
}
