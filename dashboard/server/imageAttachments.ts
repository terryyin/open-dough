// Rules shared by the launch and terminal image upload boundaries.
import type { IncomingMessage } from "node:http";
import path from "node:path";
import {
  isImageAttachmentType,
  launchAttachmentEmpty,
  launchAttachmentExtensionFor,
  launchAttachmentLimitBytes,
  launchAttachmentNameHeader,
  launchAttachmentTooLarge,
  launchAttachmentTypes,
  launchAttachmentUnsupportedType,
  type ImageAttachmentType,
} from "../src/launchAttachments.ts";
import { readBoundedRawBody } from "./boundedRawBody.ts";
import { RefusedRequest } from "./localOrigin.ts";

export function checkedImageAttachmentType(
  type: string,
  byteLength: number,
): ImageAttachmentType {
  if (!isImageAttachmentType(type)) {
    throw new RefusedRequest(415, launchAttachmentUnsupportedType);
  }
  if (byteLength > launchAttachmentLimitBytes) {
    throw new RefusedRequest(413, launchAttachmentTooLarge);
  }
  return type;
}

export function sanitizeImageAttachmentName(
  name: string,
  type: ImageAttachmentType,
): string {
  const extension = `.${launchAttachmentExtensionFor[type]}`;
  const base = path
    .basename(name)
    .replace(/[^\w.\-()+ ]+/g, "_")
    .trim();
  if (base === "" || base === "." || base === "..") return `image${extension}`;
  const hasExtension = /\.[A-Za-z0-9]+$/.test(base);
  return hasExtension ? base : `${base}${extension}`;
}

export async function readImageAttachment(
  req: IncomingMessage,
  signal: AbortSignal,
) {
  const { bytes, type } = await readBoundedRawBody(req, signal, {
    allowedTypes: launchAttachmentTypes,
    limitBytes: launchAttachmentLimitBytes,
    unsupportedType: launchAttachmentUnsupportedType,
    tooLarge: launchAttachmentTooLarge,
    empty: launchAttachmentEmpty,
  });
  const raw = req.headers[launchAttachmentNameHeader];
  const value = Array.isArray(raw) ? raw[0] : raw;
  return { bytes, type, name: value?.trim() || "image.png" };
}
