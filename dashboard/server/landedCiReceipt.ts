// Optional local receipt evidence for the landing selected from published
// history. Acquisition supplies raw project documents; this matcher alone
// chooses the earliest matching age, never the published landed revision.
import type { LaunchRecord } from "../src/agentLaunch.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import {
  keptLandingReferences,
  type ProjectHistory,
} from "./landedCiHistoryStore.ts";
import type { StoreRead } from "./machineJsonStore.ts";

export type LandingReceiptFacts = {
  readonly launchesByProject:
    ReadonlyMap<string, readonly LaunchRecord[]> | undefined;
  readonly retained: StoreRead<Readonly<Record<string, ProjectHistory>>>;
};

export function landedReceiptTime(
  source: Pick<PublishedSource, "id" | "ref">,
  identity: string,
  revision: string,
  facts: LandingReceiptFacts,
): string | undefined {
  const records = facts.launchesByProject?.get(source.id) ?? [];
  const history =
    facts.retained.kind === "document"
      ? facts.retained.document[source.id]
      : undefined;
  const references = [
    ...records.flatMap(({ landing }) =>
      landing === undefined ? [] : [landing],
    ),
    ...(history === undefined ? [] : keptLandingReferences(history)),
  ];
  const matching = references.filter(
    (landing) =>
      landing.target === `refs/heads/${source.ref}` &&
      landing.identity === identity &&
      landing.revision === revision,
  );
  // A later capture cannot restart the wait. Targetless legacy history
  // cannot establish matching age; neither can an unreadable local document.
  return matching
    .map(({ receivedAt }) => receivedAt)
    .sort((a, b) => Date.parse(a) - Date.parse(b))[0];
}
