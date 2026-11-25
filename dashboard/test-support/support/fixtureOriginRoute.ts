// Routes GitHub URLs in the fixture HOME's Git config: a configured
// repository's URL reaches the fixture's local origin, and any other GitHub URL
// fails locally, so no Git command run under that HOME, including one in a
// repository the fixture never cloned, reaches the network.
import { execFileSync } from "node:child_process";
import path from "node:path";

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
    "--replace-all",
    `url.${origin}.insteadOf`,
    gitHubRepositoryUrl(repository),
  ]);
}

// Every GitHub URL no fixture routes resolves to a missing local repository
// under `home`, so a Git read of an unrouted configured project fails at once
// instead of reaching the network. Git picks the longest matching insteadOf,
// so each origin `routeOriginThroughHome` names still wins.
export function routeUnroutedGitHubAway(home: string): void {
  execFileSync("git", [
    "config",
    "--file",
    path.join(home, ".gitconfig"),
    `url.${path.join(home, "unrouted-github")}/.insteadOf`,
    "https://github.com/",
  ]);
}
