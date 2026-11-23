import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { accept, launch } from "../../test-support/agentLaunchBoundary.ts";
import { stored } from "../../test-support/support/codexLaunch.ts";
import { keepLaunchRecords } from "../../test-support/support/launchStore.ts";
import { expect, test } from "../../test-support/support/preparationPage.ts";
import { landingHandoff } from "../../test-support/support/startSessionLandingContext.ts";
import { answerOf, request } from "./followUpBoundaryCases.ts";

test.use({ serverMode: "boundary" });

const reference = "22222222-2222-4222-8222-222222222222";
const identity = `ad-hoc#${reference}`;
const title = "Draft the release notes";

const originalDone = () => {
  const completedAt = new Date().toISOString();
  return makeMe.aLaunchRecord
    .adHoc({ title, instruction: title })
    .inClaudeSession({ sessionId: "original-draft", shortId: "original" })
    .reportingThrough({
      origin: "http://localhost",
      reference,
      command: "report",
    })
    .markedDoneAt(completedAt)
    .originatedDoneStory({ identity, title, completedAt })
    .please();
};

for (const from of ["local card", "retained session"] as const) {
  test(`a follow-up from the ${from} gets its own UUID and hands its parent's identity to Land`, async ({
    dashboard,
    origin: preparedOrigin,
  }) => {
    const original = originalDone();
    keepLaunchRecords(dashboard, [original]);
    dashboard.claudeScenario("launched");
    const byCard = from === "local card";
    const source = byCard
      ? makeMe.aFollowUp.ofLocalStory(identity)
      : makeMe.aFollowUp.ofSession(original);
    const launched = await answerOf(
      launch(dashboard, {
        ...request,
        instruction: "Extend the notes",
        policy: { workspace: "isolated", landing: "review" },
        followUp: source.please(),
      }),
    );
    expect(launched.kind, JSON.stringify(launched)).toBe("launched");
    if (launched.record === undefined)
      throw new Error("Missing launched session.");
    expect(launched.record.establishedSession?.workspace).toContain(
      preparedOrigin.project,
    );
    const { context, reporting } = landingHandoff(launched.record);
    expect(reporting.reference).toMatch(/^[a-f\d-]{36}$/);
    expect(reporting.reference).not.toBe(reference);
    expect(context).toMatchObject({ identity, reference: reporting.reference });
    const input = dashboard.claudeLaunchCalls()[0]?.argv.at(-1);
    expect(input).toContain(`Session “${title}”:`);
    expect(input).toContain(`- Original request: ${title}`);
    if (byCard) {
      expect(input).toContain(`Done story “${identity} — ${title}”:`);
      expect(input).toContain(
        "- Status: Done. This story is kept on this machine.",
      );
    } else {
      expect(input).not.toContain("Done story “");
      source.underStory(identity);
    }
    expect(launched.record.request).toMatchObject({
      followUp: source.please(),
    });
    expect(stored(dashboard.home)[0]).toEqual(original);
    expect(
      dashboard.github.calls.map(({ request }) => request),
    ).not.toContainEqual(
      expect.objectContaining({
        kind: "content",
        path: expect.stringContaining("/done/"),
      }),
    );
  });
}

test("the launch boundary refuses a forged session association and a missing local Done story", async ({
  dashboard,
}) => {
  const original = originalDone();
  keepLaunchRecords(dashboard, [original]);
  dashboard.claudeScenario("launched");

  const spoofed = await accept(dashboard, {
    ...request,
    followUp: makeMe.aFollowUp
      .ofSession(original)
      .underStory("SEED-999#wrong")
      .please(),
  });
  expect(spoofed.status, spoofed.body).toBe(400);
  const missing = await accept(dashboard, {
    ...request,
    followUp: makeMe.aFollowUp.ofLocalStory("SEED-999#missing").please(),
  });
  expect(missing.status, missing.body).toBe(404);
  expect(dashboard.claudeCalls()).toEqual([]);
});
