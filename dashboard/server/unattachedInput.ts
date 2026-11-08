// An unattached session's first input, the same on every host: the block of
// the session its launch established, the reporting context, then the
// developer's part (typed text and any attached-images path list). A launch
// that established none sends the developer's part first and its reporting
// context after, as it always did, and nothing at all when that part is blank.
// A follow-up's context (`../src/followUpContext.ts`), resolved at admission
// and kept on the request, is its own block just before the developer's part:
// `[context, own, reporting]`, or `[block, reporting, context, own]`.

import type { RecordedLaunchRequest } from "../src/agentLaunch.ts";
import { developerPart } from "../src/launchAttachments.ts";
import { reportingInstruction } from "./reportingInstruction.ts";

export function unattachedInput(
  request: RecordedLaunchRequest,
  block: string | undefined,
): string | undefined {
  const own = developerPart(request);
  const context =
    request.workflow === "ad-hoc" ? request.followUp?.context : undefined;
  if (block === undefined && own === undefined && context === undefined)
    return undefined;
  const reporting = reportingInstruction(request);
  return (
    block === undefined
      ? [context, own, reporting]
      : [block, reporting, context, own]
  )
    .filter((part) => part !== undefined && part !== "")
    .join("\n\n");
}
