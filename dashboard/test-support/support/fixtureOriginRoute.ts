// Routes GitHub URLs in the fixture HOME's Git config: a configured
// repository's URL reaches the fixture's local origin, and any other GitHub URL
// fails locally, so no Git command run under that HOME, including one in a
// repository the fixture never cloned, reaches the network.
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, rmSync, symlinkSync } from "node:fs";
import path from "node:path";
import { productionSeedProjects } from "../../server/projectConfigurationSeed.ts";
import type { FakeGitHub } from "./fakeGitHub.ts";

// The origin URL a configured project `owner/name` names.
export const gitHubRepositoryUrl = (repository: string) =>
  `https://github.com/${repository}.git`;

export function routeOriginThroughHome(
  home: string,
  origin: string,
  repository: string,
): void {
  execFileSync("git", [
    "config",
    "--file",
    path.join(home, ".gitconfig"),
    "--add",
    `url.${origin}.insteadOf`,
    gitHubRepositoryUrl(repository),
  ]);
}

const unroutedGitHub = (home: string) => path.join(home, "unrouted-github");

// Every GitHub URL no fixture routes resolves to a missing local repository
// under `home`, so a Git read of an unrouted configured project fails at once
// instead of reaching the network. Git picks the longest matching insteadOf,
// so each origin `routeOriginThroughHome` names still wins.
function routeUnroutedGitHubAway(home: string): void {
  execFileSync("git", [
    "config",
    "--file",
    path.join(home, ".gitconfig"),
    `url.${unroutedGitHub(home)}/.insteadOf`,
    "https://github.com/",
  ]);
}

// An origin served for every repository answers each seeded project's URL
// through the unrouted-away route: that project's place under it links to the
// origin. Any route naming the whole URL is longer, so a repository published
// by name, or routed by the HOME's own fixture, still reaches its own origin,
// and a repository no seed names still fails locally.
function routeFallbackThroughHome(home: string, origin: string | undefined) {
  for (const { repository } of productionSeedProjects) {
    const place = path.join(unroutedGitHub(home), `${repository}.git`);
    rmSync(place, { force: true });
    if (origin === undefined) continue;
    mkdirSync(path.dirname(place), { recursive: true });
    symlinkSync(origin, place);
  }
}

// Every HOME a dashboard served by one fake GitHub runs under, every origin a
// journey publishes through it by name, and the origin it serves for every
// repository, routed both ways whichever comes first, so a Git read of a
// published project under any of those HOMEs reaches the origin the fake
// GitHub answers from.
type Served = {
  homes: string[];
  origins: [string, string][];
  fallback?: string | undefined;
};
const servedBy = new WeakMap<FakeGitHub, Served>();
const served = (github: FakeGitHub): Served => {
  const known = servedBy.get(github) ?? { homes: [], origins: [] };
  servedBy.set(github, known);
  return known;
};

// A dashboard HOME served by `github`: unrouted GitHub URLs fail locally and
// each origin published through `github` is reachable.
export function routeDashboardHome(home: string, github: FakeGitHub): void {
  routeUnroutedGitHubAway(home);
  const { homes, origins, fallback } = served(github);
  homes.push(home);
  if (fallback !== undefined) routeFallbackThroughHome(home, fallback);
  for (const [origin, repository] of origins)
    routeOriginThroughHome(home, origin, repository);
}

// Git takes the first of two routes for one URL, so a repository published
// again through the same fake GitHub drops the route its earlier publication
// added; a route the HOME's own fixture set up stays first.
function unrouteOrigin(home: string, origin: string, repository: string) {
  spawnSync("git", [
    "config",
    "--file",
    path.join(home, ".gitconfig"),
    "--fixed-value",
    "--unset-all",
    `url.${origin}.insteadOf`,
    gitHubRepositoryUrl(repository),
  ]);
}

export function routeOriginThroughServedHomes(
  github: FakeGitHub,
  origin: string,
  repository: string,
): void {
  const known = served(github);
  const earlier = known.origins.find(([, routed]) => routed === repository);
  known.origins = [
    ...known.origins.filter(([, routed]) => routed !== repository),
    [origin, repository],
  ];
  for (const home of known.homes) {
    if (earlier !== undefined) unrouteOrigin(home, earlier[0], repository);
    routeOriginThroughHome(home, origin, repository);
  }
}

// Serving every repository from `origin` (or, undefined, from no origin).
export function routeFallbackThroughServedHomes(
  github: FakeGitHub,
  origin: string | undefined,
): void {
  const known = served(github);
  known.fallback = origin;
  for (const home of known.homes) routeFallbackThroughHome(home, origin);
}
