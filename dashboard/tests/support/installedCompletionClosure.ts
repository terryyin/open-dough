// Real installed Git/closure/retirement setup with observer ownership through shutdown.
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { expect } from "@playwright/test";
import { queuedIdentity, type StartOrigin } from "./startOrigin.ts";
import { completionCi } from "./completionCi.ts";

const exec = promisify(execFile);
export type CompletionClosure =
  "Land" | "Story Branch Wrap Up" | "Trunk Wrap Up";

export async function withInstalledCompletionClosure(
  origin: StartOrigin,
  workspace: string,
  closure: CompletionClosure,
  observe: (final: string) => Promise<void>,
  proofEnv = process.env,
): Promise<void> {
  const git = async (...args: string[]) =>
    (
      await exec("git", ["-C", workspace, ...args], { env: proofEnv })
    ).stdout.trim();
  const installed = path.join(workspace, ".agents/skills");
  const run = async (
    skill: string,
    script: string,
    args: string[],
    env = proofEnv,
  ) =>
    (
      await exec(
        process.execPath,
        [path.join(installed, skill, "scripts", script), ...args],
        { cwd: origin.machine, env },
      )
    ).stdout;
  const branch = await git("branch", "--show-current");
  const repository = await git(
    "rev-parse",
    "--path-format=absolute",
    "--git-common-dir",
  );
  writeFileSync(
    path.join(workspace, "product.txt"),
    "Accepted product result\n",
  );
  await git("add", "product.txt");
  await git("commit", "-m", "Retain product knowledge before closure");
  const beforeCleanup = await git("rev-parse", "HEAD");
  await git("push", "origin", "HEAD:refs/heads/main");
  let final = beforeCleanup;
  let mailbox: string | undefined;
  let ci: ReturnType<typeof completionCi> | undefined;
  if (closure !== "Land") {
    writeFileSync(
      path.join(workspace, ".planning/closure-result.md"),
      "Fixture final closure\n",
    );
    await git("add", ".planning/closure-result.md");
    await git("commit", "-m", "Commit final closure");
    final = await git("rev-parse", "HEAD");
    ci = completionCi(origin.machine, [beforeCleanup, final]);
    const observer = await run(
      "dough-execute-plan",
      "ci-mailbox.mjs",
      ["start", "--execution", "terryyin/open-dough", "main", "60000"],
      ci.env,
    );
    mailbox = (
      JSON.parse(observer.trim().replace(/^CI_OBSERVER /, "")) as {
        directory: string;
      }
    ).directory;
  }
  try {
    if (closure === "Story Branch Wrap Up" && ci !== undefined) {
      if (mailbox === undefined) throw new Error("Missing fixture CI observer");
      await git("push", "origin", `HEAD:refs/heads/${branch}`);
      await exec("git", ["-C", origin.project, "fetch", "origin"]);
      await exec("git", [
        "-C",
        origin.project,
        "merge",
        "--no-ff",
        "-m",
        "Integrate published final closure",
        `origin/${branch}`,
      ]);
      await exec("git", ["-C", origin.project, "push", "origin", "main"]);
      final = (await origin.originGit("rev-parse", "main")).trim();
      // The provider answers for the accepted integrated SHA, not the old branch tip.
      writeFileSync(
        ci.provider,
        readFileSync(ci.provider, "utf8").replaceAll(
          await git("rev-parse", "HEAD"),
          final,
        ),
        { mode: 0o755 },
      );
      await run(
        "dough-execute-plan",
        "ci-mailbox.mjs",
        ["register-push", mailbox, final],
        ci.env,
      );
      ci.release();
      const receipt = JSON.parse(
        (
          await run(
            "dough-execute-plan",
            "ci-mailbox.mjs",
            ["complete-revision", mailbox, final],
            ci.env,
          )
        )
          .trim()
          .replace(/^CI_OBSERVER_RESULT /, "")
          .replace(/^CI_OBSERVER /, ""),
      ) as {
        verdict?: string;
        shutdown: { status: string };
      };
      expect(receipt.shutdown.status).toBe("confirmed");
      expect(receipt.verdict).toBe("success");
    } else if (closure === "Trunk Wrap Up" && ci !== undefined) {
      if (mailbox === undefined) throw new Error("Missing fixture CI observer");
      await git("push", "origin", "HEAD:refs/heads/main");
      await run(
        "dough-execute-plan",
        "ci-mailbox.mjs",
        ["register-push", mailbox, final],
        ci.env,
      );
      ci.release();
      const finished: unknown = JSON.parse(
        (
          await run(
            "dough-story-wrap-up",
            "trunk-closure.mjs",
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
              "refs/heads/main",
              "--repo",
              "terryyin/open-dough",
              "--host",
              "codex",
              "--repository",
              repository,
              "--identity",
              queuedIdentity,
              "--created-for-work",
            ],
            ci.env,
          )
        ).trim(),
      );
      expect(finished).toMatchObject({
        ok: true,
        publication: "accepted",
        acceptedSha: final,
        completion: { verdict: "success", shutdown: { status: "confirmed" } },
        cleanup: { removed: true },
      });
    }
    expect((await origin.originGit("rev-parse", "main")).trim()).toBe(final);
    if (closure !== "Trunk Wrap Up") {
      const retired = JSON.parse(
        (
          await run("dough-land", "worktree-retirement.mjs", [
            "retire",
            "--repository",
            repository,
            "--worktree",
            workspace,
            "--branch",
            branch,
            "--remote",
            "origin",
            "--target-ref",
            "refs/heads/main",
            "--identity",
            queuedIdentity,
            "--created-for-work",
            "--remote-branch",
            branch,
            "--contained",
            final,
          ])
        ).trim(),
      ) as { ok?: boolean };
      expect(retired.ok).toBe(true);
    }
    expect(existsSync(workspace)).toBe(false);
    await observe(final);
  } finally {
    // Own every real observer to shutdown, even when an assertion fails.
    if (mailbox !== undefined) {
      if (existsSync(workspace))
        await run(
          "dough-execute-plan",
          "ci-mailbox.mjs",
          ["stop", mailbox],
          ci?.env,
        );
      else
        expect(
          (
            JSON.parse(
              readFileSync(path.join(mailbox, "result.json"), "utf8"),
            ) as {
              status: string;
            }
          ).status,
        ).toMatch(/^(finished|stopped)$/);
    }
  }
}
