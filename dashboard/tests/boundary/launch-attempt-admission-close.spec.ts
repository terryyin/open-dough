// Closing the admission owner while its durable intent is replaced must not
// allow effects when that write completes. The child owns its isolated HOME.
import { execFile } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { expect, test } from "../support/pageTest.ts";

const exec = promisify(execFile);

test("a closed owner keeps admission evidence but runs nothing after the write finishes", async () => {
  const home = mkdtempSync(path.join(tmpdir(), "dough-admission-close-"));
  const module = new URL("../../server/launchAttemptOwner.ts", import.meta.url)
    .href;
  try {
    const script = `
      import promises from 'node:fs/promises';
      import {syncBuiltinESMExports} from 'node:module';
      const {LaunchAttemptOwner} = await import(${JSON.stringify(module)});
      const owner = new LaunchAttemptOwner();
      const original = promises.rename;
      promises.rename = async (...args) => {
        if (String(args[1]).endsWith('/launch-attempts.json')) owner.close();
        return original(...args);
      };
      syncBuiltinESMExports();
      let ran = false;
      const answer = await owner.accept({source:'open-dough', host:'claude', workflow:'ad-hoc'}, async () => {
        ran = true;
        return {kind:'failed', reason:'refused', explanation:'Not launched.'};
      });
      console.log(JSON.stringify({answer, ran, kept: await owner.attempts()}));
    `;
    const { stdout, stderr } = await exec(
      process.execPath,
      [
        "--experimental-transform-types",
        "--disable-warning=ExperimentalWarning",
        "--input-type=module",
        "-e",
        script,
      ],
      { env: { ...process.env, HOME: home } },
    );
    expect(stderr).toBe("");
    const observed = JSON.parse(stdout) as {
      answer: unknown;
      ran: boolean;
      kept: { attempts: unknown[] };
    };
    expect(observed.answer).toMatchObject({
      kind: "failed",
      reason: "refused",
      explanation: expect.stringContaining("nothing was started or launched"),
    });
    expect(observed.ran).toBe(false);
    expect(observed.kept.attempts).toHaveLength(1);
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
});
