// An unattached session's first input, the same on every host: the block of
// the session its launch established, the reporting context, then the
// developer's part (typed text and any attached-images path list). A launch
// that established none sends the developer's part first and its reporting
// context after, as it always did, and nothing at all when that part is blank.

import type { RecordedLaunchRequest } from "../src/agentLaunch.ts";
import { developerPart } from "../src/launchAttachments.ts";
import { reportingInstruction } from "./reportingInstruction.ts";

export function unattachedInput(
  request: RecordedLaunchRequest,
  block: string | undefined,
): string | undefined {
  const own = developerPart(request);
  if (block === undefined && own === undefined) return undefined;
  const reporting = reportingInstruction(request);
  return (block === undefined ? [own, reporting] : [block, reporting, own])
    .filter((part) => part !== undefined && part !== "")
    .join("\n\n");
}
