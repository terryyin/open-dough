// An unattached session's first input, the same on every host: the block of
// the session its launch established, the reporting context, then the
// developer's text as typed. A launch that established none sends the
// developer's text first and its reporting context after, as it always did,
// and nothing at all when that text is blank.

import type { RecordedLaunchRequest } from "../src/agentLaunch.ts";
import { reportingInstruction } from "./reportingInstruction.ts";

export function unattachedInput(
  request: RecordedLaunchRequest,
  block: string | undefined,
): string | undefined {
  const own = request.instruction?.trim() ? request.instruction : undefined;
  if (block === undefined && own === undefined) return undefined;
  const reporting = reportingInstruction(request);
  return (block === undefined ? [own, reporting] : [block, reporting, own])
    .filter((part) => part !== undefined && part !== "")
    .join("\n\n");
}
