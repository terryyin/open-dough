// One work item's card in its column (`./Columns.tsx`), read at two levels.
// Its scan view leads with the title, then its priority in the Backlog, the
// assigned or preparing developer, preparation badges with the story's
// start eligibility (`./startEligibility.ts`), dependencies, slice progress
// on Taken work with a brief source
// qualification, its launches (`./StoryCardLaunches.tsx`), and its inspection
// group: Inspect story, led by a chevron that turns while the detail is
// open, which opens the secondary detail (`./StoryDetail.tsx`)
// of identity, assignment records, explanations, evidence, and source links,
// from facts already read, and Review changes (`./StoryReviewAction.tsx`) when
// offered.
// While its story starts on this machine (`./storyStartup.ts`), none of the
// card's actions can run, Inspect story included; its facts stay readable and
// its source links are shown on the card, so none waits behind that
// unavailable action, and the
// card and each unavailable action are described by its startup status
// (`./protectedFrame.ts`), which the card holds the keyboard on once a
// launch dialog hands the startup off (`./launchDialogLauncher.ts`).

import { useId, useRef } from "react";
import { ChevronRight } from "lucide-react";
import { Icon } from "./Icon.tsx";
import "./frame-controls.css";
import { sessionKey } from "./sessionReference.ts";
import type { WorkEntry } from "./publishedWork.ts";
import { StoryCardDependencies } from "./StoryCardDependencies.tsx";
import { StoryCardPreparationFacts } from "./StoryCardPreparation.tsx";
import { SliceProgress } from "./SliceProgress.tsx";
import { WorkSourceLinks } from "./WorkSourceLinks.tsx";
import { StoryDetail } from "./StoryDetail.tsx";
import {
  PreparingFacts,
  TakenOwnerFacts,
  type OpenRoster,
} from "./AgentAssignmentFacts.tsx";
import { storyCardMarks } from "./storyCardFocus.ts";
import type { MachineSessions } from "./agentLaunches.ts";
import { StoryCardLaunches } from "./StoryCardLaunches.tsx";
import {
  dependencyStartReason,
  startEligibilityOf,
} from "./startEligibility.ts";
import { StoryReviewAction } from "./StoryReviewAction.tsx";
import { storyCardSessionsOf } from "./agentLaunch.ts";
import { usePageSessions } from "./pageSessions.ts";
import { ProtectedFrameReason } from "./protectedFrame.ts";

export function StoryCard({
  sourceId,
  entry,
  priority,
  showsSliceProgress,
  launches,
  offersStart,
  selected,
  onSelect,
  onOpenRoster,
}: {
  // The project the snapshot shows.
  sourceId: string;
  entry: WorkEntry;
  priority: number | undefined;
  // Taken cards only: queued work shows no progress.
  showsSliceProgress: boolean;
  launches: MachineSessions;
  // Backlog cards only: Taken work offers no launch.
  offersStart: boolean;
  selected: boolean;
  onSelect: (identity: string) => void;
  onOpenRoster: OpenRoster;
}) {
  const cardRef = useRef<HTMLElement>(null);
  const detailId = `story-detail-${entry.identity.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
  // Outlined while the page's panel shows one of the card's sessions.
  const { shownSession } = usePageSessions();
  const inPanel = storyCardSessionsOf(
    launches.launched,
    sourceId,
    entry.identity,
  ).some((record) => sessionKey(record.session) === shownSession?.key);
  // Every startup of the story protects its frame.
  const starting =
    launches.storyStartupOf(sourceId, entry.identity) !== undefined;
  const statusId = useId();
  const eligibility = startEligibilityOf(entry);
  const reason = starting ? statusId : undefined;
  return (
    <article
      ref={cardRef}
      className={[
        "story-card",
        selected && "story-card-selected",
        inPanel && "in-terminal",
        starting && "story-card-starting",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label={entry.title}
      aria-describedby={reason}
      {...storyCardMarks(entry.identity)}
    >
      <fieldset className="story-card-frame" disabled={starting}>
        <ProtectedFrameReason value={reason}>
          <h3>{entry.title}</h3>
          <div className="story-card-meta">
            {priority !== undefined && (
              <p className="story-card-priority">Priority {priority}</p>
            )}
            <TakenOwnerFacts owner={entry.owner} onOpenRoster={onOpenRoster} />
            <PreparingFacts
              preparing={entry.preparing}
              onOpenRoster={onOpenRoster}
            />
          </div>
          <StoryCardPreparationFacts
            preparation={entry.preparation}
            eligibility={eligibility}
          />
          <StoryCardDependencies
            sourceId={sourceId}
            dependencies={entry.dependencies}
          />
          {showsSliceProgress && (
            <SliceProgress
              planSlices={entry.planSlices}
              progressSource={entry.progressSource}
              sliceClock={entry.sliceClock}
            />
          )}
          <StoryCardLaunches
            sourceId={sourceId}
            entry={entry}
            launches={launches}
            offersStart={offersStart}
            dependencyProblem={dependencyStartReason(eligibility)}
            statusId={statusId}
          />
          <div
            className="story-card-action-group story-card-inspection-group"
            role="group"
            aria-label="Inspection actions"
          >
            <button
              type="button"
              className="inspect-story frame-disclosure-button"
              aria-expanded={selected}
              aria-controls={detailId}
              aria-describedby={reason}
              onClick={() => {
                const closing = selected;
                onSelect(entry.identity);
                // Closing detail returns focus to this story's card — not to a
                // different card that may have just been selected.
                if (closing) {
                  queueMicrotask(() => {
                    cardRef.current?.focus();
                  });
                }
              }}
            >
              <Icon icon={ChevronRight} />
              {selected ? "Hide detail" : "Inspect story"}
            </button>
            <StoryReviewAction
              records={launches.records}
              workspaces={launches.workspaces}
              sourceId={sourceId}
              work={entry}
            />
          </div>
          {selected && <StoryDetail entry={entry} detailId={detailId} />}
          {!selected && starting && (
            <ul className="story-card-links" aria-label="Source links">
              <WorkSourceLinks entry={entry} />
            </ul>
          )}
        </ProtectedFrameReason>
      </fieldset>
    </article>
  );
}
