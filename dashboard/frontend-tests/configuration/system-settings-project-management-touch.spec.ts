// Machine persistence and the failed write's predecessor file are covered by
// ../../../e2e/configuration/project-add.spec.ts.
import { describe, expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { PublishedSource } from "../../src/publishedSource.ts";
import {
  enableSettingsTouch,
  settingsPhoneViewports,
} from "./system-settings-browser.ts";
import {
  mountProjectsSettings,
  projectReplies,
} from "./system-settings-projects-page.ts";

const { portrait, landscape, reduced } = settingsPhoneViewports;

describe("phone project settings editing", () => {
  test("touch edits at reduced height and retries a refused save with the exact draft", async () => {
    const original = makeMe.aPublishedSource.pygardon.please();
    const project = makeMe.aPublishedSource
      .with({
        id: "sample-app",
        label: "Sample App",
        repository: "example/sample-app",
      })
      .please();
    const draft = {
      githubUrl: "https://github.com/example/sample-app",
      localPath: "~/work/private-checkout",
    };
    const refusal = new Error(
      "EACCES: permission denied, open '~/.open-dough/dashboard/projects-production.json.tmp'",
    );
    const replies = projectReplies();
    replies.read.mockResolvedValue([
      makeMe.aProjectSettings
        .with({
          id: original.id,
          localPath: "~/git/pygardon",
          clientConfiguration: { status: "absent" },
        })
        .please(),
      makeMe.aProjectSettings
        .with({
          id: project.id,
          localPath: draft.localPath,
          clientConfiguration: { status: "absent" },
        })
        .please(),
    ]);
    replies.add.mockRejectedValueOnce(refusal).mockResolvedValueOnce({
      project,
      projects: [original, project],
    });
    replies.remove.mockResolvedValueOnce([original]);
    const select = vi.fn<(source: PublishedSource | undefined) => void>();
    await enableSettingsTouch();
    const settings = await mountProjectsSettings(
      replies,
      original,
      [original],
      select,
      portrait,
    );

    await settings.touchOpenAdd();
    await settings.showsFocusedUrl();
    await settings.useViewport(reduced);
    await settings.touchUrl();
    await settings.typeUrl(draft.githubUrl);
    await settings.touchPath();
    await settings.fillPath(draft.localPath);
    await settings.useViewport(landscape);
    await settings.showsDraft(draft.githubUrl, draft.localPath);
    await settings.useViewport(reduced);
    await settings.fitsAddWithoutSidewaysScrolling();
    await settings.touchPath();
    await settings.showsFocusedPath();
    expect(replies.add).not.toHaveBeenCalled();

    await settings.touchSubmitAdd();
    await settings.showsRefusal(refusal.message);
    await settings.readRefusal();
    await settings.showsDraft(draft.githubUrl, draft.localPath);
    expect(select).not.toHaveBeenCalled();
    await settings.useViewport(landscape);
    await settings.showsDraft(draft.githubUrl, draft.localPath);
    await settings.useViewport(reduced);
    await settings.touchSubmitAdd();
    await expect.poll(() => replies.add.mock.calls).toEqual([[draft], [draft]]);
    await settings.showsClosedAdd();
    await settings.readProject(project.label, draft.localPath);
    await settings.touchRemoveProject(project.label);
    await settings.showsNoProject(project.label);
    await settings.showsProject(original.label);
    expect(replies.remove.mock.calls).toEqual([[project.id]]);
    expect(replies.setHidden).not.toHaveBeenCalled();
    expect(select.mock.calls).toEqual([[project], [original]]);
  });
});
