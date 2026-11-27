// A follow-up the project cannot stand behind is refused before a host starts.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { doneRecordFileName } from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import { claimLaunchAttachment } from "../../server/launchAttachmentClaims.ts";
import { followUpStart } from "./followUpAttemptIdentity.ts";
import {
  expectRefusal,
  keptRecord,
  keptThenExpired,
  listed,
  malformed,
  namesIn,
  noBinding,
  notKept,
  notListed,
  pageFollowUp,
  png,
  projectId,
  refuses,
  revision,
  unlisted,
  unlistedReads,
} from "./followUpRefusal.ts";

test("refuses context text a page composed before a host starts", async () => {
  const source = keptRecord("reported-source", listed);
  const refusal = await refuses(
    [source],
    pageFollowUp(source, { context: "Text from the page." }),
  );
  expectRefusal(refusal, 400, malformed);
});

test("refuses a session this project does not keep before a host starts", async () => {
  const source = keptRecord("reported-source", listed);
  const refusal = await refuses(
    [source],
    followUpStart(
      projectId,
      makeMe.aFollowUp
        .ofSession({ host: "claude", sessionId: "never-kept" })
        .please(),
    ),
  );
  expectRefusal(refusal, 404, notKept);
});

test("refuses context text a page composed on a repeat after the source record is gone", async () => {
  let refusal: unknown;
  await keptThenExpired(async (host, source) => {
    try {
      await host.accept(
        pageFollowUp(source, { context: "Text from the page." }),
      );
    } catch (error) {
      refusal = error;
    }
  });
  expectRefusal(refusal, 400, malformed);
});

test("a repeat after the source record is gone that claims a new image is refused and the claim is abandoned", async () => {
  let refusal: unknown;
  await keptThenExpired(async (host, source) => {
    const claim = claimLaunchAttachment(png, "image/png", "new-evidence.png");
    expect(namesIn("launch-attachment-claims")).toEqual([claim]);
    try {
      await host.accept(
        makeMe.aLaunchRequest
          .adHoc({
            source: projectId,
            instruction: "Continue",
            followUp: makeMe.aFollowUp.ofSession(source).please(),
            attachmentClaims: [claim],
          })
          .withPolicy({ workspace: "isolated", landing: "review" })
          .please(),
      );
    } catch (error) {
      refusal = error;
    }
    expect(namesIn("launch-attachment-claims")).toEqual([]);
    expect(namesIn("launch-attachments")).toEqual([]);
  });
  expectRefusal(refusal, 404, notKept);
});

test("refuses a session with no story binding before a host starts", async () => {
  const source = keptRecord("unbound-source");
  const sources = [source];
  const { input, asked } = unlistedReads(sources);
  const refusal = await refuses(
    sources,
    followUpStart(projectId, makeMe.aFollowUp.ofSession(source).please()),
    input,
  );
  expectRefusal(refusal, 404, noBinding);
  expect(asked).toEqual([]);
});

test("refuses a session whose story the published project does not list before a host starts", async () => {
  const source = keptRecord("unlisted-source", unlisted);
  const sources = [source];
  const { input, asked } = unlistedReads(sources);
  const refusal = await refuses(
    sources,
    followUpStart(projectId, makeMe.aFollowUp.ofSession(source).please()),
    input,
  );
  expectRefusal(refusal, 404, notListed);
  expect(asked).toEqual([
    {
      project: projectId,
      revision,
      files: [doneRecordFileName(unlisted)],
    },
  ]);
});

test("refuses a story binding the page supplied before a host starts", async () => {
  const source = keptRecord("reported-source", listed);
  const sources = [source];
  const { input, asked } = unlistedReads(sources);
  const refusal = await refuses(
    sources,
    pageFollowUp(source, { storyIdentity: listed }),
    input,
  );
  expectRefusal(refusal, 400, malformed);
  expect(asked).toEqual([]);
});
