// A HOME's Git routes: the ordered insteadOf list its Git config holds, the
// rules that keep that list, and its one read and one write of the config.
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";

// One insteadOf route in a HOME's Git config: Git reads `url` from `origin`.
export type HomeRoute = { origin: string; url: string };

// Git rewrites a URL through its longest matching route and, among equally
// long ones, the first listed; these rules keep that list.

// `route` joins the list; an origin routes one URL, kept in its place.
export function withRoute(routes: readonly HomeRoute[], route: HomeRoute) {
  const at = routes.findIndex(({ origin }) => origin === route.origin);
  if (at === -1) return [...routes, route];
  return [
    ...routes.slice(0, at),
    route,
    ...routes.slice(at + 1).filter(({ origin }) => origin !== route.origin),
  ];
}

const isRoute = (a: HomeRoute, b: HomeRoute) =>
  a.origin === b.origin && a.url === b.url;

// A republished URL drops its earlier publication's route and adds the new
// one after any route the HOME's own fixture set up first.
export function republishedRoutes(
  routes: readonly HomeRoute[],
  earlier: HomeRoute | undefined,
  route: HomeRoute,
): HomeRoute[] {
  const kept =
    earlier === undefined
      ? routes
      : routes.filter((each) => !isRoute(each, earlier));
  return withRoute(kept, route);
}

// A committed publication is the only route left for its URL.
export function publicationRoutes(
  routes: readonly HomeRoute[],
  publication: HomeRoute,
): HomeRoute[] {
  return routes.filter(
    ({ origin, url }) =>
      url !== publication.url || origin === publication.origin,
  );
}

const homeConfig = (home: string) => path.join(home, ".gitconfig");

// The routes `home`'s Git config lists, in order.
export function homeRoutes(home: string): HomeRoute[] {
  const listed = spawnSync(
    "git",
    [
      "config",
      "--file",
      homeConfig(home),
      "--get-regexp",
      String.raw`^url\..*\.insteadof$`,
    ],
    { encoding: "utf8" },
  );
  return listed.stdout
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const at = line.lastIndexOf(" ");
      return {
        origin: line.slice("url.".length, at - ".insteadof".length),
        url: line.slice(at + 1),
      };
    });
}

const quoted = (value: string) => value.replace(/[\\"]/g, "\\$&");

// Writes `routes` as `home`'s Git config routes in one write, keeping the
// config's other sections.
export function writeHomeRoutes(home: string, routes: readonly HomeRoute[]) {
  const config = homeConfig(home);
  const kept: string[] = [];
  let inRoute = false;
  for (const line of existsSync(config)
    ? readFileSync(config, "utf8").split("\n")
    : []) {
    if (line.startsWith("[")) inRoute = line.startsWith('[url "');
    if (!inRoute && line !== "") kept.push(line);
  }
  const written = routes.map(
    ({ origin, url }) =>
      `[url "${quoted(origin)}"]\n\tinsteadOf = ${quoted(url)}`,
  );
  // Git commands under `home` may read the config meanwhile, so it is renamed
  // into place whole, as Git's own config writes are.
  const staged = `${config}.${process.pid}.routes`;
  writeFileSync(staged, [...kept, ...written, ""].join("\n"));
  renameSync(staged, config);
}

export function changeHomeRoutes(
  home: string,
  change: (routes: HomeRoute[]) => HomeRoute[],
) {
  writeHomeRoutes(home, change(homeRoutes(home)));
}
