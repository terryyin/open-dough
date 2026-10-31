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

export const launchAttachmentTooLarge =
  "Larger than 10 MB. Choose a smaller image or omit it.";
export const launchAttachmentUnsupportedType =
  "Not an image (PNG, JPEG, GIF or WebP).";
export const launchAttachmentTooMany = "At most 5 images";
export const launchAttachmentEmpty = "The image is empty.";

export type LaunchAttachmentRefusal = {
  readonly name: string;
  readonly reason: string;
};

// Why one file cannot join the draft, or undefined when it can. Type and size
// before count so a PDF or oversized file keeps its own reason even past the
// fifth slot; a sixth accepted-type image is "At most 5 images".
export function launchAttachmentRefusalFor(
  file: { readonly name: string; readonly type: string; readonly size: number },
  acceptedCount: number,
): string | undefined {
  if (!(launchAttachmentTypes as readonly string[]).includes(file.type)) {
    return launchAttachmentUnsupportedType;
  }
  if (file.size > launchAttachmentLimitBytes) {
    return launchAttachmentTooLarge;
  }
  if (acceptedCount >= launchAttachmentMaxCount) {
    return launchAttachmentTooMany;
  }
  return undefined;
}

// Splits a picker or paste batch into files the draft can take and named
// refusals for the rest. `alreadyAccepted` is how many images the dialog
// already holds.
export function partitionLaunchAttachments(
  files: readonly File[],
  alreadyAccepted: number,
): {
  readonly accepted: File[];
  readonly refusals: LaunchAttachmentRefusal[];
} {
  const accepted: File[] = [];
  const refusals: LaunchAttachmentRefusal[] = [];
  let count = alreadyAccepted;
  for (const file of files) {
    const reason = launchAttachmentRefusalFor(file, count);
    if (reason !== undefined) {
      refusals.push({
        name: file.name.trim() !== "" ? file.name : "image",
        reason,
      });
      continue;
    }
    accepted.push(file);
    count += 1;
  }
  return { accepted, refusals };
}

// Filename stems for each accepted type (no leading dot). Paste naming and
// claim sanitization both use this map.
export const launchAttachmentExtensionFor: Record<
  (typeof launchAttachmentTypes)[number],
  string
> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
};

// Clipboard screenshots often arrive as a File with an empty name. Keep a
// supplied name; otherwise use pasted.<type> (pasted.png for PNG).
function namedPasteAttachment(file: File): File {
  if (file.name.trim() !== "") return file;
  const ext =
    launchAttachmentExtensionFor[
      file.type as (typeof launchAttachmentTypes)[number]
    ];
  return new File([file], `pasted.${ext}`, { type: file.type });
}

// Image files from a paste. Empty when the clipboard holds only text (or no
// accepted image), so the field's ordinary text paste stays unchanged.
export function imageFilesFromPaste(
  clipboardData: DataTransfer | null | undefined,
): File[] {
  if (clipboardData === null || clipboardData === undefined) return [];
  const files: File[] = [];
  for (const item of clipboardData.items) {
    if (item.kind !== "file") continue;
    if (!(launchAttachmentTypes as readonly string[]).includes(item.type)) {
      continue;
    }
    const file = item.getAsFile();
    if (file !== null) files.push(namedPasteAttachment(file));
  }
  return files;
}

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
