// The local authenticated read service at the browser's fetch boundary,
// answering the files each revision publishes and their Intent locations, for
// the mounted Intent revision cases (./intent-revision-*.spec.ts).
import { onTestFinished, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import {
  pygardonFeatures,
  type PublishedFiles,
} from "../../../Distribution/tests/support/publishedFilesTestData.mjs";
import { forgetAnswers } from "../../src/answerMemo.ts";
import { authenticatedReadEndpoint } from "../../src/authenticatedReadRules.ts";
import { forgetCachedFiles } from "../../src/fileContentCache.ts";
import { clearAllTransientFailures } from "../../src/transientRecovery.ts";
import type { IntentLocationsAnswer } from "../../server/intentLocationsRead.ts";

const { folder } = pygardonFeatures;

const answer = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

const locationsOf = (
  revision: string,
  files: PublishedFiles,
): IntentLocationsAnswer =>
  makeMe.anIntentLocationsAnswer
    .at(revision)
    .locating(
      makeMe.anIntentLocation
        .at(folder)
        .ofKind("gherkin")
        .selecting(
          ...Object.keys(files).filter((file) => file.startsWith(`${folder}/`)),
        )
        .please(),
    )
    .please();

// How a held read settles: with the published content, unreachable, or with
// the locations answer the case gives.
type HoldOutcome = "published" | "unreachable" | IntentLocationsAnswer;

// The read service answering Intent's locations and file reads at each
// published revision. `reads` lists Intent's reads as `<what>@<revision>`;
// `unexpected` any other call; `holdRead` keeps the next such read until the
// case releases or fails it. Each service starts the browser session's read
// caches and transient failures empty, so every read a case causes reaches it.
export function publishedReadService(published: Map<string, PublishedFiles>) {
  forgetAnswers();
  forgetCachedFiles();
  clearAllTransientFailures();
  const reads: string[] = [];
  const unexpected: string[] = [];
  const holds = new Map<string, Promise<HoldOutcome>>();
  const held: string[] = [];
  // Waits out a hold on the read, which then rejects as unreachable if failed,
  // answering the locations the case gave in place of the published ones.
  const answering = async (read: string) => {
    reads.push(read);
    const hold = holds.get(read);
    if (hold === undefined) return undefined;
    holds.delete(read);
    held.push(read);
    const outcome = await hold;
    if (outcome === "unreachable") throw new TypeError("Failed to fetch");
    return outcome === "published" ? undefined : outcome;
  };
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
      const [intent, path] = [params.get("intent"), params.get("path")];
      const revision = params.get("revision") ?? "";
      const files = published.get(revision);
      if (files !== undefined && intent === "locations") {
        const given = await answering(`locations@${revision}`);
        return answer(given ?? locationsOf(revision, files));
      }
      if (files !== undefined && path !== null && path in files) {
        await answering(`${path}@${revision}`);
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
    // Holds the next read named `<what>@<revision>`. `release` lets it
    // answer, `fail` makes it unreachable and `answerLocations` answers a
    // locations read with the given answer. Later reads of the same name
    // answer at once.
    holdRead(read: string) {
      let settle: (outcome: HoldOutcome) => void = () => {};
      holds.set(
        read,
        new Promise<HoldOutcome>((resolve) => {
          settle = resolve;
        }),
      );
      onTestFinished(() => {
        settle("published");
      });
      return {
        release: () => {
          settle("published");
        },
        fail: () => {
          settle("unreachable");
        },
        answerLocations: (given: IntentLocationsAnswer) => {
          settle(given);
        },
      };
    },
  };
}
