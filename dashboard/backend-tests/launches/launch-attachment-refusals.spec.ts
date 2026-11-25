// Dialog and claim helpers share the same refusal reasons for type, size and
// count (commitments 11a–11c).

import { expect, test } from "vitest";
import {
  launchAttachmentLimitBytes,
  launchAttachmentNameFromHeader,
  launchAttachmentNameHeader,
  launchAttachmentNameHeaderValue,
  launchAttachmentTooLarge,
  launchAttachmentTooMany,
  launchAttachmentUnsupportedType,
  partitionLaunchAttachments,
} from "../../src/launchAttachments.ts";

test("a non-Latin-1 attachment filename survives a header round trip", () => {
  const name = "截图.png";
  const headers = new Headers({
    [launchAttachmentNameHeader]: launchAttachmentNameHeaderValue(name),
  });
  expect(
    launchAttachmentNameFromHeader(
      headers.get(launchAttachmentNameHeader) ?? "",
    ),
  ).toBe(name);
});

test("selection fills the remaining image slot and names each refusal", () => {
  const pdf = new File(["%PDF"], "notes.pdf", {
    type: "application/pdf",
  });
  const huge = new File(
    [Buffer.alloc(launchAttachmentLimitBytes + 1)],
    "huge.png",
    { type: "image/png" },
  );
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64",
  );
  const card = new File([png], "card.png", { type: "image/png" });
  const sixth = new File([png], "sixth.png", { type: "image/png" });
  const alreadyAccepted = 4;

  const { accepted, refusals } = partitionLaunchAttachments(
    [pdf, huge, card, sixth],
    alreadyAccepted,
  );

  expect(accepted).toHaveLength(1);
  expect(accepted[0]).toBe(card);
  expect(refusals).toEqual([
    { name: "notes.pdf", reason: launchAttachmentUnsupportedType },
    { name: "huge.png", reason: launchAttachmentTooLarge },
    { name: "sixth.png", reason: launchAttachmentTooMany },
  ]);
});
