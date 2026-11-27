// Locked development inputs reuse this checkout's packages while each fixture
// keeps its writable caches private. A changed lock's real `npm ci` is proven
// in e2e/runtime/published-development-install.spec.ts.
import {
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test } from "vitest";
import {
  developmentInputsLocked,
  linkInstalledDevelopmentRuntime,
  type DevelopmentInputs,
} from "../../test-support/support/publishedDevelopmentRuntime.ts";

const vite = { version: "7.0.0", integrity: "sha512-vite" };
const devDependencies = { vite: "^7.0.0" };
const sourceLock = JSON.stringify({
  packages: {
    "": { devDependencies },
    "node_modules/vite": vite,
    "node_modules/fsevents": { version: "2.3.3", optional: true },
  },
});
const locked: DevelopmentInputs = {
  sourceLock,
  fixtureLock: sourceLock,
  installed: { packages: { "node_modules/vite": vite } },
  fixture: { devDependencies },
  installedVersion: () => vite.version,
};

test.for([
  { inputs: "match the installed lock", change: {}, reused: true },
  {
    inputs: "carry a changed lock",
    change: { fixtureLock: "{}" },
    reused: false,
  },
  {
    inputs: "declare other dev dependencies",
    change: { fixture: { devDependencies: { vite: "^6.0.0" } } },
    reused: false,
  },
  {
    inputs: "meet a differently installed package",
    change: { installedVersion: () => "6.0.0" },
    reused: false,
  },
  {
    inputs: "meet an installed package the lock omits",
    change: {
      installed: {
        packages: { "node_modules/vite": vite, "node_modules/extra": vite },
      },
    },
    reused: false,
  },
  {
    inputs: "meet a missing required package",
    change: { installed: { packages: {} } },
    reused: false,
  },
] satisfies {
  inputs: string;
  change: Partial<DevelopmentInputs>;
  reused: boolean;
}[])(
  "development inputs that $inputs are reused: $reused",
  ({ change, reused }) => {
    expect(developmentInputsLocked({ ...locked, ...change })).toBe(reused);
  },
);

test("a reused development runtime links installed packages and keeps its caches private", async () => {
  const root = mkdtempSync(path.join(tmpdir(), "dough-development-runtime-"));
  try {
    const installed = path.join(root, "installed");
    for (const entry of ["vite", ".bin", ".vite"])
      mkdirSync(path.join(installed, entry), { recursive: true });
    const development = path.join(root, "development");
    mkdirSync(development);

    await linkInstalledDevelopmentRuntime(development, installed);

    const modules = path.join(development, "node_modules");
    expect(lstatSync(modules).isSymbolicLink()).toBe(false);
    expect(lstatSync(path.join(modules, "vite")).isSymbolicLink()).toBe(true);
    expect(lstatSync(path.join(modules, ".bin")).isSymbolicLink()).toBe(true);
    expect(existsSync(path.join(modules, ".vite"))).toBe(false);
    mkdirSync(path.join(modules, ".vite-temp"));
    writeFileSync(path.join(modules, ".vite-temp", "private"), "fixture only");
    expect(existsSync(path.join(installed, ".vite-temp"))).toBe(false);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
