// The title an admitted ad hoc Start gives its Taken story, which its launch
// record keeps (../../server/launchRun.ts): the developer's text with
// whitespace runs collapsed, cut at 40 characters, or the launch time when
// the text is blank or holds a control character. The recorded request keeps
// the text as typed. Admission refuses an ad hoc request naming an identity.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { admittedLaunchRequest } from "../../server/agentLaunchAdmission.ts";
import {
  admittedStoryTitle,
  recordedRequest,
} from "../../server/hostLaunch.ts";
import { RefusedRequest } from "../../server/localOrigin.ts";

const began = new Date(2026, 8, 30, 14, 32);
const titled = (instruction?: string) => {
  const request = admittedLaunchRequest(
    makeMe.aLaunchRequest
      .adHoc(instruction === undefined ? {} : { instruction })
      .please(),
  );
  return {
    ...recordedRequest(request, began),
    title: admittedStoryTitle(request, began),
  };
};

test("keeps the text as typed and titles the Start with it", () => {
  const text = "why is the CI slow on main?";

  expect(titled(text)).toMatchObject({ title: text, instruction: text });
});

for (const [blank, instruction] of [
  ["no text", undefined],
  ["only spaces", "   "],
  ["a control character", "beep\u0007 please"],
] as const) {
  test(`titles a Start with ${blank} for its launch time`, () => {
    expect(titled(instruction).title).toBe("Ad hoc work — 30 Sep, 14:32");
  });
}

test("cuts a long multi-line text to 40 characters and keeps it as typed", () => {
  const text =
    "Investigate the\n\tslow\t\tbuild step and why\r\nit regressed lately";

  expect(titled(text)).toMatchObject({
    title: "Investigate the slow build step and why …",
    instruction: text,
  });
});

test("refuses an ad hoc request naming an identity", () => {
  const request = {
    ...makeMe.aLaunchRequest.adHoc().please(),
    identity: "SEED-1#some-story",
  };

  expect(() => admittedLaunchRequest(request)).toThrow(RefusedRequest);
});
