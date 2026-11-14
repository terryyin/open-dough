// Purpose and Proof of the selected file (`./IntentSelectionReading.tsx`):
// two tabs of one Intent tablist (`./IntentTabs.tsx`) at the top of the
// reading area, the chosen tab's panel filling it. The chosen tab is the
// reader's page state, owned by the browser so selecting another file keeps
// it, and opening from the candidates record chooses Purpose and starts a
// fresh reading positioned on its case. Purpose is the published source or
// the selected story's source diff (`storyDiffOf`); Proof is that file's
// published CI evidence (`./IntentFileProof.tsx`) with no further CI read,
// and with a selected story a direct return to its CI comparison
// (`./intentStoryTabs.tsx`). A file the selected story changed shows Review
// changes' own diff of it as its Purpose, and the browser reads no published
// text for it; a file the published revision does not list is never read
// there. Text of an
// earlier revision whose update failed stays readable under that failure and
// its Retry.

import { useId, useLayoutEffect, useRef, type RefObject } from "react";
import { ArrowRight } from "lucide-react";
import { Icon } from "./Icon.tsx";
import type { IntentTreeFile } from "./intentStoryOverlay.ts";
import { resolveCaseTargetLine } from "./intentCaseTargetLine.ts";
import { IntentFileProof } from "./IntentFileProof.tsx";
import { shortRevision } from "./publishedWork.ts";
import { IntentSourceLines } from "./IntentSourceLines.tsx";
import type { ComparedStory } from "./IntentStorySummary.tsx";
import {
  IntentTabs,
  intentTabId,
  intentTabPanelId,
  type IntentTabOption,
} from "./IntentTabs.tsx";
import { useKeptReading, useKeptReadingScroll } from "./pageIntentReading.tsx";
import { diffStartOf } from "./storyComparisonShown.ts";
import { useStoryCiReturn } from "./intentStoryTabs.tsx";
import { FileDiff } from "./StoryReviewFileDiff.tsx";
import { ReviewedFileHeader } from "./StoryReviewFileHeader.tsx";
import "./intent-file-reading.css";

export type IntentReadingTab = "purpose" | "proof";

// Purpose/Proof choice and the reading area that scrolls the chosen panel,
// kept across file selections (`./pageIntentReading.tsx`).
export type IntentFileReadingPlace = {
  readonly tab: IntentReadingTab;
  readonly onChooseTab: (next: IntentReadingTab) => void;
  readonly idPrefix: string;
  readonly readingArea: RefObject<HTMLElement | null>;
};

export type FileRead =
  | { readonly path: string; readonly state: "failed" }
  | { readonly path: string; readonly state: "ready"; readonly text: string };

const tabs: readonly IntentTabOption<IntentReadingTab>[] = [
  { value: "purpose", label: "Purpose" },
  { value: "proof", label: "Proof" },
];

// The browser's kept Purpose/Proof place and reading pane.
export function useKeptFileReadingPlace() {
  const [tab, setTab] = useKeptReading<IntentReadingTab>(
    "readingTab",
    () => "purpose",
  );
  const idPrefix = useId();
  const readingArea = useRef<HTMLDivElement>(null);
  useKeptReadingScroll(readingArea);
  return {
    place: {
      tab,
      onChooseTab: setTab,
      idPrefix,
      readingArea,
    } satisfies IntentFileReadingPlace,
    setTab,
    readingArea,
  };
}

// The selected story's change of the selected file, when its Purpose is that
// change's diff rather than the file's published text.
export function storyDiffOf(
  story: ComparedStory | undefined,
  treeFile: IntentTreeFile | undefined,
) {
  return story === undefined ? undefined : treeFile?.change;
}

