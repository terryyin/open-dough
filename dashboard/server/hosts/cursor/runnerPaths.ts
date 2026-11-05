// Where this machine's Cursor runner accepts connections. The address file
// lives with the launch records, under HOME, so every dashboard server on
// this machine finds the same runner. The runner itself binds 127.0.0.1.
import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { z } from "zod";
import { machineDashboardDirectory } from "../../machineHome.ts";

const addressSchema = z.object({
  port: z.int().positive(),
  pid: z.int().positive(),
  // The build the runner is running (./runnerBuild.ts). Runners started
  // before build proof existed publish no identity; absence means stale.
  buildId: z.string().min(1).optional(),
  // The node-pty helper this process executes to open a terminal
  // (./runnerSpawnHelper.ts). Absence, or a path no longer on disk, means
  // this runner cannot open another terminal.
  spawnHelper: z.string().min(1).optional(),
});

export type CursorRunnerAddress = z.infer<typeof addressSchema>;

// Set by the starter (`runnerProcess.ts`) to the directory it created. The
// runner exits when that directory is already gone, instead of creating it
// again and outliving the home that was removed while it was still loading.
export const cursorRunnerDirectoryVariable =
  "OPEN_DOUGH_CURSOR_RUNNER_DIRECTORY";

export function cursorRunnerDirectory(home = homedir()): string {
  return machineDashboardDirectory(home);
}

export function cursorRunnerAddressFile(home = homedir()): string {
  return path.join(cursorRunnerDirectory(home), "cursor-runner.json");
}

export function cursorRunnerLockFile(home = homedir()): string {
  return path.join(cursorRunnerDirectory(home), "cursor-runner.lock");
}

// Session keys (`host:sessionId`) the runner last held. Machine-local
// operational evidence beside the address (ADR 0008): keep adds a key,
// deliberate hangup removes one, and process-exit hangups leave the set.
const lastHeldSchema = z.object({
  sessionKeys: z.array(z.string().min(1)),
});

export type CursorRunnerLastHeld = z.infer<typeof lastHeldSchema>;

export function cursorRunnerLastHeldFile(home = homedir()): string {
  return path.join(cursorRunnerDirectory(home), "cursor-runner-last-held.json");
}

export function readCursorRunnerAddress(
  home = homedir(),
): CursorRunnerAddress | undefined {
  try {
    const parsed = addressSchema.safeParse(
      JSON.parse(readFileSync(cursorRunnerAddressFile(home), "utf8")),
    );
    return parsed.success ? parsed.data : undefined;
  } catch {
    return undefined;
  }
}

// The session keys recorded for revive after a runner restart. Missing or
// unreadable evidence is an empty set — the revive path starts nothing.
export function readCursorRunnerLastHeld(home = homedir()): readonly string[] {
  try {
    const parsed = lastHeldSchema.safeParse(
      JSON.parse(readFileSync(cursorRunnerLastHeldFile(home), "utf8")),
    );
    return parsed.success ? parsed.data.sessionKeys : [];
  } catch {
    return [];
  }
}

// Atomic replace so a concurrent reader never sees a partial write (same
// shape the runner process uses when it first listens).
function writeAtomicJson(file: string, value: unknown): void {
  mkdirSync(path.dirname(file), { recursive: true });
  const temporary = `${file}.${String(process.pid)}.tmp`;
  writeFileSync(temporary, JSON.stringify(value));
  renameSync(temporary, file);
}

// Publishes the machine-local runner address.
export function writeCursorRunnerAddress(
  home: string,
  address: CursorRunnerAddress,
): void {
  writeAtomicJson(cursorRunnerAddressFile(home), address);
}

function writeCursorRunnerLastHeld(
  home: string,
  sessionKeys: readonly string[],
): void {
  writeAtomicJson(cursorRunnerLastHeldFile(home), {
    sessionKeys: [...sessionKeys],
  } satisfies CursorRunnerLastHeld);
}

// Keep publishes this session into last-held without dropping keys for
// sessions this runner is not holding right now (those remain candidates
// for revive after replacement).
export function rememberCursorRunnerLastHeld(
  sessionKey: string,
  home = homedir(),
): void {
  const keys = new Set(readCursorRunnerLastHeld(home));
  keys.add(sessionKey);
  writeCursorRunnerLastHeld(home, [...keys].sort());
}

// Deliberate Stop /hangup removes one key. Process-exit hangups must not
// call this — shutdown leaves the pre-shutdown held set recorded.
export function forgetCursorRunnerLastHeld(
  sessionKey: string,
  home = homedir(),
): void {
  writeCursorRunnerLastHeld(
    home,
    readCursorRunnerLastHeld(home).filter((key) => key !== sessionKey),
  );
}
