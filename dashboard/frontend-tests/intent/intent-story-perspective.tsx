import { expect } from "vitest";
import { page } from "vitest/browser";
import type { ReactNode } from "react";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { MachineAnswer } from "../../src/agentLaunch.ts";
import { IntentPerspective } from "../../src/IntentPerspective.tsx";
import { IntentReadRecovery } from "../../src/intentReadRecovery.tsx";
import type { LaunchAttemptSource } from "../../src/launchAttempts.ts";
import { LaunchesOnPage } from "../../src/pageLaunches.ts";
import { PageReadsOnPage, type PageReads } from "../../src/pageReads.tsx";
import { SessionsOnPage } from "../../src/pageSessions.ts";
import { ProjectsOnPage } from "../../src/projectList.tsx";
import type { PublishedWork } from "../../src/publishedWork.ts";
import { RecentlyDoneLinkSources } from "../../src/recentlyDoneShownLinks.ts";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import { machineSessionsAnswering } from "../../test-support/component-mount/machineSessionsAnswering.ts";
import { pageReadsSupplying } from "../../test-support/component-mount/unreadPageReads.ts";
import { unanswered } from "../../test-support/support/waitUntil.ts";
import { useMountedLaunchAttempts } from "../launches/mounted-launch-attempts.ts";
import { inertPageSessions } from "../sessions/inert-page-sessions.ts";

const unansweredLaunches: LaunchAttemptSource = {
  accept: unanswered,
  waitForChange: unanswered,
};

function StoryIntentLaunches({
  machine,
  source,
  children,
}: {
  readonly machine: MachineAnswer;
  readonly source: LaunchAttemptSource;
  readonly children: ReactNode;
}) {
  const { adHocAttemptOf, startAdHoc } = useMountedLaunchAttempts(
    machine,
    source,
    0,
  );
  return (
    <LaunchesOnPage
      value={{
        ...machineSessionsAnswering({ answer: machine }),
        adHocAttemptOf,
        startAdHoc,
      }}
    >
      <SessionsOnPage value={inertPageSessions}>{children}</SessionsOnPage>
    </LaunchesOnPage>
  );
}

// Begin at the selected story. Story selection and the dashboard frame have
// their own proofs; the case supplies the selection and Intent's read replies.
export async function mountStoryIntent({
  work,
  identity,
  machine = makeMe.aMachineAnswer.please(),
  launchSource = unansweredLaunches,
  reads,
  viewport,
}: {
  readonly work: PublishedWork;
  readonly identity: string;
  readonly machine?: MachineAnswer;
  readonly launchSource?: LaunchAttemptSource;
  readonly reads: Partial<PageReads>;
  readonly viewport?: { readonly width: number; readonly height: number };
}) {
  const { source } = work;
  const pageReads = pageReadsSupplying(reads);
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
          <StoryIntentLaunches machine={machine} source={launchSource}>
            <IntentReadRecovery visibility="visible" limitStands={false}>
              <IntentPerspective
                source={source}
                work={work}
                records={machine.records}
                workspaces={machine.workspaces}
                selection={
                  selected === undefined
                    ? undefined
                    : { project: source.id, identity: selected }
                }
                project={project}
              />
            </IntentReadRecovery>
          </StoryIntentLaunches>
        </RecentlyDoneLinkSources>
      </ProjectsOnPage>
    </PageReadsOnPage>
  );
  const mounted = await mountComponent(view(identity), {
    ...(viewport === undefined ? {} : { viewport }),
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
