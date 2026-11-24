// Notes keep the context shown by this diff; Follow up alone verifies anchors.
import { createContext, useContext, useRef, useState } from "react";
import { RecentlyDoneLinkSources } from "./recentlyDoneShownLinks.ts";
import { useDoneStoryFollowUp } from "./doneStoryFollowUp.ts";
import { fileComparisonName } from "./followUpContext.ts";
import { reviewedStoryIdentity } from "./reviewedWorkSubject.ts";
import {
  reviewedComparison,
  reviewedFilePaths,
} from "./reviewedFileContext.ts";
import type { StoryNoteContext } from "./storyNote.ts";
import { useStoryNoteAnnouncement } from "./storyNoteAnnouncement.ts";
import { useStoryNotes } from "./storyNotes.ts";
import { StoryNotesDialog } from "./StoryNotesDialog.tsx";
import type { ReviewedFile } from "./storyReviewFiles.ts";
import type { ReviewedWork } from "./reviewedFileRead.ts";

export const StoryNoteView =
  createContext<StoryNoteContext["view"]>("Review changes");

export const StoryNoteComparison = createContext("All changes");

export function useDiffStoryNote(
  reviewed: ReviewedWork,
  from: string,
  tree: string,
  file: ReviewedFile,
) {
  const identity = reviewedStoryIdentity(reviewed.subject);
  const done = useDoneStoryFollowUp(identity);
  const { work } = useContext(RecentlyDoneLinkSources);
  const active =
    work?.source.id === reviewed.subject.source
      ? [...work.taken, ...work.backlog].find(
          (entry) => entry.identity === identity,
        )
      : undefined;
  const story = active ?? done?.story;
  const comparison = reviewedComparison(reviewed);
  const workspaceComparison = useContext(StoryNoteComparison);
  const view = useContext(StoryNoteView);
  const { change } = useStoryNotes(reviewed.subject.source);
  const [context, setContext] = useState<StoryNoteContext>();
  const [announcement, setAnnouncement] = useStoryNoteAnnouncement();
  const opener = useRef<HTMLElement | null>(null);
  const close = () => {
    setContext(undefined);
    opener.current?.focus();
  };
  return {
    available: story !== undefined,
    open: (line?: StoryNoteContext["line"]) => {
      if (story === undefined) return;
      const active = document.activeElement;
      opener.current =
        active instanceof HTMLElement
          ? (active
              .closest(".story-review-line-number-wrap")
              ?.querySelector("button") ?? active)
          : null;
      setAnnouncement("");
      setContext({
        view,
        ...reviewedFilePaths(file),
        comparison: {
          name:
            comparison === undefined
              ? workspaceComparison
              : fileComparisonName(comparison.kind),
          baseline: from,
          tree,
        },
        ...(line === undefined ? {} : { line }),
      });
    },
    content: (
      <>
        <div aria-live="polite">
          {announcement && (
            <span className="visually-hidden">{announcement}</span>
          )}
        </div>
        {context !== undefined && story !== undefined && (
          <StoryNotesDialog
            identity={story.identity}
            title={story.title}
            context={context}
            notes={[]}
            unreadable={false}
            onChange={change}
            onClose={close}
            onSaved={() => {
              close();
              setAnnouncement("Note saved to this story.");
            }}
          />
        )}
      </>
    ),
  };
}
