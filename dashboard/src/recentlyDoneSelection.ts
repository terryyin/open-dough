// The Recently done sessions row the developer chose (ADR 0008, Dashboard UI
// concepts). Choosing a row selects; its Open control alone opens the
// session (`./PageFrame.tsx`). A row linked to a published done story selects
// that story as the page's Selected story in its project, keeping the
// perspective; a standalone row selects its retained session and leaves the
// Selected story, project and reading as they are. Neither changes the Side
// panel.
//
// A story launch is linked when the done catalog its project publishes now
// lists that exact story identity within the recent window Board Recently
// done uses (`recentDoneRecords`). The shown project's current-revision
// catalog is reused; another project's is read on demand through the same
// authenticated snapshot and catalog readers, and no done record body is read.
// An unread catalog is checking, and a failed one or one naming the story's
// record as unreadable is unknown, each said apart from a confirmed miss,
// which selects the session. A later choice, an explicit Open, or another
// project chosen meanwhile supersedes an unanswered check. A linked row stays
// chosen while its story is the page's Selected story.

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { doneRecordFileName } from "../../src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import { launchSubject, type LaunchRecord } from "./agentLaunch.ts";
import { readDoneCatalogAt } from "./authenticatedDoneRead.ts";
import { readPublishedSnapshot } from "./authenticatedRead.ts";
import { recentDoneRecords, type DoneStories } from "./doneStories.ts";
import {
  sameSelectedStory,
  type SelectedStory,
  type usePageStorySelection,
} from "./pageStorySelection.tsx";
import type { PublishedSource } from "./publishedSource.ts";
import type { PublishedWork } from "./publishedWork.ts";
import { sessionKey } from "./sessionReference.ts";

// The chosen row, by its session key, and what its choice selected.
export type RecentlyDoneChoice = { readonly key: string } & (
  | { readonly kind: "checking" }
  | { readonly kind: "linked"; readonly story: SelectedStory }
  | { readonly kind: "standalone" }
  | { readonly kind: "unknown"; readonly problem: string }
);

// A Recently done sessions row's selection: the chosen row, if any, and
// choosing one.
export type RecentlyDoneRowSelection = {
  readonly choice: RecentlyDoneChoice | undefined;
  readonly onSelect: (record: LaunchRecord) => void;
};

// The page's project facts the selection reads and moves.
export type RecentlyDoneProjects = {
  // The project the developer has chosen to show, read or not.
  readonly selected: string;
  // The selected project's snapshot, once read; its done catalog is reused.
  readonly work: PublishedWork | undefined;
  // Shows a project in the current perspective, as one history entry.
  readonly select: (source: PublishedSource) => void;
};

type DoneLink = "linked" | "absent" | { readonly problem: string };

// Whether the catalog lists the story recently done, lacks it, or cannot say.
function linkIn(
  done: Extract<DoneStories, { status: "catalogued" }>,
  identity: string,
): DoneLink {
  if (
    recentDoneRecords(done, new Date()).some(
      (record) => record.identity === identity,
    )
  )
    return "linked";
  const fileName = doneRecordFileName(identity);
  return done.unreadable.some((record) => record.fileName === fileName)
    ? { problem: `Its done record ${fileName} could not be read.` }
    : "absent";
}

// The shown project's done catalog, when it was read at the revision shown.
function currentCatalog(work: PublishedWork | undefined, project: string) {
  const done = work?.done;
  return work?.source.id === project &&
    done?.status === "catalogued" &&
    done.revision === work.revision
    ? done
    : undefined;
}

async function readLink(
  source: PublishedSource,
  identity: string,
  signal: AbortSignal,
): Promise<DoneLink> {
  try {
    const { revision } = await readPublishedSnapshot(source, signal);
    const catalog = await readDoneCatalogAt(source, revision, signal);
    if (catalog.status === "gap") return { problem: catalog.problem };
    return linkIn({ ...catalog, revision }, identity);
  } catch (error) {
    return { problem: error instanceof Error ? error.message : String(error) };
  }
}

export function useRecentlyDoneSelection(
  projects: readonly PublishedSource[],
  stories: RecentlyDoneProjects,
  selection: ReturnType<typeof usePageStorySelection>,
) {
  const [choice, setChoice] = useState<RecentlyDoneChoice>();
  const checking = useRef<AbortController | undefined>(undefined);

  const abandonCheck = useCallback(() => {
    checking.current?.abort();
    checking.current = undefined;
  }, []);
  // Ends an unanswered check, whose row then shows no choice.
  const supersede = useCallback(() => {
    abandonCheck();
    setChoice((current) =>
      current?.kind === "checking" ? undefined : current,
    );
  }, [abandonCheck]);
  // Another project chosen meanwhile keeps the developer where they went.
  useLayoutEffect(supersede, [stories.selected, supersede]);

  const select = (record: LaunchRecord) => {
    abandonCheck();
    const key = sessionKey(record.session);
    const { identity } = launchSubject(record.request);
    const source = projects.find(({ id }) => id === record.request.source);
    if (identity === undefined || source === undefined) {
      setChoice({ key, kind: "standalone" });
      return;
    }
    const story = { project: source.id, identity };
    const settle = (link: DoneLink) => {
      if (link === "absent") {
        setChoice({ key, kind: "standalone" });
      } else if (link === "linked") {
        setChoice({ key, kind: "linked", story });
        selection.api.select(story);
        stories.select(source);
      } else {
        setChoice({ key, kind: "unknown", problem: link.problem });
      }
    };
    const shown = currentCatalog(stories.work, source.id);
    if (shown !== undefined) {
      settle(linkIn(shown, identity));
      return;
    }
    const controller = new AbortController();
    checking.current = controller;
    setChoice({ key, kind: "checking" });
    void readLink(source, identity, controller.signal).then((link) => {
      if (checking.current !== controller) return;
      checking.current = undefined;
      settle(link);
    });
  };

  const chosen =
    choice?.kind === "linked" &&
    !sameSelectedStory(selection.selected, choice.story)
      ? undefined
      : choice;
  const row: RecentlyDoneRowSelection = { choice: chosen, onSelect: select };
  return { choice: chosen, row, supersede };
}
