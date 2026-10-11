import { reportingInstruction } from "../../reportingInstruction.ts";
// Cursor's first prompt. The skill mark is this host's own sigil.
import {
  launchArguments,
  launchWorkflows,
  type RecordedLaunchRequest,
} from "../../../src/agentLaunch.ts";
import { hostDescriptions } from "../../../src/hostDescription.ts";
import type { EstablishedHandoff } from "../../hostLaunch.ts";
import { unattachedInput } from "../../unattachedInput.ts";

export function cursorPrompt(
  request: RecordedLaunchRequest,
  handoff: EstablishedHandoff | undefined,
): string | undefined {
  if (request.workflow === "ad-hoc") {
    return unattachedInput(request, handoff?.formatted);
  }
  const own = request.instruction?.trim();
  const skill = [
    `${hostDescriptions.cursor.skillSigil}${launchWorkflows[request.workflow].skill}`,
    ...launchArguments(request),
  ].join(" ");
  return [skill, handoff?.formatted, reportingInstruction(request), own]
    .filter((part) => part !== undefined && part !== "")
    .join("\n\n");
}
