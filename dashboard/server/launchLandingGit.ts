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
const oneShotRefPrefix = "refs/open-dough/one-shot/";
const landingRefPrefix = (reference: string) =>
  `${oneShotRefPrefix}${reference}/`;
type LandingDelivery = Pick<LaunchLanding, "reference" | "delivery">;
const landingDeliveryRefPrefix = ({ reference, delivery }: LandingDelivery) =>
  `${landingRefPrefix(reference)}${delivery}/`;

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
// Holds a comparison's two ends in `repository` by references under `prefix`,
// so the pair outlives its branches.
export async function pinPair(
  repository: string,
  prefix: string,
  pair: { readonly base: string; readonly revision: string },
): Promise<void> {
  await git(repository, ["update-ref", `${prefix}base`, pair.base]);
  await git(repository, ["update-ref", `${prefix}revision`, pair.revision]);
}
export type HeldPin = { readonly ref: string; readonly objectId: string };
// Every reference held under `prefix`, ordered by Git ref name.
export async function heldPins(
  repository: string,
  prefix: string,
): Promise<HeldPin[]> {
  const listed = await git(repository, [
    "for-each-ref",
    "--format=%(refname) %(objectname)",
    prefix,
  ]);
  return listed.stdout
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [ref = "", objectId = ""] = line.split(" ");
      return { ref, objectId };
    });
}
// Releases every pair held under `prefix`.
export async function removePins(
  repository: string,
  prefix: string,
): Promise<void> {
  for (const { ref } of await heldPins(repository, prefix))
    await git(repository, ["update-ref", "-d", ref]);
}
// The landing pins `repository` holds, ordered by Git ref name: the whole
// one-shot namespace, one reporting reference's pins, or one delivery's pair.
export const heldLandingPins = (
  repository: string,
  scope?: { readonly reference: string; readonly delivery?: string },
): Promise<HeldPin[]> =>
  heldPins(
    repository,
    scope === undefined
      ? oneShotRefPrefix
      : scope.delivery === undefined
        ? landingRefPrefix(scope.reference)
        : landingDeliveryRefPrefix({ ...scope, delivery: scope.delivery }),
  );
export const pinLanding = (landing: LaunchLanding): Promise<void> =>
  pinPair(landing.repository, landingDeliveryRefPrefix(landing), landing);

export const removeLandingDeliveryPins = (
  landing: LaunchLanding,
): Promise<void> =>
  removePins(landing.repository, landingDeliveryRefPrefix(landing));

export const removeLandingPins = (
  repository: string,
  reference: string,
): Promise<void> => removePins(repository, landingRefPrefix(reference));
