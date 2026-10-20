// Where this machine's Cursor runner accepts connections. The address file
// lives with the launch records, under HOME, so every dashboard server on
// this machine finds the same runner. The runner itself binds 127.0.0.1.
import { readFileSync } from "node:fs";
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
});

export type CursorRunnerAddress = z.infer<typeof addressSchema>;

export function cursorRunnerDirectory(home = homedir()): string {
  return machineDashboardDirectory(home);
}

export function cursorRunnerAddressFile(home = homedir()): string {
  return path.join(cursorRunnerDirectory(home), "cursor-runner.json");
}

export function cursorRunnerLockFile(home = homedir()): string {
  return path.join(cursorRunnerDirectory(home), "cursor-runner.lock");
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
