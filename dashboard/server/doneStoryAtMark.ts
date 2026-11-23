// Read existing membership before the record lock, then apply it to the same
// retained launch when its Done time is saved.
import { adHocStoryIdentity } from "../../Distribution/src/skills/dough-execute-plan/scripts/session-record.mjs";
import { followUpStoryIdentity } from "../src/followUpRequest.ts";
import { landingReportingReference } from "../src/launchLanding.ts";
import type { LaunchRecord } from "../src/launchRecord.ts";
import { sessionKey } from "../src/sessionReference.ts";
import { completedStoryAssociation } from "./completedStoryAssociation.ts";
import { RefusedRequest } from "./localOrigin.ts";
import { configuredProject } from "./projectConfiguration.ts";
import { publishedLaunchClose } from "./publishedLaunchClose.ts";

type AttachDoneStory = (marked: LaunchRecord) => LaunchRecord;

function needsStoryAssociation(record: LaunchRecord): boolean {
  const { request } = record;
  return (
    request.workflow === "ad-hoc" &&
    record.doneStory === undefined &&
    followUpStoryIdentity(request) === undefined
  );
}

const recordedStory = (record: LaunchRecord) =>
  record.landing?.identity ?? record.landingReporting?.authority.identity;

export async function prepareDoneStory(
  candidate: LaunchRecord | undefined,
): Promise<AttachDoneStory> {
  if (candidate === undefined || !needsStoryAssociation(candidate))
    return (marked) => marked;
  const reference = landingReportingReference(candidate);
  const identity = adHocStoryIdentity(reference);
  const kept =
    recordedStory(candidate) === undefined && identity !== undefined
      ? await publishedMembership(candidate)
      : undefined;
  return (marked) => {
    if (
      marked.doneAt === undefined ||
      !needsStoryAssociation(marked) ||
      marked.request.source !== candidate.request.source ||
      marked.launchedAt !== candidate.launchedAt ||
      sessionKey(marked.session) !== sessionKey(candidate.session)
    )
      return marked;
    const named = recordedStory(marked);
    if (named !== undefined)
      return { ...marked, doneStory: { kind: "linked", identity: named } };
    // A receipt that arrived after the read can establish an older story.
    // Withhold this mark so its next attempt reads the new facts.
    if (
      landingReportingReference(marked) !== reference ||
      (identity !== undefined &&
        marked.landing?.receipt !== candidate.landing?.receipt)
    )
      throw new RefusedRequest(
        409,
        "The session recorded a landing while Done was in progress. Retry Done to keep its story association.",
      );
    if (kept?.kind === "linked") return { ...marked, doneStory: kept };
    if (
      identity === undefined ||
      kept?.kind !== "absent" ||
      !marked.request.title.trim()
    )
      return marked;
    return {
      ...marked,
      doneStory: {
        kind: "originating",
        identity,
        title: marked.request.title,
        completedAt: candidate.doneAt ?? marked.doneAt,
      },
    };
  };
}

async function publishedMembership(record: LaunchRecord) {
  const source = configuredProject(record.request.source);
  const reference = landingReportingReference(record);
  if (source === undefined || reference === undefined)
    return { kind: "absent" } as const;
  const signal = AbortSignal.timeout(10_000);
  const published = await publishedLaunchClose(source, record, signal);
  if (published !== undefined)
    return published.story === undefined
      ? ({ kind: "standalone" } as const)
      : ({ kind: "linked", identity: published.story } as const);
  return completedStoryAssociation(source, record, signal).catch(
    () => ({ kind: "unavailable" }) as const,
  );
}
