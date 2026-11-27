// A dashboard server started as a deployment's is, by `npm run`: a created
// `node_modules/.bin` directory and npm's `node-gyp-bin` first on its PATH,
// npm's `npm_*` variables and `INIT_CWD`, and one pass-through marker. Vite
// sets `NODE_ENV` inside the server itself, in both modes. The expectation
// reads a fake host's recorded environment for the launch environment rule
// (`../../server/developerShellEnvironment.ts`): every start-up addition
// removed, the fake's own directory and the rest kept. Each caller asserts
// the violations empty with its own runner's `expect`.

import { mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fakeClaudeHost } from "./fakeClaude.ts";

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

// The fake host a record came from: the directory it is installed in, kept
// on PATH, and the variable that wires it to its spec, kept too. The fake
// `claude` (./fakeClaude.ts) by default.
export type FakeHostWiring = {
  readonly binDir: string;
  readonly wiring: string;
};

export function developerShellViolations(
  env: Readonly<Record<string, string>> | undefined,
  host: FakeHostWiring = fakeClaudeHost,
): string[] {
  if (env === undefined) return ["no recorded environment"];
  const violations: string[] = [];
  for (const key of Object.keys(env))
    if (key.startsWith("npm_")) violations.push(`kept ${key}`);
  for (const key of ["NODE_ENV", "INIT_CWD"])
    if (env[key] !== undefined) violations.push(`kept ${key}`);
  // The start's PATH directories, and any other npm put there, are gone.
  const entries = (env["PATH"] ?? "").split(path.delimiter);
  for (const entry of entries)
    if (
      entry.endsWith("node-gyp-bin") ||
      entry.endsWith(`node_modules${path.sep}.bin`)
    )
      violations.push(`kept PATH entry ${entry}`);
  // The fake's own directory stays on PATH.
  if (!entries.some((entry) => path.basename(entry) === host.binDir))
    violations.push(`lost PATH entry ${host.binDir}`);
  if (env["DOUGH_SPEC_PASSTHROUGH"] !== passThroughMarker)
    violations.push("lost DOUGH_SPEC_PASSTHROUGH");
  if (typeof env[host.wiring] !== "string")
    violations.push(`lost ${host.wiring}`);
  return violations;
}
