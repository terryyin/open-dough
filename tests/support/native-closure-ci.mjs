// @ts-check
// Controlled GitHub responses for the closure harness. Run facts use the same
// MakeMe/transport encoding as the observer's deterministic tests. Routes,
// release markers and request logging remain harness operations.
import { appendFileSync, existsSync, readFileSync, statSync } from "node:fs";
import { apiRun } from "../../src/skills/dough-execute-plan/scripts/github-actions-api-test-fixtures.mjs";
import { makeMe } from "./makeMe.mjs";

/** @param {number} id @param {string} sha @param {string} branch @param {string} url @param {string} created */
function run(id, sha, branch, url, created) {
  return apiRun(
    makeMe.aCiRun
      .with({
        databaseId: id,
        headSha: sha,
        headBranch: branch,
        url,
        createdAt: created,
        attempt: 1,
        event: "push",
        status: "completed",
        conclusion: "success",
      })
      .please(),
  );
}

/** @param {string} path */
const isFile = (path) => existsSync(path) && statSync(path).isFile();

/** @param {object[]} runs */
const listing = (runs) => ({ total_count: runs.length, workflow_runs: runs });
const [kind, route = ""] = process.argv.slice(2);
const env = process.env;
/** @param {string} name */
const fact = (name) => {
  const value = env[name];
  if (value === undefined)
    throw new Error(`missing closure fixture fact: ${name}`);
  return value;
};
let response;
if (route.includes("/jobs?")) {
  response = { total_count: 0, jobs: [] };
} else if (!route.includes("/actions/workflows/")) {
  // Exact partial attempt response; not an ordinary observed run.
  response = {
    run_attempt: 1,
    status: "completed",
    conclusion: "success",
    html_url: "https://ci.invalid/run",
  };
} else if (!route.includes("/runs?")) {
  response = { id: 7001, name: "CI" };
} else if (kind === "trunk") {
  const base = run(
    1,
    fact("TRUNK_CLOSURE_BASE_SHA"),
    "main",
    "https://ci.invalid/base",
    "2026-09-22T00:00:00Z",
  );
  if (
    env.TRUNK_CLOSURE_SCENARIO === "source" &&
    isFile(fact("TRUNK_CLOSURE_RELEASE"))
  ) {
    appendFileSync(
      fact("TRUNK_CLOSURE_GH_LOG"),
      `${fact("TRUNK_CLOSURE_CANDIDATE_SHA")}\n`,
    );
    response = listing([
      base,
      run(
        2,
        fact("TRUNK_CLOSURE_CANDIDATE_SHA"),
        "main",
        "https://ci.invalid/candidate",
        "2026-09-22T00:01:00Z",
      ),
    ]);
  } else response = listing([base]);
} else if (kind === "story") {
  if (route.includes("branch=exec%2Fstory")) {
    response = listing([
      run(
        11,
        fact("STORY_CLOSURE_BRANCH_SHA"),
        "exec/story",
        "https://ci.invalid/branch",
        "2026-09-22T00:01:00Z",
      ),
    ]);
  } else {
    const base = run(
      21,
      fact("STORY_CLOSURE_TRUNK_SHA"),
      "main",
      "https://ci.invalid/trunk-base",
      "2026-09-22T00:02:00Z",
    );
    const integrated = fact("STORY_CLOSURE_INTEGRATED_SHA_FILE");
    const released =
      isFile(fact("STORY_CLOSURE_RELEASE")) &&
      existsSync(integrated) &&
      statSync(integrated).size > 0;
    const candidate = released
      ? readFileSync(integrated, "utf8").replace(/\n+$/u, "")
      : "";
    response = released
      ? listing([
          base,
          run(
            22,
            candidate,
            "main",
            "https://ci.invalid/integrated",
            "2026-09-22T00:03:00Z",
          ),
        ])
      : listing([base]);
  }
} else throw new Error(`unknown native closure CI kind: ${kind}`);
process.stdout.write(`${JSON.stringify(response)}\n`);
