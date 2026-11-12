// Installed CLI cancellation and failure leave no owned process or output.
import { spawnSync } from "node:child_process";
import {
  closeSync,
  constants,
  existsSync,
  openSync,
  readFileSync,
  readdirSync,
  writeFileSync,
  writeSync,
} from "node:fs";
import path from "node:path";
import { everyRepository, hangs } from "../../tests/support/fakeGitHub.ts";
import { processAlive } from "../../tests/support/processGroup.ts";
import { expect, test } from "../support/fakeGhClient.ts";

for (const signal of ["SIGTERM", "SIGINT"] as const) {
  test(`${signal} during temp-directory creation retires the directory and creation child`, async ({
    client,
  }) => {
    const reached = path.join(client.root, "mktemp.reached");
    const release = path.join(client.root, "mktemp.release");
    expect(spawnSync("mkfifo", [release]).status).toBe(0);
    writeFileSync(
      path.join(client.gh.binDir, "mktemp"),
      `#!/bin/sh
created=$(/usr/bin/mktemp "$@") || exit $?
printf '%s\\n' "$created"
printf '%s' "$$" > "$FAKE_GH_MKTEMP_REACHED"
IFS= read -r released < "$FAKE_GH_MKTEMP_RELEASE"
`,
      { mode: 0o755 },
    );
    const { child, result } = client.run(["api"], {
      FAKE_GH_MKTEMP_REACHED: reached,
      FAKE_GH_MKTEMP_RELEASE: release,
    });
    await expect.poll(() => existsSync(reached)).toBe(true);
    const creator = Number(readFileSync(reached, "utf8"));
    let writer: number | undefined;
    try {
      await expect
        .poll(() => {
          try {
            writer = openSync(
              release,
              constants.O_WRONLY | constants.O_NONBLOCK,
            );
            return true;
          } catch (error) {
            if ((error as NodeJS.ErrnoException).code === "ENXIO") return false;
            throw error;
          }
        })
        .toBe(true);
      if (writer === undefined)
        throw new Error("held mktemp has no FIFO reader");
      child.kill(signal);
      writeSync(writer, "released\n");
    } finally {
      if (writer !== undefined) closeSync(writer);
    }
    expect(await result).toEqual({
      code: 143,
      signal: null,
      stdout: Buffer.alloc(0),
      stderr: Buffer.alloc(0),
    });
    expect(readFileSync(`${client.gh.pidPath}.exited`, "utf8")).toBe(signal);
    expect(processAlive(creator)).toBe(false);
    expect(client.github.calls).toEqual([]);
    expect(readdirSync(client.scratch)).toEqual([]);
  });

  test(`${signal} ends a held request, records the signal and retires children and output files`, async ({
    client,
  }) => {
    client.github.serve(everyRepository, hangs);
    const argv = ["api", "repos/test/repo"];
    const { child, result } = client.run(argv);
    await expect.poll(() => client.github.calls.length).toBe(1);
    expect(client.github.calls[0]?.argv).toEqual(argv);
    expect(client.github.unansweredCalls).toBe(1);
    const children = spawnSync("ps", ["-axo", "pid=,ppid="], {
      encoding: "utf8",
    })
      .stdout.split("\n")
      .map((line) => line.trim().split(/\s+/).map(Number))
      .filter(([, parent]) => parent === child.pid)
      .map(([pid]) => pid);
    child.kill(signal);
    expect(await result).toEqual({
      code: 143,
      signal: null,
      stdout: Buffer.alloc(0),
      stderr: Buffer.alloc(0),
    });
    expect(readFileSync(`${client.gh.pidPath}.exited`, "utf8")).toBe(signal);
    await expect.poll(() => client.github.unansweredCalls).toBe(0);
    expect(children.every((pid) => !processAlive(pid))).toBe(true);
    expect(readdirSync(client.scratch)).toEqual([]);
  });
}

test("missing origin and a gone fake fail with only the synthetic diagnostic and leave no output files", async ({
  client,
}) => {
  expect(
    await client.run(["api"], { FAKE_GH_ORIGIN: undefined }).result,
  ).toEqual({
    code: 1,
    signal: null,
    stdout: Buffer.alloc(0),
    stderr: Buffer.from("fake gh: FAKE_GH_ORIGIN is not set\n"),
  });
  client.github.serve(everyRepository, hangs);
  const held = client.run(["api", "repos/test/repo"]);
  await expect.poll(() => client.github.calls.length).toBe(1);
  await client.github.close();
  expect(await held.result).toEqual({
    code: 1,
    signal: null,
    stdout: Buffer.alloc(0),
    stderr: Buffer.from("fake gh: the test's fake GitHub is gone\n"),
  });
  expect(await client.run(["api"]).result).toEqual({
    code: 1,
    signal: null,
    stdout: Buffer.alloc(0),
    stderr: Buffer.from("fake gh: the test's fake GitHub is gone\n"),
  });
  expect(readdirSync(client.scratch)).toEqual([]);
});

test("a native request consumer ending retires its held installed gh and curl", async ({
  client,
}) => {
  client.github.serve(everyRepository, hangs);
  const native = client.runOwner();
  await expect.poll(() => client.github.calls.length).toBe(1);
  const ghPid = Number(readFileSync(client.gh.pidPath, "utf8"));
  expect(processAlive(ghPid)).toBe(true);
  native.child.kill("SIGTERM");
  expect((await native.result).signal).toBe("SIGTERM");
  await expect.poll(() => client.github.unansweredCalls).toBe(0);
  await expect.poll(() => processAlive(ghPid)).toBe(false);
  expect(readFileSync(`${client.gh.pidPath}.exited`, "utf8")).toBe("SIGTERM");
  expect(readdirSync(client.scratch)).toEqual([]);
});
