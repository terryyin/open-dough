// Refuses a fixture origin's Git transfers the way GitHub's HTTPS transport
// refuses a credential, under every HOME a dashboard served by one fake
// GitHub runs under (./fixtureOriginRoute.ts).
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import path from "node:path";
import type { FakeGitHub } from "./fakeGitHub.ts";
import { gitHubRepositoryUrl, servedHomes } from "./fixtureOriginRoute.ts";

// What Git prints when GitHub's HTTPS transport refuses the credential.
const refusalStderr = (repository: string) => ({
  401: `fatal: could not read Username for '${gitHubRepositoryUrl(repository)}': terminal prompts disabled\n`,
  403: "error: RPC failed; HTTP 403 curl 22 The requested URL returned error: 403\n",
});

// Git under every HOME a dashboard served by `github` runs under has each
// `origin` transfer of `repository` refused with HTTP `status` until the
// returned restore lets it through again.
export function refuseOriginThroughServedHomes(
  github: FakeGitHub,
  repository: string,
  status: 401 | 403,
): () => void {
  const config = (home: string, ...args: string[]) =>
    execFileSync("git", [
      "config",
      "--file",
      path.join(home, ".gitconfig"),
      ...args,
    ]);
  for (const home of servedHomes(github)) {
    const said = path.join(home, "refusal-stderr");
    const gate = path.join(home, "refusing-upload-pack");
    writeFileSync(said, refusalStderr(repository)[status]);
    writeFileSync(gate, `#!/bin/sh\ncat '${said}' >&2\nexit 128\n`, {
      mode: 0o755,
    });
    config(home, "remote.origin.uploadpack", gate);
  }
  return () => {
    for (const home of servedHomes(github))
      config(home, "--unset", "remote.origin.uploadpack");
  };
}
