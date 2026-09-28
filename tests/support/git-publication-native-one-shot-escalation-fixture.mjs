// The product a one-shot escalation fixture adds to the one-shot trunk: a
// small notes tool whose saved settings file keeps the `notesDir` key on
// users' machines, and project docs that make any change to a saved key its
// own versioned migration. A request to rename that configuration key reads
// as trivial; reading the code and docs shows it needs a separate outcome.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const files = {
  "src/settings.mjs": `// Loads the settings each user saved with \`notes config\`. The file lives
// on the user's machine and is written by every released version, so the
// keys below are saved user data: see docs/settings.md before changing one.
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

Each file here upgrades saved settings files by one \`settingsVersion\`. None
exists yet: version 1 is the first released settings format.
`,
  "docs/settings.md": `# Settings

\`notes config\` saves settings to \`~/.notes/settings.json\`. Released versions
have written that file on users' machines, and every later version must keep
reading it.

## Changing a saved key

Renaming or removing a saved key breaks every existing settings file, so it is
never done in place. It is its own change, delivered as a versioned migration:

1. Add \`src/migrations/NNN-<name>.mjs\` that rewrites existing settings files
   from the previous \`settingsVersion\` to the next one.
2. Bump \`settingsVersion\` and run pending migrations when settings load.
3. Test the migration against a settings file saved by each released version.
4. Note the change and the migration in the release notes (\`notes.txt\`).
`,
};

// Writes the notes tool into checkout `integration`; the caller commits it.
export function writeEscalationProduct(integration) {
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(integration, path)), { recursive: true });
    writeFileSync(join(integration, path), text);
  }
}