export function IntentFileReading({
  place,
  path,
  revision,
  treeRevision,
  read,
  syntaxHint,
  caseTarget,
  treeFile,
  story,
  onFileRetry,
  failedRevision,
}: {
  readonly place: IntentFileReadingPlace;
  // The selected file's path.
  readonly path: string;
  // The revision of the text shown, and a later one whose read failed.
  readonly revision: string;
  // The revision the tree shows, for Proof evidence naming.
  readonly treeRevision: string;
  readonly failedRevision?: string | undefined;
  // The answered read of `path`, or undefined while it is being read.
  readonly read: FileRead | undefined;
  // The selected file's syntax hint (`./intentLocationSelection.ts`).
  readonly syntaxHint: string | undefined;
  readonly caseTarget: string | undefined;
  // The selected file as the location's tree shows it.
  readonly treeFile: IntentTreeFile | undefined;
  readonly story: ComparedStory | undefined;
  readonly onFileRetry: () => void;
}) {
  const { tab, onChooseTab, idPrefix, readingArea } = place;
  const backToStoryCi = useStoryCiReturn();
  // Where each tab was last read, for one file.
  const places = useRef({ path, top: { purpose: 0, proof: 0 } });
  const text = read?.state === "ready" ? read.text : undefined;
  // The opened case's line, which Purpose positions on.
  const targetLine =
    text === undefined || caseTarget === undefined
      ? undefined
      : resolveCaseTargetLine(text, caseTarget);
  const change = storyDiffOf(story, treeFile);
  // The selected change's *from* tree, as Review changes reads it.
  const changeFrom =
    story === undefined ? "" : diffStartOf(story.shown.comparison, change);

  function chooseTab(next: IntentReadingTab) {
    if (next === tab) return;
    if (places.current.path !== path) {
      places.current = { path, top: { purpose: 0, proof: 0 } };
    }
    places.current.top[tab] = readingArea.current?.scrollTop ?? 0;
    onChooseTab(next);
  }

  useLayoutEffect(() => {
    const area = readingArea.current;
    if (area === null || places.current.path !== path) return;
    area.scrollTop = places.current.top[tab];
    // Only a tab switch returns to a place; a new file starts its own.
  }, [tab, path, readingArea]);

  function panel(value: IntentReadingTab) {
    return {
      role: "tabpanel",
      id: intentTabPanelId(idPrefix, value),
      "aria-labelledby": intentTabId(idPrefix, value),
      hidden: tab !== value,
    } as const;
  }

  return (
    <>
      <div className="intent-reading-bar">
        <IntentTabs
          options={tabs}
          selected={tab}
          onSelect={chooseTab}
          label="Purpose and Proof"
          idPrefix={idPrefix}
        />
      </div>
      <div className="intent-reading-panel" {...panel("purpose")}>
        <section className="intent-purpose" aria-label="Purpose">
          <h3 className="visually-hidden">Purpose</h3>
          {story !== undefined && change !== undefined ? (
            <div className="intent-story-diff">
              <ReviewedFileHeader
                reviewed={story.shown.reviewed}
                from={changeFrom}
                tree={story.shown.tree}
                file={change}
              />
              <FileDiff
                // A new comparison or file is a new read.
                key={`${changeFrom}:${story.shown.tree}:${change.path}`}
                reviewed={story.shown.reviewed}
                from={changeFrom}
                tree={story.shown.tree}
                file={change}
              />
            </div>
          ) : read?.state === "failed" ? (
            <p className="intent-file-problem" role="alert">
              {path} could not be read.{" "}
              <button type="button" onClick={onFileRetry}>
                Retry
              </button>
            </p>
          ) : text !== undefined ? (
            <>
              {failedRevision !== undefined && (
                <p className="intent-file-problem" role="alert">
                  {path} could not be read at revision{" "}
                  <code>{shortRevision(failedRevision)}</code>; showing{" "}
                  <code>{shortRevision(revision)}</code>.{" "}
                  <button type="button" onClick={onFileRetry}>
                    Retry
                  </button>
                </p>
              )}
              <IntentSourceLines
                text={text}
                revision={revision}
                path={path}
                {...(syntaxHint === undefined ? {} : { syntaxHint })}
                {...(targetLine === undefined ? {} : { targetLine })}
              />
            </>
          ) : (
            <p className="quiet">Reading {path}…</p>
          )}
        </section>
      </div>
      <div className="intent-reading-panel" {...panel("proof")}>
        <section className="intent-proof" aria-label="Proof">
          <h3 className="visually-hidden">Proof</h3>
          <IntentFileProof
            path={path}
            treeFile={treeFile}
            revision={treeRevision}
          />
          {backToStoryCi !== undefined && (
            <button
              type="button"
              className="intent-open-link intent-story-ci-return"
              onClick={backToStoryCi}
            >
              View story CI comparison <Icon icon={ArrowRight} />
            </button>
          )}
        </section>
      </div>
    </>
  );
}
