// An ordinary server exit cannot strand a lock while acquiring or releasing it.
import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { expect, test } from "../../tests/support/pageTest.ts";
import { fsPromisesHook } from "../../tests/support/serverFsHook.ts";
import { keepStart, keptStart, updateStart } from "../../server/startStore.ts";

test("a writer ending at the first turn after lock creation leaves its start update retryable", async () => {
  const home = mkdtempSync(path.join(tmpdir(), "dough-store-exit-lock-"));
  const previousHome = process.env["HOME"];
  process.env["HOME"] = home;
  try {
    const written = makeMe.aStartRecord
      .with({
        host: "claude",
        identity: "SEED-LOCK#retry",
        publisherId: "store-lock-proof",
        workspace: path.join(home, "checkout"),
        branch: "codex/store-retry",
        startedAt: "2026-11-10T00:00:00.000Z",
      })
      .please();
    await keepStart("open-dough", written);
    const file = path.join(home, ".open-dough/dashboard/execution-starts.json");
    const before = readFileSync(file, "utf8");
    const writer = path.join(home, "writer.mjs");
    writeFileSync(
      writer,
      `import { updateStart } from ${JSON.stringify(fileURLToPath(new URL("../../server/startStore.ts", import.meta.url)))};
await updateStart("open-dough", ${JSON.stringify(written.identity)}, { candidateSha: "interrupted" });`,
    );
    const reached = path.join(home, "lock-created");
    // The first event-loop turn after filesystem creation can run server shutdown.
    // Cover both asynchronous creation and a creation registered synchronously.
    const exitAfterCreation = fsPromisesHook(
      path.join(home, "exit-after-creation.mjs"),
      "mkdir",
      `(() => {
 const isLock = (file) => String(file).endsWith("/execution-starts.json.lock");
 const record = () => fs.writeFileSync(${JSON.stringify(reached)}, "created");
 const sync = fs.mkdirSync;
 fs.mkdirSync = (file, ...args) => {
   const result = sync(file, ...args);
   if (isLock(file)) { record(); process.nextTick(() => process.exit(0)); }
   return result;
 };
 return async (file, ...args) => {
   const result = await original(file, ...args);
   if (isLock(file)) { record(); process.exit(0); }
   return result;
 };
})()`,
    );
    execFileSync(process.execPath, [writer], {
      env: { ...process.env, HOME: home, ...exitAfterCreation },
    });
    expect(readFileSync(reached, "utf8")).toBe("created");
    expect(readFileSync(file, "utf8")).toBe(before);
    await updateStart("open-dough", written.identity, {
      candidateSha: "recovered",
    });
    expect(existsSync(`${file}.lock`)).toBe(false);
    expect(await keptStart("open-dough", written.identity)).toEqual({
      ...written,
      candidateSha: "recovered",
    });
  } finally {
    if (previousHome === undefined) delete process.env["HOME"];
    else process.env["HOME"] = previousHome;
    rmSync(home, { recursive: true, force: true });
  }
});

for (const abandoned of [false, true]) {
  test(`a writer ending during ${abandoned ? "abandoned" : "owned"} lock removal leaves its start update retryable`, async () => {
    const home = mkdtempSync(path.join(tmpdir(), "dough-store-release-lock-"));
    const previousHome = process.env["HOME"];
    process.env["HOME"] = home;
    try {
      const written = makeMe.aStartRecord
        .with({
          host: "claude",
          identity: "SEED-LOCK#release",
          publisherId: "store-lock-proof",
          workspace: path.join(home, "checkout"),
          branch: "codex/store-release",
          startedAt: "2026-11-10T00:00:00.000Z",
        })
        .please();
      await keepStart("open-dough", written);
      const file = path.join(
        home,
        ".open-dough/dashboard/execution-starts.json",
      );
      const writer = path.join(home, "writer.mjs");
      writeFileSync(
        writer,
        `import { updateStart } from ${JSON.stringify(fileURLToPath(new URL("../../server/startStore.ts", import.meta.url)))};
  await updateStart("open-dough", ${JSON.stringify(written.identity)}, { candidateSha: "committed" });`,
      );
      if (abandoned) {
        mkdirSync(`${file}.lock`);
        writeFileSync(path.join(`${file}.lock`, "owner"), "2147483647\n");
      }
      const reached = path.join(home, "lock-removal-reached");
      // Recursive asynchronous removal can unlink owner before removing the directory.
      // Synchronous removal completes before the next turn can run server shutdown.
      const exitDuringRemoval = fsPromisesHook(
        path.join(home, "exit-during-removal.mjs"),
        "rm",
        `(() => {
   const isLock = (file) => String(file).endsWith("/execution-starts.json.lock");
   const record = () => fs.writeFileSync(${JSON.stringify(reached)}, "release");
   const sync = fs.rmSync;
   fs.rmSync = (file, ...args) => {
     const result = sync(file, ...args);
     if (isLock(file)) { record(); process.nextTick(() => process.exit(0)); }
     return result;
   };
   return async (file, ...args) => {
     if (isLock(file)) {
       sync(String(file) + "/owner", { force: true });
       record();
       process.exit(0);
     }
     return original(file, ...args);
   };
  })()`,
      );
      execFileSync(process.execPath, [writer], {
        env: { ...process.env, HOME: home, ...exitDuringRemoval },
      });
      expect(readFileSync(reached, "utf8")).toBe("release");
      expect(await keptStart("open-dough", written.identity)).toEqual(
        abandoned ? written : { ...written, candidateSha: "committed" },
      );
      await updateStart("open-dough", written.identity, {
        candidateSha: "resumed",
      });
      expect(existsSync(`${file}.lock`)).toBe(false);
      expect(await keptStart("open-dough", written.identity)).toEqual({
        ...written,
        candidateSha: "resumed",
      });
    } finally {
      if (previousHome === undefined) delete process.env["HOME"];
      else process.env["HOME"] = previousHome;
      rmSync(home, { recursive: true, force: true });
    }
  });
}
