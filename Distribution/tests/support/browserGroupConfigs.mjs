// Each browser test group as ci.yml runs it (./ci-proof-action-fixtures.mjs
// `browserGroups`), joined to the declaration its runner takes for the same
// job (dashboard/test-support/support/browserTestGroups.mjs): its npm
// command, settings prefix, test root, `directory` (repository-relative) and
// Playwright `config` (repository-relative), with `configText` to read.
import { readFileSync } from "node:fs";
import { posix, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { browserTestGroups } from "../../../dashboard/test-support/support/browserTestGroups.mjs";
import { browserGroups, root } from "./ci-proof-action-fixtures.mjs";

export const browserGroupConfigs = browserGroups.map(({ job, inputs }) => {
  const declared = browserTestGroups.find((group) => group.job === job);
  const directory =
    declared &&
    relative(fileURLToPath(root), fileURLToPath(declared.directory));
  const config = declared && posix.join(directory, declared.config);
  return {
    ...declared,
    job,
    inputs,
    shards: JSON.parse(inputs.shards).length,
    directory,
    config,
    configText: config && readFileSync(new URL(config, root), "utf8"),
  };
});
