// Nested Playwright runs that record committed proof inside a temporary Git
// checkout with its own `.planning/open-dough.json`, specs and proof directory.
import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { repoRoot } from "./repositoryRoot.ts";
import {
  proofDirectory,
  removeProofDirectories,
  startProofRun,
} from "./proofRecordRun.ts";

const checkouts: string[] = [];

export function removeSnapshotCheckouts(): void {
  removeProofDirectories();
  for (const directory of checkouts) {
    rmSync(directory, { recursive: true, force: true });
  }
  checkouts.length = 0;
}

function git(cwd: string, args: readonly string[]): string {
  const result = spawnSync("git", args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (result.status !== 0) {
    throw new Error(`git ${args.join(" ")} failed: ${result.stderr}`);
  }
  return result.stdout.trim();
}

export type SnapshotCheckout = {
  readonly root: string;
  readonly specs: string;
  readonly proof: string;
  head: () => string;
  writeSpec: (name: string, source: string) => string;
  writeHelper: (name: string, source: string) => string;
  readProof: () =>
    { version: number; observations: ProofObservation[] } | undefined;
  fileBlob: (relativeFile: string) => string;
};

export type ProofObservation = {
  file: string;
  test: string[];
  project?: string;
  outcome: string;
  attempts: number;
  durationMs: number;
  finishedAt: string;
  commit: string;
  fileBlob: string;
};

export function snapshotCheckout(
  openDough: Readonly<Record<string, unknown>> = {
    intent: {
      locations: [
        {
          path: "specs",
          kind: "typescript",
          include: ["**/*.spec.ts"],
          runner: "playwright",
          proof: "proof",
        },
      ],
    },
  },
): SnapshotCheckout {
  const root = mkdtempSync(path.join(tmpdir(), "dashboard-proof-snapshot-"));
  checkouts.push(root);
  git(root, ["init"]);
  git(root, ["config", "user.email", "proof-snapshot@example.com"]);
  git(root, ["config", "user.name", "Proof Snapshot"]);
  // Specs import `@playwright/test`; resolve it from this repository.
  symlinkSync(
    path.join(repoRoot, "node_modules"),
    path.join(root, "node_modules"),
  );
  writeFileSync(path.join(root, ".gitignore"), "node_modules\n");
  mkdirSync(path.join(root, ".planning"), { recursive: true });
  mkdirSync(path.join(root, "specs"), { recursive: true });
  writeFileSync(
    path.join(root, ".planning", "open-dough.json"),
    `${JSON.stringify(openDough, null, 2)}\n`,
  );
  writeFileSync(
    path.join(root, "specs", "seed.spec.ts"),
    `import { test } from "@playwright/test";\ntest("seed", () => {});\n`,
  );
  git(root, ["add", ".gitignore", ".planning", "specs"]);
  git(root, ["commit", "-m", "seed"]);
  function writeUnderSpecs(name: string, source: string): string {
    const file = path.join(root, "specs", name);
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, source);
    git(root, ["add", path.join("specs", name)]);
    git(root, ["commit", "-m", `add ${name}`]);
    return file;
  }
  return {
    root,
    specs: path.join(root, "specs"),
    proof: path.join(root, "proof"),
    head: () => git(root, ["rev-parse", "HEAD"]),
    writeSpec: writeUnderSpecs,
    writeHelper: writeUnderSpecs,
    readProof() {
      const file = path.join(root, "proof", "latest.json");
      if (!existsSync(file)) return undefined;
      return JSON.parse(readFileSync(file, "utf8")) as {
        version: number;
        observations: ProofObservation[];
      };
    },
    fileBlob(relativeFile) {
      return git(root, ["hash-object", relativeFile]);
    },
  };
}

export function startSnapshotRun(options: {
  checkout: SnapshotCheckout;
  spec: string | string[];
  snapshot?: boolean;
  recordPath?: string | false;
  config?: Readonly<Record<string, unknown>>;
  args?: string[];
  env?: Readonly<Record<string, string>>;
  directory?: string;
}) {
  const directory = options.directory ?? proofDirectory();
  return startProofRun({
    directory,
    cwd: options.checkout.root,
    testDir: options.checkout.specs,
    spec: options.spec,
    ...(options.snapshot === undefined ? {} : { snapshot: options.snapshot }),
    recordPath: options.recordPath ?? false,
    ...(options.config === undefined ? {} : { config: options.config }),
    ...(options.args === undefined ? {} : { args: options.args }),
    ...(options.env === undefined ? {} : { env: options.env }),
  });
}

export function nongitCheckout(): string {
  const root = mkdtempSync(path.join(tmpdir(), "dashboard-proof-nongit-"));
  checkouts.push(root);
  symlinkSync(
    path.join(repoRoot, "node_modules"),
    path.join(root, "node_modules"),
  );
  mkdirSync(path.join(root, ".planning"), { recursive: true });
  mkdirSync(path.join(root, "specs"), { recursive: true });
  writeFileSync(
    path.join(root, ".planning", "open-dough.json"),
    `${JSON.stringify(
      {
        intent: {
          locations: [
            {
              path: "specs",
              kind: "typescript",
              runner: "playwright",
              proof: "proof",
            },
          ],
        },
      },
      null,
      2,
    )}\n`,
  );
  writeFileSync(
    path.join(root, "specs", "plain.spec.ts"),
    `import { test } from "@playwright/test";\ntest("plain", () => {});\n`,
  );
  return root;
}
