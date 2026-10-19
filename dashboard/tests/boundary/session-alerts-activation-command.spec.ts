// Round-trip the sender's actual shell command without invoking osascript.
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test } from "../support/pageTest.ts";
import { installFakeClaude } from "../support/fakeClaude.ts";
import { notificationActivation } from "../support/notificationActivation.ts";
import { sendTerminalNotification } from "../../server/terminalNotifier.ts";

test("the durable inline command carries quotes and substitution syntax as literal destination data", async () => {
  const directory = mkdtempSync(path.join(tmpdir(), "dough-click-command-"));
  const native = installFakeClaude(
    directory,
    { binDir: directory, path: process.env.PATH ?? "" },
    {},
  );
  const environment = {
    PATH: native.env["PATH"],
    FAKE_CLAUDE_DIR: native.env["FAKE_CLAUDE_DIR"],
  };
  const prior = Object.fromEntries(
    Object.keys(environment).map((key) => [key, process.env[key]]),
  );
  const marker = path.join(directory, "substitution-must-not-run");
  const destination = `http://127.0.0.1:58312/?project=single'quote&story=$(touch\${IFS}${marker})\`touch\${IFS}${marker}\`\\backslash#identity`;
  for (const [key, value] of Object.entries(environment))
    process.env[key] = value;
  try {
    expect(
      await sendTerminalNotification(
        { title: "Quoted ' title", message: "Literal $() text", destination },
        new AbortController().signal,
      ),
    ).toBeUndefined();
    const argv = native.controls.notifierCalls()[0]?.argv ?? [];
    const activation = notificationActivation(argv);
    expect(activation.destination).toBe(destination);
    expect(activation.source).toContain("function run(argv)");
    expect(activation.source).not.toContain(directory);
    expect(activation.source).not.toContain(destination);
    expect(activation.source).not.toContain("require(");
    expect(activation.source).not.toContain("fetch(");
    expect(existsSync(marker)).toBe(false);
    expect(() =>
      notificationActivation([
        "-execute",
        `'/usr/bin/osascript'; touch '${marker}'`,
      ]),
    ).toThrow("Invalid argument boundary");
    expect(existsSync(marker)).toBe(false);
  } finally {
    for (const [key, value] of Object.entries(prior)) {
      if (value === undefined) Reflect.deleteProperty(process.env, key);
      else process.env[key] = value;
    }
    rmSync(directory, { recursive: true, force: true });
  }
});
