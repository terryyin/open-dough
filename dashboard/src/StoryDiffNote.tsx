// Notes keep the context shown by this diff; Follow up alone verifies anchors.
import { createContext, useContext, useRef, useState } from "react";
import { fileFollowUpParts } from "./StoryAnchoredFollowUp.tsx";
import { useDoneStoryFollowUp } from "./doneStoryFollowUp.ts";
import { fileComparisonName } from "./followUpContext.ts";
import { reviewedStoryIdentity } from "./reviewedWorkSubject.ts";
import type { StoryNoteContext } from "./storyNote.ts";
import { useStoryNoteAnnouncement } from "./storyNoteAnnouncement.ts";
import { useStoryNotes } from "./storyNotes.ts";
import { StoryNotesDialog } from "./StoryNotesDialog.tsx";
import type { ReviewedFile } from "./storyReviewFiles.ts";
import type { ReviewedWork } from "./StoryReviewFileDiff.tsx";

export const StoryNoteView =
  createContext<StoryNoteContext["view"]>("Review changes");

export function useDiffStoryNote(
  reviewed: ReviewedWork,
  from: string,
  tree: string,
  file: ReviewedFile,
) {
  const target = useDoneStoryFollowUp(reviewedStoryIdentity(reviewed.subject));
  const parts = fileFollowUpParts(reviewed, from, tree, file);
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
    available: target !== undefined && parts !== undefined,
    open: (line?: StoryNoteContext["line"]) => {
      if (target === undefined || parts === undefined) return;
      const active = document.activeElement;
      opener.current =
        active instanceof HTMLElement
          ? (active
              .closest(".story-review-line-number-wrap")
              ?.querySelector("button") ?? active)
          : null;
      setAnnouncement("");
      const facts = parts.facts;
      setContext({
        view,
        path: facts.path,
        ...(facts.oldPath === undefined ? {} : { oldPath: facts.oldPath }),
        comparison: {
          name: fileComparisonName(facts.kind),
          baseline: facts.baseline,
          tree: facts.tree,
        },
        ...(line === undefined ? {} : { line }),
      });
    },
    content: (
      <>
        <p aria-live="polite" className="visually-hidden">
          {announcement}
        </p>
        {context !== undefined && target !== undefined && (
          <StoryNotesDialog
            identity={target.story.identity}
            title={target.story.title}
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
