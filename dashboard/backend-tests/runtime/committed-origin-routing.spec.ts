import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test as base } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { PublishedSource } from "../../src/publishedSource.ts";
import {
  everyRepository,
  publishes,
  startFakeGitHub,
  type FakeGitHub,
} from "../../test-support/support/fakeGitHub.ts";
import {
  gitHubRepositoryUrl,
  routeDashboardHome,
  routeOriginThroughHome,
} from "../../test-support/support/fixtureOriginRoute.ts";
import { holdingAnswer } from "../../test-support/support/heldGitHubAnswer.ts";

const project = makeMe.aPublishedSource
  .with({
    id: "release-board",
    label: "Release Board",
    repository: "fixture/release-board",
    ref: "release+stable",
  })
  .please();
const other = makeMe.aPublishedSource
  .with({ id: "other", label: "Other", repository: "fixture/other" })
  .please();
const seeded = makeMe.aPublishedSource.openDough.please();

const test = base.extend<{ github: FakeGitHub; newHome: () => string }>({
  // eslint-disable-next-line no-empty-pattern
  github: async ({}, use) => {
    const github = await startFakeGitHub();
    try {
      await use(github);
    } finally {
      await github.close();
    }
  },
  // eslint-disable-next-line no-empty-pattern
  newHome: async ({}, use) => {
    const root = mkdtempSync(path.join(tmpdir(), "dough-publication-routes-"));
    try {
      await use(() => mkdtempSync(path.join(root, "home-")));
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  },
});

function readHead(home: string, { repository, ref }: PublishedSource) {
  return spawnSync(
    "git",
    [
      "ls-remote",
      "--exit-code",
      gitHubRepositoryUrl(repository),
      `refs/heads/${ref}`,
    ],
    {
      cwd: home,
      env: { ...process.env, HOME: home, GIT_ALLOW_PROTOCOL: "file" },
      encoding: "utf8",
    },
  );
}

function reachedRevision(home: string, source: PublishedSource) {
  const result = readHead(home, source);
  expect(result.status, result.stderr).toBe(0);
  return result.stdout.split("\t")[0];
}

function serveFirstPublication(github: FakeGitHub) {
  const published = publishes({ defaultBranch: project.ref });
  github.serve(project.repository, published);
  return published.revision;
}

function serveSecondPublication(github: FakeGitHub) {
  const published = publishes({ defaultBranch: project.ref });
  const held = holdingAnswer(published, ({ kind }) => kind === "content");
  github.serve(project.repository, held.answer);
  return published.revision;
}

test("Git reaches the wrapped second publication in HOMEs registered before and after the first", ({
  github,
  newHome,
}) => {
  const early = newHome();
  routeDashboardHome(early, github);
  const first = serveFirstPublication(github);

  const late = newHome();
  routeDashboardHome(late, github);
  expect(reachedRevision(early, project)).toBe(first);
  expect(reachedRevision(late, project)).toBe(first);

  const second = serveSecondPublication(github);
  expect(reachedRevision(early, project)).toBe(second);
  expect(reachedRevision(late, project)).toBe(second);
});

test.for([
  { route: "another named project", source: other, servedAs: other.repository },
  { route: "the seeded fallback", source: seeded, servedAs: everyRepository },
])(
  "re-serving a project preserves $route",
  ({ source, servedAs }, { github, newHome }) => {
    const home = newHome();
    routeDashboardHome(home, github);
    const retained = publishes({ defaultBranch: source.ref });
    github.serve(servedAs, retained);
    serveFirstPublication(github);

    serveSecondPublication(github);

    expect(reachedRevision(home, source)).toBe(retained.revision);
  },
);

test("the HOME's explicit route takes precedence after republication", ({
  github,
  newHome,
}) => {
  const home = newHome();
  const explicit = publishes({ defaultBranch: project.ref });
  routeOriginThroughHome(home, explicit.origin, project.repository);
  routeDashboardHome(home, github);
  serveFirstPublication(github);

  serveSecondPublication(github);

  expect(reachedRevision(home, project)).toBe(explicit.revision);
});

test("an unserved and unseeded repository fails through a local route", ({
  github,
  newHome,
}) => {
  const home = newHome();
  routeDashboardHome(home, github);
  github.serve(everyRepository, publishes({ defaultBranch: other.ref }));

  const result = readHead(home, other);

  expect(result.status).toBe(128);
  expect(result.stderr).toContain(home);
  expect(result.stderr).toContain(`${other.repository}.git`);
});
