// The harness of a lead reading's tests (./ci-proof-leads*.test.mjs): GitHub
// answering in-process as its Actions API does, from the runs and summaries a
// test says it holds; the project settings and retained summary files a test
// writes; and the table's sections, rows and gaps as a test reads them. A CI
// adapter answering literal wire JSON: ./ci-proof-adapter-test-fixtures.mjs.
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  actionsRunsAnswer,
  actionsWorkflowAnswer,
} from "../../../../../dashboard/tests/support/baseCiActions.ts";
import {
  runArtifactsAnswer,
  summaryZipAnswer,
} from "../../../../../dashboard/tests/support/ciProofArtifacts.ts";
import { parseActionsRequest } from "../../../../../dashboard/tests/support/ghActionsRequest.ts";
import { makeMe } from "../../../../tests/support/makeMe.mjs";
import { GitHubAcquisitionFailed } from "../../dough-execute-plan/scripts/ci-github-actions.mjs";

/**
 * GitHub holding RUNS (`makeMe.aCiRun`) of the selected workflow and, by
 * run id, the SUMMARIES their attempts kept; REFUSED routes answer HTTP
 * 403. `asked` keeps each route asked, in order.
 * @param {{
 *   repository: string;
 *   runs: readonly { id: number; attempt?: number; headSha: string }[];
 *   summaries?: Readonly<Record<number, unknown>>;
 *   refused?: (route: string) => boolean;
 * }} held
 */
export function gitHubHolding({ repository, runs, summaries = {}, refused }) {
  const asked = [];
  const answer = (route) => {
    asked.push(route);
    if (refused?.(route))
      throw new GitHubAcquisitionFailed(route, { kind: "http", status: 403 });
    return parseActionsRequest(route);
  };
  const runOf = (runId) => {
    const run = runs.find((each) => (each.databaseId ?? each.id) === runId);
    return makeMe.aCiProofCollectorRun
      .with({
        repository,
        runId,
        attempt: run?.attempt ?? 1,
        revision: run?.headSha ?? "",
      })
      .please();
  };
  return {
    asked,
    asks: {
      async readGitHubActions([, route]) {
        const request = answer(route);
        if (request?.kind === "actions-workflow")
          return JSON.parse(
            actionsWorkflowAnswer(`.github/workflows/${request.workflow}`).body,
          );
        if (request?.kind === "actions-runs")
          return JSON.parse(actionsRunsAnswer(runs).body);
        if (request?.kind === "actions-run-artifacts")
          return JSON.parse(
            runArtifactsAnswer(
              runOf(request.runId),
              summaries[request.runId] === undefined
                ? undefined
                : request.runId,
            ).body,
          );
        throw new Error(`unexpected GitHub request ${route}`);
      },
      async askGitHubArchive([, route]) {
        const request = answer(route);
        if (request?.kind !== "actions-artifact-zip")
          throw new Error(`unexpected GitHub archive request ${route}`);
        const summary = summaries[request.artifactId];
        return Buffer.from(summaryZipAnswer(summary).body, "base64");
      },
    },
  };
}

/**
 * The project settings TEXT written into CHECKOUT's working tree.
 * @param {string} checkout
 * @param {object} settings
 */
export function settingsIn(checkout, settings) {
  writeFileSync(
    join(checkout, ".planning/open-dough.json"),
    `${JSON.stringify(settings, null, 2)}\n`,
  );
}

/**
 * SUMMARY written as a file a project retains elsewhere, removed after T.
 * @param {{ after: (fn: () => void) => void }} t
 * @param {unknown} summary
 */
export function retainedSummary(t, summary) {
  const folder = mkdtempSync(join(tmpdir(), "ci-proof-retained-"));
  t.after(() => rmSync(folder, { recursive: true, force: true }));
  const file = join(folder, "ci-proof-summary.json");
  writeFileSync(file, `${JSON.stringify(summary)}\n`);
  return file;
}

/**
 * The line of TEXT, a reading's table, of the section NAME.
 * @param {string} text
 * @param {string} name
 */
export const lineOf = (text, name) =>
  text.split("\n").find((line) => line.startsWith(`${name} `));

/**
 * TEXT with each run of spaces as one, so rows compare whatever their
 * alignment.
 * @param {string} text
 */
export const rowsOf = (text) => text.replace(/ +/g, " ");

/**
 * The gaps TEXT lists, in order, each with its remedy after "; remedy: "
 * when it shows one.
 * @param {string} text
 */
export function gapsOf(text) {
  const gaps = [];
  for (const line of text.split("\n"))
    if (line.startsWith("  - ")) gaps.push(line.slice(4));
    else if (line.startsWith("    remedy: "))
      gaps.push(`${gaps.pop()}; remedy: ${line.slice(12)}`);
  return gaps;
}
