// One immutable production-component bundle per run; every page owns its state.
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ownedProcess } from "../../server/productionProcess.mjs";
import { repoRoot } from "./repositoryRoot.ts";
import { requestRunArtifact } from "./runArtifacts.ts";

const key = "intent-comparison-mount";

export function comparisonMountArtifact() {
  return [
    key,
    {
      create: () => mkdtempSync(path.join(tmpdir(), "dough-comparison-mount-")),
      async prepare(outDir: string, signal: AbortSignal) {
        const build = ownedProcess(
          process.execPath,
          [
            fileURLToPath(
              new URL("./comparisonMountBuild.mjs", import.meta.url),
            ),
            outDir,
          ],
          { cwd: repoRoot, signal },
        );
        const result = await build.exited;
        signal.throwIfAborted();
        if (result.code !== 0) {
          throw new Error(`Comparison mount build failed: ${build.output()}`);
        }
      },
    },
  ] as const;
}

export async function comparisonMountBuild(): Promise<string> {
  const directory = await requestRunArtifact(key);
  if (directory === undefined) {
    throw new Error("The comparison mount needs the run's artifact owner");
  }
  return directory;
}
