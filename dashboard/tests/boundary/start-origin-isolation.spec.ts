import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import {
  chmodSync,
  cpSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { expect, test } from "../support/pageTest.ts";
import { repoRoot } from "../support/repositoryRoot.ts";
import { startOrigin, type StartOrigin } from "../support/startOrigin.ts";
import {
  fixtureFiles as snapshot,
  objectPack as pack,
} from "../support/startOriginObservation.ts";
import {
  createStartOriginPreparationDirectory,
  installedStartSkills,
  prepareStartOrigins,
  startOriginPreparationVariable,
} from "../support/startOriginPreparation.ts";

const exec = promisify(execFile);
const git = async (cwd: string, ...args: string[]) =>
  (await exec("git", ["-C", cwd, ...args])).stdout.trim();
test("concurrent installed starts edit, publish and clean private repositories without changing peers or later instances", async () => {
  const origins: StartOrigin[] = [];
  const prepared = process.env[startOriginPreparationVariable];
  assert(prepared);
  const before = snapshot(prepared);
  try {
    const [first, second] = await Promise.all([
      startOrigin("someone/first", "first", "codex"),
      startOrigin("someone/second", "second", "cursor"),
    ]);
    origins.push(first, second);
    for (const origin of origins) {
      await expect(
        git(origin.project, "config", "--get", "branch.main.remote"),
      ).rejects.toMatchObject({ code: 1 });
      expect(
        await git(origin.project, "for-each-ref", "--format=%(refname)"),
      ).toBe("refs/heads/main\nrefs/remotes/origin/main");
      expect(
        await origin.originGit("for-each-ref", "--format=%(refname)"),
      ).toBe("refs/heads/main\n");
    }
    const baseline = await first.originGit("rev-parse", "main");
    await Promise.all(origins.map((origin) => origin.takenByAnotherAgent()));
    for (const origin of origins) {
      expect(await origin.originGit("rev-parse", "main")).not.toBe(baseline);
      expect(await origin.takenProfiles()).toHaveLength(1);
    }
    await Promise.all(
      origins.map(async (origin, index) => {
        writeFileSync(
          path.join(origin.machine, "home", "private"),
          String(index),
        );
        writeFileSync(path.join(origin.project, "private"), String(index));
        await git(origin.project, "checkout", "-b", "private");
        await git(origin.project, "add", "private");
        await git(origin.project, "commit", "-m", `private ${String(index)}`);
        await git(origin.project, "push", "origin", "private");
        expect(await origin.originGit("show", "private:private")).toBe(
          String(index),
        );
        expect(
          readFileSync(path.join(origin.machine, "home", "private"), "utf8"),
        ).toBe(String(index));
      }),
    );
    const peerFiles = snapshot(second.machine);
    const peerRefs = await second.originGit("show-ref");
    await first.originGit("config", "test.private", "first");
    await git(first.project, "config", "test.private", "first");
    const packs = [
      pack(path.join(prepared, "codex")),
      pack(first.origin),
      pack(path.join(first.project, ".git")),
      pack(second.origin),
      pack(path.join(second.project, ".git")),
    ] as const;
    expect(new Set(packs.map((file) => statSync(file).ino)).size).toBe(
      packs.length,
    );
    chmodSync(packs[1], 0o644);
    writeFileSync(packs[1], "arbitrary writable object bytes");
    await git(first.project, "fsck", "--full");
    expect(snapshot(second.machine)).toEqual(peerFiles);
    expect(await second.originGit("show-ref")).toBe(peerRefs);
    first.cleanup();
    expect(existsSync(first.machine)).toBe(false);
    expect(snapshot(second.machine)).toEqual(peerFiles);
    await second.originGit("fsck", "--full");
    const later = await startOrigin("someone/later", "later", "cursor");
    origins.push(later);
    expect(await later.originGit("rev-parse", "main")).toBe(baseline);
    expect(await later.takenProfiles()).toEqual([]);
    expect(existsSync(path.join(later.project, "private"))).toBe(false);
    expect(existsSync(path.join(later.machine, "home", "private"))).toBe(false);
    const laterFiles = snapshot(later.machine);
    second.cleanup();
    expect(snapshot(later.machine)).toEqual(laterFiles);
    await later.originGit("fsck", "--full");
    expect(snapshot(prepared)).toEqual(before);
  } finally {
    for (const origin of origins) origin.cleanup();
  }
});

test("successive preparations install current working-tree source without a persistent cache", async () => {
  const directory = mkdtempSync(
    path.join(tmpdir(), "dough-start-source-proof-"),
  );
  const inherited = process.env[startOriginPreparationVariable];
  const origins: StartOrigin[] = [];
  try {
    const source = path.join(directory, "skills");
    for (const skill of installedStartSkills) {
      cpSync(
        path.join(repoRoot, "src", "skills", skill),
        path.join(source, skill),
        { recursive: true },
      );
    }
    for (const value of ["first run", "changed working tree"]) {
      writeFileSync(
        path.join(source, "dough-execute-plan", "current-source"),
        value,
      );
      const prepared = createStartOriginPreparationDirectory();
      try {
        await prepareStartOrigins(prepared, source);
        process.env[startOriginPreparationVariable] = prepared;
        const origin = await startOrigin();
        origins.push(origin);
        expect(
          readFileSync(
            path.join(
              origin.project,
              ".claude/skills/dough-execute-plan/current-source",
            ),
            "utf8",
          ),
        ).toBe(value);
      } finally {
        rmSync(prepared, { recursive: true, force: true });
      }
    }
    const initial = origins[0];
    assert(initial);
    expect(
      readFileSync(
        path.join(
          initial.project,
          ".claude/skills/dough-execute-plan/current-source",
        ),
        "utf8",
      ),
    ).toBe("first run");
    Reflect.deleteProperty(process.env, startOriginPreparationVariable);
    const fresh = await startOrigin();
    origins.push(fresh);
    expect(
      existsSync(
        path.join(
          fresh.project,
          ".claude/skills/dough-execute-plan/current-source",
        ),
      ),
    ).toBe(false);
    await fresh.takenByAnotherAgent();
    expect(await fresh.takenProfiles()).toHaveLength(1);
  } finally {
    if (inherited === undefined)
      Reflect.deleteProperty(process.env, startOriginPreparationVariable);
    else process.env[startOriginPreparationVariable] = inherited;
    for (const origin of origins) origin.cleanup();
    rmSync(directory, { recursive: true, force: true });
  }
});

test("failed preparation and initialization remove only owned state and retain unexpected errors", async () => {
  const directory = mkdtempSync(
    path.join(tmpdir(), "dough-start-failure-proof-"),
  );
  const inherited = process.env[startOriginPreparationVariable];
  const previousTmp = process.env["TMPDIR"];
  const peer = await startOrigin();
  const peerFiles = snapshot(peer.machine);
  try {
    assert(inherited);
    const prepared = createStartOriginPreparationDirectory();
    await expect(
      prepareStartOrigins(prepared, path.join(directory, "missing-source")),
    ).rejects.toMatchObject({ code: "ENOENT" });
    expect(existsSync(prepared)).toBe(false);
    process.env["TMPDIR"] = directory;
    process.env[startOriginPreparationVariable] = path.join(
      directory,
      "missing-preparation",
    );
    await expect(startOrigin()).rejects.toMatchObject({ code: "ENOENT" });
    expect(readdirSync(directory)).toEqual([]);
    const broken = path.join(directory, "broken");
    cpSync(path.join(inherited, "claude"), path.join(broken, "claude"), {
      recursive: true,
    });
    writeFileSync(
      path.join(broken, "claude", "config"),
      "broken configuration\n",
    );
    process.env[startOriginPreparationVariable] = broken;
    await expect(startOrigin()).rejects.toMatchObject({
      code: 128,
      stderr: expect.stringContaining("bad config line"),
    });
    expect(readdirSync(directory)).toEqual(["broken"]);
    expect(snapshot(peer.machine)).toEqual(peerFiles);
    await peer.originGit("fsck", "--full");
  } finally {
    if (inherited === undefined)
      Reflect.deleteProperty(process.env, startOriginPreparationVariable);
    else process.env[startOriginPreparationVariable] = inherited;
    if (previousTmp === undefined) delete process.env["TMPDIR"];
    else process.env["TMPDIR"] = previousTmp;
    peer.cleanup();
    rmSync(directory, { recursive: true, force: true });
  }
});
