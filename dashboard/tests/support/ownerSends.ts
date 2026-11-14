// Notes, inside a dashboard server process, each read that process hands to
// its GitHub request owner's connection
// (`../../../Distribution/src/skills/dough-execute-plan/scripts/github-request-owner-link.mjs`),
// so a spec can wait until a read is queued at the owner instead of waiting
// for time to pass. Only the argument array of each numbered read is noted,
// never a greeting or its caller token. The server imports the written module
// through the returned environment.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

export type OwnerSends = {
  readonly env: { readonly NODE_OPTIONS: string };
  // How many reads handed to an owner so far have an argument naming `part`.
  readonly asked: (part: string) => number;
};

// Writes the hook under `folder`, which it notes into.
export function ownerSends(folder: string): OwnerSends {
  mkdirSync(folder, { recursive: true });
  const log = path.join(folder, "owner-sends.jsonl");
  const module = path.join(folder, "owner-sends.mjs");
  writeFileSync(log, "");
  writeFileSync(
    module,
    `import fs from 'node:fs'; import net from 'node:net';
const write = net.Socket.prototype.write;
const askedIn = (chunk) => {
 if (typeof chunk !== 'string' || !chunk.startsWith('{"id":') || !chunk.endsWith('\\n')) return undefined;
 try { const args = JSON.parse(chunk)?.request?.args; return Array.isArray(args) ? args : undefined; } catch { return undefined; }
};
net.Socket.prototype.write = function (chunk, ...rest) {
 const written = write.call(this, chunk, ...rest);
 const args = askedIn(chunk);
 if (args !== undefined) fs.appendFileSync(${JSON.stringify(log)}, JSON.stringify(args) + '\\n');
 return written;
};`,
  );
  return {
    env: { NODE_OPTIONS: `--import=${JSON.stringify(module)}` },
    asked: (part) =>
      readFileSync(log, "utf8")
        .split("\n")
        .filter((line) => line.length > 0)
        .map((line) => JSON.parse(line) as string[])
        .filter((args) => args.some((arg) => arg.includes(part))).length,
  };
}
