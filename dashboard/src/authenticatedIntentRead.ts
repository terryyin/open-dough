// Intent locations published in the project settings, read through the local
// authenticated read boundary (`../server/authenticatedRead.ts`) at a
// revision already resolved: with `intent=locations`, each configured
// location and the files its kind lists there (`./IntentPerspective.tsx`).
// An answer fixed by its revision is asked once per page (`./answerMemo.ts`);
// a failed read, or a settings problem, is asked again.

import { z } from "zod";
import {
  authenticatedGet,
  commitSha,
  transientReadRecovery,
  unexpectedAnswer,
} from "./authenticatedGet.ts";
import { keptAnswer, memoizedAnswer } from "./answerMemo.ts";
import { agentSettingsPath } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { readingPathAt } from "./authenticatedReadRules.ts";
import type { PublishedSource } from "./publishedSource.ts";

const locationProblem = z.enum(["unsupported-kind", "no-matching-files"]);
const settingsProblem = z.enum(["malformed", "unreadable"]);

const intentLocation = z.object({
  path: z.string().min(1),
  kind: z.string().min(1),
  label: z.string().min(1).optional(),
  include: z.array(z.string().min(1)).optional(),
  files: z.array(z.string().min(1)),
  problem: locationProblem.optional(),
});

const okIntent = z.object({
  revision: commitSha,
  locations: z.array(intentLocation).nullable(),
  settingsProblem: settingsProblem.optional(),
  recovery: transientReadRecovery,
});

export type IntentLocation = z.infer<typeof intentLocation>;
export type IntentSettingsProblem = z.infer<typeof settingsProblem>;

export type IntentLocations =
  | { readonly status: "not-configured" }
  | {
      readonly status: "settings-problem";
      readonly problem: IntentSettingsProblem;
      readonly recovery: z.infer<typeof transientReadRecovery>;
    }
  | {
      readonly status: "configured";
      readonly locations: readonly IntentLocation[];
    };

const locationsQuery = (source: PublishedSource, revision: string) =>
  `source=${encodeURIComponent(source.id)}&revision=${encodeURIComponent(revision)}&intent=locations`;

// The Intent locations published at `revision` already read on this page.
export function keptIntentLocationsAt(
  source: PublishedSource,
  revision: string,
): IntentLocations | undefined {
  return keptAnswer(locationsQuery(source, revision)) as
    IntentLocations | undefined;
}

// The Intent locations published at `revision`, or not-configured / a
// settings problem when the project has none or the settings are unusable.
export function readIntentLocationsAt(
  source: PublishedSource,
  revision: string,
  signal: AbortSignal,
): Promise<IntentLocations> {
  const query = locationsQuery(source, revision);
  return memoizedAnswer(
    query,
    (shared) => askIntentLocationsAt(query, revision, shared),
    signal,
    // Settings problems offer Retry, so they are asked again.
    (locations) => locations.status !== "settings-problem",
  );
}

async function askIntentLocationsAt(
  query: string,
  revision: string,
  signal: AbortSignal,
): Promise<IntentLocations> {
  const reading = readingPathAt(agentSettingsPath, revision);
  const body = await authenticatedGet(query, reading, signal);
  const parsed = okIntent.safeParse(body);
  if (!parsed.success || parsed.data.revision !== revision) {
    throw unexpectedAnswer(reading);
  }
  if (parsed.data.settingsProblem !== undefined) {
    if (parsed.data.locations !== null) {
      throw unexpectedAnswer(reading);
    }
    return {
      status: "settings-problem",
      problem: parsed.data.settingsProblem,
      recovery:
        parsed.data.settingsProblem === "unreadable"
          ? parsed.data.recovery
          : undefined,
    };
  }
  return parsed.data.locations === null
    ? { status: "not-configured" }
    : { status: "configured", locations: parsed.data.locations };
}
