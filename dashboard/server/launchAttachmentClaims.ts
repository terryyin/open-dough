// Claimed launch-image bytes live under the machine dashboard home until a
// launch attempt is admitted, then move into `launch-attachments/<attempt>/`.
// Nothing here writes into a repository or workspace (ADR 0008).

import { createHash, randomUUID } from "node:crypto";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  launchAttachmentExtensionFor,
  launchAttachmentLimitBytes,
  launchAttachmentMaxCount,
  launchAttachmentTooLarge,
  launchAttachmentTooMany,
  launchAttachmentTypes,
  launchAttachmentUnsupportedType,
} from "../src/launchAttachments.ts";
import {
  withoutConfirmation,
  type AgentLaunchRequest,
} from "../src/launchRequest.ts";
import { machineDashboardPath } from "./machineHome.ts";
import { RefusedRequest } from "./localOrigin.ts";

function contentDigest(bytes: Buffer): string {
  return createHash("sha256").update(bytes).digest("hex");
}

const claimsRoot = (...segments: string[]) =>
  machineDashboardPath("launch-attachment-claims", ...segments);

const attachmentsRoot = (...segments: string[]) =>
  machineDashboardPath("launch-attachments", ...segments);

type ClaimMeta = {
  readonly name: string;
  readonly type: (typeof launchAttachmentTypes)[number];
};

function sanitizeName(name: string, type: ClaimMeta["type"]): string {
  const extension = `.${launchAttachmentExtensionFor[type]}`;
  const base = path
    .basename(name)
    .replace(/[^\w.\-()+ ]+/g, "_")
    .trim();
  const fallback = `image${extension}`;
  if (base === "" || base === "." || base === "..") return fallback;
  const hasExtension = /\.[A-Za-z0-9]+$/.test(base);
  return hasExtension ? base : `${base}${extension}`;
}

export function claimLaunchAttachment(
  bytes: Buffer,
  type: string,
  name: string,
): string {
  if (!(launchAttachmentTypes as readonly string[]).includes(type)) {
    throw new RefusedRequest(415, launchAttachmentUnsupportedType);
  }
  if (bytes.length > launchAttachmentLimitBytes) {
    throw new RefusedRequest(413, launchAttachmentTooLarge);
  }
  const id = randomUUID();
  const directory = claimsRoot(id);
  mkdirSync(directory, { recursive: true });
  const meta: ClaimMeta = {
    name: sanitizeName(name, type as ClaimMeta["type"]),
    type: type as ClaimMeta["type"],
  };
  writeFileSync(path.join(directory, "meta.json"), JSON.stringify(meta));
  writeFileSync(path.join(directory, "bytes"), bytes);
  return id;
}

export function abandonAttachmentClaims(
  claims: readonly string[] | undefined,
): void {
  for (const id of claims ?? []) {
    rmSync(claimsRoot(id), { recursive: true, force: true });
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

export function removeLaunchAttachments(attemptId: string): void {
  rmSync(attachmentsRoot(attemptId), { recursive: true, force: true });
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
  const digests: string[] = [];
  for (const id of request.attachmentClaims) {
    try {
      digests.push(
        contentDigest(readFileSync(path.join(claimsRoot(id), "bytes"))),
      );
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
): MaterializedAttachments {
  if (claims === undefined || claims.length === 0) {
    return { paths: [], digests: [] };
  }
  if (claims.length > launchAttachmentMaxCount) {
    abandonAttachmentClaims(claims);
    throw new RefusedRequest(400, launchAttachmentTooMany);
  }
  const unique = new Set(claims);
  if (unique.size !== claims.length) {
    abandonAttachmentClaims(claims);
    throw new RefusedRequest(400, "The launch request is malformed.");
  }
  const directory = attachmentsRoot(attemptId);
  mkdirSync(directory, { recursive: true });
  const paths: string[] = [];
  const digests: string[] = [];
  try {
    for (const [index, id] of claims.entries()) {
      const claimDirectory = claimsRoot(id);
      let meta: ClaimMeta;
      let bytes: Buffer;
      try {
        meta = JSON.parse(
          readFileSync(path.join(claimDirectory, "meta.json"), "utf8"),
        ) as ClaimMeta;
        bytes = readFileSync(path.join(claimDirectory, "bytes"));
      } catch {
        throw new RefusedRequest(400, "An attached image could not be read.");
      }
      const fileName = `${String(index + 1)}-${sanitizeName(meta.name, meta.type)}`;
      const destination = path.join(directory, fileName);
      writeFileSync(destination, bytes);
      rmSync(claimDirectory, { recursive: true, force: true });
      paths.push(destination);
      digests.push(contentDigest(bytes));
    }
  } catch (error) {
    rmSync(directory, { recursive: true, force: true });
    abandonAttachmentClaims(claims);
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
): AgentLaunchRequest {
  if (request.attachments !== undefined) {
    abandonAttachmentClaims(request.attachmentClaims);
    throw new RefusedRequest(400, "The launch request is malformed.");
  }
  const base = withoutConfirmation(request);
  try {
    const { paths, digests } = materializeLaunchAttachments(
      attemptId,
      request.attachmentClaims,
    );
    if (paths.length === 0) {
      const kept = { ...base };
      delete kept.attachmentDigests;
      return kept;
    }
    return { ...base, attachments: paths, attachmentDigests: digests };
  } catch (error) {
    removeLaunchAttachments(attemptId);
    throw error;
  }
}
