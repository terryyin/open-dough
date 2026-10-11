// What the unattached landing-capture specs share on a real start origin
// (./startOrigin.ts): the landing handoff a launch that established a session
// was given, the installed delivery command a one-shot landing runs, given
// that handoff, and an installation whose landing module predates a context
// with no story.

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { installedSkillPath } from "../../server/launchHosts.ts";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import { capturedPublicationSchema, git } from "./launchLanding.ts";
import type { StartOrigin } from "./startOrigin.ts";

type Host = "claude" | "codex";

const scripts = (folder: string, host: Host = "claude") =>
  installedSkillPath(
    host,
    { path: folder, shown: folder },
    "dough-execute-plan",
    "scripts",
  );

// The session a launch established and the landing context its reporting
// context names, as the file holds it.
export function landingHandoff(record: LaunchRecord) {
  const session = record.establishedSession;
  const reporting = record.request.reporting;
  if (session === undefined || reporting?.landingContext === undefined)
    throw new Error("No unattached landing handoff.");
  return {
    session,
    reporting,
    file: reporting.landingContext,
    context: JSON.parse(
      readFileSync(reporting.landingContext, "utf8"),
    ) as Record<string, string>,
  };
}

// The project's own repository, which outlives any worktree.
export const repositoryOf = (project: string) =>
  git(project, "rev-parse", "--path-format=absolute", "--git-common-dir");

// What the dashboard and origin held when the publication was about to push.
type BeforePush = {
  readonly trunk: string;
  readonly preparations: readonly { base: string; revision: string }[];
};

// Lands the session's workspace on trunk through the installed shared
// publication, as Dough Land runs it with no execution observer, given the
// launch's context and no identity. Answers its result and what the
// dashboard had kept, and origin held, just before the push.
export function land(
  record: LaunchRecord,
  origin: StartOrigin,
  home: string,
  host: Host = "claude",
) {
  const { session, reporting, file } = landingHandoff(record);
  const module = pathToFileURL(
    path.join(
      scripts(session.workspace, host),
      "execution-increment-publication.mjs",
    ),
  ).href;
  const attempts = path.join(
    home,
    ".open-dough/dashboard/launch-attempts.json",
  );
  const observed = path.join(origin.machine, `before-${reporting.reference}`);
  const code = [
    `import { publishExecutionIncrement } from ${JSON.stringify(module)};`,
    'import { execFileSync } from "node:child_process";',
    'import { readFileSync, writeFileSync } from "node:fs";',
    "const request = JSON.parse(process.argv[1]);",
    "const result = await publishExecutionIncrement({ ...request, beforePush: async () => {",
    `  const kept = Object.values(JSON.parse(readFileSync(${JSON.stringify(attempts)}, "utf8"))).flat();`,
    `  writeFileSync(${JSON.stringify(observed)}, JSON.stringify({`,
    '    trunk: execFileSync("git", ["-C", request.workspace, "ls-remote", request.remote, request.targetRef], { encoding: "utf8" }).split("\t")[0],',
    `    preparations: kept.find((entry) => entry.id === ${JSON.stringify(reporting.reference)})?.landingPreparations ?? [],`,
    "  }));",
    "} });",
    "console.log(JSON.stringify(result));",
  ].join("\n");
  const result = capturedPublicationSchema.parse(
    JSON.parse(
      execFileSync(
        process.execPath,
        [
          "--input-type=module",
          "-e",
          code,
          JSON.stringify({
            workspace: session.workspace,
            branch: session.branch,
            previouslyPublishedBase: session.startingRevision,
            remote: session.remote,
            targetRef: `refs/heads/${session.target}`,
            landingContext: file,
          }),
        ],
        { cwd: origin.machine, encoding: "utf8" },
      ),
    ),
  );
  return {
    result,
    before: JSON.parse(readFileSync(observed, "utf8")) as BeforePush,
  };
}

// Lands a Codex session's workspace with the installed delivery command, as
// a one-shot landing runs it, naming no identity and the launch's context.
// Codex only: its delivery starts no observer of the real repository.
export function deliver(record: LaunchRecord, origin: StartOrigin) {
  const { session, file } = landingHandoff(record);
  if (record.request.host !== "codex") throw new Error("Codex only.");
  return capturedPublicationSchema.parse(
    JSON.parse(
      execFileSync(
        process.execPath,
        [
          path.join(
            scripts(session.workspace, "codex"),
            "execution-increment-delivery.mjs",
          ),
          "deliver",
          "--mode",
          "story-branch",
          "--tracking",
          "one-shot",
          "--workspace",
          session.workspace,
          "--branch",
          session.branch,
          "--previously-published-base",
          session.startingRevision ?? "",
          "--host",
          "codex",
          "--repo",
          "terryyin/open-dough",
          "--target-ref",
          `refs/heads/${session.target}`,
          "--landing-context",
          file,
        ],
        {
          cwd: origin.machine,
          env: {
            ...process.env,
            DOUGH_CI_MAILBOX_ROOT: path.join(origin.machine, "mailboxes"),
          },
          encoding: "utf8",
        },
      ),
    ),
  );
}

// Leaves the project's installed landing module as one released before a
// context could name no story: it says nothing of accepting one. Published,
// so the default checkout stays clean and a new worktree holds it too.
export function withOlderLandingModule(origin: StartOrigin) {
  // Claude's installation, the host these specs launch.
  const module = path.join(scripts(origin.project), "dashboard-landing.mjs");
  const current = readFileSync(module, "utf8");
  const older = current.replace(
    /^export const acceptsLandingWithoutIdentity = true;\n/m,
    "",
  );
  if (older === current)
    throw new Error("The module names no such capability.");
  writeFileSync(module, older);
  git(origin.project, "commit", "-am", "older landing module");
  git(origin.project, "push", "origin", "main");
}
