// Recording owns object preservation; reads never need to create these refs.
import type { LaunchLanding } from "../src/launchLanding.ts";
import { runGit, defaultGitOutputLimit } from "./gitRunner.ts";
import { RefusedRequest } from "./localOrigin.ts";
const git = (repository: string, args: readonly string[]) =>
  runGit(args, {
    cwd: repository,
    maxBuffer: defaultGitOutputLimit,
    signal: AbortSignal.timeout(30_000),
  });
export const landingRefPrefix = (reference: string) =>
  `refs/open-dough/one-shot/${reference}/`;

// Recorded landing ancestry from already retained local Git objects, across
// all merge parents. Only requested landing revisions enter the order; private
// branch commits do not become observations. No fetch, helper or ref mutation
// belongs to history reading. Missing objects/paths leave the order unsupported;
// a previously collected order can still be used.
export async function readLandingOrder(
  repositories: readonly string[],
  revisions: readonly string[],
  endpoint?: string,
  signal?: AbortSignal,
): Promise<readonly string[] | undefined> {
  const wanted = [
    ...new Set([...revisions, ...(endpoint === undefined ? [] : [endpoint])]),
  ];
  if (wanted.length === 0) return [];
  const retained = new Set(wanted);
  let best: readonly string[] | undefined;
  let score = -1;
  const bounded =
    signal === undefined
      ? AbortSignal.timeout(30_000)
      : AbortSignal.any([signal, AbortSignal.timeout(30_000)]);
  for (const repository of new Set(repositories)) {
    const local = (args: readonly string[], input?: string) =>
      runGit(args, {
        cwd: repository,
        maxBuffer: defaultGitOutputLimit,
        env: {
          GIT_NO_LAZY_FETCH: "1",
          GIT_ALLOW_PROTOCOL: "file",
          GIT_TERMINAL_PROMPT: "0",
        },
        signal: bounded,
        ...(input === undefined ? {} : { input }),
      });
    try {
      const checked = await local(
        ["cat-file", "--batch-check=%(objectname) %(objecttype)"],
        `${wanted.join("\n")}\n`,
      );
      const known = checked.stdout
        .trim()
        .split("\n")
        .flatMap((line) => {
          const [revision, kind] = line.split(" ");
          return revision !== undefined && kind === "commit" ? [revision] : [];
        });
      if (
        known.length === 0 ||
        (endpoint !== undefined && !known.includes(endpoint))
      )
        continue;
      const latest = (
        await local(["rev-list", "--topo-order", "--max-count=1", ...known])
      ).stdout.trim();
      let order = (
        await local(["rev-list", "--topo-order", "--reverse", latest])
      ).stdout
        .trim()
        .split("\n")
        .filter((revision) => retained.has(revision));
      if (endpoint !== undefined && !order.includes(endpoint))
        order = (
          await local(["rev-list", "--topo-order", "--reverse", endpoint])
        ).stdout
          .trim()
          .split("\n")
          .filter((revision) => retained.has(revision));
      const covered = wanted.filter((revision) =>
        order.includes(revision),
      ).length;
      if (covered > score) {
        best = order;
        score = covered;
      }
      if (covered === wanted.length) return order;
    } catch {
      if (bounded.aborted) return best;
      // Another retained local repository may still hold the pinned objects.
    }
  }
  return best;
}
export async function verifyLanding(
  landing: LaunchLanding,
  prepare?: { workspace: string; branch: string },
): Promise<void> {
  const { repository, base, revision, remote, target } = landing;
  try {
    for (const object of [base, revision])
      if (
        (await git(repository, ["cat-file", "-t", object])).stdout.trim() !==
        "commit"
      )
        throw new Error("Both comparison ends must be commits.");
    await git(repository, ["merge-base", "--is-ancestor", base, revision]);
    if (prepare !== undefined) {
      // The candidate is what the workspace holds and carries the launch's
      // branch: its tip, or a detached integration of that tip onto trunk.
      if (
        (await git(prepare.workspace, ["rev-parse", "HEAD"])).stdout.trim() !==
        revision
      )
        throw new Error("The candidate is not this launch's workspace HEAD.");
      await git(prepare.workspace, [
        "merge-base",
        "--is-ancestor",
        `refs/heads/${prepare.branch}`,
        revision,
      ]);
      return;
    }
    // Fetch only into FETCH_HEAD: the record operation moves no checkout branch.
    await git(repository, ["fetch", "--no-tags", "--refmap=", remote, target]);
    await git(repository, [
      "merge-base",
      "--is-ancestor",
      revision,
      "FETCH_HEAD",
    ]);
  } catch {
    throw new RefusedRequest(
      409,
      prepare === undefined
        ? "The authorized remote target has not confirmed this commit comparison."
        : "This is not the established launch's workspace candidate and commit comparison.",
    );
  }
}
export async function pinLanding(landing: LaunchLanding): Promise<void> {
  const prefix = `${landingRefPrefix(landing.reference)}${landing.delivery}/`;
  await git(landing.repository, ["update-ref", `${prefix}base`, landing.base]);
  await git(landing.repository, [
    "update-ref",
    `${prefix}revision`,
    landing.revision,
  ]);
}
export async function removeLandingPins(
  repository: string,
  reference: string,
): Promise<void> {
  const listed = await git(repository, [
    "for-each-ref",
    "--format=%(refname)",
    landingRefPrefix(reference),
  ]);
  for (const ref of listed.stdout.trim().split("\n").filter(Boolean))
    await git(repository, ["update-ref", "-d", ref]);
}
