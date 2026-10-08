// A dashboard server started as a deployment's is, by `npm run`: a created
// `node_modules/.bin` directory and npm's `node-gyp-bin` first on its PATH,
// npm's `npm_*` variables and `INIT_CWD`, and one pass-through marker. Vite
// sets `NODE_ENV` inside the server itself, in both modes. The expectation
// reads a host's recorded environment (`ClaudeEnvironment`) for the launch
// environment rule (`../../server/developerShellEnvironment.ts`): every
// start-up addition removed, the fake's own directory and the rest kept.

import { mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { expect } from "@playwright/test";
import type { ClaudeEnvironment } from "./fakeClaude.ts";

export const passThroughMarker = "kept-from-the-dashboard";

export type DeploymentLikeStart = {
  readonly pathPrefix: readonly string[];
  readonly extraEnv: Readonly<Record<string, string>>;
  // Creates the PATH directories under the root, before the server starts.
  create(): void;
  remove(): void;
};

// The start of a deployment installed at `root`, a directory the caller
// chooses and this removes.
export function deploymentLikeStart(root: string): DeploymentLikeStart {
  const npmBin = path.join(root, "node_modules", ".bin");
  const nodeGypBin = path.join(
    root,
    "node_modules",
    "@npmcli",
    "run-script",
    "lib",
    "node-gyp-bin",
  );
  return {
    pathPrefix: [nodeGypBin, npmBin],
    extraEnv: {
      npm_lifecycle_event: "preview:dashboard",
      npm_config_local_prefix: root,
      INIT_CWD: root,
      DOUGH_SPEC_PASSTHROUGH: passThroughMarker,
    },
    create() {
      mkdirSync(npmBin, { recursive: true });
      mkdirSync(nodeGypBin, { recursive: true });
    },
    remove() {
      rmSync(root, { recursive: true, force: true });
    },
  };
}

export function expectDeveloperShellEnvironment(
  env: ClaudeEnvironment | undefined,
): void {
  expect(env).toBeDefined();
  const recorded = env ?? {};
  expect(Object.keys(recorded).filter((key) => key.startsWith("npm_"))).toEqual(
    [],
  );
  expect(recorded["NODE_ENV"]).toBeUndefined();
  expect(recorded["INIT_CWD"]).toBeUndefined();
  // The start's PATH directories, and any other npm put there, are gone.
  const entries = (recorded["PATH"] ?? "").split(path.delimiter);
  expect(entries.filter((entry) => entry.endsWith("node-gyp-bin"))).toEqual([]);
  expect(
    entries.filter((entry) => entry.endsWith(`node_modules${path.sep}.bin`)),
  ).toEqual([]);
  // The fake `claude`'s own directory (./fakeClaude.ts) stays on PATH.
  expect(entries.map((entry) => path.basename(entry))).toContain("claude-bin");
  expect(recorded["DOUGH_SPEC_PASSTHROUGH"]).toBe(passThroughMarker);
  expect(recorded["FAKE_CLAUDE_DIR"]).toEqual(expect.any(String));
}
