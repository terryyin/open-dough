// Interruptions for preparation recovery journeys: other developers holding
// names, a remote that refuses pushes or loses a response after accepting,
// and a rival writer racing a push. They shape the remote only; announcing,
// releasing and abandoning stay with the production CLI.
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  agentNames,
  renderAgentProfile,
} from "../../dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import {
  exec,
  git,
  profileOf,
  read,
  revParse,
} from "./preparation-assignment-test-fixtures.mjs";

// Every rotation name except `free` becomes another developer's execution
// assignment, published in one commit dated decades ago: age alone never
// frees a name.
export async function occupyAllBut(trunk, ...free) {
  const { integration } = trunk;
  await git(integration, "pull", "--quiet", "--ff-only", "origin", "main");
  mkdirSync(join(integration, ".planning/agents"), { recursive: true });
  const held = agentNames.filter((name) => !free.includes(name));
  for (const name of held)
    writeFileSync(
      join(integration, profileOf(name)),
      renderAgentProfile({
        name,
        identity: `SEED-${name.toUpperCase()}#work`,
        mode: "trunk",
        branch: "origin/main",
      }),
    );
  await git(integration, "add", ".planning/agents");
  const date = "2001-01-01T00:00:00Z";
  await exec(
    "git",
    ["commit", "--quiet", `--date=${date}`, "-m", "other developers work"],
    { cwd: integration, env: { ...process.env, GIT_COMMITTER_DATE: date } },
  );
  await git(integration, "push", "--quiet", "origin", "HEAD:main");
  return held;
}

function hook(trunk, name, body) {
  const path = join(trunk.origin, "hooks", name);
  writeFileSync(path, `#!/bin/sh\n${body}`, { mode: 0o755 });
  return () => rmSync(path, { force: true });
}

// The remote refuses every push until the returned function lifts it.
export const refusePushes = (trunk) =>
  hook(trunk, "pre-receive", "echo 'trunk is frozen' >&2\nexit 1\n");

// The next push to main is accepted, then the connection drops before the
// pusher hears so: the receive process dies after updating the ref. The
// returned function says whether that has happened.
export function loseNextResponse(trunk) {
  const marker = join(trunk.fixture, "response-lost");
  hook(
    trunk,
    "reference-transaction",
    `[ "$1" = committed ] || exit 0
grep -q ' refs/heads/main$' || exit 0
[ -e '${marker}' ] && exit 0
touch '${marker}'
kill -9 $PPID
`,
  );
  return () => existsSync(marker);
}

// Before the next push from `checkout` (or any worktree of it) leaves, another
// writer publishes `files` on remote trunk.
export async function raceNextPush(trunk, checkout, files) {
  const rival = join(trunk.fixture, "rival");
  const staged = join(trunk.fixture, "rival-files");
  mkdirSync(staged, { recursive: true });
  const copies = Object.entries(files).map(([path, text], index) => {
    writeFileSync(join(staged, String(index)), text);
    return `mkdir -p "$(dirname '${rival}/${path}')"
cp '${join(staged, String(index))}' '${rival}/${path}'`;
  });
  const hooks = join(trunk.fixture, "hooks");
  mkdirSync(hooks, { recursive: true });
  const marker = join(trunk.fixture, "raced");
  writeFileSync(
    join(hooks, "pre-push"),
    `#!/bin/sh
[ -e '${marker}' ] && exit 0
touch '${marker}'
unset GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE
git clone --quiet '${trunk.origin}' '${rival}'
${copies.join("\n")}
git -C '${rival}' add -A
git -C '${rival}' -c user.name=Rival -c user.email=rival@example.test commit --quiet -m 'rival writer'
git -C '${rival}' push --quiet origin HEAD:main
`,
    { mode: 0o755 },
  );
  await git(checkout, "config", "core.hooksPath", hooks);
}

// What the workspace holds: HEAD, index and working-tree status, and the
// bytes of `paths` (null when absent).
export async function snapshot(workspace, paths) {
  return {
    head: await revParse(workspace, "HEAD"),
    status: (await git(workspace, "status", "--porcelain")).stdout,
    files: Object.fromEntries(
      paths.map((path) => [
        path,
        existsSync(join(workspace, path)) ? read(workspace, path) : null,
      ]),
    ),
  };
}

// Commit messages on remote trunk, newest first.
export async function remoteSubjects(trunk) {
  const { stdout } = await git(trunk.origin, "log", "--format=%s", "main");
  return stdout.trim().split("\n");
}
