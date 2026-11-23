// Shared production shell: page frame, story-reference navigation, banner and
// the notice-bearing body. ConfiguredDashboard and held-work mounts supply
// typed view inputs; this owner places banner, notice and scroll content.
import type { ReactNode } from "react";
import type { MachineSessions } from "./agentLaunches.ts";
import { PageFrame } from "./PageFrame.tsx";
import type { PublishedSource } from "./publishedSource.ts";
import type { PublishedWork } from "./publishedWork.ts";
import { StoryReferenceNavigation } from "./storyNavigation.tsx";

type FrameStories = {
  readonly selected: string;
  readonly shown: string | undefined;
  readonly show: (project: PublishedSource) => void;
  readonly select: (source: PublishedSource | undefined) => void;
  readonly development: boolean;
  readonly work: PublishedWork | undefined;
};

type StoryReference = {
  readonly projects: readonly PublishedSource[];
  readonly selected: string;
  readonly work: PublishedWork | undefined;
  readonly reading: boolean;
  readonly failure: string | undefined;
  readonly show: (project: PublishedSource) => void;
  readonly retry: () => void;
  readonly suspended: boolean;
};

export function ConfiguredDashboardFrame({
  launches,
  stories,
  showIntent,
  followUpSelection,
  storyReference,
  banner,
  children,
}: {
  readonly launches: Pick<
    MachineSessions,
    | "records"
    | "alerts"
    | "hostOperations"
    | "markDone"
    | "markRead"
    | "deleteRecord"
    | "recoverSession"
    | "stopSession"
    | "readSession"
    | "readHistory"
  >;
  readonly stories: FrameStories;
  readonly showIntent?: () => void;
  readonly followUpSelection?: ReactNode;
  readonly storyReference: StoryReference;
  readonly banner: ReactNode;
  readonly children: (storyNotice: ReactNode) => ReactNode;
}) {
  return (
    <PageFrame sessions={launches} showIntent={showIntent} stories={stories}>
      {followUpSelection}
      <StoryReferenceNavigation {...storyReference}>
        {(storyNotice) => (
          <>
            {banner}
            {children(storyNotice)}
          </>
        )}
      </StoryReferenceNavigation>
    </PageFrame>
  );
}
