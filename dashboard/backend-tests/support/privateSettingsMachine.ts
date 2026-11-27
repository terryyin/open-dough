// The machine an in-process local settings boundary runs against in this
// worker: a private HOME, `gh` and `claude` on PATH that record any call and
// fail, an environment OpenAI key no boundary may import, every fetch recorded
// and refused, and console output captured. `close()` restores all of it.
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { vi } from "vitest";
import { withRestoredEnv } from "../../test-support/support/testEnv.ts";

export type PrivateSettingsMachine = {
  // `<command> <args>` lines, one per `gh` or `claude` call.
  readonly commandCalls: () => string;
  // The host of every fetch.
  readonly egress: readonly string[];
  // One line per console call.
  readonly logged: readonly string[];
  readonly close: () => void;
};

export function privateSettingsMachine(): PrivateSettingsMachine {
  const machine = mkdtempSync(path.join(tmpdir(), "dough-settings-boundary-"));
  const bin = path.join(machine, "bin");
  const calls = path.join(machine, "command-calls");
  mkdirSync(bin);
  writeFileSync(calls, "");
  for (const command of ["gh", "claude"])
    writeFileSync(
      path.join(bin, command),
      `#!/bin/sh\necho "${command} $*" >> "${calls}"\nexit 1\n`,
      { mode: 0o755 },
    );
  const restoreEnv = withRestoredEnv({
    HOME: path.join(machine, "home"),
    PATH: `${bin}${path.delimiter}${process.env["PATH"] ?? ""}`,
    OPENAI_API_KEY: "synthetic-environment-key-must-not-import",
  });
  const egress: string[] = [];
  const logged: string[] = [];
  const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
    egress.push(
      new URL(input instanceof Request ? input.url : String(input)).host,
    );
    return Promise.reject(new Error("External requests are blocked."));
  });
  const consoleSpies = (["log", "info", "warn", "error"] as const).map(
    (method) =>
      vi.spyOn(console, method).mockImplementation((...args: unknown[]) => {
        logged.push(args.map(String).join(" "));
      }),
  );
  return {
    commandCalls: () => readFileSync(calls, "utf8"),
    egress,
    logged,
    close() {
      try {
        for (const spy of [fetchSpy, ...consoleSpies]) spy.mockRestore();
        restoreEnv();
      } finally {
        rmSync(machine, { recursive: true, force: true });
      }
    },
  };
}
