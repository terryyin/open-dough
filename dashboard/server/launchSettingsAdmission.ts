// Startup settings admission keeps static host aliases distinct from a host
// boundary's transient native offerings.
import type { AgentLaunchRequest } from "../src/agentLaunch.ts";
import { effortBlocked } from "../src/launchEffort.ts";
import { launchHost, type LaunchHost } from "./launchHosts.ts";
import { sessionHostSchema } from "../src/sessionReference.ts";
import { knownSource } from "./sessionAdmission.ts";
import { projectFolder, folderExists } from "./projectFolders.ts";
import { RefusedRequest } from "./localOrigin.ts";

export async function admitLaunchSettings(
  request: AgentLaunchRequest,
  host: LaunchHost,
): Promise<void> {
  if (
    request.effort !== undefined &&
    request.host !== "codex" &&
    request.host !== "cursor"
  )
    throw new RefusedRequest(
      400,
      "Reasoning effort is only offered for Codex or Cursor startup.",
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
  const effortSetting =
    request.host === "cursor" ? "your Cursor setting" : "the Codex setting";
  const staleEffort = `The selected reasoning effort is no longer supported by this model. Choose a supported effort or use ${effortSetting}.`;
  try {
    const options = await host.options(AbortSignal.timeout(10_000));
    if (
      request.model !== undefined &&
      !options.models.some((item) => item.model === request.model)
    )
      throw new RefusedRequest(400, modelCatalog?.stale ?? unoffered);
    if (request.host === "cursor") {
      if (request.effort !== undefined && request.model === undefined)
        throw new RefusedRequest(
          400,
          "Cursor reasoning effort requires a chosen model.",
        );
      if (
        request.model !== undefined &&
        effortBlocked(
          options,
          request.model,
          request.effort ?? "",
          request.host,
        )
      )
        throw new RefusedRequest(400, staleEffort);
      return;
    }
    if (
      request.effort !== undefined &&
      request.model !== undefined &&
      effortBlocked(options, request.model, request.effort, request.host)
    )
      throw new RefusedRequest(400, staleEffort);
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
