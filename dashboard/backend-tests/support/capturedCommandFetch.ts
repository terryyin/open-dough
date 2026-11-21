// Runs a shell command whose Node `fetch` is captured instead of sent, and
// answers the one request it made, as the dashboard would admit it.
import { execFile } from "node:child_process";
import fs from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";
import type { BranchEntryRequestAdmission } from "../../server/sessionBranchEntry.ts";

const runShell = promisify(execFile);

type CapturedFetch = BranchEntryRequestAdmission & {
  readonly url: string;
};

export async function captureBranchEntryCommand(
  command: string,
  cwd: string,
): Promise<CapturedFetch> {
  const dir = fs.mkdtempSync(path.join(tmpdir(), "dough-branch-handoff-"));
  try {
    const preload = path.join(dir, "capture-fetch.mjs");
    const captured = path.join(dir, "captured.json");
    fs.writeFileSync(
      preload,
      `import { writeFileSync } from "node:fs";
globalThis.fetch = (input, init) => {
  const url = new URL(input instanceof Request ? input.url : String(input));
  const origin = new Headers(init?.headers).get("Origin");
  const bodyText = typeof init?.body === "string" ? init.body : "";
  writeFileSync(process.env.CAPTURED_FETCH ?? "", JSON.stringify({ url: url.href, route: url.pathname, method: init?.method, origin, host: url.host, bodyText }));
  return Promise.resolve(new Response("{}", { status: 200 }));
};\n`,
    );
    await runShell("/bin/sh", ["-c", command], {
      cwd,
      env: {
        ...process.env,
        NODE_OPTIONS: `--import=${pathToFileURL(preload).href}`,
        CAPTURED_FETCH: captured,
      },
    });
    return JSON.parse(fs.readFileSync(captured, "utf8")) as CapturedFetch;
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}
