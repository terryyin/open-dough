// The real handler's refused write and absence of a GitHub read are covered by
// ../../backend-tests/configuration/project-add-validation.spec.ts.
import { expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { ProjectInputProblem } from "../../src/projectInput.ts";
import type { PublishedSource } from "../../src/publishedSource.ts";
import {
  mountProjectsSettings,
  projectReplies,
} from "./system-settings-projects-page.ts";

const githubUrl = "https://github.com/example/sample-app";
const localPath = "~/work/private-checkout";
const openDough = () =>
  makeMe.aPublishedSource
    .with({
      id: "open-dough",
      label: "Open Dough",
      repository: "terryyin/open-dough",
    })
    .please();

test("origin mismatch stays linked to the path, retains both inputs and saves nothing", async () => {
  const original = openDough();
  const refusal = new ProjectInputProblem(
    "localPath",
    `The origin of ${localPath} is another/different, but the GitHub URL names example/sample-app.`,
  );
  const replies = projectReplies();
  replies.add.mockRejectedValueOnce(refusal);
  const select = vi.fn<(source: PublishedSource | undefined) => void>();
  const settings = await mountProjectsSettings(
    replies,
    original,
    [original],
    select,
  );

  await settings.openAdd();
  await settings.fillDraft(githubUrl, localPath);
  await settings.submitAdd();
  await settings.showsPathRefusal(refusal.message);
  await settings.showsOpenAdd();
  await settings.showsDraft(githubUrl, localPath);
  await settings.showsEnabledAdd();
  await settings.cancel();
  await settings.showsClosedAdd();
  await settings.showsProject(original.label);
  await settings.showsNoProject("Sample App");
  expect(select).not.toHaveBeenCalled();
  expect(replies.add.mock.calls).toEqual([[{ githubUrl, localPath }]]);
  expect(replies.remove).not.toHaveBeenCalled();
  expect(replies.setHidden).not.toHaveBeenCalled();
});

test("Cancel and Escape save nothing, return focus and keep project arrows inside the modal", async () => {
  const original = openDough();
  const alternate = makeMe.aPublishedSource.pygardon.please();
  const replies = projectReplies();
  const select = vi.fn<(source: PublishedSource | undefined) => void>();
  const settings = await mountProjectsSettings(
    replies,
    original,
    [original, alternate],
    select,
  );

  await settings.showsEnabledOpener();
  for (const dismiss of [settings.escape, settings.cancel]) {
    await settings.openAdd();
    await settings.fillDraft(githubUrl, localPath);
    await settings.focusCancel();
    await settings.projectArrow("Right");
    await settings.projectArrow("Left");
    expect(select).not.toHaveBeenCalled();
    await dismiss();
    await settings.showsClosedAdd();
    await settings.showsFocusedOpener();
    expect(replies.add).not.toHaveBeenCalled();
  }

  expect(replies.remove).not.toHaveBeenCalled();
  expect(replies.setHidden).not.toHaveBeenCalled();
  await settings.projectArrow("Right");
  expect(select.mock.calls).toEqual([[alternate]]);
});
