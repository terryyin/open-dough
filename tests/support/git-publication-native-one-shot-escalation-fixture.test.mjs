// Product feasibility, independent of the native agent's admission verdict.
// Each candidate runs the generated project's actual setup and command.
import { deepStrictEqual, match, strictEqual } from "node:assert";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { gunzipSync } from "node:zlib";
import { test } from "node:test";

const source = fileURLToPath(new URL("../../", import.meta.url));
const dispatcher = join(
  source,
  "tests/support/git-publication-native-one-shot-fixture.mjs",
);
const renamePaths = ["src/settings.mjs", "src/notes.mjs", "docs/settings.md"];

test("released active and extension values collide with the renamed core meaning", async (t) => {
  const root = mkdtempSync(join(tmpdir(), "one-shot-settings-collision-"));
  try {
    const fixture = JSON.parse(
      execFileSync(
        process.execPath,
        [dispatcher, source, "one-shot-escalation", root],
        { encoding: "utf8" },
      ),
    );
    const releasePath = "test/released/settings-1.0.json.gz";
    const releaseBytes = readFileSync(join(fixture.integration, releasePath));
    deepStrictEqual(JSON.parse(gunzipSync(releaseBytes)), {
      notesDir: "active-notes",
      notesDirectory: "archive-notes",
      editor: "nano",
    });

    const variants = [
      { name: "original", status: 0 },
      {
        name: "literal-rename",
        status: 1,
        diagnostic: /released 1\.0 loaded active directory/,
        notes: /archived\.md/,
      },
      {
        name: "legacy-first-alias",
        status: 1,
        diagnostic: /released 1\.0 saved notesDirectory/,
        notes: /active-notes/,
      },
      {
        name: "new-key-first-alias",
        status: 1,
        diagnostic: /released 1\.0 loaded active directory/,
        notes: /archived\.md/,
      },
      {
        name: "legacy-consumer-fallback",
        status: 1,
        diagnostic: /released 1\.0 loaded active directory/,
        notes: /archived\.md/,
      },
    ];
    for (const variant of variants) {
      await t.test(variant.name, () => {
        const checkout = join(root, variant.name);
        execFileSync("git", [
          "clone",
          "--quiet",
          "--shared",
          fixture.integration,
          checkout,
        ]);
        if (variant.name !== "original") {
          for (const path of renamePaths) {
            const target = join(checkout, path);
            writeFileSync(
              target,
              readFileSync(target, "utf8").replace(
                /\bnotesDir\b/g,
                "notesDirectory",
              ),
            );
          }
        }
        const settings = join(checkout, "src/settings.mjs");
        if (variant.name.endsWith("-alias")) {
          const precedence =
            variant.name === "legacy-first-alias"
              ? 'saved.notesDir ?? saved.notesDirectory ?? "notes"'
              : 'saved.notesDirectory ?? saved.notesDir ?? "notes"';
          writeFileSync(
            settings,
            readFileSync(settings, "utf8").replace(
              'saved.notesDirectory ?? "notes"',
              precedence,
            ),
          );
        }
        if (variant.name === "legacy-consumer-fallback") {
          const notes = join(checkout, "src/notes.mjs");
          writeFileSync(
            notes,
            readFileSync(notes, "utf8").replace(
              "const { notesDirectory } = loadSettings(settingsFile);",
              "const saved = loadSettings(settingsFile);\n  const notesDirectory = saved.notesDir ?? saved.notesDirectory;",
            ),
          );
        }
        const setup = spawnSync(process.execPath, ["scripts/setup.js"], {
          cwd: checkout,
          encoding: "utf8",
        });
        strictEqual(setup.status, 0, setup.stdout + setup.stderr);
        const command = spawnSync(process.execPath, ["scripts/command.js"], {
          cwd: checkout,
          encoding: "utf8",
        });
        const output = command.stdout + command.stderr;
        strictEqual(command.status, variant.status, output);
        if (variant.diagnostic) {
          match(output, variant.diagnostic);
          match(output, variant.notes);
        } else strictEqual(output, "");
        deepStrictEqual(
          readFileSync(join(checkout, releasePath)),
          releaseBytes,
        );
      });
    }
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
