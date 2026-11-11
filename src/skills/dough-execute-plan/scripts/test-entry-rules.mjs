#!/usr/bin/env node
// Local project configuration and the public shared test-rule boundary.
import { execFileSync } from "node:child_process";
import { statSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parseArgs } from "node:util";
import { isDirectCliEntry } from "./ci-direct-entry.mjs";
import { changedForRefactoring } from "./git-changes.mjs";
import { selectTestEntryRules } from "./test-entry-rules-runtime.mjs";

export { selectTestEntryRules } from "./test-entry-rules-runtime.mjs";

export async function testEntryRules(project, sourcePaths) {
  let settings;
  try {
    settings = await readFile(
      resolve(project, ".planning/open-dough.json"),
      "utf8",
    );
  } catch (error) {
    if (error.code === "ENOENT") {
      return {
        ...selectTestEntryRules("{}", sourcePaths),
        configuration: "absent",
      };
    }
    return { status: "unresolved", problem: "unreadable", sources: [] };
  }
  return selectTestEntryRules(settings, sourcePaths);
}

export async function changedTestEntryRules(project, committed = []) {
  const git = (root, args) =>
    execFileSync("git", ["-C", root, ...args], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  const sources = changedForRefactoring(git, project, committed).filter(
    (path) => {
      try {
        return statSync(resolve(project, path)).isFile();
      } catch (error) {
        if (error.code === "ENOENT" || error.code === "ENOTDIR") return false;
        throw error;
      }
    },
  );
  return testEntryRules(project, sources);
}

if (isDirectCliEntry(import.meta.url, process.argv[1])) {
  try {
    const { values } = parseArgs({
      options: {
        project: { type: "string" },
        source: { type: "string", multiple: true },
        changed: { type: "boolean" },
        committed: { type: "string", multiple: true },
      },
    });
    if (
      !values.project ||
      (!values.changed && !values.source?.length) ||
      (values.changed && values.source?.length) ||
      (values.committed?.length && !values.changed)
    ) {
      throw new Error(
        "usage: test-entry-rules.mjs --project <root> (--source <path>... | --changed [--committed <revision>...])",
      );
    }
    const result = values.changed
      ? await changedTestEntryRules(values.project, values.committed)
      : await testEntryRules(values.project, values.source);
    console.log(JSON.stringify(result));
    if (result.status === "unresolved") process.exitCode = 1;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 2;
  }
}
