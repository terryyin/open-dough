import { createElement } from "react";
import { expect, onTestFinished, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import {
  agentIdentity,
  renderAgentProfile,
} from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { PageReadsOnPage, type PageReads } from "../../src/pageReads.tsx";
import { SessionsOnPage } from "../../src/pageSessions.ts";
import { ProjectsOnPage } from "../../src/projectList.tsx";
import type { PublishedSource } from "../../src/publishedSource.ts";
import { SessionEntry } from "../../src/SessionEntry.tsx";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import { pageReadsSupplying } from "../../test-support/component-mount/unreadPageReads.ts";
import { story } from "../navigation/board-work.ts";
import { inertPageSessions } from "./inert-page-sessions.ts";
import { sessionEntry } from "./session-card-page.ts";

test("Session details credit a saved allocation from the supplied profile and addition readers, never an authenticated read", async () => {
  const fetched = vi.spyOn(window, "fetch");
  onTestFinished(() => {
    fetched.mockRestore();
  });
  const savedRevision = "a".repeat(40);
  const allocatedName = "Yui";
  const allocated = agentIdentity(allocatedName);
  const work = story("Credited refinement", 761);
  const launch = makeMe.aLaunchRecord
    .refining(work)
    .inClaudeSession({ sessionId: "credited-allocation" })
    .onStoryBranch({
      workspace: "/work/open-dough/.worktrees/credited",
      branch: "claude/credited",
      agent: allocated.agent,
      publishedSha: savedRevision,
    })
    .please();
  const source: PublishedSource = {
    id: launch.request.source,
    label: "Open Dough",
    repository: "terryyin/open-dough",
    ref: "main",
    backlogPath: ".planning/PRODUCT-BACKLOG.md",
  };
  const profilePath = `.planning/${allocated.path}`;
  const asked: string[] = [];
  const observation: PageReads["observation"] = {
    ...pageReadsSupplying({}).observation,
    readProfiles: (...[, revision]) => {
      asked.push(`profiles@${revision}`);
      return Promise.resolve({
        profiles: [
          {
            path: profilePath,
            text: renderAgentProfile({
              name: allocatedName,
              identity: work.identity,
              activity: "preparation",
              host: "claude",
              model: "claude-opus-5-5",
            }),
          },
        ],
        settings: undefined,
      });
    },
    readProfileAddition: (...[, path, revision]) => {
      asked.push(`${path}@${revision}`);
      return Promise.resolve({
        commit: "c".repeat(40),
        committerName: "Grace Hopper",
        committedAt: "2026-01-01T00:00:00.000Z",
        login: null,
      });
    },
  };
  const record = makeMe.anObservedLaunch
    .of(launch)
    .withSessionState(makeMe.aSessionState.loaded("working").please())
    .please();
  await mountComponent(
    createElement(PageReadsOnPage, {
      reads: pageReadsSupplying({ observation }),
      children: createElement(ProjectsOnPage, {
        projects: [source],
        replaceProjects: () => undefined,
        children: createElement(SessionsOnPage, {
          value: inertPageSessions,
          children: createElement(SessionEntry, { record, onStoryCard: true }),
        }),
      }),
    }),
  );
  const session = sessionEntry(
    page.getByRole("article", { name: "Refinement session" }),
  );
  await userEvent.click(session.details);

  await expect
    .element(session.entry.getByText("Grace Hopper", { exact: true }))
    .toBeVisible();
  expect(asked).toEqual([
    `profiles@${savedRevision}`,
    `${profilePath}@${savedRevision}`,
  ]);
  expect(
    fetched.mock.calls.filter(([url]) =>
      String(url instanceof Request ? url.url : url).includes(
        "/__authenticated-read",
      ),
    ),
  ).toEqual([]);
});
