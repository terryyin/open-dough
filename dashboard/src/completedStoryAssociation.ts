// Browser read of which published Done story a retained ad hoc session
// completed (`../server/completedStoryAssociation.ts`). The launch boundary
// resolves the session from server-held records; the browser never supplies a
// repository path or unchecked completion identity.
import { z } from "zod";
import { agentLaunchEndpoint } from "./launchRequest.ts";
import type { SessionReference } from "./sessionReference.ts";

export const completedStoryAssociationEndpoint = `${agentLaunchEndpoint}/completed-story`;

export const completedStoryAssociationSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("linked"),
    identity: z.string().min(1),
  }),
  z.object({ kind: z.literal("absent") }),
  z.object({
    kind: z.literal("unavailable"),
    explanation: z.string().min(1),
  }),
]);

export type CompletedStoryAssociationAnswer = z.infer<
  typeof completedStoryAssociationSchema
>;

export async function readCompletedStoryAssociation(
  source: string,
  session: SessionReference,
  signal: AbortSignal,
): Promise<CompletedStoryAssociationAnswer> {
  const query = new URLSearchParams({
    source,
    host: session.host,
    session: session.sessionId,
  });
  const response = await fetch(
    `${completedStoryAssociationEndpoint}?${query.toString()}`,
    { signal, cache: "no-store" },
  );
  const answer: unknown = await response.json();
  if (!response.ok) {
    const said = (answer as { error?: unknown }).error;
    throw new Error(
      typeof said === "string"
        ? said
        : "The completed-story association could not be read.",
    );
  }
  return completedStoryAssociationSchema.parse(answer);
}
