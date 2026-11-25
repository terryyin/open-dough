import { execFile } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import { expect } from "@playwright/test";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { launchResultSchema } from "../../src/launchOutcome.ts";
import { admittedClaimCheckoutSchema } from "../../src/launchLanding.ts";
import { launch } from "../agentLaunchBoundary.ts";
import { completionCi } from "./completionCi.ts";
import {
  claimCompletionObserver,
  completionCoordinator,
} from "./completionObserverClaim.ts";
import { completeBacklogStory } from "./completedStoryPublication.ts";
import type { DashboardServer } from "./dashboardServer.ts";
import type { StartOrigin } from "./startOrigin.ts";
import { commitAll, git, writeAt } from "./storyReviewWorktree.ts";

const exec = promisify(execFile);
const skills = ".agents/skills";
const targetRef = "refs/heads/main";
const repo = "terryyin/open-dough";

export async function admitForCompletion(
  dashboard: DashboardServer,
  origin: StartOrigin,
  title: string,
) {
  const request = makeMe.anAcceptedAttempt
    .requesting({
      source: "open-dough",
      host: "codex",
      workflow: "ad-hoc",
      instruction: title,
    })
    .please().request;
  const response = await launch(dashboard, request);
  expect(response.status, response.body).toBe(200);
  const launched = launchResultSchema.parse(JSON.parse(response.body));
  if (
    launched.kind !== "launched" ||
    launched.record.request.workflow !== "ad-hoc"
  )
    throw new Error(response.body);
  const { storyIdentity: identity, reporting } = launched.record.request;
  if (!identity || !reporting?.landingContext)
    throw new Error("The admitted launch has no installed context.");
  const landingContext = reporting.landingContext;
  const handoff = JSON.parse(
    readFileSync(
      path.join(path.dirname(landingContext), "admitted-claim.json"),
      "utf8",
    ),
  ) as { admission: unknown };
  const claim = admittedClaimCheckoutSchema.parse(handoff.admission);
  expect(claim.workspace).not.toBe(origin.project);
  expect((await origin.originGit("rev-parse", "main")).trim()).toBe(
    claim.publishedSha,
  );
  expect(
    await origin.originGit("show", "main:.planning/PRODUCT-BACKLOG.md"),
  ).toContain(identity);
  return { claim, identity, reporting, landingContext, origin };
}

export type AdmittedCompletion = Awaited<ReturnType<typeof admitForCompletion>>;

async function runSkill(
  workspace: string,
  command: string,
  args: string[],
  env = process.env,
) {
  try {
    const { stdout } = await exec(
      process.execPath,
      [path.join(workspace, skills, command), ...args],
      { cwd: workspace, env },
    );
    return stdout.trim();
  } catch (error) {
    const { stdout } = error as { stdout?: string };
    if (stdout?.trim()) throw new Error(stdout.trim(), { cause: error });
    throw error;
  }
}

export async function landNativeWork(
  admitted: AdmittedCompletion,
  file: string,
) {
  const native = admitted.origin.project;
  const { publishedSha } = admitted.claim;
  git(native, "merge", "--ff-only", publishedSha);
  writeAt(native, file, "Accepted native work\n");
  const candidate = commitAll(native, "Verify product behavior before cleanup");
  const result: unknown = JSON.parse(
    await runSkill(
      native,
      "dough-execute-plan/scripts/execution-increment-delivery.mjs",
      [
        "deliver",
        "--workspace",
        native,
        "--branch",
        "main",
        "--mode",
        "trunk",
        "--previously-published-base",
        publishedSha,
        "--target-ref",
        targetRef,
        "--repo",
        repo,
        "--host",
        "codex",
        "--validated-candidate",
        candidate,
        "--landing-context",
        admitted.landingContext,
      ],
    ),
  );
  expect(result).toMatchObject({
    ok: true,
    suffixBase: publishedSha,
    receipt: { sha: candidate },
  });
  return candidate;
}

export async function finishAdmittedClaim(
  admitted: AdmittedCompletion,
  beforeCleanup: string,
  defaultCheckout?: string,
) {
  const {
    claim: { workspace, branch },
    identity,
    landingContext,
    origin,
  } = admitted;
  git(workspace, "fetch", "--quiet", "origin");
  git(workspace, "merge", "--ff-only", beforeCleanup);
  completeBacklogStory(workspace, { identity, skillsDirectory: skills });
  const final = commitAll(workspace, "Complete the admitted story");
  const ci = completionCi(
    mkdtempSync(path.join(origin.machine, "admitted-completion-")),
    [beforeCleanup, final],
  );
  const mailbox = "dough-execute-plan/scripts/ci-mailbox.mjs";
  let observerDirectory: string | undefined;
  try {
    const observer = await runSkill(
      workspace,
      mailbox,
      ["start", "--execution", repo, "main"],
      ci.env,
    );
    ({ directory: observerDirectory } = JSON.parse(
      observer.replace(/^CI_OBSERVER /, ""),
    ) as { directory: string });
    await claimCompletionObserver(
      path.join(workspace, skills),
      workspace,
      observer,
      ci.env,
    );
    ci.release();
    const result: unknown = JSON.parse(
      await runSkill(
        workspace,
        "dough-story-wrap-up/scripts/trunk-closure.mjs",
        [
          "finish",
          "--workspace",
          workspace,
          "--branch",
          branch,
          "--before-cleanup",
          beforeCleanup,
          "--final",
          final,
          "--previously-published-base",
          beforeCleanup,
          "--target-ref",
          targetRef,
          "--repo",
          repo,
          "--host",
          "cursor",
          "--session-json",
          JSON.stringify(completionCoordinator),
          "--identity",
          identity,
          "--admitted-launch-context",
          landingContext,
          ...(defaultCheckout === undefined
            ? []
            : ["--default-checkout", defaultCheckout]),
        ],
        ci.env,
      ),
    );
    expect(result).toMatchObject({
      ok: true,
      acceptedSha: final,
      cleanup: { removed: true },
      completion: { verdict: "success", shutdown: { status: "confirmed" } },
    });
    return final;
  } finally {
    try {
      if (observerDirectory && existsSync(workspace))
        await runSkill(workspace, mailbox, ["stop", observerDirectory], ci.env);
    } finally {
      await ci.endRequests();
    }
  }
}
