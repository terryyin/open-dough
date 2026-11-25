import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { describedFiles } from "../describedRevisions.ts";
import type { DashboardServer } from "./dashboardServer.ts";
import { publishes } from "./fakeGitHub.ts";

type Story = { readonly identity: string; readonly title: string };

export function takenStoryFiles(stories: readonly Story[]) {
  return describedFiles({
    backlog: {
      taken: stories.map((story) =>
        makeMe.aBacklogEntry
          .with({
            identity: story.identity,
            title: story.title,
            href: `seeds/${story.identity.replace("#", ".md#")}`,
          })
          .please(),
      ),
    },
  });
}

export function publishRetainedProjectStory(
  server: DashboardServer,
  repository: string,
  story: Story,
  defaultBranch = "main",
): void {
  server.github.serve(
    repository,
    publishes({ defaultBranch, files: takenStoryFiles([story]) }),
  );
}
