// Publish a planning-only origin head after the current main tip so base-CI
// journeys can place a nearest ancestor result on the prior revision
// (`../../../e2e/launches/agent-launch-base-ci.spec.ts` and its completed-history/unread siblings).

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { Page } from "@playwright/test";
import { publishCommittedOrigin } from "../committedOrigin.ts";

const exec = promisify(execFile);

async function git(cwd: string, ...args: string[]) {
  return (await exec("git", args, { cwd })).stdout.trim();
}

export async function publishLaterHead(
  origin: {
    readonly origin: string;
    readonly project: string;
    originGit(...args: string[]): Promise<string>;
  },
  page: Page,
  subject: string,
) {
  const ancestor = (await origin.originGit("rev-parse", "main")).trim();
  await git(origin.project, "pull", "--ff-only", "origin", "main");
  await git(
    origin.project,
    "-c",
    "user.name=Dashboard Developer",
    "-c",
    "user.email=developer@example.test",
    "commit",
    "--allow-empty",
    "-m",
    subject,
  );
  await git(origin.project, "push", "origin", "HEAD:main");
  const head = (await origin.originGit("rev-parse", "main")).trim();
  const published = await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: head,
    repository: "terryyin/open-dough",
    follows: true,
  });
  return { ancestor, head, published };
}
