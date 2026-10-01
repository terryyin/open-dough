// Codex's exact first input; its text is retained before native submission.
import path from "node:path";
import type { FirstInput } from "../../../src/launchRecord.ts";
import {
  launchArguments,
  launchWorkflows,
  type RecordedLaunchRequest,
} from "../../../src/agentLaunch.ts";
import type { EstablishedLaunch } from "../../hostLaunch.ts";
export function codexInput(
  request: RecordedLaunchRequest,
  workspace: string,
  established?: EstablishedLaunch,
  saved?: string,
) {
  const own = request.instruction?.trim();
  const spec =
    request.workflow === "ad-hoc"
      ? undefined
      : launchWorkflows[request.workflow];
  return spec === undefined
    ? [{ type: "text", text: saved ?? request.instruction ?? "" }]
    : [
        {
          type: "text",
          text:
            saved ??
            [
              [
                `$${spec.skill}`,
                ...("identity" in request ? launchArguments(request) : []),
              ].join(" "),
              established?.handoff.formatted,
              own,
            ]
              .filter((part) => part !== undefined && part !== "")
              .join("\n\n"),
        },
        {
          type: "skill",
          name: spec.skill,
          path: path.join(
            workspace,
            ".agents",
            "skills",
            spec.skill,
            "SKILL.md",
          ),
        },
      ];
}

// Acknowledgment/history replaces pending acceptance evidence.
export function confirmedFirstInput(
  evidence: FirstInput,
  turnId: string,
): FirstInput {
  return { ...evidence, state: "confirmed", turnId, explanation: undefined };
}
