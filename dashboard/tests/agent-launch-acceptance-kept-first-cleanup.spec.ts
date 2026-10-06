// Runs the kept-first spec's own setup and teardown under Playwright. Only
// setup is perturbed: the actual preview exits, or an acquired cleanup throws.
import { spawn } from "node:child_process";
import type { JSONReport } from "@playwright/test/reporter";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test } from "./support/pageTest.ts";
import { repoRoot } from "./support/repositoryRoot.ts";

const specFile = path.join(
  repoRoot,
  "dashboard/tests/agent-launch-acceptance-kept-first.spec.ts",
);

for (const failure of ["preview", "release"] as const) {
  test(`kept-first teardown cleans acquired resources after ${failure} fails`, async () => {
    test.setTimeout(60_000);
    const workDir = mkdtempSync(path.join(tmpdir(), "kept-first-cleanup-"));
    writeFileSync(path.join(workDir, "package.json"), '{"type":"module"}\n');
    const machineFile = path.join(workDir, "machine");
    const closedFile = path.join(workDir, "server-closed");
    const pidFile = path.join(workDir, "server-pid");
    const reportFile = path.join(workDir, "report.json");
    const preload = path.join(workDir, "fail-preview.cjs");
    writeFileSync(preload, 'throw new Error("controlled preview failure");\n');

    let source = readFileSync(specFile, "utf8").replace(
      /from "(\.\/[^"\n]+)"/g,
      (statement: string, relative: string) =>
        statement.replace(
          relative,
          path.resolve(path.dirname(specFile), relative),
        ),
    );
    source = source.replace(
      "origin = await startOrigin();",
      `origin = await startOrigin();\n    writeFileSync(${JSON.stringify(machineFile)}, origin.machine);`,
    );
    if (failure === "preview") {
      source = source.replace(
        "extraEnv: keepHold(),",
        `extraEnv: { ...keepHold(), NODE_OPTIONS: ${JSON.stringify(`--require=${preload}`)} },`,
      );
    } else {
      source = source.replace(
        "push = origin.holdPushes();",
        `push = origin.holdPushes();\n    writeFileSync(${JSON.stringify(pidFile)}, String(server.pid));\n    const close = server.close;\n    server.close = async () => { await close(); writeFileSync(${JSON.stringify(closedFile)}, "closed"); };\n    push.release = () => { throw new Error("controlled release failure"); };`,
      );
      source = source.replace(
        "  test.afterEach",
        '  test.beforeEach(() => { throw new Error("controlled setup failure"); });\n\n  test.afterEach',
      );
    }
    const substitute = path.join(workDir, "kept-first.spec.ts");
    writeFileSync(substitute, source);
    const configFile = path.join(workDir, "playwright.config.mjs");
    writeFileSync(
      configFile,
      `export default ${JSON.stringify({ testDir: workDir, testMatch: "kept-first.spec.ts", outputDir: path.join(workDir, "results"), workers: 1, retries: 0, reporter: [["json", { outputFile: reportFile }]], timeout: 30_000 })};\n`,
    );
    const env = Object.fromEntries(
      Object.entries(process.env).filter(
        ([name]) => !name.startsWith("TEST_") && !name.startsWith("PW_"),
      ),
    );
    let machine: string | undefined;
    let processCleanupError: unknown;
    try {
      const child = spawn(
        path.join(repoRoot, "node_modules/.bin/playwright"),
        ["test", "--config", configFile],
        { cwd: repoRoot, env, stdio: ["ignore", "pipe", "pipe"] },
      );
      const output: Buffer[] = [];
      child.stdout.on("data", (chunk: Buffer) => output.push(chunk));
      child.stderr.on("data", (chunk: Buffer) => output.push(chunk));
      const status = await new Promise<number | null>((resolve, reject) => {
        child.on("error", reject);
        child.on("close", resolve);
      });
      const outputText = Buffer.concat(output).toString("utf8");
      expect(existsSync(machineFile), outputText).toBe(true);
      const jsonReport = JSON.parse(
        readFileSync(reportFile, "utf8"),
      ) as JSONReport;
      const result =
        jsonReport.suites[0]?.suites?.[0]?.specs[0]?.tests[0]?.results[0];
      const report =
        result?.errors.map((error) => error.message).join("\n") ?? "";
      machine = readFileSync(machineFile, "utf8");
      expect(status).toBe(1);
      expect(report).toContain(
        failure === "preview"
          ? "controlled preview failure"
          : "controlled setup failure",
      );
      expect(report).not.toContain("Cannot read properties of undefined");
      expect(existsSync(machine)).toBe(false);
      if (failure === "release") {
        expect(report).toContain("controlled release failure");
        expect(existsSync(closedFile)).toBe(true);
      }
    } finally {
      if (existsSync(pidFile) && !existsSync(closedFile)) {
        try {
          process.kill(-Number(readFileSync(pidFile, "utf8")), "SIGTERM");
        } catch (error) {
          if ((error as NodeJS.ErrnoException).code !== "ESRCH")
            processCleanupError = error;
        }
      }
      if (machine === undefined && existsSync(machineFile))
        machine = readFileSync(machineFile, "utf8");
      if (machine !== undefined)
        rmSync(machine, { recursive: true, force: true });
      rmSync(workDir, { recursive: true, force: true });
    }
    expect(processCleanupError).toBeUndefined();
  });
}
