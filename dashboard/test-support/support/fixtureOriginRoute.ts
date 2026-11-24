// Routes a configured repository's GitHub URL to a fixture's local origin in
// the fixture HOME's Git config, so every Git command run under that HOME,
// including one in a repository the fixture never cloned, reaches the local
// origin instead of the network.
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
    "--add",
    `url.${origin}.insteadOf`,
    gitHubRepositoryUrl(repository),
  ]);
}
