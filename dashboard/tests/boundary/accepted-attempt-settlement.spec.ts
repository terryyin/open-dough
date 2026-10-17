// Atomic replacement exposes the outcome before the writer has released its
// lock. Following a live owner must wait for its change answer before a
// recovery journey can stop that server and leave the machine's store behind.
import { spawn } from "node:child_process";
import { once } from "node:events";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { settledOutcome } from "../acceptedAttempts.ts";
import type { DashboardServer } from "../support/dashboardServer.ts";
import { expect, test } from "../support/pageTest.ts";
import { repoRoot } from "../support/repositoryRoot.ts";

test("following a live attempt waits past outcome replacement until its writer releases the lock", async () => {
  const home = mkdtempSync(path.join(tmpdir(), "dough-settled-"));
  const ownerModule = fileURLToPath(
    new URL("../../server/launchAttemptOwner.ts", import.meta.url),
  );
  const changesModule = fileURLToPath(
    new URL("../../server/launchAttemptChanges.ts", import.meta.url),
  );
  const script = `
    import http from 'node:http';
    import promises from 'node:fs/promises';
    import {readFileSync} from 'node:fs';
    import {syncBuiltinESMExports} from 'node:module';
    import {createServer} from 'vite';
    // The dashboard's installed compiler also loads this isolated owner's
    // TypeScript on supported Node versions without native TS support.
    const vite = await createServer({configFile:false, server:{middlewareMode:true}, appType:'custom'});
    const {LaunchAttemptOwner} = await vite.ssrLoadModule(${JSON.stringify(ownerModule)});
    const {changedAttempt} = await vite.ssrLoadModule(${JSON.stringify(changesModule)});
    const owner = new LaunchAttemptOwner();
    const original = promises.rmdir;
    let release;
    const held = new Promise(resolve => { release = resolve; });
    promises.rmdir = async lock => {
      if (String(lock).endsWith('/launch-attempts.json.lock')) {
        const kept = JSON.parse(readFileSync(String(lock).slice(0, -5), 'utf8'));
        if (kept['open-dough'][0].outcome !== undefined) {
          process.send({kind: 'replacement', lock});
          await held;
        }
      }
      return original(lock);
    };
    syncBuiltinESMExports();
    let firstAnswer;
    const accepted = await owner.accept(
      {source:'open-dough', host:'claude', workflow:'ad-hoc'},
      async (own, publication) => {
        // The first change answer is taken before final replacement, then
        // delivered after it: the same network/filesystem ordering as CI.
        firstAnswer = changedAttempt(owner, own.attempt.id, 30_000);
        await publication({kind:'none'});
        return {kind:'uncertain', reason:'unconfirmed', explanation:'Kept for recovery.'};
      },
    );
    let requests = 0;
    const server = http.createServer(async (_request, response) => {
      requests += 1;
      if (requests === 2) process.send({kind:'requested-again'});
      const answer = requests === 1
        ? await firstAnswer
        : await changedAttempt(owner, accepted.attempt.id, 30_000);
      response.end(JSON.stringify(answer));
    });
    server.listen(0, '127.0.0.1', () => {
      process.send({kind:'listening', port:server.address().port, id:accepted.attempt.id});
    });
    process.on('message', async message => {
      if (message === 'release') release();
      if (message === 'close') {
        server.close();
        await vite.close();
      }
    });
  `;
  const child = spawn(process.execPath, ["--input-type=module", "-e", script], {
    cwd: repoRoot,
    env: { ...process.env, HOME: home },
    stdio: ["ignore", "pipe", "pipe", "ipc"],
  });
  let stderr = "";
  child.stderr?.on("data", (chunk: Buffer) => {
    stderr += chunk.toString();
  });
  const messages: Record<string, unknown>[] = [];
  child.on("message", (message: Record<string, unknown>) => {
    messages.push(message);
  });
  let following: Promise<unknown> | undefined;
  try {
    await expect
      .poll(() => messages.map((message) => message["kind"]))
      .toEqual(expect.arrayContaining(["replacement", "listening"]));
    const listening = messages.find(
      (message) => message["kind"] === "listening",
    );
    const replacement = messages.find(
      (message) => message["kind"] === "replacement",
    );
    const baseURL = `http://127.0.0.1:${String(listening?.["port"])}`;
    const lock = String(replacement?.["lock"]);
    expect(existsSync(lock)).toBe(true);
    following = settledOutcome(
      { baseURL, origin: baseURL, home } as DashboardServer,
      String(listening?.["id"]),
    );
    const nextRequest = new Promise<string>((resolve) => {
      child.on("message", (message: Record<string, unknown>) => {
        if (message["kind"] === "requested-again") resolve("requested-again");
      });
    });
    expect(
      await Promise.race([following.then(() => "settled"), nextRequest]),
    ).toBe("requested-again");
    child.send("release");
    expect(await following).toMatchObject({
      kind: "uncertain",
      reason: "unconfirmed",
    });
    expect(existsSync(lock)).toBe(false);
  } finally {
    child.send("release");
    await following;
    const exited = once(child, "exit");
    child.send("close");
    child.disconnect();
    await exited;
    rmSync(home, { recursive: true, force: true });
  }
  expect(stderr).toBe("");
});
