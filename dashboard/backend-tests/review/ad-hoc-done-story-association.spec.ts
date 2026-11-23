import { writeFileSync } from "node:fs";
import { IncomingMessage, ServerResponse } from "node:http";
import { Socket } from "node:net";
import path from "node:path";
import { expect, onTestFinished, test } from "vitest";
import { git } from "../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { sessionRecordPathBeside } from "../../../Distribution/src/skills/dough-execute-plan/scripts/session-record.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { completedStoryAssociationResponse } from "../../server/completedStoryAssociationAdmission.ts";
import { withFollowUpContext } from "../../server/followUpAdmission.ts";
import {
  bindRecord,
  keptSession,
  replaceKeptSession,
  updateRecord,
} from "../../server/launchRecordStore.ts";
import {
  mountProjectConfiguration,
  projectConfigurationFile,
} from "../../server/projectConfiguration.ts";
import { submitStoryAssociationChoice } from "../../server/storyAssociationChoice.ts";
import { storyAssociationChoiceEndpoint } from "../../src/storyAssociationChoice.ts";
import { keep, minutesAgo, source } from "../support/doneCaptureCase.ts";
import { aDoneCaptureCase } from "../support/doneCaptureCaseBuilder.ts";
import { dashboardReporting } from "../support/publisherDashboardOrigin.ts";

const project = makeMe.aPublishedSource.openDough.please();
const close = dashboardReporting.reference;
const retained = `ad-hoc#${close}`;
const published = "SEED-42#already-published";
const choice = { close, retained, published, selected: "published" } as const;
const title = "Reconcile this session";

async function withClose(conflicting: boolean) {
  const file = sessionRecordPathBeside(project.backlogPath, close);
  const facts = makeMe.aSessionRecord
    .forSession(close)
    .underStory(published)
    .please();
  const { checkout } = await aDoneCaptureCase()
    .withOrigin()
    .withBaseFiles({ [file]: JSON.stringify(facts) })
    .please();
  const launch = makeMe.aLaunchRecord
    .adHoc({ title })
    .inClaudeSession({ sessionId: "original" })
    .withDeclaredLanding({ reference: close });
  const at = minutesAgo(10);
  const stale = launch.please();
  const done = conflicting
    ? launch
        .originatedDoneStory({ identity: retained, title, completedAt: at })
        .markedDoneAt(at)
        .please()
    : launch.markedDoneAt(at).please();
  const home = keep(done);
  writeFileSync(
    projectConfigurationFile("production"),
    JSON.stringify([
      makeMe.aConfiguredProject
        .with({
          ...project,
          localPath: `~/${path.relative(home, checkout.integration)}`,
        })
        .please(),
      makeMe.aConfiguredProject
        .with({
          ...makeMe.aPublishedSource.pygardon.please(),
          localPath: "~/pygardon",
        })
        .please(),
    ]),
  );
  onTestFinished(mountProjectConfiguration("production"));
  return { stale, done, repository: checkout.integration };
}

function postChoice(body: unknown) {
  const socket = new Socket();
  Object.defineProperty(socket, "remoteAddress", { value: "127.0.0.1" });
  const request = new IncomingMessage(socket);
  request.url = storyAssociationChoiceEndpoint;
  request.method = "POST";
  request.headers = {
    host: "127.0.0.1",
    "content-type": "application/json",
    "sec-fetch-site": "same-origin",
  };
  request.push(Buffer.from(JSON.stringify(body)));
  request.push(null);
  return submitStoryAssociationChoice(request);
}

const submitted = { source, host: "claude", session: "original", choice };

function readAssociation(sessionId: string) {
  return completedStoryAssociationResponse(
    {
      kind: "completed-story-association",
      sourceId: source,
      host: "claude",
      sessionId,
    },
    new ServerResponse(new IncomingMessage(new Socket())),
  );
}

test("the on-demand read finds a retained launch's published story without claim history", async () => {
  const { done } = await withClose(false);
  expect(await readAssociation(done.session.sessionId)).toMatchObject({
    body: { kind: "recorded", identity: published },
  });
});

test("a stale candidate or another project's session cannot save a story choice", async () => {
  const { done } = await withClose(true);
  await expect(
    postChoice({ ...submitted, source: "pygardon" }),
  ).rejects.toMatchObject({
    status: 404,
    message: "This dashboard launched no such session for this project.",
  });
  await expect(
    postChoice({
      ...submitted,
      choice: { ...choice, published: "SEED-44#no-longer-recorded" },
    }),
  ).rejects.toMatchObject({ status: 409 });
  expect(
    (await keptSession(source, done.session))?.storyAssociationChoice,
  ).toBeUndefined();
});

test("choosing a published association keeps both pieces of Done evidence through later native writes", async () => {
  const { stale, done, repository } = await withClose(true);
  expect(await readAssociation(done.session.sessionId)).toMatchObject({
    body: { kind: "conflict" },
  });
  const publishedTip = () =>
    git(repository, "ls-remote", "origin", "refs/heads/main");
  const branch = await publishedTip();
  await git(repository, "update-ref", "-d", "refs/remotes/origin/main");
  expect(await postChoice(submitted)).toEqual({ saved: true });
  expect(await postChoice(submitted)).toEqual({ saved: true });
  await expect(
    postChoice({ ...submitted, choice: { ...choice, selected: "retained" } }),
  ).rejects.toMatchObject({ status: 409 });
  expect((await publishedTip()).stdout).toBe(branch.stdout);
  expect((await git(repository, "status", "--porcelain")).stdout).toBe("");
  expect(await readAssociation(done.session.sessionId)).toMatchObject({
    body: { kind: "recorded", identity: published },
  });
  const followUp = makeMe.aFollowUp.ofSession(done).please();
  const launch = makeMe.aLaunchRequest.adHoc({ followUp }).please();
  expect(await withFollowUpContext(launch, project)).toMatchObject({
    followUp: { storyIdentity: published },
  });

  const expected = {
    doneAt: done.doneAt,
    doneStory: {
      kind: "originating",
      identity: retained,
      title,
      completedAt: done.doneAt,
    },
    storyAssociationChoice: choice,
  };
  const rebinding = {
    ...stale,
    session: { ...stale.session, sessionId: "replacement" },
  };
  await updateRecord(source, stale);
  expect(await keptSession(source, stale.session)).toMatchObject(expected);
  await replaceKeptSession(source, stale.session, rebinding);
  expect(await keptSession(source, rebinding.session)).toMatchObject(expected);
  await bindRecord(source, rebinding);
  expect(await keptSession(source, rebinding.session)).toMatchObject(expected);
});
