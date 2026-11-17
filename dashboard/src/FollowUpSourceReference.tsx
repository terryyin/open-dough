// A Taken story follow-up names its source by title when the catalogued
// record is read, or by identity while unread or unavailable, and reveals
// that Done card through the page's story navigation — including an older
// catalogued source beyond the default recent window on demand.
import type { LaunchWithState } from "./agentLaunch.ts";
import { useDoneDetails } from "./doneDetails.ts";
import type { PublishedWork } from "./publishedWork.ts";
import { StoryReferenceLink } from "./StoryReferenceLink.tsx";
import "./follow-up.css";

export function FollowUpSourceReference({
  record,
  work,
}: {
  readonly record: LaunchWithState;
  readonly work: PublishedWork;
}) {
  const { request } = record;
  if (
    request.workflow !== "ad-hoc" ||
    request.followUp === undefined ||
    !("story" in request.followUp) ||
    request.source !== work.source.id
  ) {
    return null;
  }
  const identity = request.followUp.story.identity;
  const done = work.done;
  const revision =
    done?.status === "catalogued" ? done.revision : work.revision;
  const named =
    done?.status === "catalogued"
      ? done.records.find((each) => each.identity === identity)
      : undefined;
  const { detailOf } = useDoneDetails(
    work.source,
    revision,
    named === undefined ? [] : [named],
    named !== undefined,
  );
  const detail = named === undefined ? undefined : detailOf(named);
  const title =
    detail?.status === "read" ? detail.story.title || identity : identity;
  return (
    <p className="follow-up-source-reference">
      Source{" "}
      <StoryReferenceLink
        sourceId={work.source.id}
        identity={identity}
        title={title}
        includeOlder
      />
    </p>
  );
}
