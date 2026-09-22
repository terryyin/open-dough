// CLI and Git helpers that turn fixture records into a committed repository.

import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

// Playwright loads test helpers as CommonJS, where import.meta is unavailable.
const repoRoot = process.cwd();
const cli = join(
  repoRoot,
  "src/skills/dough-product-backlog/scripts/product-backlog.mjs",
);

function runCli(directory: string, args: string[]) {
  return execFileSync(process.execPath, [cli, ...args], {
    cwd: directory,
    encoding: "utf8",
  });
}

export function writePlanning(
  directory: string,
  relative: string,
  contents: string,
) {
  const path = join(directory, ".planning", relative);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, contents, "utf8");
  return path;
}

export function recordState(
  directory: string,
  story: { identity: string; link: string },
  facts: {
    refinement: string;
    approach: string;
    plan?: string;
    assessment?: string;
    reasons?: string[];
    expectDocument?: string;
    expectPlan?: string;
  },
) {
  const args = [
    "record-state",
    "--identity",
    story.identity,
    "--link",
    story.link,
    "--refinement",
    facts.refinement,
    "--approach",
    facts.approach,
  ];
  if (facts.plan !== undefined) {
    args.push("--plan", facts.plan);
  }
  if (facts.assessment !== undefined) {
    args.push("--assessment", facts.assessment);
  }
  if (facts.expectDocument !== undefined) {
    args.push("--expect-document", facts.expectDocument);
  }
  if (facts.expectPlan !== undefined) {
    args.push("--expect-plan", facts.expectPlan);
  }
  for (const reason of facts.reasons ?? []) {
    args.push("--reason", reason);
  }
  runCli(directory, args);
}

function readState(directory: string, link: string) {
  const stdout = runCli(directory, ["read-state", "--link", link]);
  return JSON.parse(stdout) as {
    basis: { document: string; plan?: string };
  };
}

export function recordAssessed(
  directory: string,
  story: { identity: string; link: string },
  facts: {
    refinement: string;
    approach: string;
    plan?: string;
    assessment: string;
    reasons?: string[];
  },
) {
  recordState(directory, story, {
    refinement: facts.refinement,
    approach: facts.approach,
    ...(facts.plan !== undefined && { plan: facts.plan }),
  });
  const basis = readState(directory, story.link);
  recordState(directory, story, {
    refinement: facts.refinement,
    approach: facts.approach,
    ...(facts.plan !== undefined && { plan: facts.plan }),
    assessment: facts.assessment,
    ...(facts.reasons !== undefined && { reasons: facts.reasons }),
    expectDocument: basis.basis.document,
    ...(basis.basis.plan !== undefined && { expectPlan: basis.basis.plan }),
  });
}

export function commitAll(directory: string, message: string): string {
  execFileSync("git", ["-C", directory, "init"], { encoding: "utf8" });
  return commitChanges(directory, message);
}

export function commitChanges(directory: string, message: string): string {
  execFileSync("git", ["-C", directory, "add", "-A"], { encoding: "utf8" });
  return commitIndex(directory, message);
}

export function commitPaths(
  directory: string,
  repositoryPaths: readonly string[],
  message: string,
): string {
  execFileSync("git", ["-C", directory, "add", "--", ...repositoryPaths], {
    encoding: "utf8",
  });
  return commitIndex(directory, message);
}

function commitIndex(directory: string, message: string): string {
  execFileSync(
    "git",
    [
      "-C",
      directory,
      "-c",
      "user.name=Story Readiness Fixture",
      "-c",
      "user.email=fixture@example.com",
      "commit",
      "-m",
      message,
    ],
    { encoding: "utf8" },
  );
  return execFileSync("git", ["-C", directory, "rev-parse", "HEAD"], {
    encoding: "utf8",
  }).trim();
}

export function scratchRepo(
  after: (cleanup: () => void) => void,
  prefix: string,
) {
  const directory = mkdtempSync(join(tmpdir(), prefix));
  after(() => {
    rmSync(directory, { recursive: true, force: true });
  });
  return directory;
}
