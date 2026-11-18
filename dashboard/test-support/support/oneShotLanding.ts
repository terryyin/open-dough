// Capture setup goes through the installed publisher and real reporting receiver.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import { capturedPublicationSchema, git, scripts } from "./launchLanding.ts";

export function checkout(workspace: string) {
  return {
    head: git(workspace, "rev-parse", "HEAD"),
    status: git(workspace, "status", "--porcelain"),
    index: readFileSync(
      git(
        workspace,
        "rev-parse",
        "--path-format=absolute",
        "--git-path",
        "index",
      ),
    ).toString("base64"),
    backlog: readFileSync(
      path.join(workspace, ".planning/PRODUCT-BACKLOG.md"),
      "utf8",
    ),
    seed: readFileSync(path.join(workspace, ".planning/seeds/A.md"), "utf8"),
  };
}
export function context(record: LaunchRecord) {
  const established = record.start ?? record.preparation;
  const reporting = record.request.reporting;
  if (
    established === undefined ||
    !("tracking" in established) ||
    reporting?.landingContext === undefined
  )
    throw new Error("No real one-shot landing handoff.");
  return { established, reporting };
}
export function publish(record: LaunchRecord, cwd: string) {
  const { established, reporting } = context(record);
  const module = pathToFileURL(
    path.join(
      scripts(established.workspace),
      "execution-increment-publication.mjs",
    ),
  ).href;
  const request = {
    workspace: established.workspace,
    branch: established.branch,
    previouslyPublishedBase: established.startingRevision,
    remote: established.remote,
    targetRef: `refs/heads/${established.target}`,
    landingContext: reporting.landingContext,
  };
  const observed = path.join(cwd, `before-${reporting.reference}.json`);
  const code = `import {publishExecutionIncrement} from ${JSON.stringify(module)}; import {readFileSync, writeFileSync} from 'node:fs'; import path from 'node:path'; const result = await publishExecutionIncrement({...JSON.parse(process.argv[1]), beforePush: async pair => { const directory = path.dirname(${JSON.stringify(reporting.landingContext)}); const current = JSON.parse(readFileSync(path.join(directory, 'landing-current.json'))); writeFileSync(${JSON.stringify(observed)}, JSON.stringify({pair, submission: JSON.parse(readFileSync(current.pending)), pending: current.pending, attempt: JSON.parse(readFileSync(${JSON.stringify(path.join(cwd, "home/.open-dough/dashboard/launch-attempts.json"))}))["open-dough"].find(entry => entry.id === ${JSON.stringify(reporting.reference)})})); }}); console.log(JSON.stringify(result));`;
  const result = capturedPublicationSchema.parse(
    JSON.parse(
      execFileSync(
        process.execPath,
        ["--input-type=module", "-e", code, JSON.stringify(request)],
        { cwd, encoding: "utf8" },
      ),
    ),
  );
  return {
    result,
    before: JSON.parse(readFileSync(observed, "utf8")) as {
      pair: { candidate: string; suffixBase: string };
      submission: Record<string, string>;
      pending: string;
      attempt: {
        landing?: unknown;
        completion?: unknown;
        landingPreparations: { base: string; revision: string }[];
      };
    },
  };
}
