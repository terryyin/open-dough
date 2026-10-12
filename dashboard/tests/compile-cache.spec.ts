import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import * as nodeModule from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test } from "./support/pageTest.ts";
import { endGroup, spawnGroupLeader } from "./support/processGroup.ts";

function cacheEntries(directory: string) {
  return readdirSync(directory, { recursive: true, encoding: "utf8" })
    .sort()
    .map((entry) => {
      const file = path.join(directory, entry);
      return {
        entry,
        hash: statSync(file).isFile()
          ? createHash("sha256").update(readFileSync(file)).digest("hex")
          : null,
      };
    });
}

test("suite descendants leave existing compile caches intact after repeated, overlapping, failed and interrupted attempts", async () => {
  // Node 20, which the repository supports, has no compile-cache API.
  const { enableCompileCache, flushCompileCache } = nodeModule as Partial<
    typeof nodeModule
  >;
  test.skip(
    typeof enableCompileCache !== "function" ||
      typeof flushCompileCache !== "function",
    "This Node version has no compile-cache API",
  );
  const root = mkdtempSync(path.join(tmpdir(), "dough-cache-"));
  const caches = [
    path.join(root, "first-cache"),
    path.join(root, "second-cache"),
  ] as const;
  let sequence = 0;
  const children: ReturnType<typeof spawnGroupLeader>[] = [];
  try {
    for (const cache of caches) {
      mkdirSync(cache);
      writeFileSync(
        path.join(cache, "unrelated-entry"),
        "another session's cache",
      );
    }
    function attempt(cache: string, mode: "pass" | "fail" | "hold") {
      // Fresh paths force new keys if the policy disappears. Both an explicit
      // inherited cache location and an explicit enable/flush are attempted.
      const moduleFile = path.join(root, `module-${sequence++}.cjs`);
      writeFileSync(
        moduleFile,
        "module.exports = Array.from({length: 100}, (_, i) => i * i);\n",
      );
      const env: NodeJS.ProcessEnv = {
        ...process.env,
        NODE_COMPILE_CACHE: cache,
      };
      return {
        args: [
          "--eval",
          `const cache = require('node:module');
cache.enableCompileCache(${JSON.stringify(cache)});
require(${JSON.stringify(moduleFile)});
cache.flushCompileCache();
process.stdout.write('compiled\\n');
${mode === "hold" ? "setInterval(() => {}, 1000);" : `process.exitCode = ${mode === "fail" ? 17 : 0};`}`,
        ],
        env,
      };
    }
    function completed(cache: string, mode: "pass" | "fail", outside = false) {
      const { args, env } = attempt(cache, mode);
      // A positive control outside the suite policy establishes that this
      // runtime really writes cache files. Suite probes never supply disable.
      if (outside) {
        delete env["NODE_DISABLE_COMPILE_CACHE"];
      }
      const result = spawnSync(process.execPath, args, {
        env,
        encoding: "utf8",
      });
      expect(result.error).toBeUndefined();
      expect(result.signal).toBeNull();
      expect(result.status, result.stderr).toBe(mode === "fail" ? 17 : 0);
      expect(result.stdout).toBe("compiled\n");
      expect(result.stderr).toBe("");
    }
    completed(caches[0], "pass", true);
    expect(
      cacheEntries(caches[0]).filter(({ hash }) => hash !== null).length,
    ).toBeGreaterThan(1);
    const existing = caches.map(cacheEntries);
    const unchanged = () => {
      expect(caches.map(cacheEntries)).toEqual(existing);
    };

    completed(caches[0], "pass");
    unchanged();
    completed(caches[0], "pass");
    unchanged();
    completed(caches[0], "fail");
    unchanged();

    // Keep both children alive after their flush opportunity, proving actual
    // overlap before signalling either. Every started process is owned here.
    const running = caches.map((cache) => {
      const { args, env } = attempt(cache, "hold");
      const child = spawnGroupLeader(process.execPath, args, { env });
      children.push(child);
      let output = "";
      let error = "";
      child.stdout.on("data", (chunk: Buffer) => {
        output += chunk.toString();
      });
      child.stderr.on("data", (chunk: Buffer) => {
        error += chunk.toString();
      });
      const exited = new Promise<{
        code: number | null;
        signal: NodeJS.Signals | null;
      }>((resolve, reject) => {
        child.once("error", reject);
        child.once("close", (code, signal) => {
          resolve({ code, signal });
        });
      });
      void exited.catch(() => undefined);
      return { child, output: () => output, error: () => error, exited };
    });
    for (const run of running) {
      await expect.poll(run.output).toBe("compiled\n");
      expect(run.child.exitCode).toBeNull();
      expect(run.child.signalCode).toBeNull();
    }
    unchanged();
    for (const run of running) {
      await endGroup(run.child);
      expect(await run.exited).toEqual({ code: null, signal: "SIGTERM" });
      expect(run.error()).toBe("");
      unchanged();
    }
    completed(caches[0], "pass");
    unchanged();
  } finally {
    for (const child of children) {
      await endGroup(child);
    }
    rmSync(root, { recursive: true, force: true });
  }
});
