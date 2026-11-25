// Claimed launch-image bytes live under the machine dashboard home until a
// launch attempt is admitted, then move into `launch-attachments/<attempt>/`.
// Nothing here writes into a repository or workspace (ADR 0008).

import { createHash, randomUUID } from "node:crypto";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  launchAttachmentMaxCount,
  launchAttachmentTooMany,
  type ImageAttachmentType,
} from "../src/launchAttachments.ts";
import {
  checkedImageAttachmentType,
  sanitizeImageAttachmentName,
} from "./imageAttachments.ts";
import {
  withoutConfirmation,
  type AgentLaunchRequest,
} from "../src/launchRequest.ts";
import { machineDashboardDirectory } from "./machineHome.ts";
import { RefusedRequest } from "./localOrigin.ts";

function contentDigest(bytes: Buffer): string {
  return createHash("sha256").update(bytes).digest("hex");
}

const claimDirectory = (id: string, dashboardDirectory: string) =>
  path.join(dashboardDirectory, "launch-attachment-claims", id);

const attachmentsDirectory = (attemptId: string, dashboardDirectory: string) =>
  path.join(dashboardDirectory, "launch-attachments", attemptId);

type ClaimMeta = {
  readonly name: string;
  readonly type: ImageAttachmentType;
};

export function claimLaunchAttachment(
  bytes: Buffer,
  type: string,
  name: string,
  dashboardDirectory = machineDashboardDirectory(),
): string {
  const imageType = checkedImageAttachmentType(type, bytes.length);
  const id = randomUUID();
  const directory = claimDirectory(id, dashboardDirectory);
  mkdirSync(directory, { recursive: true });
  const meta: ClaimMeta = {
    name: sanitizeImageAttachmentName(name, imageType),
    type: imageType,
  };
  writeFileSync(path.join(directory, "meta.json"), JSON.stringify(meta));
  writeFileSync(path.join(directory, "bytes"), bytes);
  return id;
}

export function abandonAttachmentClaims(
  claims: readonly string[] | undefined,
  dashboardDirectory = machineDashboardDirectory(),
): void {
  for (const id of claims ?? []) {
    rmSync(claimDirectory(id, dashboardDirectory), {
      recursive: true,
      force: true,
    });
  }
}

// Abandon claims first, then produce the answer, so deferred work such as
// continuation never starts while claim directories still exist.
export function answerWithoutAttachmentClaims<T>(
  claims: readonly string[] | undefined,
  answer: () => T,
): T {
  abandonAttachmentClaims(claims);
  return answer();
}

export function removeLaunchAttachments(
  attemptId: string,
  dashboardDirectory = machineDashboardDirectory(),
): void {
  rmSync(attachmentsDirectory(attemptId, dashboardDirectory), {
    recursive: true,
    force: true,
  });
}

type MaterializedAttachments = {
  readonly paths: string[];
  readonly digests: string[];
};

// Content digests of claimed image bytes, in claim order, so sameLaunch can
// match a wire request to a retained attempt before claims are consumed.
export function withClaimAttachmentDigests(
  request: AgentLaunchRequest,
): AgentLaunchRequest {
  if (
    request.attachmentDigests !== undefined ||
    request.attachmentClaims === undefined ||
    request.attachmentClaims.length === 0
  ) {
    return request;
  }
  const dashboardDirectory = machineDashboardDirectory();
  const digests: string[] = [];
  for (const id of request.attachmentClaims) {
    try {
      const directory = claimDirectory(id, dashboardDirectory);
      digests.push(contentDigest(readFileSync(path.join(directory, "bytes"))));
    } catch {
      throw new RefusedRequest(400, "An attached image could not be read.");
    }
  }
  return { ...request, attachmentDigests: digests };
}

// Moves claimed images into the attempt's folder and answers their absolute
// paths and content digests in order. Claims are consumed; a failure leaves
// neither partial folder nor remaining claims for the ones already moved.
export function materializeLaunchAttachments(
  attemptId: string,
  claims: readonly string[] | undefined,
  dashboardDirectory = machineDashboardDirectory(),
): MaterializedAttachments {
  if (claims === undefined || claims.length === 0) {
    return { paths: [], digests: [] };
  }
  if (claims.length > launchAttachmentMaxCount) {
    abandonAttachmentClaims(claims, dashboardDirectory);
    throw new RefusedRequest(400, launchAttachmentTooMany);
  }
  const unique = new Set(claims);
  if (unique.size !== claims.length) {
    abandonAttachmentClaims(claims, dashboardDirectory);
    throw new RefusedRequest(400, "The launch request is malformed.");
  }
  const directory = attachmentsDirectory(attemptId, dashboardDirectory);
  mkdirSync(directory, { recursive: true });
  const paths: string[] = [];
  const digests: string[] = [];
  try {
    for (const [index, id] of claims.entries()) {
      const claimed = claimDirectory(id, dashboardDirectory);
      let meta: ClaimMeta;
      let bytes: Buffer;
      try {
        meta = JSON.parse(
          readFileSync(path.join(claimed, "meta.json"), "utf8"),
        ) as ClaimMeta;
        bytes = readFileSync(path.join(claimed, "bytes"));
      } catch {
        throw new RefusedRequest(400, "An attached image could not be read.");
      }
      const fileName = `${String(index + 1)}-${sanitizeImageAttachmentName(meta.name, meta.type)}`;
      const destination = path.join(directory, fileName);
      writeFileSync(destination, bytes);
      rmSync(claimed, { recursive: true, force: true });
      paths.push(destination);
      digests.push(contentDigest(bytes));
    }
  } catch (error) {
    rmSync(directory, { recursive: true, force: true });
    abandonAttachmentClaims(claims, dashboardDirectory);
    throw error;
  }
  return { paths, digests };
}

// After an attempt id is chosen: refuse a wire request that already names
// paths, materialize claim ids into absolute paths and content digests, and
// answer the kept request (paths and digests only; never claim ids or image
// bytes).
export function recordedRequestWithMaterializedAttachments(
  attemptId: string,
  request: AgentLaunchRequest,
  dashboardDirectory = machineDashboardDirectory(),
): AgentLaunchRequest {
  if (request.attachments !== undefined) {
    abandonAttachmentClaims(request.attachmentClaims, dashboardDirectory);
    throw new RefusedRequest(400, "The launch request is malformed.");
  }
  const base = withoutConfirmation(request);
  try {
    const { paths, digests } = materializeLaunchAttachments(
      attemptId,
      request.attachmentClaims,
      dashboardDirectory,
    );
    if (paths.length === 0) {
      const kept = { ...base };
      delete kept.attachmentDigests;
      return kept;
    }
    return { ...base, attachments: paths, attachmentDigests: digests };
  } catch (error) {
    removeLaunchAttachments(attemptId, dashboardDirectory);
    throw error;
  }
}
