// A Recently done sessions row selects its resolved story or standalone
// session in the current perspective. Open alone changes the Side panel.
// The row uses the owning project's story evidence, including an on-demand
// read when its published snapshot is unavailable locally to the page.
// Another selection or an explicit Open supersedes an unanswered check.

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { LaunchRecord } from "./agentLaunch.ts";
import {
  sameSelectedStory,
  type SelectedStory,
  type usePageStorySelection,
} from "./pageStorySelection.tsx";
import type { PublishedSource } from "./publishedSource.ts";
import type { PublishedWork } from "./publishedWork.ts";
import {
  associatedIdentity,
  currentCatalog,
  currentSessionCloses,
  linkIn,
  needsSessionClose,
  readLink,
  type DoneLink,
} from "./recentlyDoneLink.ts";
import type { GoToSession } from "./sessionNavigation.ts";
import {
  publishedCloseFor,
  recentLocalDoneStory,
  sessionStoryAssociation,
} from "./retainedStoryMembership.ts";
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
  // Whether the page shows the Development perspective.
  readonly development: boolean;
  // Shows a project's Development stories, as one history entry.
  readonly show: (source: PublishedSource) => void;
};

// The session of the standalone row chosen, by its key, which its Board entry
// marks selected.
export const ChosenSessionOnPage = createContext<string | undefined>(undefined);

// Whether the session with this key is the standalone row chosen.
export function useChosenSession(key: string) {
  return useContext(ChosenSessionOnPage) === key;
}

export function useRecentlyDoneSelection(
  projects: readonly PublishedSource[],
  stories: RecentlyDoneProjects,
  selection: ReturnType<typeof usePageStorySelection>,
  goTo: GoToSession,
) {
  const [choice, setChoice] = useState<RecentlyDoneChoice>();
  const checking = useRef<AbortController | undefined>(undefined);
  // The page as it is when an answer arrives, not as it was when chosen.
  const now = useRef({ stories, goTo });
  useLayoutEffect(() => {
    now.current = { stories, goTo };
  });

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
    const source = projects.find(({ id }) => id === record.request.source);
    // In Development, shows the session's project's stories and goes to the
    // session, or its done `story`; elsewhere, gives up an earlier going.
    const goThere = (story?: string) => {
      const page = now.current;
      if (!page.stories.development || source === undefined) {
        page.goTo();
        return;
      }
      page.stories.show(source);
      page.goTo(record, story);
    };
    const standalone = () => {
      setChoice({ key, kind: "standalone" });
      goThere();
    };
    if (source === undefined) {
      standalone();
      return;
    }
    const published = currentSessionCloses(now.current.stories.work, source.id);
    const membership = sessionStoryAssociation(
      record,
      publishedCloseFor(record, published),
    );
    if (membership?.kind === "conflict") {
      standalone();
      return;
    }
    const settle = (link: DoneLink, identity?: string) => {
      if (link === "absent") {
        standalone();
      } else if (link === "linked" && identity !== undefined) {
        const story = { project: source.id, identity };
        setChoice({ key, kind: "linked", story });
        selection.api.select(story);
        if (now.current.stories.development) goThere(identity);
        else now.current.stories.select(source);
      } else if (typeof link === "object") {
        setChoice({ key, kind: "unknown", problem: link.problem });
        now.current.goTo();
      } else {
        standalone();
      }
    };
    const checkCatalog = (identity: string, recentOnly: boolean) => {
      // Use the page as it is when the association answers, not the work
      // snapshot from the click that started an earlier unread check.
      const shown = currentCatalog(now.current.stories.work, source.id);
      if (shown !== undefined) {
        settle(linkIn(shown, identity, { recentOnly }), identity);
        return;
      }
      const controller = new AbortController();
      checking.current = controller;
      setChoice({ key, kind: "checking" });
      goTo();
      void readLink(source, identity, controller.signal, recentOnly).then(
        (link) => {
          if (checking.current !== controller) return;
          checking.current = undefined;
          settle(link, identity);
        },
      );
    };
    const settleRetained = () => {
      if (membership === undefined) {
        standalone();
        return;
      }
      const localStory = recentLocalDoneStory(membership, new Date());
      if (localStory !== undefined) {
        settle("linked", localStory.identity);
        return;
      }
      checkCatalog(membership.identity, membership.kind !== "linked");
    };
    if (
      membership !== undefined &&
      !needsSessionClose(now.current.stories.work, record)
    ) {
      settleRetained();
      return;
    }
    const controller = new AbortController();
    checking.current = controller;
    setChoice({ key, kind: "checking" });
    goTo();
    void associatedIdentity(source, record, controller.signal).then(
      (answer) => {
        if (checking.current !== controller) return;
        checking.current = undefined;
        if (answer === "absent") {
          settleRetained();
          return;
        }
        if ("kind" in answer) {
          if (answer.kind === "conflict") {
            standalone();
            return;
          }
          const local = recentLocalDoneStory(membership, new Date());
          if (answer.kind === "linked" || local?.identity === answer.identity) {
            settle("linked", answer.identity);
            return;
          }
          checkCatalog(answer.identity, false);
          return;
        }
        settle(answer);
      },
    );
  };

  const chosen =
    choice?.kind === "linked" &&
    !sameSelectedStory(selection.selected, choice.story)
      ? undefined
      : choice;
  const row: RecentlyDoneRowSelection = { choice: chosen, onSelect: select };
  const chosenSession = chosen?.kind === "standalone" ? chosen.key : undefined;
  return { choice: chosen, row, supersede, chosenSession };
}
