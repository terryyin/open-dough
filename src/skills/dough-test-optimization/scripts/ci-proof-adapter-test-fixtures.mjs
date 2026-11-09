// A CI adapter for the tests of readings through one: the shared CI proof
// read's (./ci-proof-read-adapter.test.mjs) and a lead reading's
// (./ci-proof-leads-adapter.test.mjs, ./ci-proof-leads-cli.test.mjs). It
// answers literal wire JSON from its own folder and keeps each request it
// was asked.
import {
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * A CI adapter in its own folder, removed after test T, answering each
 * operation with the literal text ANSWERS names for it, or exiting with
 * status 3 and STDERR when it names none. `command` is its ciAdapter
 * setting; `requests()` the requests it was asked, in order.
 * @param {{ after: (fn: () => void) => void }} t
 * @param {Readonly<Record<string, string>>} answers
 * @param {string} [stderr]
 */
export function adapterAnswering(t, answers, stderr = "no CI service") {
  const folder = realpathSync(mkdtempSync(join(tmpdir(), "ci-proof-adapter-")));
  t.after(() => rmSync(folder, { recursive: true, force: true }));
  writeFileSync(join(folder, "answers.json"), JSON.stringify(answers));
  writeFileSync(join(folder, "requests.jsonl"), "");
  const script = join(folder, "adapter.mjs");
  writeFileSync(
    script,
    `import { appendFileSync, readFileSync } from "node:fs";
let request = "";
for await (const chunk of process.stdin) request += chunk;
appendFileSync(${JSON.stringify(join(folder, "requests.jsonl"))}, request);
const answers = JSON.parse(readFileSync(${JSON.stringify(join(folder, "answers.json"))}, "utf8"));
const answer = answers[JSON.parse(request).operation];
if (answer === undefined) {
  process.stderr.write(${JSON.stringify(`${stderr}\n`)});
  process.exit(3);
}
process.stdout.write(answer);
`,
  );
  return {
    command: [process.execPath, script],
    requests: () =>
      readFileSync(join(folder, "requests.jsonl"), "utf8")
        .split("\n")
        .filter((line) => line !== "")
        .map((line) => JSON.parse(line)),
  };
}
