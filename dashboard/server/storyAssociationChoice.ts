// Saves a developer's choice against the evidence held for this launch now.
import type { IncomingMessage } from "node:http";
import { observedStoryAssociation } from "../src/retainedStoryMembership.ts";
import {
  sameStoryAssociation,
  storyAssociationChoiceRequestSchema,
} from "../src/storyAssociationChoice.ts";
import { jsonBody } from "./jsonRequestBody.ts";
import { changeSessionRecord, keptSession } from "./launchRecordStore.ts";
import { RefusedRequest, verifyLocalOrigin } from "./localOrigin.ts";
import { publishedLaunchClose } from "./publishedLaunchClose.ts";
import { knownSource, noSuchSession } from "./sessionAdmission.ts";

export async function submitStoryAssociationChoice(req: IncomingMessage) {
  verifyLocalOrigin(req);
  if (req.method !== "POST")
    throw new RefusedRequest(405, "Only POST is accepted here.");
  const parsed = storyAssociationChoiceRequestSchema.safeParse(
    await jsonBody(req),
  );
  if (!parsed.success)
    throw new RefusedRequest(400, "The story choice is malformed.");
  const { host, session, choice } = parsed.data;
  const source = knownSource(parsed.data.source);
  const reference = { host, sessionId: session };
  const before = await keptSession(source.id, reference);
  if (before === undefined) throw noSuchSession();
  const close = await publishedLaunchClose(
    source,
    before,
    AbortSignal.timeout(10_000),
    { fetchMissing: true },
  );
  const saved = await changeSessionRecord(source.id, reference, (record) => {
    const observed = observedStoryAssociation(record, close);
    const earlier = record.storyAssociationChoice;
    if (
      record.request.source !== source.id ||
      record.doneAt === undefined ||
      record.launchedAt !== before.launchedAt ||
      observed?.kind !== "conflict" ||
      !sameStoryAssociation(observed, choice) ||
      (sameStoryAssociation(earlier, choice) &&
        earlier?.selected !== choice.selected)
    )
      throw new RefusedRequest(
        409,
        "The story association changed. Refresh before choosing.",
      );
    return { ...record, storyAssociationChoice: choice };
  });
  if (saved === undefined) throw noSuchSession();
  return { saved: true } as const;
}
