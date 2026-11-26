import { expect } from "vitest";
import { page } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { MachineAnswer } from "../../src/agentLaunch.ts";
import { IntentPerspective } from "../../src/IntentPerspective.tsx";
import { IntentReadRecovery } from "../../src/intentReadRecovery.tsx";
import { LaunchesOnPage } from "../../src/pageLaunches.ts";
import { PageReadsOnPage, type PageReads } from "../../src/pageReads.tsx";
import { SessionsOnPage } from "../../src/pageSessions.ts";
import { ProjectsOnPage } from "../../src/projectList.tsx";
import type { PublishedWork } from "../../src/publishedWork.ts";
import { RecentlyDoneLinkSources } from "../../src/recentlyDoneShownLinks.ts";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import { machineSessionsAnswering } from "../../test-support/component-mount/machineSessionsAnswering.ts";
import { withStoryResultFixture } from "../../test-support/component-mount/storyResultFixture.ts";
import { pageReadsSupplying } from "../../test-support/component-mount/unreadPageReads.ts";
import { inertPageSessions } from "../sessions/inert-page-sessions.ts";

// Begin at the selected story with Files docked unless `viewport` says
// otherwise. Story selection and the dashboard frame have their own proofs; the
// case supplies the selection and Intent's read replies.
export async function mountStoryIntent({
  work,
  identity,
  machine = makeMe.aMachineAnswer.please(),
  reads,
  viewport = { width: 1280, height: 800 },
}: {
  readonly work: PublishedWork;
  readonly identity: string;
  readonly machine?: MachineAnswer;
  readonly reads: Partial<PageReads>;
  readonly viewport?:
    { readonly width: number; readonly height: number } | undefined;
}) {
  const { source } = work;
  const pageReads = pageReadsSupplying(
    withStoryResultFixture(reads, () => work),
  );
  const launches = machineSessionsAnswering({ answer: machine });
  const projects = [source];
  const project = {
    mode: "ci",
    modeIdPrefix: "project-intent",
    onModeChange() {},
  } as const;
  const view = (selected: string | undefined) => (
    <PageReadsOnPage reads={pageReads}>
      <ProjectsOnPage projects={projects} replaceProjects={() => undefined}>
        <RecentlyDoneLinkSources
          value={{ projects, selected: source.id, work }}
        >
          <LaunchesOnPage value={launches}>
            <SessionsOnPage value={inertPageSessions}>
              <IntentReadRecovery visibility="visible" limitStands={false}>
                <IntentPerspective
                  source={source}
                  work={work}
                  records={launches.records}
                  workspaces={launches.workspaces}
                  selection={
                    selected === undefined
                      ? undefined
                      : { project: source.id, identity: selected }
                  }
                  project={project}
                />
              </IntentReadRecovery>
            </SessionsOnPage>
          </LaunchesOnPage>
        </RecentlyDoneLinkSources>
      </ProjectsOnPage>
    </PageReadsOnPage>
  );
  const mounted = await mountComponent(view(identity), {
    viewport,
    fillsViewport: true,
  });
  return {
    async selectStory(next: string | undefined) {
      mounted.rerender(view(next));
      const intent = page.getByRole("main", { name: "Intent", exact: true });
      await expect
        .poll(
          () => intent.query()?.getAttribute("data-selected-story") ?? null,
          {
            interval: 5,
          },
        )
        .toBe(next ?? null);
    },
  };
}
