// Read only the completed-story evidence required by shown sidebar rows.
// Story launches share one catalog per project, reusing the Board's current
// catalog. Ad hoc links retain the server's confirmed association semantics.
// This owner never navigates or opens/attaches a session.
import { createContext, useContext, useEffect, useState } from "react";
import { launchSubject, type LaunchWithState } from "./agentLaunch.ts";
import { readPublishedSnapshot } from "./authenticatedRead.ts";
import { cataloguedAt, type DoneStories } from "./doneStories.ts";
import type { PublishedSource } from "./publishedSource.ts";
import type { PublishedWork } from "./publishedWork.ts";
import {
  associatedIdentity,
  currentCatalog,
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

export function useShownDoneLinks(
  records: readonly LaunchWithState[] | undefined,
) {
  const { projects, selected, work } = useContext(RecentlyDoneLinkSources);
  // Record evidence, including captured landing and reporting reference, is
  // part of the observation context. Replacing it invalidates an old answer.
  const rows = JSON.stringify(records ?? []);
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
    const listed = JSON.parse(rows) as LaunchWithState[];
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
            const relevant = listed.filter(
              (record) => record.request.source === source.id,
            );
            const launches = relevant.filter(
              (record) => launchSubject(record.request).identity !== undefined,
            );
            const catalog = async (): Promise<DoneStories | undefined> => {
              const current = currentCatalog(work, source.id);
              if (current !== undefined) return current;
              // The selected project's Board owns its catalog read and recovery.
              if (source.id === selected) return undefined;
              try {
                const { revision: at } = await readPublishedSnapshot(
                  source,
                  signal,
                );
                return await cataloguedAt(source, at, signal);
              } catch {
                return undefined;
              }
            };
            await Promise.all([
              ...(launches.length === 0
                ? []
                : [
                    catalog().then((done) => {
                      if (done?.status !== "catalogued") return;
                      for (const record of launches) {
                        const identity = launchSubject(record.request).identity;
                        if (
                          identity !== undefined &&
                          linkIn(done, identity, { recentOnly: true }) ===
                            "linked"
                        )
                          links.set(sessionKey(record.session), identity);
                      }
                      publish();
                    }),
                  ]),
              ...relevant
                .filter(
                  (record) =>
                    launchSubject(record.request).identity === undefined,
                )
                .map(async (record) => {
                  const associated = await associatedIdentity(
                    source,
                    record,
                    signal,
                  );
                  if (typeof associated === "object" && "kind" in associated)
                    links.set(sessionKey(record.session), associated.identity);
                  publish();
                }),
            ]);
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
  }, [context]);
  return answer?.context === context ? answer.links : undefined;
}
