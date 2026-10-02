import { reportingInstruction } from "../../reportingInstruction.ts";
// Cursor's first prompt. The skill mark is this host's own sigil.
import {
  launchArguments,
  launchWorkflows,
  type RecordedLaunchRequest,
} from "../../../src/agentLaunch.ts";
import { hostDescriptions } from "../../../src/hostDescription.ts";
import type { EstablishedHandoff } from "../../hostLaunch.ts";

export function cursorPrompt(
  request: RecordedLaunchRequest,
  handoff: EstablishedHandoff | undefined,
): string | undefined {
  const own = request.instruction?.trim();
  if (request.workflow === "ad-hoc") {
    return own
      ? [request.instruction, reportingInstruction(request)]
          .filter(Boolean)
          .join("\n\n")
      : undefined;
  }
  const skill = [
    `${hostDescriptions.cursor.skillSigil}${launchWorkflows[request.workflow].skill}`,
    ...launchArguments(request),
  ].join(" ");
  return [skill, handoff?.formatted, reportingInstruction(request), own]
    .filter((part) => part !== undefined && part !== "")
    .join("\n\n");
}
