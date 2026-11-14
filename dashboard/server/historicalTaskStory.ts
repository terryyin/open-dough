// One assignment may explicitly name both a plan and an established identity.
// Every reference must resolve and agree; competing canonical facts stay auditable.
import { historicalUsageStory } from "./historicalUsageStory.ts";
import { uniqueFacts } from "./usageReconciliation.ts";
import type { NativeTaskFact } from "./nativeTaskFacts.ts";
import type { ConfiguredProject } from "./projectConfiguration.ts";
import type { UsageSource, UsageTask } from "./usageRecords.ts";

export async function historicalTaskStory(
  project: ConfiguredProject | undefined,
  revision: string | undefined,
  fact: NativeTaskFact,
) {
  const references = fact.storyReferences ?? [];
  const stories =
    project && revision
      ? await Promise.all(
          references.map((reference) =>
            historicalUsageStory(project, revision, reference),
          ),
        )
      : [];
  const resolved = stories.filter((story) => story !== undefined);
  const identities = new Set(resolved.map((story) => story.identity));
  const first =
    resolved.length === references.length && identities.size === 1
      ? resolved[0]
      : undefined;
  const titles = new Set(resolved.map((story) => story.title).filter(Boolean));
  const story = first
    ? {
        identity: first.identity,
        title:
          titles.size === 1
            ? (resolved.find((item) => item.title)?.title ?? null)
            : null,
      }
    : undefined;
  const sources = (items: UsageSource[]) =>
    uniqueFacts([
      fact.source,
      fact.contextSource ?? fact.source,
      ...(fact.revisionSource ? [fact.revisionSource] : []),
      ...items,
    ]);
  const fieldClaims: NonNullable<UsageTask["fieldClaims"]> = {};
  if (identities.size > 1) {
    fieldClaims["identity"] = resolved.map((item) => ({
      value: item.identity,
      sources: sources(item.sources),
    }));
    fieldClaims["title"] = resolved.flatMap((item) =>
      item.title ? [{ value: item.title, sources: sources(item.sources) }] : [],
    );
  }
  const fieldSources: NonNullable<UsageTask["fieldSources"]> = {};
  if (resolved.length) {
    fieldSources["identity"] = sources(
      resolved.flatMap((item) => item.sources),
    );
    if (resolved.some((item) => item.title))
      fieldSources["title"] = fieldSources["identity"];
  }
  return {
    story,
    fieldClaims,
    fieldSources,
    referenced: references.length > 0,
  };
}
