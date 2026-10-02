// Validate requested settings in the actual launch workspace. Untouched defaults
// never depend on catalog visibility (configured custom models remain usable).
import type { LaunchHostOptions } from "../../../src/launchHostOptions.ts";
import type { RecordedLaunchRequest } from "../../../src/agentLaunch.ts";
import { hostDescriptions } from "../../../src/hostDescription.ts";
import { codexOptions } from "./options.ts";
import { NativeRefusal } from "./rpc.ts";
export async function verifyCodexSettings(
  request: RecordedLaunchRequest,
  workspace: string,
  signal: AbortSignal,
): Promise<LaunchHostOptions | undefined> {
  if (request.model === undefined && request.effort === undefined) return;
  let options;
  try {
    options = await codexOptions(
      signal,
      request.effort === undefined || request.model !== undefined
        ? undefined
        : workspace,
    );
  } catch {
    throw new NativeRefusal(
      "The requested Codex settings could not be verified. Retry, or use the Codex setting.",
    );
  }
  const model = request.model ?? options.configuredModel;
  const offering = options.models.find((item) => item.model === model);
  if (request.model !== undefined && offering === undefined)
    throw new NativeRefusal(hostDescriptions.codex.modelCatalog.stale);
  if (
    request.effort !== undefined &&
    model !== undefined &&
    !offering?.efforts.some((item) => item.effort === request.effort)
  )
    throw new NativeRefusal(
      "The requested reasoning effort could not be verified for the launch workspace's model. Choose a supported effort or use the Codex setting.",
    );
  return options;
}
