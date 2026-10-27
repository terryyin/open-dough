// Answers the admitted host's startup choices, keeping failures readable.
import type { ServerResponse } from "node:http";
import type { AdmittedHostOptions } from "./launchSettingsAdmission.ts";
import type { AgentLaunchAnswer } from "./agentLaunchResponse.ts";
import { withResponseSignal } from "./responseSignal.ts";

export async function launchHostOptionsResponse(
  request: AdmittedHostOptions,
  res: ServerResponse,
): Promise<AgentLaunchAnswer> {
  return await withResponseSignal(res, async (signal) => {
    try {
      if (request.host.options === undefined)
        throw new Error("Host startup choices unavailable.");
      return {
        status: 200,
        body: await request.host.options(signal, request.cwd),
      };
    } catch {
      return {
        status: 503,
        body: {
          error:
            request.host.description.modelCatalog?.unreadable ??
            `${request.host.name} model choices could not be read.`,
        },
      };
    }
  });
}
