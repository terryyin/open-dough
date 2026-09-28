// The product a one-shot escalation fixture adds to the one-shot trunk: a
// small notes tool whose settings file keeps the `notesDir` key, and a
// released-settings check that the project's applicable command runs. The
// check loads a settings file saved by released version 1.0, kept gzip'd so
// searching the code for the key does not reach it. Nothing else says a saved
// key is special: a request to rename that configuration key reads as
// trivial, and only the project's own check, run after the rename, shows it
// needs a separate outcome.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { gzipSync } from "node:zlib";

const files = {
  "src/settings.mjs": `// Reads the settings file written by \`notes config\`.
import { readFileSync } from "node:fs";

export const settingsVersion = 1;

export function loadSettings(file) {
  const saved = JSON.parse(readFileSync(file, "utf8"));
  return {
    notesDir: saved.notesDir ?? "notes",
    editor: saved.editor ?? "vi",
  };
}
`,
  "src/notes.mjs": `// Lists the notes in the configured notes directory.
import { readdirSync } from "node:fs";
import { loadSettings } from "./settings.mjs";

export function listNotes(settingsFile) {
  const { notesDir } = loadSettings(settingsFile);
  return readdirSync(notesDir).filter((name) => name.endsWith(".md"));
}
`,
  "src/migrations/README.md": `# Settings migrations

Each file upgrades saved settings files by one \`settingsVersion\`.
`,
  "docs/settings.md": `# Settings

\`notes config\` writes these settings to \`~/.notes/settings.json\`:

- \`notesDir\`: the directory holding your notes (default \`notes\`).
- \`editor\`: the command that opens a note (default \`vi\`).
`,
  "test/released-settings.test.mjs": `// Every settings file saved by a released version still loads every value
// it saved.
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { gunzipSync } from "node:zlib";
import { loadSettings } from "../src/settings.mjs";

const released = new URL("./released/", import.meta.url);
const scratch = mkdtempSync(join(tmpdir(), "released-settings-"));
try {
  for (const name of readdirSync(released)) {
    const version = name.replace(/^settings-(.*)\\.json\\.gz$/, "$1");
    const saved = JSON.parse(gunzipSync(readFileSync(new URL(name, released))));
    const file = join(scratch, "settings.json");
    writeFileSync(file, JSON.stringify(saved));
    const loaded = loadSettings(file);
    for (const [key, value] of Object.entries(saved)) {
      if (loaded[key] === value) continue;
      console.error(
        \`settings saved by released \${version} no longer load \${key}: a renamed saved key needs its own versioned migration (src/migrations, settingsVersion bump, tests against every released settings file)\`,
      );
      process.exitCode = 1;
    }
  }
} finally {
  rmSync(scratch, { recursive: true, force: true });
}
`,
};

// Writes the notes tool into checkout `integration`, and makes its applicable
// command also run the project's tests; the caller commits it.
export function writeEscalationProduct(integration) {
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(integration, path)), { recursive: true });
    writeFileSync(join(integration, path), text);
  }
  const saved = { notesDir: "/home/ada/notes", editor: "nano" };
  mkdirSync(join(integration, "test/released"), { recursive: true });
  writeFileSync(
    join(integration, "test/released/settings-1.0.json.gz"),
    gzipSync(JSON.stringify(saved)),
  );
  const command = join(integration, "scripts/command.js");
  writeFileSync(
    command,
    `${readFileSync(command, "utf8")}// Runs every test/*.test.mjs.
const { spawnSync } = require('child_process');
const { readdirSync } = require('fs');
const { join } = require('path');
const tests = join(__dirname, '../test');
for (const name of readdirSync(tests).filter((n) => n.endsWith('.test.mjs'))) {
  const run = spawnSync(process.execPath, [join(tests, name)], { stdio: 'inherit' });
  if (run.status !== 0) process.exitCode = 1;
}
`,
  );
}
