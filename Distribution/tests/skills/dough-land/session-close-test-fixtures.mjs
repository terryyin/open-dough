// Shared setup for session close publication and resume proofs: one
// unpublished edit in a Land workspace, closed through publishSessionClose.
import { makeMe } from "../../support/makeMe.mjs";
import { materializeRepository } from "../../support/repository-fixture.mjs";
import { publishSessionClose } from "../../../src/skills/dough-execute-plan/scripts/session-record-publication.mjs";

export const nativeSession = "0b5c2f1e-6a3d-4c8e-9f21-7d4e5a6b8c90";

export const targetRef = "refs/heads/main";
export const closedAt = new Date("2026-11-20T10:00:00.000Z");

export const oneUnpublishedEdit = makeMe.aRepository
  .withRevision("trunk")
  .withWorkspace("land/ad-hoc", { from: "trunk" })
  .withUnpublishedRevision("edit", { files: { "edited.txt": "edit\n" } })
  .please();

export async function landed(
  t,
  session,
  publication = {},
  before = async () => {},
) {
  const fixture = await materializeRepository(oneUnpublishedEdit);
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
