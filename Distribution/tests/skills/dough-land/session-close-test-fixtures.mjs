// Shared setup for session close publication and resume proofs: one
// unpublished edit in a Land workspace, closed through publishSessionClose.
import { writeFile } from "node:fs/promises";
import { makeMe } from "../../support/makeMe.mjs";
import { materializeRepository } from "../../support/repository-fixture.mjs";
import { publishSessionClose } from "../../../src/skills/dough-execute-plan/scripts/session-record-publication.mjs";
import { sharedCheckoutNotePathBeside } from "../../../src/skills/dough-execute-plan/scripts/shared-checkout-note.mjs";
import { git } from "../dough-execute-plan/publication-test-fixtures.mjs";
import {
  landingContextFile,
  landingReceiver,
} from "../dough-execute-plan/dashboard-landing-test-fixtures.mjs";

export const nativeSession = "0b5c2f1e-6a3d-4c8e-9f21-7d4e5a6b8c90";

export const targetRef = "refs/heads/main";
export const closedAt = new Date("2026-11-20T10:00:00.000Z");

export const oneUnpublishedEdit = makeMe.aRepository
  .withRevision("trunk")
  .withWorkspace("land/ad-hoc", { from: "trunk" })
  .withUnpublishedRevision("edit", { files: { "edited.txt": "edit\n" } })
  .please();

// A trunk commit the workspace received only by pull before its edit.
export const pulledBeforeOneUnpublishedEdit = makeMe.aRepository
  .withRevision("trunk")
  .withRevision("pulled", { files: { "pulled.txt": "pulled\n" } })
  .withWorkspace("land/ad-hoc", { from: "pulled" })
  .withUnpublishedRevision("edit", { files: { "edited.txt": "edit\n" } })
  .please();

// A Dashboard launch's landing context, with the Dashboard's shared-checkout
// note beside it when `sharedSince` is given.
export async function aLaunchLandingContext(t, sharedSince) {
  const receiver = await landingReceiver(t);
  const file = await landingContextFile(
    t,
    makeMe.aLandingContext.reportingTo(receiver.origin).please(),
  );
  if (sharedSince !== undefined)
    await writeFile(
      sharedCheckoutNotePathBeside(file),
      JSON.stringify({ since: sharedSince.toISOString() }),
    );
  return file;
}

// The text of the session record trunk holds for `sessionId`.
export const publishedRecord = async ({ origin }, sessionId = nativeSession) =>
  (await git(origin, "show", `main:.planning/sessions/${sessionId}.json`))
    .stdout;

export async function landed(
  t,
  session,
  publication = {},
  before = async () => {},
  repository = oneUnpublishedEdit,
) {
  const fixture = await materializeRepository(repository);
  t.after(fixture.cleanup);
  await before(fixture);
  const closed = await publishSessionClose({
    now: () => closedAt,
    workspace: fixture.execution,
    session: { workflow: "ad-hoc", ...session },
    ...makeMe.anIncrementPublication
      .with({
        branch: "land/ad-hoc",
        previouslyPublishedBase: fixture.trunkSha,
        targetRef,
      })
      .please(),
    ...publication,
  });
  return { fixture, closed };
}
