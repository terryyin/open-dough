// Native settings an independent session cannot use are refused before its
// story is admitted, so a refusal publishes nothing.
import { sendsFirstInput, unattachedPolicyOf } from "../src/agentLaunch.ts";
import { admitsAdHocStory } from "../src/launchRequest.ts";
import { NativeRefusal } from "./hosts/codex/rpc.ts";
import { verifyCodexSettings } from "./hosts/codex/startupSettings.ts";
import { cursorBlankModelExplanation } from "./hosts/cursor/prompt.ts";
import type { Started } from "./launchStart.ts";
import type { UnattachedRequest } from "./unattachedStartScript.ts";

const refused = (explanation: string): Started => ({
  kind: "stopped",
  result: { kind: "failed", reason: "refused", explanation },
  publication: { kind: "none" },
});

export function refuseBlankCursor(
  request: UnattachedRequest,
): Started | undefined {
  return request.host === "cursor" &&
    request.model !== undefined &&
    admitsAdHocStory(request) &&
    !sendsFirstInput(request)
    ? refused(cursorBlankModelExplanation)
    : undefined;
}

// The borrowed checkout exists before admission, so its effective Codex
// settings are verified there first; native launch verifies them again.
export async function refuseDefaultCodexSettings(
  request: UnattachedRequest,
  workspace: string,
): Promise<Started | undefined> {
  if (
    request.host !== "codex" ||
    (request.model === undefined && request.effort === undefined) ||
    !admitsAdHocStory(request) ||
    unattachedPolicyOf(request).workspace !== "default-checkout"
  )
    return undefined;
  try {
    await verifyCodexSettings(request, workspace, AbortSignal.timeout(10_000));
  } catch (error) {
    if (!(error instanceof NativeRefusal)) throw error;
    return refused(
      `Codex refused to create a conversation. ${error.message} No first input was submitted.`,
    );
  }
  return undefined;
}
