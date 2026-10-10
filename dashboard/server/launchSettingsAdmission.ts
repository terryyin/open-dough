// Startup settings admission keeps static host aliases distinct from a host
// boundary's transient native offerings.
import type { AgentLaunchRequest } from "../src/agentLaunch.ts";
import { launchHost, type LaunchHost } from "./launchHosts.ts";
import { sessionHostSchema } from "../src/sessionReference.ts";
import { knownSource } from "./sessionAdmission.ts";
import { projectFolder, folderExists } from "./projectFolders.ts";
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

// Startup option discovery uses the same host and project admission as launch settings.
export type AdmittedHostOptions = {
  readonly kind: "host-options";
  readonly cwd?: string;
  readonly host: LaunchHost;
};
export async function hostOptionsRequest(
  url: URL,
): Promise<AdmittedHostOptions> {
  const source = knownSource(url.searchParams.get("source"));
  const identity = sessionHostSchema.safeParse(url.searchParams.get("host"));
  const host = identity.success ? launchHost(identity.data) : undefined;
  if (host?.options === undefined)
    throw new RefusedRequest(400, "This host cannot offer startup choices.");
  if (!(await folderExists(projectFolder(source))))
    throw new RefusedRequest(
      404,
      "The project folder is not available on this machine.",
    );
  return {
    kind: "host-options",
    host,
    ...(url.searchParams.get("context") === "project"
      ? { cwd: projectFolder(source).path }
      : {}),
  };
}
