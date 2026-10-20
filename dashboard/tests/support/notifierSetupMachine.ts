// An isolated machine for the notification sender setup
// (../boundary/notifier-setup.spec.ts): its own home, a PATH with only Node,
// a recording `lsregister` and, when asked, a synthetic installed
// terminal-notifier app (../fixtures/fake-terminal-notifier-app) in
// Homebrew's layout, so no test posts a real notification, asks for
// permission or registers an app with this machine's Launch Services.
import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { installFixtureExecutable } from "./fixtureExecutable.ts";
import { repoRoot } from "./repositoryRoot.ts";

export type Machine = {
  readonly root: string;
  readonly home: string;
  readonly installed: string;
  readonly app: string;
  mode(mode: string): void;
  setup(...args: string[]): {
    readonly status: number | null;
    readonly out: string;
  };
  calls(): { readonly executable: string; readonly argv: string[] }[];
  registrations(): string[];
};

export function machine(options: { readonly helper: boolean }): Machine {
  // Real, as the helper sees its own path (macOS links /var to /private/var).
  const root = realpathSync(
    mkdtempSync(path.join(tmpdir(), "dough-notifier-setup-")),
  );
  const home = path.join(root, "home");
  const bin = path.join(root, "bin");
  const state = path.join(root, "state");
  const keg = path.join(root, "Cellar", "terminal-notifier", "3.1.0");
  const installed = path.join(keg, "terminal-notifier.app");
  mkdirSync(home);
  mkdirSync(state);
  mkdirSync(bin);
  // Node for the synthetic helper's own `#!/usr/bin/env node`, without the
  // directory it came from, which may hold a real terminal-notifier.
  symlinkSync(process.execPath, path.join(bin, "node"));
  writeFileSync(
    path.join(bin, "lsregister"),
    `#!/bin/sh\nprintf '%s\\n' "$*" >> '${state}/lsregister.log'\n`,
    { mode: 0o755 },
  );
  if (options.helper) {
    // Homebrew's layout: a launcher in the keg's bin beside the app.
    mkdirSync(path.join(installed, "Contents", "Resources"), {
      recursive: true,
    });
    installFixtureExecutable(
      "fake-terminal-notifier-app",
      path.join(installed, "Contents", "MacOS"),
      "terminal-notifier",
    );
    writeFileSync(
      path.join(installed, "Contents", "Info.plist"),
      `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>CFBundleExecutable</key><string>terminal-notifier</string>
<key>CFBundleIconFile</key><string>Terminal</string>
<key>CFBundleIdentifier</key><string>fr.julienxx.oss.terminal-notifier</string>
<key>CFBundleName</key><string>terminal-notifier</string>
<key>CFBundlePackageType</key><string>APPL</string>
</dict></plist>
`,
    );
    writeFileSync(
      path.join(installed, "Contents", "Resources", "Terminal.icns"),
      "the helper's own icon",
    );
    mkdirSync(path.join(keg, "bin"));
    writeFileSync(
      path.join(keg, "bin", "terminal-notifier"),
      `#!/bin/bash\nexec "${installed}/Contents/MacOS/terminal-notifier" "$@"\n`,
      { mode: 0o755 },
    );
    symlinkSync(
      path.join(keg, "bin", "terminal-notifier"),
      path.join(bin, "terminal-notifier"),
    );
  }
  return {
    root,
    home,
    installed,
    app: path.join(
      home,
      ".open-dough",
      "dashboard",
      "notifier",
      "Open Dough.app",
    ),
    mode(mode) {
      writeFileSync(path.join(state, "mode"), mode);
    },
    setup(...args) {
      const result = spawnSync(
        process.execPath,
        [
          path.join(repoRoot, "dashboard", "server", "notifierSetup.ts"),
          ...args,
        ],
        {
          env: {
            HOME: home,
            PATH: [bin, "/usr/bin", "/bin", "/usr/sbin"].join(path.delimiter),
            FAKE_NOTIFIER_DIR: state,
          },
          encoding: "utf8",
          timeout: 60_000,
        },
      );
      return { status: result.status, out: result.stdout + result.stderr };
    },
    calls() {
      const file = path.join(state, "calls.jsonl");
      return existsSync(file)
        ? readFileSync(file, "utf8")
            .trim()
            .split("\n")
            .map(
              (line) =>
                JSON.parse(line) as { executable: string; argv: string[] },
            )
        : [];
    },
    registrations() {
      const file = path.join(state, "lsregister.log");
      return existsSync(file)
        ? readFileSync(file, "utf8").trim().split("\n")
        : [];
    },
  };
}
