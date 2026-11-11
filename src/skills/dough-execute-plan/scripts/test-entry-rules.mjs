#!/usr/bin/env node
// Local project configuration and the public shared test-rule boundary.
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parseArgs } from "node:util";
import { isDirectCliEntry } from "./ci-direct-entry.mjs";
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

if (isDirectCliEntry(import.meta.url, process.argv[1])) {
  try {
    const { values } = parseArgs({
      options: {
        project: { type: "string" },
        source: { type: "string", multiple: true },
      },
    });
    if (!values.project || !values.source?.length) {
      throw new Error(
        "usage: test-entry-rules.mjs --project <root> --source <path> [--source <path>...]",
      );
    }
    const result = await testEntryRules(values.project, values.source);
    console.log(JSON.stringify(result));
    if (result.status === "unresolved") process.exitCode = 1;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 2;
  }
}
