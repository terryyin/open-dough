// Startup settings admission keeps static host aliases distinct from transient Codex offerings.
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
  if (
    request.model !== undefined &&
    request.host !== "codex" &&
    !Object.hasOwn(host.description.models, request.model)
  ) {
    throw new RefusedRequest(
      400,
      host.description.unofferedModelExplanation ??
        `${host.name} does not offer this model.`,
    );
  }
  if (
    request.host === "codex" &&
    (request.model !== undefined || request.effort !== undefined)
  ) {
    try {
      if (host.options === undefined)
        throw new Error("Host startup choices unavailable.");
      const options = await host.options(AbortSignal.timeout(10_000));
      if (
        request.model !== undefined &&
        !options.models.some((item) => item.model === request.model)
      )
        throw new RefusedRequest(
          400,
          "The selected Codex model is no longer available. Choose another model or use the Codex setting.",
        );
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
        "Codex model choices could not be verified. Retry, or use the Codex setting.",
      );
    }
  }
}
