import { writeFileSync } from "node:fs";
import path from "node:path";
import { expect, onTestFinished, test } from "vitest";
import { sessionRecordPathBeside } from "../../../Distribution/src/skills/dough-execute-plan/scripts/session-record.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { withFollowUpContext } from "../../server/followUpAdmission.ts";
import {
  changeSessionRecord,
  keptSession,
  setRecordDoneAt,
} from "../../server/launchRecordStore.ts";
import {
  mountProjectConfiguration,
  projectConfigurationFile,
} from "../../server/projectConfiguration.ts";
import {
  aHeldDone,
  keep,
  minutesAgo,
  source,
} from "../support/doneCaptureCase.ts";
import { aDoneCaptureCase } from "../support/doneCaptureCaseBuilder.ts";
import { dashboardReporting } from "../support/publisherDashboardOrigin.ts";

const published = makeMe.aPublishedSource.openDough.please();

function configureCheckout(home: string, integration: string) {
  writeFileSync(
    projectConfigurationFile("production"),
    JSON.stringify([
      makeMe.aConfiguredProject
        .with({
          ...published,
          localPath: `~/${path.relative(home, integration)}`,
        })
        .please(),
    ]),
  );
  onTestFinished(mountProjectConfiguration("production"));
}

test.each([
  {
    originStory: "SEED-42#published-story",
    kept: { kind: "linked", identity: "SEED-42#published-story" },
  },
  { originStory: undefined, kept: undefined },
])(
  "Done respects the close already published under $originStory",
  async ({ originStory, kept }) => {
    const close = makeMe.aSessionRecord.forSession(
      dashboardReporting.reference,
    );
    if (originStory !== undefined) close.underStory(originStory);
    const file = sessionRecordPathBeside(
      published.backlogPath,
      dashboardReporting.reference,
    );
    const { checkout } = await aDoneCaptureCase()
      .withOrigin()
      .withBaseFiles({ [file]: JSON.stringify(close.please()) })
      .please();
    const record = makeMe.aLaunchRecord
      .adHoc({ title: "Existing published close" })
      .launchedAt(minutesAgo(60))
      .reportingThrough(dashboardReporting)
      .please();
    const home = keep(record);
    configureCheckout(home, checkout.integration);
    const marked = await setRecordDoneAt(
      source,
      record.session,
      minutesAgo(10),
    );

    expect(marked?.doneStory).toEqual(kept);
    expect(marked?.doneAt).toBeDefined();
  },
);

test("a follow-up from a retained Done session inherits its published association", async () => {
  const reference = dashboardReporting.reference;
  const identity = `ad-hoc#${reference}`;
  const file = sessionRecordPathBeside(published.backlogPath, reference);
  const close = makeMe.aSessionRecord
    .forSession(reference)
    .underStory(identity)
    .please();
  const { checkout } = await aDoneCaptureCase()
    .withOrigin()
    .withBaseFiles({ [file]: JSON.stringify(close) })
    .please();
  const title = "Work sent for review";
  const retained = makeMe.aLaunchRecord
    .adHoc({ title })
    .withDeclaredLanding({ reference })
    .markedDoneAt(minutesAgo(10))
    .please();
  configureCheckout(keep(retained), checkout.integration);
  const followUp = makeMe.aFollowUp.ofSession(retained).please();
  const request = makeMe.aLaunchRequest.adHoc({ followUp }).please();

  const resolved = await withFollowUpContext(request, published);
  expect(resolved).toMatchObject({
    followUp: {
      ...followUp,
      storyIdentity: identity,
    },
  });
  if (resolved.workflow !== "ad-hoc") throw new Error("Expected a follow-up.");
  expect(resolved.followUp?.context).toContain(title);
});

test("a storyless receipt arriving while Done is prepared is observed on retry", async () => {
  const {
    checkout,
    records: { draft },
  } = await aDoneCaptureCase()
    .withOrigin()
    .withWorkspace("draft")
    .withIsolatedLaunch("draft", { launched: 60 }, "draft", (launch) =>
      launch.reportingThrough(dashboardReporting),
    )
    .kept()
    .please();
  const held = aHeldDone(draft);
  const landing = makeMe.aLaunchLanding
    .capturedFrom({
      repository: checkout.gitDirectory,
      remote: "origin",
      target: "refs/heads/main",
    })
    .forLaunch(dashboardReporting.reference)
    .comparing({ base: checkout.base, revision: checkout.base })
    .please();
  try {
    await held.reading;
    await changeSessionRecord(source, draft.session, (record) => ({
      ...record,
      landing,
    }));
  } finally {
    held.release();
  }
  await expect(held.marking).rejects.toMatchObject({ status: 409 });
  expect((await keptSession(source, draft.session))?.doneAt).toBeUndefined();

  const resumed = await setRecordDoneAt(source, draft.session, minutesAgo(5));
  expect(resumed?.landing).toEqual(landing);
  expect(resumed?.doneStory?.identity).toBe(
    `ad-hoc#${dashboardReporting.reference}`,
  );
});
