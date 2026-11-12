import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { checkedSha } from "./ci-command-adapter-test-fixtures.mjs";
// An adapter, run in its own folder, that records its request there and
// answers the text from answer.json unless the response is held open.
export function attemptAdapter(t, read) {
  const root = mkdtempSync(join(tmpdir(), "ci-command-adapter-proof-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const adapter = join(root, "proof-adapter.mjs");
  writeFileSync(
    adapter,
    `import { readFileSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:net';
let input = '';
for await (const chunk of process.stdin) input += chunk;
writeFileSync('request.json', input);
const answer = readFileSync('answer.json', 'utf8');
if (answer === 'hold') createServer().listen(0, '127.0.0.1');
else process.stdout.write(answer);
`,
  );
  const check = { repo: "owner/project", branch: "main" };
  const attempt = { runId: "r1", attemptId: "9f1c", sha: checkedSha };
  const ask = (answer, options = {}) => {
    writeFileSync(join(root, "answer.json"), answer);
    return read([process.execPath, adapter], check, attempt, {
      signal: new AbortController().signal,
      cwd: root,
      ...options,
    });
  };
  return { root, adapter, ask };
}
