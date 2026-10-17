// The hosts a production dashboard of a published-main fixture reaches: a
// fake GitHub answering the fixture's own `gh`, and a fake Claude on the
// fixture's machine with the `open-dough` project folder. Neither supplies a
// watcher outcome; the fixture's commands find them through `env`.
import type { publishedMainFixture } from "./publishedMainFixture.ts";
import { fakeGhEnv } from "./fakeGh.ts";
import { installFakeClaude } from "./fakeClaude.ts";
import { startFakeGitHub } from "./fakeGitHub.ts";

type Fixture = Awaited<ReturnType<typeof publishedMainFixture>>;

export async function publishedMainHosts(fixture: Fixture) {
  const github = await startFakeGitHub();
  const ghEnv = fakeGhEnv(fixture.gh, github.url);
  const claude = installFakeClaude(
    fixture.root,
    { binDir: fixture.gh.binDir, path: ghEnv["PATH"] ?? "" },
    { machine: fixture.root, projectFolders: ["open-dough"] },
  );
  const env: NodeJS.ProcessEnv = { ...fixture.env, ...ghEnv, ...claude.env };
  return { github, claude, env, close: () => github.close() };
}
