import { expect, test } from "../support/pageTest.ts";
import { developerPart } from "../../src/launchAttachments.ts";

test("developerPart is undefined when there is no text and no attachments", () => {
  expect(developerPart({})).toBeUndefined();
  expect(developerPart({ instruction: "   " })).toBeUndefined();
});

test("developerPart keeps exact typed bytes alone when there are no attachments", () => {
  expect(developerPart({ instruction: "  Why clipped?  " })).toBe(
    "  Why clipped?  ",
  );
});

test("developerPart appends a numbered Attached images list after exact text", () => {
  expect(
    developerPart({
      instruction: " Why is this card clipped?\t",
      attachments: ["/tmp/launch-attachments/a/1-card-b.png"],
    }),
  ).toBe(
    [
      " Why is this card clipped?\t",
      "",
      "Attached images:",
      "1. /tmp/launch-attachments/a/1-card-b.png",
    ].join("\n"),
  );
});

test("developerPart returns the list alone when text is blank", () => {
  expect(
    developerPart({
      attachments: ["/a/1.png", "/a/2.png"],
    }),
  ).toBe(["Attached images:", "1. /a/1.png", "2. /a/2.png"].join("\n"));
});
