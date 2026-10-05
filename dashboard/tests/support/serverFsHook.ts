// Replaces one `node:fs/promises` function inside a dashboard server process,
// so a spec can observe, hold, or fail the server's own file operations at a
// chosen point. The server imports the written module through the returned
// environment.

import { writeFileSync } from "node:fs";

// `replacement` is the source of the replacing async function. In it,
// `original` is the replaced function, `fs` is `node:fs`, and
// `await heldWhile(marker, ms)` waits while the file `marker` exists, at most
// `ms` milliseconds.
export function fsPromisesHook(
  module: string,
  name: "mkdir" | "rename" | "writeFile",
  replacement: string,
): { NODE_OPTIONS: string } {
  writeFileSync(
    module,
    `import fs from 'node:fs'; import promises from 'node:fs/promises'; import {syncBuiltinESMExports} from 'node:module';
const heldWhile = async (marker, ms) => {
 const deadline = Date.now() + ms;
 while (fs.existsSync(marker) && Date.now() < deadline) await new Promise((resolve) => setTimeout(resolve, 25));
};
const original = promises.${name};
promises.${name} = ${replacement};
syncBuiltinESMExports();`,
  );
  return { NODE_OPTIONS: `--import=${JSON.stringify(module)}` };
}
