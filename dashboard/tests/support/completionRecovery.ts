// Reporting fault journeys keep transport substitution outside product persistence.
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createServer, request } from "node:http";
import { writeFileSync } from "node:fs";
import path from "node:path";
import type { DashboardServer } from "./dashboardServer.ts";
import { repoRoot } from "./repositoryRoot.ts";

const exec = promisify(execFile);
export const quote = (part: string) => `'${part.replaceAll("'", "'\\''")}'`;
export async function reportingChild(
  command: string,
  cwd: string,
  env = process.env,
) {
  try {
    return { ok: true, ...(await exec("bash", ["-c", command], { cwd, env })) };
  } catch (error) {
    return { ok: false, ...(error as { stdout: string; stderr: string }) };
  }
}
export function retainedSubmission(stderr: string): string {
  const file = /^Retained completion: (.+)$/m.exec(stderr)?.[1];
  if (file === undefined)
    throw new Error(`No retained reporting submission: ${stderr}`);
  return file;
}
export async function recordOperation(
  server: Pick<DashboardServer, "home">,
  operation: string,
  args: unknown[],
) {
  const url = new URL(
    `file://${path.join(repoRoot, "dashboard/server/launchRecordStore.ts")}`,
  ).href;
  return exec(
    process.execPath,
    [
      "--experimental-transform-types",
      "--input-type=module",
      "-e",
      `import {${operation}} from ${JSON.stringify(url)}; const args = JSON.parse(process.argv[1], (_key, value) => value === null ? undefined : value); console.log(JSON.stringify(await ${operation}(...args)));`,
      JSON.stringify(args),
    ],
    {
      env: { ...process.env, HOME: server.home, NODE_NO_WARNINGS: "1" },
    },
  );
}

// Forward with the original Host/Origin. Lose the client acknowledgment only
// AFTER the real receiver finished its persisted response, not before its write.
export async function completionProxy(origin: string, receiver: string) {
  let drop = false;
  let lost = 0;
  const server = createServer((req, res) => {
    const upstream = request(
      `${receiver}${req.url}`,
      { method: req.method, headers: req.headers },
      (answer) => {
        const chunks: Buffer[] = [];
        answer.on("data", (chunk: Buffer) => chunks.push(chunk));
        answer.on("end", () => {
          if (
            drop &&
            req.url === "/__agent-launch/completion" &&
            req.method === "POST"
          ) {
            drop = false;
            lost += 1;
            res.destroy();
            return;
          }
          res.writeHead(answer.statusCode ?? 500, answer.headers);
          res.end(Buffer.concat(chunks));
        });
      },
    );
    upstream.on("error", () => res.destroy());
    req.pipe(upstream);
  });
  await new Promise<void>((resolve) =>
    server.listen(Number(new URL(origin).port), "127.0.0.1", resolve),
  );
  return {
    dropNext() {
      drop = true;
    },
    lost: () => lost,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.closeAllConnections();
        server.close((error) => {
          if (error) reject(error);
          else resolve();
        });
      }),
  };
}

export function completionWriteFault(machine: string) {
  const marker = path.join(machine, "completion-write-fault");
  const loader = path.join(machine, "completion-write-fault.mjs");
  writeFileSync(
    loader,
    `import fs from 'node:fs'; import promises from 'node:fs/promises'; import {syncBuiltinESMExports} from 'node:module';
const original = promises.writeFile;
promises.writeFile = async (file, ...args) => {
 if (String(file).includes('/agent-launches.json.') && String(file).endsWith('.tmp') && fs.existsSync(${JSON.stringify(marker)})) {
  fs.unlinkSync(${JSON.stringify(marker)}); throw Object.assign(new Error('Injected record write EIO'), {code:'EIO'});
 }
 return original(file, ...args);
}; syncBuiltinESMExports();`,
  );
  return {
    arm() {
      writeFileSync(marker, "fault\n");
    },
    env: { NODE_OPTIONS: `--import=${JSON.stringify(loader)}` },
  };
}

export async function countedGit(machine: string) {
  const real = (await exec("which", ["git"])).stdout.trim();
  const log = path.join(machine, "completion-git.log");
  const bin = path.join(machine, "completion-bin");
  const { mkdirSync } = await import("node:fs");
  mkdirSync(bin);
  writeFileSync(
    path.join(bin, "git"),
    `#!/bin/sh\nprintf '%s\\n' "$*" >> ${quote(log)}\nexec ${quote(real)} "$@"\n`,
    { mode: 0o755 },
  );
  return {
    log,
    env: { ...process.env, PATH: `${bin}:${process.env["PATH"] ?? ""}` },
  };
}
