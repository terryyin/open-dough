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
// done uses (`recentDoneRecords`). An ad hoc row may derive a completed-story
// association from retained launch and published claim/completion evidence
// (`./completedStoryAssociation.ts`) without rewriting its request identity
// or Ad hoc label; that association may name a catalogued Done story beyond
// the recent window. The shown project's current-revision catalog is reused;
// another project's is read on demand through the same authenticated snapshot
// reader and the Board's catalog reading (`cataloguedAt`), and no done record
// body is read. An unread catalog or association is checking, and a failed
// one, a catalog gap said in the Board's words, or one naming the story's
// record as unreadable is unknown, each said apart from a confirmed miss,
// which selects the session. A later choice, an explicit Open, or another
// project chosen meanwhile supersedes an unanswered check. A linked row stays
// chosen while its story is the page's Selected story.
//
// In Development the choice also shows its project's stories and brings into
// view its done story's card, or, for a standalone row, its session's entry,
// which is marked selected (`ChosenSessionOnPage`); the page's Recently done
// range extends as far as that entry (`./sessionNavigation.ts`). Only the
// current choice goes there, as the perspective is when its check answers.

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { launchSubject, type LaunchRecord } from "./agentLaunch.ts";
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
  linkIn,
  readLink,
  type DoneLink,
} from "./recentlyDoneLink.ts";
import type { GoToSession } from "./sessionNavigation.ts";
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
    const { identity: requested } = launchSubject(record.request);
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
    if (requested !== undefined) {
      checkCatalog(requested, true);
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
        // Association already validated published claim/completion evidence.
        // Select that identity without the recent-window catalog gate story
        // launches use; Board reveal may still include a catalogued older Done.
        if (typeof answer === "object" && "kind" in answer) {
          settle("linked", answer.identity);
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
