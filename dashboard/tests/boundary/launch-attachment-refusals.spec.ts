// Dialog and claim helpers share the same refusal reasons for type, size and
// count (commitments 11a–11c).

import { expect, test } from "../support/pageTest.ts";
import {
  launchAttachmentLimitBytes,
  launchAttachmentRefusalFor,
  launchAttachmentTooLarge,
  launchAttachmentTooMany,
  launchAttachmentUnsupportedType,
  partitionLaunchAttachments,
} from "../../src/launchAttachments.ts";
import { pngA } from "../support/launchAttachmentFixtures.ts";

test("launchAttachmentRefusalFor names type, size and count with the shared messages", () => {
  expect(
    launchAttachmentRefusalFor(
      { name: "notes.pdf", type: "application/pdf", size: 12 },
      0,
    ),
  ).toBe(launchAttachmentUnsupportedType);
  expect(
    launchAttachmentRefusalFor(
      {
        name: "huge.png",
        type: "image/png",
        size: launchAttachmentLimitBytes + 1,
      },
      0,
    ),
  ).toBe(launchAttachmentTooLarge);
  expect(
    launchAttachmentRefusalFor(
      { name: "sixth.png", type: "image/png", size: pngA.length },
      5,
    ),
  ).toBe(launchAttachmentTooMany);
  expect(
    launchAttachmentRefusalFor(
      { name: "ok.png", type: "image/png", size: pngA.length },
      0,
    ),
  ).toBeUndefined();
});

test("partitionLaunchAttachments keeps accepted files and names each refusal", () => {
  const pdf = new File([Buffer.from("%PDF")], "notes.pdf", {
    type: "application/pdf",
  });
  const huge = new File(
    [Buffer.alloc(launchAttachmentLimitBytes + 1)],
    "huge.png",
    { type: "image/png" },
  );
  const ok = new File([pngA], "card.png", { type: "image/png" });
  const { accepted, refusals } = partitionLaunchAttachments([pdf, huge, ok], 0);
  expect(accepted).toEqual([ok]);
  expect(refusals).toEqual([
    { name: "notes.pdf", reason: launchAttachmentUnsupportedType },
    { name: "huge.png", reason: launchAttachmentTooLarge },
  ]);
});
