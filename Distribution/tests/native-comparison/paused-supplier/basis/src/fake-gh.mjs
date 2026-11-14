// Fake GitHub CLI reads for the checks. Each read starts its own node
// process and answers from the fixture it is given, as the real CLI would.
import { spawnSync } from "node:child_process";

export function answer(fixture, args) {
  const [noun, verb, id] = args;
  if (noun === "run" && verb === "list") return fixture.runs;
  if (noun === "run" && verb === "view") {
    return fixture.runs.find((run) => run.id === Number(id)) ?? null;
  }
  throw new Error(`unsupported read: ${args.join(" ")}`);
}

export function readFakeGh(fixture, args) {
  const program = [
    `import { answer } from ${JSON.stringify(import.meta.url)};`,
    "const [fixture, ...args] = process.argv.slice(1);",
    "process.stdout.write(JSON.stringify(answer(JSON.parse(fixture), args)));",
  ].join("\n");
  const result = spawnSync(
    process.execPath,
    ["--input-type=module", "-e", program, JSON.stringify(fixture), ...args],
    { encoding: "utf8" },
  );
  if (result.status !== 0) throw new Error(result.stderr);
  return JSON.parse(result.stdout);
}
