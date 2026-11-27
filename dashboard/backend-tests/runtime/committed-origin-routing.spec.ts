// A HOME's routes are a list Git reads in order: among equally long matching
// URLs it takes the first. Git's own longest match is exercised by the
// journeys that read a committed origin through `expectServedHomesReach`.
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test } from "vitest";
import {
  gitHubRepositoryUrl,
  unroutedAway,
} from "../../test-support/support/fixtureOriginRoute.ts";
import {
  homeRoutes,
  publicationRoutes,
  republishedRoutes,
  withRoute,
  writeHomeRoutes,
  type HomeRoute,
} from "../../test-support/support/homeRoutes.ts";

const url = gitHubRepositoryUrl("fixture/release-board");
const otherUrl = gitHubRepositoryUrl("fixture/other");
const awayFromGitHub = unroutedAway("/home");
const explicit = { origin: "/explicit", url };
const first = { origin: "/first-publication", url };
const second = { origin: "/second-publication", url };
const other = { origin: "/other-publication", url: otherUrl };

const firstFor = (routes: readonly HomeRoute[], wanted: string) =>
  routes.find((route) => route.url === wanted)?.origin;

test.for([
  {
    home: "a HOME routed before the first publication",
    routes: [awayFromGitHub, first, other],
    reaches: second.origin,
  },
  {
    home: "a HOME whose own fixture routed the repository first",
    routes: [explicit, awayFromGitHub, first, other],
    reaches: explicit.origin,
  },
])(
  "republication of $home reaches the expected origin",
  ({ routes, reaches }) => {
    const republished = republishedRoutes(routes, first, second);

    expect(firstFor(republished, url)).toBe(reaches);
    expect(republished).not.toContainEqual(first);
    expect(republished).toEqual(
      expect.arrayContaining([awayFromGitHub, other]),
    );
  },
);

test("a committed publication leaves its origin as the only route for its URL", () => {
  const routes = [explicit, awayFromGitHub, second, other];

  expect(publicationRoutes(routes, second)).toEqual([
    awayFromGitHub,
    second,
    other,
  ]);
});

test("an origin routes one URL and keeps its place", () => {
  expect(
    withRoute([first, other], { origin: first.origin, url: otherUrl }),
  ).toEqual([{ origin: first.origin, url: otherUrl }, other]);
});

test("a HOME's routes round-trip through config text in order, keeping other settings", () => {
  const home = mkdtempSync(path.join(tmpdir(), "dough-home-routes-"));
  try {
    writeFileSync(
      path.join(home, ".gitconfig"),
      '[user]\n\tname = Fixture\n[url "/stale"]\n\tinsteadOf = https://github.com/stale.git\n',
    );
    const routes = [
      explicit,
      awayFromGitHub,
      { origin: '/with "quote"', url: otherUrl },
    ];

    writeHomeRoutes(home, routes);

    expect(homeRoutes(home)).toEqual(routes);
    expect(readFileSync(path.join(home, ".gitconfig"), "utf8")).toContain(
      "name = Fixture",
    );
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
});
