// Launch-dialog image attachments: limits, the claim upload endpoint, and the
// shared developer part every host's first input reads (typed text, then the
// numbered absolute-path list). Bytes travel only as a bounded raw body at
// Start; JSON requests and stores hold claim ids or paths, never image bytes.

export const launchAttachmentEndpoint = "/__agent-launch/attachments";
export const launchAttachmentNameHeader = "x-launch-attachment-name";
export const launchAttachmentLimitBytes = 10 * 1024 * 1024;
export const launchAttachmentMaxCount = 5;
export const launchAttachmentTypes = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
] as const;

export const launchAttachmentAccept = launchAttachmentTypes.join(",");

export const launchAttachmentTooLarge =
  "Larger than 10 MB. Choose a smaller image or omit it.";
export const launchAttachmentUnsupportedType =
  "Not an image (PNG, JPEG, GIF or WebP).";
export const launchAttachmentTooMany = "At most 5 images";
export const launchAttachmentEmpty = "The image is empty.";

// The developer's part of the first input: typed text with its exact bytes
// when the field is not blank after trim, then a blank line and the
// attached-images path list when the request names any. The list is not
// part of the 4,000-character instruction field. Trim decides emptiness;
// a present text keeps every typed byte.
export function developerPart(request: {
  readonly instruction?: string | undefined;
  readonly attachments?: readonly string[] | undefined;
}): string | undefined {
  const text = request.instruction;
  const own = text?.trim() ? text : undefined;
  const paths = request.attachments ?? [];
  const list =
    paths.length === 0
      ? undefined
      : [
          "Attached images:",
          ...paths.map((path, index) => `${String(index + 1)}. ${path}`),
        ].join("\n");
  if (own === undefined && list === undefined) return undefined;
  if (own === undefined) return list;
  if (list === undefined) return own;
  return `${own}\n\n${list}`;
}
