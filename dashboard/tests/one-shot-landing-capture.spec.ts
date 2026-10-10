// Retained landing evidence outlives the actual workspace and Git's other refs.
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { test, expect, stored } from "./support/codexStart.ts";
import { launch } from "./agentLaunchBoundary.ts";
import { requestFor, oneShot } from "./support/oneShotLaunch.ts";
import { keptAttempts } from "./acceptedAttempts.ts";
import {
  reportingChild,
  quote,
  recordOperation,
} from "./support/completionRecovery.ts";
import { landingReceiptSchema } from "../src/launchLanding.ts";
import {
  git,
  scripts,
  commit,
  checkout,
  refs,
  context,
  publish,
} from "./support/oneShotLanding.ts";
for (const workflow of ["refinement", "execution"] as const) {
  test(`${workflow} retains its accepted comparison through actual retirement and GC, without completing its launch`, async ({
    dashboard,
    origin,
    codexProtocol: native,
  }) => {
    if (native === undefined) throw new Error("No native fixture");
    const response = await launch(dashboard, {
      ...requestFor(
        workflow,
        oneShot("isolated", workflow === "refinement" ? "auto-land" : "review"),
      ),
      host: "codex",
    });
    expect(JSON.parse(response.body), response.body).toMatchObject({
      kind: "launched",
    });
    const record = stored(dashboard.home)[0];
    if (record === undefined) throw new Error("No launch record");
    const { established, reporting } = context(record);
    const base = established.startingRevision;
    const revision = commit(established.workspace, `${workflow}.txt`);
    const before = checkout(established.workspace);
    const startReceipt = keptAttempts(dashboard)[0]?.publication;
    const delivered = publish(record, origin.machine);
    expect(delivered.result).toMatchObject({
      ok: true,
      publication: "accepted",
      suffixBase: base,
      receipt: { sha: revision, target: "refs/heads/main" },
      landing: { state: "recorded" },
    });
    expect(delivered.before.attempt.landing).toBeUndefined();
    expect(delivered.before.attempt.completion).toBeUndefined();
    expect(delivered.before.attempt.landingPreparations.at(-1)).toMatchObject({
      base,
      revision,
    });
    expect(delivered.before.pair).toMatchObject({
      candidate: revision,
      suffixBase: base,
    });
    expect(delivered.before.submission).toMatchObject({
      reference: reporting.reference,
      source: "open-dough",
      host: "codex",
      identity: established.identity,
      base,
      revision,
      remote: "origin",
      target: "refs/heads/main",
    });
    expect(path.dirname(delivered.before.pending)).toBe(
      path.dirname(reporting.landingContext ?? ""),
    );
    expect(delivered.before.pending.startsWith(established.workspace)).toBe(
      false,
    );
    const receipt = landingReceiptSchema.parse(
      delivered.result.landing.receipt,
    );
    expect(receipt.state).toBe("recorded");
    const saved = stored(dashboard.home)[0];
    expect(saved?.landing).toMatchObject({
      base,
      revision,
      reference: reporting.reference,
      receipt: receipt.receipt,
    });
    expect(saved?.completion).toBeUndefined();
    expect(saved?.doneAt).toBeUndefined();
    expect(saved?.request).toEqual(record.request);
    expect(keptAttempts(dashboard)[0]?.publication).toEqual(startReceipt);
    expect(keptAttempts(dashboard)[0]?.landingPreparations).toHaveLength(1);
    expect(keptAttempts(dashboard)[0]?.completion).toBeUndefined();
    expect(checkout(established.workspace)).toEqual(before);
    expect(
      (
        await origin.originGit("show", "main:.planning/PRODUCT-BACKLOG.md")
      ).trim(),
    ).toBe(before.backlog.trim());
    const repository = git(
      established.workspace,
      "rev-parse",
      "--path-format=absolute",
      "--git-common-dir",
    );
    expect(saved?.landing?.repository).toBe(repository);
    const retirement = JSON.parse(
      execFileSync(
        process.execPath,
        [
          path.join(
            scripts(origin.project, "dough-land"),
            "worktree-retirement.mjs",
          ),
          "retire",
          "--repository",
          repository,
          "--worktree",
          established.workspace,
          "--branch",
          established.branch,
          "--remote",
          "origin",
          "--target-ref",
          "refs/heads/main",
          "--identity",
          established.identity,
          "--created-for-work",
          "--contained",
          revision,
        ],
        { cwd: origin.machine, encoding: "utf8" },
      ),
    ) as { ok?: boolean };
    expect(retirement.ok).toBe(true);
    expect(existsSync(established.workspace)).toBe(false);
    // Native lifecycle updates and completion report preserve the independent comparison.
    await recordOperation(dashboard, "updateRecord", ["open-dough", record]);
    const retry = await reportingChild(
      `${reporting.command} --operation landing --retry ${quote(delivered.before.pending)}`,
      origin.machine,
    );
    expect(retry.ok, retry.stderr).toBe(true);
    expect(JSON.parse(retry.stdout)).toEqual(receipt);
    expect(stored(dashboard.home)[0]?.landing?.receipt).toBe(receipt.receipt);
    // Remove every other local ref/reflog: only the retained launch pins hold the comparison.
    for (const line of refs(repository).split("\n")) {
      const [ref] = line.split(" ");
      if (ref && !ref.startsWith("refs/open-dough/one-shot/"))
        git(repository, "update-ref", "-d", ref);
    }
    git(repository, "reflog", "expire", "--expire=now", "--all");
    git(repository, "gc", "--prune=now");
    for (const object of [base, revision])
      expect(git(repository, "cat-file", "-t", object ?? "")).toBe("commit");
    expect(git(repository, "diff", "--name-only", base ?? "", revision)).toBe(
      `${workflow}.txt`,
    );
    expect(stored(dashboard.home)[0]?.completion).toBeUndefined();
    expect(stored(dashboard.home)[0]?.doneAt).toBeUndefined();
  });
}
