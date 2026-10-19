// Real first landing followed by published story closure for installed completion journeys.
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { expect } from "@playwright/test";
import { parseBacklog } from "../../../src/skills/dough-product-backlog/scripts/product-backlog-document.mjs";
import { queuedIdentity, type StartOrigin } from "./startOrigin.ts";

const exec = promisify(execFile);

export async function publishCompletionClosure(
  origin: StartOrigin,
  workspace: string,
  proofEnv: NodeJS.ProcessEnv,
  landingContext: string | undefined,
  observeKept: (() => Promise<void>) | undefined,
): Promise<string> {
  const git = async (...args: string[]) =>
    (
      await exec("git", ["-C", workspace, ...args], { env: proofEnv })
    ).stdout.trim();
  writeFileSync(
    path.join(workspace, "product.txt"),
    "Accepted product result\n",
  );
  await git("add", "product.txt");
  await git("commit", "-m", "Retain product knowledge before closure");
  const delivered = await git("rev-parse", "HEAD");
  // Use the supplied launch capability before publication, then record its
  // real accepted comparison before retirement removes the workspace.
  const landingModule =
    landingContext === undefined
      ? undefined
      : path.join(path.dirname(landingContext), "dashboard-landing.mjs");
  const pending =
    landingModule === undefined
      ? undefined
      : (
          await exec(
            process.execPath,
            [
              "--input-type=module",
              "-e",
              'const m = await import(process.argv[1]); process.stdout.write(await m.retainLandingComparison(process.argv[2], {candidate: process.argv[3], suffixBase: process.argv[4]}, {remote: "origin", targetRef: "refs/heads/main"}));',
              landingModule,
              landingContext ?? "",
              delivered,
              (await origin.originGit("rev-parse", "main")).trim(),
            ],
            { cwd: origin.machine, env: proofEnv },
          )
        ).stdout;
  await git("push", "origin", "HEAD:refs/heads/main");
  if (landingModule !== undefined && pending !== undefined) {
    const captured = await exec(
      process.execPath,
      [
        "--input-type=module",
        "-e",
        "const m = await import(process.argv[1]); process.stdout.write(JSON.stringify(await m.submitLandingInput(process.argv[2])));",
        landingModule,
        pending,
      ],
      { cwd: origin.machine, env: proofEnv },
    );
    expect(JSON.parse(captured.stdout)).toMatchObject({ state: "recorded" });
  }
  await observeKept?.();
  const backlog = path.join(workspace, ".planning/PRODUCT-BACKLOG.md");
  const backlogDocument = readFileSync(backlog, "utf8");
  // Final closure removes the accepted story from the active backlog.
  const entry = parseBacklog(backlogDocument).entries.find(
    (item: { identity: string }) => item.identity === queuedIdentity,
  );
  if (entry === undefined) throw new Error("Missing closing story");
  const backlogLines = backlogDocument.split("\n");
  backlogLines.splice(entry.index as number, 1);
  writeFileSync(backlog, backlogLines.join("\n"));
  await git("add", ".planning/PRODUCT-BACKLOG.md");
  await git("commit", "-m", "Close accepted story");
  const beforeCleanup = await git("rev-parse", "HEAD");
  await git("push", "origin", "HEAD:refs/heads/main");
  return beforeCleanup;
}
