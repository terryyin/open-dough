// Git transfers of a project's trunk check that wait, fail or read an
// older trunk once the Board already opened (./heldTrunkTransfer.ts
// holds the cold open itself). The gate is the dashboard's review
// repository's `remote.origin.uploadpack`, so a start's own pushes and
// fetches reach the origin unchanged.
import { execFileSync } from "node:child_process";
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { expect } from "@playwright/test";
import { routedOrigin } from "./support/fixtureOriginRoute.ts";
import { homeReviewRepository } from "./support/reviewRepositoryFixture.ts";

// Every later Git transfer of `repository`'s trunk check under `home`, after
// the Board already opened from it, waits at the origin's upload-pack; so
// does a Review's own fetch, which shares that repository. `untilHeld` waits
// until one waits; `held` counts those that waited; `fail` ends each waiting
// and later transfer as an origin that hung up; `releaseAt` lets them through
// to a copy of the origin whose trunk is still `revision`, and `release` to
// the origin itself.
export function holdLaterTrunkTransfers(home: string, repository: string) {
  const origin = routedOrigin(home, repository);
  const at = (name: string) => path.join(home, `later-upload-pack-${name}`);
  const log = at("log");
  const released = at("released");
  const failing = at("failing");
  const served = at("served");
  const gate = at("gate");
  writeFileSync(log, "");
  writeFileSync(
    gate,
    `#!/bin/sh
printf 'held\\n' >> "${log}"
while [ ! -f "${released}" ]; do
  if [ -f "${failing}" ]; then exit 1; fi
  sleep 0.05
done
if [ -f "${served}" ]; then exec git upload-pack "$(cat "${served}")"; fi
exec git upload-pack "$@"
`,
    { mode: 0o755 },
  );
  git(
    homeReviewRepository(home, repository),
    "config",
    "remote.origin.uploadpack",
    gate,
  );
  const held = () =>
    readFileSync(log, "utf8").split("\n").filter(Boolean).length;
  return {
    held,
    untilHeld: () => expect.poll(held, { timeout: 30_000 }).toBeGreaterThan(0),
    fail: () => {
      writeFileSync(failing, "");
    },
    releaseAt: (revision: string) => {
      const older = at("older.git");
      rmSync(older, { recursive: true, force: true });
      git(home, "clone", "--bare", "--quiet", "--no-hardlinks", origin, older);
      git(older, "update-ref", "refs/heads/main", revision);
      writeFileSync(served, older);
      writeFileSync(released, "");
    },
    release: () => {
      rmSync(failing, { force: true });
      rmSync(served, { force: true });
      writeFileSync(released, "");
    },
  };
}

const git = (directory: string, ...args: string[]) =>
  execFileSync("git", ["-C", directory, ...args]);
