// The local authenticated read service at the browser's fetch boundary, with
// the published content it answers, for the mounted Intent revision cases
// (./intent-revision-*.mounted.spec.ts, ./intent-revision-reading.mounted.ts).
import { onTestFinished, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { forgetAnswers } from "../../src/answerMemo.ts";
import { authenticatedReadEndpoint } from "../../src/authenticatedReadRules.ts";
import { forgetCachedFiles } from "../../src/fileContentCache.ts";
import type { IntentLocationsAnswer } from "../../server/intentLocationsRead.ts";
import { actSettled } from "../../test-support/mounted-dashboard/mountedActSettled.ts";

export const featuresFolder = "e2e_test/features";
export const featurePath = `${featuresFolder}/jobs.feature`;
export const otherPath = `${featuresFolder}/disk_space.feature`;
export const otherFeature = `Feature: Disk space
  Scenario: Report free space
    Then I see its free space
`;
// A feature long enough for the reading pane to scroll.
export const longFeature = (scenario: string) =>
  `Feature: Jobs\n  Scenario: ${scenario}\n    Then it is done\n${[
    ...Array(60).keys(),
  ]
    .map((n) => `\n  Scenario: Keep job ${n}\n    Then it stays\n`)
    .join("")}`;

export type Snapshot = Readonly<Record<string, string>>;

const answer = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

// The trunk's unchanged CI judgment and empty history, which Intent reads
// beside every published revision.
function trunkCiAnswer(params: URLSearchParams) {
  const revision = params.get("revision") ?? "";
  if (params.get("intent") === "ci-status")
    return makeMe.anIntentCiStatus
      .with({
        branch: "main",
        revision,
        state: "unread",
        subject: "No readable result",
        laterWithoutResult: 0,
        reason:
          "No result of the selected check was found in the readable history",
        checkedAt: "2026-11-01T00:00:00.000Z",
        freshness: "fresh",
      })
      .please();
  if (params.get("intent") !== "ci-history") return undefined;
  if (!params.has("scope")) return makeMe.aCiHistoryAnswer.please();
  return makeMe.aScopeHistoryGlance
    .with({
      path: params.get("scope") ?? "",
      selectedRevision: revision,
      availability: "empty",
      entries: [],
    })
    .please();
}

const locationsOf = (
  revision: string,
  files: Snapshot,
): IntentLocationsAnswer => ({
  revision,
  locations: [
    makeMe.anIntentLocation
      .at(featuresFolder)
      .ofKind("gherkin")
      .selecting(
        ...Object.keys(files).filter((file) =>
          file.startsWith(`${featuresFolder}/`),
        ),
      )
      .please(),
  ],
});

// The read service answering Intent's locations and file reads at each published revision and
// the trunk's CI. `reads` lists Intent's reads as `<what>@<revision>`;
// `unexpected` any other call; `holdLocationsOf` keeps one revision's
// locations read until the case releases it. Each service starts the
// browser session's read caches empty, so every read a case causes reaches it.
export function publishedReadService(published: Map<string, Snapshot>) {
  forgetAnswers();
  forgetCachedFiles();
  const reads: string[] = [];
  const unexpected: string[] = [];
  const holds = new Map<string, Promise<void>>();
  const held: string[] = [];
  const realFetch = window.fetch.bind(window);
  const fetchSpy = vi
    .spyOn(window, "fetch")
    .mockImplementation(async (input, init) => {
      const url = new URL(
        input instanceof Request ? input.url : String(input),
        location.href,
      );
      if (url.pathname !== authenticatedReadEndpoint)
        return realFetch(input, init);
      const params = url.searchParams;
      const ci = trunkCiAnswer(params);
      if (ci !== undefined) return answer(ci);
      const [intent, path] = [params.get("intent"), params.get("path")];
      const revision = params.get("revision") ?? "";
      const files = published.get(revision);
      if (files !== undefined && intent === "locations") {
        reads.push(`locations@${revision}`);
        const hold = holds.get(revision);
        if (hold !== undefined) {
          held.push(revision);
          await hold;
        }
        return answer(locationsOf(revision, files));
      }
      if (files !== undefined && path !== null && path in files) {
        reads.push(`${path}@${revision}`);
        return answer({ revision, path, text: files[path] });
      }
      unexpected.push(url.search);
      return answer({ error: `Unexpected read ${url.search}` }, 404);
    });
  onTestFinished(() => {
    fetchSpy.mockRestore();
  });
  return {
    reads,
    unexpected,
    held: () => held.length,
    // Holds the revision's locations read; the returned release lets it
    // answer and settles the reading it updates.
    holdLocationsOf(revision: string) {
      let release = () => {};
      holds.set(
        revision,
        new Promise<void>((resolve) => {
          release = resolve;
        }),
      );
      onTestFinished(() => {
        release();
      });
      return () => actSettled(release);
    },
  };
}
