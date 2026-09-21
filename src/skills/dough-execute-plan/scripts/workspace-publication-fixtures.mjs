// Disposable trunk, queued backlog, and command-readiness scripts for
// workspace-publication Git-mechanics tests.
import {
  mkdirSync,
  mkdtempSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { backlogOf } from "../../../../tests/support/product-backlog-fixture.mjs";
import { git, exec, revParse } from "./publication-test-fixtures.mjs";

export const storyA = "- [Story A](seeds/A.md#a) \u2014 SEED-A#a";
export const storyB = "- [Story B](seeds/B.md#b) \u2014 SEED-B#b";
export const identityA = "SEED-A#a";
export const identityB = "SEED-B#b";

export const readyContributing = [
  "Locked setup: `node scripts/setup.js`",
  "Applicable command: `node scripts/command.js`",
  "",
].join("\n");

export const failingContributing = [
  "Locked setup: `node scripts/setup.js`",
  "Applicable command: `node scripts/fail.js`",
  "",
].join("\n");

export async function createQueuedTrunk({ contributing } = {}) {
  const fixture = realpathSync(mkdtempSync(join(tmpdir(), "workspace-claim-")));
  const origin = join(fixture, "remote.git");
  const integration = join(fixture, "integration");
  await exec("git", ["init", "--bare", "-b", "main", origin]);
  await exec("git", ["init", "-b", "main", integration]);
  await git(integration, "config", "user.name", "Integration Checkout");
  await git(integration, "config", "user.email", "integration@example.test");
  await git(integration, "remote", "add", "origin", origin);
  mkdirSync(join(integration, ".planning"), { recursive: true });
  writeFileSync(
    join(integration, ".planning/PRODUCT-BACKLOG.md"),
    backlogOf([], [storyA, storyB]),
  );
  if (contributing) {
    mkdirSync(join(integration, "scripts"), { recursive: true });
    writeFileSync(
      join(integration, "scripts/setup.js"),
      "require('fs').writeFileSync('.setup-ran','1')\n",
    );
    writeFileSync(
      join(integration, "scripts/command.js"),
      "require('fs').writeFileSync('.command-ran','1')\n",
    );
    writeFileSync(join(integration, "scripts/fail.js"), "process.exit(1)\n");
    writeFileSync(join(integration, "CONTRIBUTING.md"), contributing);
  }
  await git(integration, "add", ".");
  await git(integration, "commit", "-m", "base trunk commit");
  await git(integration, "push", "origin", "main");
  return {
    fixture,
    origin,
    integration,
    trunkSha: await revParse(integration, "HEAD"),
    cleanup: () => rmSync(fixture, { recursive: true, force: true }),
  };
}
