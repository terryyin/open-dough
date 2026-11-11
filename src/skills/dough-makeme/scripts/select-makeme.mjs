// Public installed entry selection. No target-project npm dependency is needed.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { declaredLocations } from "./intent-location-settings.mjs";
import { locationSelectsRepositoryPath } from "./intent-location-selection.mjs";
import { isSafeRepositoryPath } from "./repository-path.mjs";

/** @param {string} project @param {readonly string[]} paths */
export function selectMakeMe(project, paths) {
  const configuration = resolve(project, ".planning/open-dough.json");
  const invalid = paths.find((path) => !isSafeRepositoryPath(path));
  if (paths.length === 0 || invalid !== undefined)
    return {
      status: "unresolved",
      reason: "invalid-test-path",
      configuration,
      message: "Supply repository-relative test source paths.",
    };
  let settings;
  try {
    settings = readFileSync(configuration, "utf8");
  } catch (error) {
    return error.code === "ENOENT"
      ? {
          status: "not-selected",
          reason: "configuration-absent",
          configuration,
          files: [],
          entries: [],
        }
      : {
          status: "unresolved",
          reason: "configuration-unreadable",
          configuration,
          message: error.message,
        };
  }
  const declared = declaredLocations(settings);
  if (declared.kind === "malformed")
    return {
      status: "unresolved",
      reason: "configuration-malformed",
      configuration,
      message: "Configuration is not readable JSON.",
    };
  const entries =
    declared.kind === "absent"
      ? []
      : declared.locations
          .filter((entry) => entry.makeMe === true)
          .map((entry) => ({
            path: entry.path,
            files: [...new Set(paths)].filter((path) =>
              locationSelectsRepositoryPath(path, entry),
            ),
          }))
          .filter((entry) => entry.files.length > 0);
  const files = [...new Set(entries.flatMap((entry) => entry.files))];
  return {
    status: files.length > 0 ? "selected" : "not-selected",
    configuration,
    files,
    entries,
    ...(files.length > 0
      ? {
          convention: fileURLToPath(
            new URL("../references/convention.md", import.meta.url),
          ),
        }
      : { reason: "no-enabled-source" }),
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args[0] !== "--project" || !args[1] || args[2] !== "--") {
    process.stderr.write(
      "usage: select-makeme.mjs --project PROJECT -- TEST_SOURCE...\n",
    );
    process.exitCode = 2;
  } else {
    const result = selectMakeMe(args[1], args.slice(3));
    process.stdout.write(`${JSON.stringify(result)}\n`);
    process.exitCode = result.status === "unresolved" ? 1 : 0;
  }
}
