import { reportingInstruction } from "../../reportingInstruction.ts";
// Codex's exact first input; its text is retained before native submission.
import path from "node:path";
import type { FirstInput } from "../../../src/launchRecord.ts";
import {
  launchArguments,
  launchWorkflows,
  type RecordedLaunchRequest,
} from "../../../src/agentLaunch.ts";
import { feedbackMaintenanceSkill } from "../../../src/feedbackMaintenanceSetting.ts";
import { skillInvocation } from "../../../src/hostDescription.ts";
import type { EstablishedLaunch } from "../../hostLaunch.ts";
import { developerPart } from "../../../src/launchAttachments.ts";
import { unattachedInput } from "../../unattachedInput.ts";
// The installed skill a first input names as its own structured item: a
// story's workflow skill, or the feedback maintenance cycle's for the ad hoc
// session the feedback maintenance check started; none for any other ad hoc
// session.
function inputSkill(request: RecordedLaunchRequest): string | undefined {
  if (request.workflow !== "ad-hoc")
    return launchWorkflows[request.workflow].skill;
  return request.maintenance === undefined
    ? undefined
    : feedbackMaintenanceSkill;
}

export function codexInput(
  request: RecordedLaunchRequest,
  workspace: string,
  established?: EstablishedLaunch,
  saved?: string,
) {
  const own = developerPart(request);
  const skill = inputSkill(request);
  const text =
    saved ??
    (request.workflow === "ad-hoc"
      ? (unattachedInput(request, established?.handoff.formatted) ?? "")
      : [
          [
            skillInvocation("codex", launchWorkflows[request.workflow].skill),
            ...launchArguments(request),
          ].join(" "),
          established?.handoff.formatted,
          reportingInstruction(request),
          own,
        ]
          .filter((part) => part !== undefined && part !== "")
          .join("\n\n"));
  return [
    { type: "text", text },
    ...(skill === undefined
      ? []
      : [
          {
            type: "skill",
            name: skill,
            path: path.join(workspace, ".agents", "skills", skill, "SKILL.md"),
          },
        ]),
  ];
}

// Acknowledgment/history replaces pending acceptance evidence.
export function confirmedFirstInput(
  evidence: FirstInput,
  turnId: string,
): FirstInput {
  return { ...evidence, state: "confirmed", turnId, explanation: undefined };
}
