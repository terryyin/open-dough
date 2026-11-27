// Read only the completed-story evidence required by shown sidebar rows.
// Launches share one catalog per project, reusing the Board's current catalog.
// This owner never navigates or opens/attaches a session.
import { createContext, useContext, useEffect, useState } from "react";
import { launchSubject, type LaunchWithState } from "./agentLaunch.ts";
import type { DoneStories } from "./doneStories.ts";
import { useDoneLinkReads } from "./pageReads.tsx";
import { currentPublishedSessions } from "./publishedSessions.ts";
import type { PublishedSource } from "./publishedSource.ts";
import type { PublishedWork } from "./publishedWork.ts";
import {
  catalogNow,
  currentCatalog,
  doneStoryMustBeRecent,
  linkIn,
} from "./recentlyDoneLink.ts";
import { checkIntervalMs } from "./revisionCheckSchedule.ts";
import { sessionKey } from "./sessionReference.ts";
import { withinReadWait } from "./readWaitBound.ts";

type Sources = {
  readonly projects: readonly PublishedSource[];
  readonly work: PublishedWork | undefined;
  readonly selected: string;
};
export const RecentlyDoneLinkSources = createContext<Sources>({
  projects: [],
  selected: "",
  work: undefined,
});

// The project's current published session records, while its work is shown.
export function useCurrentPublishedSessions(sourceId: string) {
  const { work } = useContext(RecentlyDoneLinkSources);
  return currentPublishedSessions(
    work?.source.id === sourceId ? work.publishedSessions : undefined,
    new Date(),
  );
}

type LinkFacts = {
  readonly key: string;
  readonly source: string;
  readonly identity: string;
  readonly recentOnly: boolean;
};

// What linking a shown row reads: its session, project and story identity.
const linkFactsOf = (record: LaunchWithState): LinkFacts[] => {
  const { identity } = launchSubject(record.request);
  return identity === undefined
    ? []
    : [
        {
          key: sessionKey(record.session),
          source: record.request.source,
          identity,
          recentOnly: doneStoryMustBeRecent(record),
        },
      ];
};

export function useShownDoneLinks(
  records: readonly LaunchWithState[] | undefined,
) {
  const { projects, selected, work } = useContext(RecentlyDoneLinkSources);
  const reads = useDoneLinkReads();
  // Only the facts a link reads make up the observation context, so detail a
  // retained session's history adds keeps the links already shown.
  const rows = JSON.stringify((records ?? []).flatMap(linkFactsOf));
  const sources = JSON.stringify(projects);
  const shown = work?.done;
  const revision = work?.revision;
  const [answer, setAnswer] = useState<{
    context: string;
    links: ReadonlyMap<string, string>;
  }>();
  const context = JSON.stringify([
    rows,
    sources,
    selected,
    work?.source.id,
    revision,
    shown,
  ]);
  useEffect(() => {
    const listed = JSON.parse(rows) as LinkFacts[];
    if (listed.length === 0) return;
    const configured = JSON.parse(sources) as PublishedSource[];
    let alive = true;
    let reading = false;
    const controller = new AbortController();
    const read = async () => {
      if (reading) return;
      reading = true;
      const links = new Map<string, string>();
      const publish = () => {
        if (alive) setAnswer({ context, links: new Map(links) });
      };
      await withinReadWait(controller.signal, async (signal) =>
        Promise.all(
          configured.map(async (source) => {
            const launches = listed.filter((row) => row.source === source.id);
            if (launches.length === 0) return;
            const catalog = async (): Promise<DoneStories | undefined> => {
              const current = currentCatalog(work, source.id);
              if (current !== undefined) return current;
              // The selected project's Board owns its catalog read and recovery.
              if (source.id === selected) return undefined;
              try {
                return await catalogNow(reads, source, signal);
              } catch {
                return undefined;
              }
            };
            const done = await catalog();
            if (done?.status !== "catalogued") return;
            for (const { key, identity, recentOnly } of launches) {
              if (linkIn(done, identity, { recentOnly }) === "linked")
                links.set(key, identity);
            }
            publish();
          }),
        ),
      );
      publish();
      reading = false;
    };
    void read();
    const interval = setInterval(() => {
      void read();
    }, checkIntervalMs);
    return () => {
      alive = false;
      controller.abort();
      clearInterval(interval);
    };
  }, [context, reads]);
  return answer?.context === context ? answer.links : undefined;
}
