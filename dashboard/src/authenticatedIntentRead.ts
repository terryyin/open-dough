// Intent locations published in the project settings, read through the local
// authenticated read boundary (`../server/authenticatedRead.ts`) at a
// revision already resolved: with `intent=locations`, each configured
// location and the files its kind lists there (`./IntentPerspective.tsx`).

import { z } from "zod";
import {
  authenticatedGet,
  commitSha,
  unexpectedAnswer,
} from "./authenticatedGet.ts";
import { agentSettingsPath } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { readingPathAt } from "./authenticatedReadRules.ts";
import type { PublishedSource } from "./publishedSource.ts";

const intentLocation = z.object({
  path: z.string().min(1),
  kind: z.string().min(1),
  files: z.array(z.string().min(1)),
});

const okIntent = z.object({
  revision: commitSha,
  locations: z.array(intentLocation).nullable(),
});

export type IntentLocation = z.infer<typeof intentLocation>;

export type IntentLocations =
  | { readonly status: "not-configured" }
  | {
      readonly status: "configured";
      readonly locations: readonly IntentLocation[];
    };

// The Intent locations published at `revision`, or not-configured when the
// project has none.
export async function readIntentLocationsAt(
  source: PublishedSource,
  revision: string,
  signal: AbortSignal,
): Promise<IntentLocations> {
  const reading = readingPathAt(agentSettingsPath, revision);
  const body = await authenticatedGet(
    `source=${encodeURIComponent(source.id)}&revision=${encodeURIComponent(revision)}&intent=locations`,
    reading,
    signal,
  );
  const parsed = okIntent.safeParse(body);
  if (!parsed.success || parsed.data.revision !== revision) {
    throw unexpectedAnswer(reading);
  }
  return parsed.data.locations === null
    ? { status: "not-configured" }
    : { status: "configured", locations: parsed.data.locations };
}
