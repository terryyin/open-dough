// Startup settings admission keeps static host aliases distinct from a host
// boundary's transient native offerings.
import type { AgentLaunchRequest } from "../src/agentLaunch.ts";
import type { LaunchHost } from "./launchHosts.ts";
import { RefusedRequest } from "./localOrigin.ts";

export async function admitLaunchSettings(
  request: AgentLaunchRequest,
  host: LaunchHost,
): Promise<void> {
  if (request.effort !== undefined && request.host !== "codex")
    throw new RefusedRequest(
      400,
      "Reasoning effort is only offered for Codex startup.",
    );
  const unoffered =
    host.description.unofferedModelExplanation ??
    `${host.name} does not offer this model.`;
  if (host.options === undefined) {
    if (
      request.model !== undefined &&
      !Object.hasOwn(host.description.models, request.model)
    )
      throw new RefusedRequest(400, unoffered);
    return;
  }
  if (request.model === undefined && request.effort === undefined) return;
  const modelCatalog = host.description.modelCatalog;
  try {
    const options = await host.options(AbortSignal.timeout(10_000));
    if (
      request.model !== undefined &&
      !options.models.some((item) => item.model === request.model)
    )
      throw new RefusedRequest(400, modelCatalog?.stale ?? unoffered);
    if (
      request.effort !== undefined &&
      request.model !== undefined &&
      !options.models
        .find((item) => item.model === request.model)
        ?.efforts.some((item) => item.effort === request.effort)
    )
      throw new RefusedRequest(
        400,
        "The selected reasoning effort is no longer supported by this model. Choose a supported effort or use the Codex setting.",
      );
  } catch (error) {
    if (error instanceof RefusedRequest) throw error;
    throw new RefusedRequest(
      503,
      modelCatalog?.unverified ??
        `${host.name} model choices could not be verified.`,
    );
  }
}
