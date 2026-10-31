// Uploads Start-dialog image bytes as bounded raw bodies, then names only the
// returned claim ids on the launch JSON request.

import {
  launchAttachmentEndpoint,
  launchAttachmentNameHeader,
} from "./launchAttachments.ts";
import type { AgentLaunchRequest } from "./launchRequest.ts";
import { refusal } from "./agentLaunchClient.ts";

export async function withAttachmentClaims(
  request: AgentLaunchRequest,
  files: readonly File[] | undefined,
): Promise<AgentLaunchRequest> {
  if (files === undefined || files.length === 0) return request;
  const claims: string[] = [];
  for (const file of files) {
    const response = await fetch(launchAttachmentEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": file.type || "application/octet-stream",
        [launchAttachmentNameHeader]: file.name,
      },
      body: file,
    });
    const answered: unknown = await response.json().catch(() => undefined);
    if (!response.ok) {
      const refused = refusal.safeParse(answered);
      throw new Error(
        refused.success
          ? refused.data.error
          : "An attached image could not be uploaded.",
      );
    }
    const claim =
      answered !== null &&
      typeof answered === "object" &&
      "claim" in answered &&
      typeof answered.claim === "string"
        ? answered.claim
        : undefined;
    if (claim === undefined) {
      throw new Error("An attached image could not be uploaded.");
    }
    claims.push(claim);
  }
  return { ...request, attachmentClaims: claims };
}
