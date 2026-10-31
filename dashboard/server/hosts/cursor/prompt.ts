import { reportingInstruction } from "../../reportingInstruction.ts";
// Cursor's first prompt. The skill mark is this host's own sigil.
import {
  launchArguments,
  launchWorkflows,
  type RecordedLaunchRequest,
} from "../../../src/agentLaunch.ts";
import { skillInvocation } from "../../../src/hostDescription.ts";
import type { EstablishedHandoff } from "../../hostLaunch.ts";
import { developerPart } from "../../../src/launchAttachments.ts";
import { unattachedInput } from "../../unattachedInput.ts";

export function cursorPrompt(
  request: RecordedLaunchRequest,
  handoff: EstablishedHandoff | undefined,
): string | undefined {
  if (request.workflow === "ad-hoc") {
    return unattachedInput(request, handoff?.formatted);
  }
  const own = developerPart(request);
  const skill = [
    skillInvocation("cursor", launchWorkflows[request.workflow].skill),
    ...launchArguments(request),
  ].join(" ");
  return [skill, handoff?.formatted, reportingInstruction(request), own]
    .filter((part) => part !== undefined && part !== "")
    .join("\n\n");
}
