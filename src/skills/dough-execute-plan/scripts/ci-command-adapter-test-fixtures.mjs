import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export const checkedSha = "c".repeat(40);

// A project whose controlled adapter answers pending, success, failure, then
// incomplete for `checkedSha`, counting its calls, beside a counting `gh`.
export function projectFixture(t, configuration) {
  const root = mkdtempSync(join(tmpdir(), "ci-command-adapter-test-"));
  const planning = join(root, ".planning");
  const bin = join(root, "bin");
  const requests = join(root, "adapter-requests.jsonl");
  const calls = join(root, "adapter-calls");
  const ghCalls = join(root, "gh-calls");
  mkdirSync(planning);
  mkdirSync(bin);
  const adapter = join(bin, "controlled-adapter.mjs");
  writeFileSync(
    adapter,
    `#!${process.execPath}
import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
let input = '';
for await (const chunk of process.stdin) input += chunk;
const request = JSON.parse(input);
appendFileSync(${JSON.stringify(requests)}, JSON.stringify(request) + '\\n');
const path = ${JSON.stringify(calls)};
const call = existsSync(path) ? Number(readFileSync(path, 'utf8')) + 1 : 1;
writeFileSync(path, String(call));
if (call === 1) writeFileSync('.planning/open-dough.json', JSON.stringify({ ciAdapter: [] }));
const attempt = call === 1
  ? { runId: 'run:opaque', attemptId: 'attempt/first', sha: ${JSON.stringify(checkedSha)}, outcome: 'pending', url: 'https://ci.example/run', time: '2026-09-15T10:00:00Z' }
  : call === 2
    ? { runId: 'run:opaque', attemptId: 'attempt/retry', sha: ${JSON.stringify(checkedSha)}, outcome: 'success', url: 'https://ci.example/run', time: '2026-09-15T10:01:00Z' }
    : call === 3
      ? { runId: 'run:opaque', attemptId: 'attempt:failed', sha: ${JSON.stringify(checkedSha)}, outcome: 'failure' }
      : { runId: 'run:opaque', attemptId: 'attempt:incomplete', sha: ${JSON.stringify(checkedSha)}, outcome: 'incomplete' };
process.stdout.write(JSON.stringify({ attempts: [attempt] }));
`,
  );
  chmodSync(adapter, 0o700);
  writeFileSync(
    join(bin, "gh"),
    `#!${process.execPath}\nimport { existsSync, readFileSync, writeFileSync } from 'node:fs';\nconst path = ${JSON.stringify(ghCalls)};\nconst count = existsSync(path) ? Number(readFileSync(path, 'utf8')) + 1 : 1;\nwriteFileSync(path, String(count));\nprocess.stdout.write('[]');\n`,
  );
  chmodSync(join(bin, "gh"), 0o700);
  if (configuration !== null)
    writeFileSync(
      join(planning, "open-dough.json"),
      JSON.stringify(configuration(adapter)),
    );
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return { root, adapter, requests, calls, ghCalls, bin };
}

export function callsReached(path, count) {
  return existsSync(path) && Number(readFileSync(path, "utf8")) >= count;
}
