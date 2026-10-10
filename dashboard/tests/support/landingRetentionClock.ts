// Advance only the test server/record-operation clock; no landing metadata is seeded.
import { writeFileSync } from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { pathToFileURL } from "node:url";
import { repoRoot } from "./repositoryRoot.ts";
export function landingRetentionClock(machine: string) {
  const offset = path.join(machine, "landing-clock-offset");
  const module = path.join(machine, "landing-clock.mjs");
  writeFileSync(offset, "0");
  writeFileSync(
    module,
    `import fs from 'node:fs';
const OriginalDate = Date;
const offset = () => Number(fs.readFileSync(${JSON.stringify(offset)}, 'utf8'));
globalThis.Date = class extends OriginalDate {
 constructor(...args) { super(...(args.length ? args : [OriginalDate.now() + offset()])); }
 static now() { return OriginalDate.now() + offset(); }
};`,
  );
  const env = { NODE_OPTIONS: `--import=${JSON.stringify(module)}` };
  return {
    env,
    advanceDays: (days: number) => {
      writeFileSync(offset, String(days * 86_400_000));
    },
  };
}

export function dropExpiredAttempts(home: string, env: NodeJS.ProcessEnv) {
  const module = pathToFileURL(
    path.join(repoRoot, "dashboard/server/launchAttemptStore.ts"),
  ).href;
  return promisify(execFile)(
    process.execPath,
    [
      "--experimental-transform-types",
      "--input-type=module",
      "-e",
      `import {replaceAttempts} from ${JSON.stringify(module)}; await replaceAttempts(kept => kept);`,
    ],
    { env: { ...env, HOME: home, NODE_NO_WARNINGS: "1" } },
  );
}
