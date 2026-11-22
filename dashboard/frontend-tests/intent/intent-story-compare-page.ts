// The selected story in a mounted Intent view
// (./intent-ci-perspective-mount.ts) as a reader meets its comparison: the
// header's revisions line and its Compare group (the comparison choice, the
// story's commits, the uncommitted check, Refresh and the range read), the
// story's views, the Changes file list and the selected file's diff. Story A
// is Taken in a worktree on this machine, so Review changes offers its
// comparison; Story B has none. The Done story's worktree is retired: its
// review is its published completion or a captured landed run.
import { expect, onTestFinished } from "vitest";
import { page, userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { IntentReadSource } from "../../src/intentReadSource.ts";
import type { ReviewSource } from "../../src/reviewSource.ts";
import { cataloguedDone } from "../navigation/board-work.ts";
import { mountIntentPerspective } from "./intent-ci-perspective-mount.ts";
import { scopeReadsOf } from "./intent-ci-scope-page.tsx";
import {
  fullSha,
  inertCiReads,
  openDoughSource,
  takenStoryEntry,
} from "./intent-ci-status-fixtures.ts";

export const storyA = {
  identity: "SEED-1#story-a",
  title: "Story A",
  branch: "claude/story-a",
};
const storyB = {
  identity: "SEED-1#story-b",
  title: "Story B",
  branch: "claude/story-b",
};

// Trunk's Intent location for the story's specs, and each file's source as
// Intent reads it today: twelve numbered lines of its name.
const location = makeMe.anIntentLocation
  .at("dashboard/tests")
  .ofKind("typescript", ["**/*.spec.ts"])
  .selecting(
    "dashboard/tests/a.spec.ts",
    "dashboard/tests/gone.spec.ts",
    "dashboard/tests/boundary/kept.spec.ts",
    "dashboard/tests/landing.spec.ts",
  )
  .please();
const sourceOf = (path: string) => {
  const word = path.split("/").at(-1)?.replace(".spec.ts", "") ?? "";
  return [...Array(12).keys()].map((line) => `${word} ${line}\n`).join("");
};
const intentReads: IntentReadSource = {
  readLocations: () =>
    Promise.resolve({ status: "configured", locations: [location] }),
  readFile: (...[, path]) => Promise.resolve(sourceOf(path)),
  readCandidates: () => Promise.resolve({ status: "absent" }),
};

// Intent with Story A selected, its review read from `review`.
export async function openStoryAComparison(review: ReviewSource) {
  const mounted = await mountIntentPerspective({
    work: makeMe.aPublishedWork
      .with({
        source: openDoughSource,
        revision: fullSha("a1a1a1a"),
        retrievedAt: new Date("2026-11-01T00:00:00Z"),
        direction: "",
        taken: [takenStoryEntry(storyA), takenStoryEntry(storyB)],
        backlog: [],
      })
      .please(),
    readSource: intentReads,
    ciReads: inertCiReads(),
    reviewSource: review,
    workspaces: [
      {
        source: openDoughSource.id,
        identity: storyA.identity,
        agent: "claude",
        workspace: "/tmp/intent-story",
        branch: storyA.branch,
      },
    ],
  });
  await mounted.selectStory(storyA.identity);
  return {
    ...mounted,
    selectStoryB: () => mounted.selectStory(storyB.identity),
    selectStoryA: () => mounted.selectStory(storyA.identity),
  };
}

// A completed story in the Summary scope, catalogued in the work's done
// records, whose CI comparison measures its landed result.
const doneStory = makeMe.aComparedStory.inSummaryScope().please();
export const doneCompletion = doneStory.work.revision;
// The published completion Review changes answers by default.
export const publishedCompletion = () =>
  makeMe.aStoryReview
    .published(doneCompletion)
    .adding("dashboard/tests/folder/a.spec.ts")
    .please();

// Intent with the Done story selected, its review read from `review`; the
// revision each Intent locations read names, in order.
export async function openDoneStoryComparison(review: ReviewSource) {
  const locationRevisions: string[] = [];
  let selected = false;
  const { done, doneReads } = cataloguedDone([
    makeMe.aDoneRecord
      .completed({
        identity: doneStory.identity,
        title: "Story A",
        completedAt: "2026-11-01T00:00:00.000Z",
      })
      .please(),
  ]);
  const mounted = await mountIntentPerspective({
    work: makeMe.aPublishedWork
      .with({
        source: doneStory.source,
        revision: fullSha("a1a1a1a"),
        retrievedAt: new Date("2026-11-02T00:00:00Z"),
        direction: "",
        taken: [],
        backlog: [],
        done,
      })
      .please(),
    readSource: {
      readLocations: (...[, revision]) => {
        if (selected) locationRevisions.push(revision);
        return Promise.resolve({
          status: "configured",
          locations: [...(doneStory.scope?.locations ?? [])],
        });
      },
      readFile: (...[, , path]) => Promise.resolve(`${path}\n`),
      readCandidates: () => Promise.resolve({ status: "absent" }),
    },
    ciReads: scopeReadsOf(doneStory).source,
    reviewSource: review,
    done: doneReads,
  });
  // Intent shows trunk's locations before any story is selected; only the
  // selected Done story's reads are recorded.
  await expect
    .poll(() => document.querySelector("button.intent-location-name"))
    .not.toBeNull();
  selected = true;
  await mounted.selectStory(doneStory.identity);
  return { locationRevisions };
}

// Every global fetch and WebSocket opened while the case runs, recorded only.
export function recordOutsideReads() {
  const opened: string[] = [];
  const { fetch, WebSocket } = globalThis;
  globalThis.fetch = (input, init) => {
    opened.push(
      `fetch ${input instanceof Request ? input.url : input.toString()}`,
    );
    return fetch(input, init);
  };
  globalThis.WebSocket = class extends WebSocket {
    constructor(url: string | URL, protocols?: string | string[]) {
      opened.push(`WebSocket ${String(url)}`);
      super(url, protocols);
    }
  };
  onTestFinished(() => {
    globalThis.fetch = fetch;
    globalThis.WebSocket = WebSocket;
  });
  return opened;
}

// The distinct kinds of OPENED calls: story notes, CI history glance, or the
// call as recorded.
export const outsideKinds = (opened: readonly string[]) =>
  new Set(
    opened.map((call) => {
      const [how = "", address = ""] = call.split(" ");
      const url = new URL(address, "http://page.test");
      if (
        how === "fetch" &&
        url.pathname === "/__project-configuration/story-notes"
      )
        return "story notes";
      if (
        how === "fetch" &&
        url.searchParams.get("intent") === "ci-history" &&
        url.searchParams.get("history") === "glance"
      )
        return "CI history glance";
      return call;
    }),
  );

// The outside reads a Done story's Intent still makes.
export const doneOutsideKinds = new Set(["story notes", "CI history glance"]);

const escaped = (name: string) => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const textOf = (element: Element | null | undefined) =>
  element?.textContent ?? "";

export function intentStoryCompare() {
  const intent = page.getByRole("main", { name: "Intent", exact: true });
  const header = intent.getByRole("region", {
    name: "Selected story",
    exact: true,
  });
  const compare = header.getByRole("group", { name: "Compare" });
  const commits = compare.getByRole("list", { name: "Story commits" });
  const commit = (subject: string) =>
    commits.getByRole("button").filter({ hasText: subject });
  const purpose = intent.getByRole("region", { name: "Purpose", exact: true });
  const run = compare.getByRole("listbox", { name: "Landed run" });
  type View = "Changes" | "CI comparison" | "Intent coverage";
  const view = (name: View) =>
    intent.getByRole("tabpanel", { name, exact: true });
  return {
    header,
    headerText: () => textOf(header.element()),
    // A chosen comparison that cannot be read, with Retry after a failed read.
    alert: header.getByRole("alert"),
    alertText: () => header.getByRole("alert").query()?.textContent.trim(),
    retry: () =>
      userEvent.click(
        header.getByRole("alert").getByRole("button", { name: "Retry" }),
      ),
    retryControl: header.getByRole("alert").getByRole("button", {
      name: "Retry",
    }),
    // The captured landed run chosen, offered with Landed runs.
    run,
    chooseRun: (key: string) => userEvent.selectOptions(run, key),
    // The story's changed files outside every location.
    outside: () =>
      textOf(
        intent
          .getByRole("region", { name: "Outside Intent locations" })
          .query(),
      ),
    // What a CI view says while another comparison than the default is chosen.
    wholeStoryNote: (name: View) =>
      view(name).getByRole("note").filter({ hasText: "whole story" }),
    // The CI comparison's landed endpoint, its third measured build.
    landedEndpoint: () =>
      textOf(
        view("CI comparison")
          .element()
          .querySelectorAll(".intent-ci-comparison-identity")[2],
      ),
    // The header's leading control, which a collapsible header would offer.
    collapsedControl: header.getByRole("button", { expanded: false }),
    revisions: () =>
      textOf(header.element().querySelector(".intent-story-revisions")),
    choice: (name: string) => compare.getByRole("radio", { name }),
    choose: (name: string) =>
      userEvent.click(compare.getByRole("radio", { name })),
    includeUncommitted: compare.getByRole("checkbox", {
      name: "Include uncommitted changes",
    }),
    refresh: () =>
      userEvent.click(compare.getByRole("button", { name: "Refresh" })),
    commits,
    commit,
    // Chooses `subject` as both ends of the range.
    async chooseAlone(subject: string) {
      await userEvent.click(commit(subject));
      await userEvent.click(commit(subject));
    },
    range: () =>
      textOf(header.element().querySelector(".story-review-range-heading")),
    chooseTab: (name: View) =>
      userEvent.click(
        intent
          .getByRole("tablist", { name: "Selected story views" })
          .getByRole("tab", { name, exact: true }),
      ),
    // A listed file's control, named by its kind and path.
    file: (name: string) =>
      intent.getByRole("button", {
        name: new RegExp(`^${escaped(name)}(?:,|$)`),
      }),
    purposeText: () => textOf(purpose.element()),
    diffName: () =>
      textOf(
        purpose.element().querySelector(".story-review-diff-heading h3"),
      ).trim(),
    diffCode: () =>
      textOf(purpose.element().querySelector(".story-review-code")),
  };
}
