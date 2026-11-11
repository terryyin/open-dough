// Resolve retained records through the existing published completion owner.
import type { PublishedSource } from "../src/publishedSource.ts";
import type { FollowUpLedger } from "./ciFollowUpStore.ts";
import { publishedStoryEndpoints } from "./storyPublishedEndpoints.ts";

type Landing = FollowUpLedger["landings"][string];
export type SelectedLanding = Landing & { readonly at: string };

export async function completedFollowUps(
  source: PublishedSource,
  ledger: FollowUpLedger,
  signal: AbortSignal,
): Promise<SelectedLanding[]> {
  const candidates = Object.values(ledger.landings).filter(
    (landing) =>
      landing.project === source.id &&
      landing.identity !== undefined &&
      (landing.request !== undefined || landing.assessment !== undefined),
  );
  const selected: SelectedLanding[] = [];
  for (const identity of new Set(
    candidates.map((landing) => landing.identity),
  )) {
    if (identity === undefined) continue;
    const endpoints = await publishedStoryEndpoints(source, identity, signal);
    if (endpoints.kind !== "facts") continue;
    const facts = endpoints.facts;
    const revision =
      facts.mode === "trunk" ? facts.completion : facts.landing?.merge;
    const landing = candidates.find(
      (candidate) =>
        candidate.identity === identity &&
        candidate.target === `refs/heads/${source.ref}` &&
        candidate.revision === revision,
    );
    if (landing !== undefined)
      selected.push({ ...landing, at: facts.completedAt });
  }
  return selected;
}
