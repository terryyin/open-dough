// Push and commit fault injection for session close resume proofs: an origin
// that logs accepted pushes and can refuse record pushes, and a workspace that
// refuses its next commit.
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { git } from "../dough-execute-plan/publication-test-fixtures.mjs";

// The origin logs each accepted push and refuses record pushes while the
// `refuse-records` marker exists.
export async function recordingPushes({ origin }) {
  const hook = (name, body) =>
    writeFile(join(origin, "hooks", name), `#!/bin/sh\n${body}`, {
      mode: 0o755,
    });
  await hook(
    "pre-receive",
    `while read old new ref; do
  if [ -e "$GIT_DIR/refuse-records" ] && git diff --name-only "$old" "$new" | grep -q '^.planning/sessions/'; then
    echo record refused >&2; exit 1
  fi
done
`,
  );
  await hook("post-receive", `cut -d' ' -f2 >> "$GIT_DIR/pushes.log"\n`);
}

export const acceptedPushes = async ({ origin }) =>
  (await readFile(join(origin, "pushes.log"), "utf8").catch(() => ""))
    .split("\n")
    .filter(Boolean);

// The workspace refuses its next commit, so the record stage throws after the
// work is accepted.
export async function refusingCommits(t, { execution }) {
  const hooks = await mkdtemp(join(tmpdir(), "refusing-hooks-"));
  t.after(() => rm(hooks, { recursive: true, force: true }));
  await writeFile(join(hooks, "pre-commit"), "#!/bin/sh\nexit 1\n", {
    mode: 0o755,
  });
  await git(execution, "config", "core.hooksPath", hooks);
  return () => git(execution, "config", "--unset", "core.hooksPath");
}
