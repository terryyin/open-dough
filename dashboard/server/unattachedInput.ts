// An unattached session's first input, the same on every host: the block of
// the session its launch established, the reporting context, then the
// developer's part (typed text and any attached-images path list). A launch
// that established none sends the developer's part first, its reporting
// context after, then the Taken story it was admitted under; nothing at all
// when that part is blank.
// A new story follow-up's saved message includes its developer instruction.
// A session follow-up and an older story follow-up save only context, so they
// keep their separate instruction block.

import type { RecordedLaunchRequest } from "../src/agentLaunch.ts";
import { developerPart } from "../src/launchAttachments.ts";
import { reportingInstruction } from "./reportingInstruction.ts";

export function unattachedInput(
  request: RecordedLaunchRequest,
  block: string | undefined,
): string | undefined {
  const saved =
    request.workflow === "ad-hoc" ? request.followUp?.context : undefined;
  const context = typeof saved === "string" ? saved : saved?.message;
  const own = developerPart(
    typeof saved === "object" ? { attachments: request.attachments } : request,
  );
  const identity =
    request.workflow === "ad-hoc" ? request.storyIdentity : undefined;
  if (own === undefined && context === undefined) return undefined;
  const story =
    identity === undefined || saved !== undefined
      ? undefined
      : `Taken story: ${identity}`;
  const reporting = reportingInstruction(request);
  return (
    block === undefined
      ? [context, own, reporting, story]
      : [block, reporting, story, context, own]
  )
    .filter((part) => part !== undefined && part !== "")
    .join("\n\n");
}
