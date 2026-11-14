// @ts-check
// A private evidence-identity source with the real installer's tracked inputs.
// The shell check owns and removes the destination. Other copied source files
// remain harness data; only the installer inventory needs Git membership.
import { execFileSync } from "node:child_process";
import { cpSync } from "node:fs";
import { join } from "node:path";
import { makeMe } from "./makeMe.mjs";
import { materializeLocalCheckout } from "./repository-fixture.mjs";
import { copiedLayer } from "./repository-revision-files.mjs";
import { uncoveredSupervisionRoots } from "./native-supervision-inputs.mjs";

const [source, destination] = process.argv.slice(2);
if (!source || !destination)
  throw new Error("usage: native-identity-source.mjs SOURCE DESTINATION");
const installerFiles = execFileSync(
  "git",
  [
    "-C",
    source,
    "ls-files",
    "-z",
    "--",
    "Distribution/src/install",
    "src/install",
  ],
  { encoding: "utf8" },
)
  .split("\0")
  .filter(Boolean);
await materializeLocalCheckout(
  undefined,
  makeMe.aRepository
    .withRevision("installer-inputs", { backlog: null })
    .please(),
  {
    at: destination,
    gitTemplates: false,
    layer: copiedLayer(source, installerFiles),
  },
);
const harnessPaths = ["Distribution", "install.sh", "VERSION", "CHANGELOG.md"];
for (const path of [
  ...harnessPaths,
  ...uncoveredSupervisionRoots(source, harnessPaths),
])
  cpSync(join(source, path), join(destination, path), { recursive: true });
