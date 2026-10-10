// Installed managed commands preserve their launch-bound comparison on resume.
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { test, expect, stored } from "./support/codexStart.ts";
import { launch } from "./agentLaunchBoundary.ts";
import { requestFor, oneShot } from "./support/oneShotLaunch.ts";
import {
  scripts,
  commit,
  context,
  capturedPublicationSchema,
} from "./support/oneShotLanding.ts";
test("the installed managed delivery and resume CLIs carry --landing-context without a second push or observer", async ({
  dashboard,
  origin,
}) => {
  await launch(dashboard, {
    ...requestFor("execution", oneShot("isolated", "auto-land")),
    host: "codex",
  });
  const record = stored(dashboard.home)[0];
  if (record === undefined) throw new Error("No execution launch");
  const { established, reporting } = context(record);
  const revision = commit(established.workspace, "managed.txt");
  const common = [
    "--workspace",
    established.workspace,
    "--host",
    "codex",
    "--repo",
    "terryyin/open-dough",
    "--target-ref",
    "refs/heads/main",
    "--landing-context",
    reporting.landingContext ?? "",
  ];
  const env = {
    ...process.env,
    DOUGH_CI_MAILBOX_ROOT: path.join(origin.machine, "managed-mailboxes"),
  };
  const delivered = capturedPublicationSchema.parse(
    JSON.parse(
      execFileSync(
        process.execPath,
        [
          path.join(
            scripts(established.workspace),
            "execution-increment-delivery.mjs",
          ),
          "deliver",
          "--mode",
          "story-branch",
          "--tracking",
          "one-shot",
          "--branch",
          established.branch,
          "--previously-published-base",
          established.startingRevision ?? "",
          "--one-shot-identity",
          established.identity,
          ...common,
        ],
        { cwd: origin.machine, env, encoding: "utf8" },
      ),
    ),
  );
  expect(delivered).toMatchObject({
    ok: true,
    publication: "accepted",
    suffixBase: established.startingRevision,
    receipt: { sha: revision },
    observation: { state: "unobserved" },
    landing: { state: "recorded" },
  });
  const resumed = capturedPublicationSchema.parse(
    JSON.parse(
      execFileSync(
        process.execPath,
        [
          path.join(
            scripts(established.workspace),
            "execution-increment-resume.mjs",
          ),
          "resume",
          "--candidate-sha",
          revision,
          "--suffix-base",
          established.startingRevision ?? "",
          ...common,
        ],
        { cwd: origin.machine, env, encoding: "utf8" },
      ),
    ),
  );
  expect(resumed).toMatchObject({
    ok: true,
    publication: "accepted",
    pushCount: 0,
    suffixBase: established.startingRevision,
    landing: { state: "recorded", receipt: delivered.landing.receipt },
  });
  expect(stored(dashboard.home)[0]?.landing?.receipt).toBe(
    delivered.landing.receipt.receipt,
  );
  expect(existsSync(path.join(origin.machine, "managed-mailboxes"))).toBe(
    false,
  );
  expect(stored(dashboard.home)[0]?.completion).toBeUndefined();
  expect(stored(dashboard.home)[0]?.doneAt).toBeUndefined();
});
