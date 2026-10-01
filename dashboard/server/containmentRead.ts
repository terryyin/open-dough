// Whether a launch's accepted publication is in the history of the revision
// a page shows, for the local authenticated read boundary
// (`./authenticatedRead.ts`): a request names the catalog source, the shown
// revision (`revision`), and the accepted one (`contains`), both full commit
// ids and nothing else, and is refused here before any `gh` call otherwise.
// GitHub compares the two in the source's own repository
// (`compare/<accepted>...<revision>`): the shown revision contains the
// accepted one when it is that commit or ahead of it; behind or diverged, or
// an accepted commit GitHub does not know, it does not. Any other answer is a
// failure, worded and rate-limited as every read's (`./performedRead.ts`,
// `./readFailureMessage.ts`), never a guess.

import { classify, execGh, GhFailure } from "./ghRead.ts";
import { limitedAsDirected } from "./ghRevision.ts";
import { parseIncluded } from "./includedAnswer.ts";
import { answered, type Outcome } from "./readOutcome.ts";
import { refused, type RefusedParameters } from "./refusedParameters.ts";
import { commitShaPattern } from "../src/authenticatedReadRules.ts";
import type { PublishedSource } from "../src/publishedSource.ts";

export type ContainmentRead = {
  readonly kind: "containment-at";
  // The revision shown.
  readonly revision: string;
  // The accepted publication's revision.
  readonly accepted: string;
};

const named = ["source", "revision", "contains"];

// A containment read names exactly one shown and one accepted commit id.
export function parseContainmentRead(
  params: URLSearchParams,
): ContainmentRead | RefusedParameters {
  const keys = [...params.keys()];
  if (
    keys.length !== named.length ||
    !named.every((key) => keys.includes(key))
  ) {
    return refused(
      "A containment read names only the revision shown and the accepted revision.",
    );
  }
  const revision = params.get("revision") ?? "";
  const accepted = params.get("contains") ?? "";
  if (!commitShaPattern.test(revision) || !commitShaPattern.test(accepted)) {
    return refused("A containment read names only full commit shas.");
  }
  return { kind: "containment-at", revision, accepted };
}

// GitHub's comparison status for a head that is, or descends from, its base.
const containing = new Set(["identical", "ahead"]);
const notContaining = new Set(["behind", "diverged"]);

async function containsViaGh(
  repository: string,
  { accepted, revision }: ContainmentRead,
  signal: AbortSignal,
): Promise<boolean> {
  const { error, stdout, stderr } = await execGh(
    [
      "api",
      "--include",
      `repos/${repository}/compare/${accepted}...${revision}?per_page=1`,
      "--jq",
      ".status",
    ],
    signal,
  );
  const answer = signal.aborted ? undefined : parseIncluded(stdout);
  // GitHub knows no such accepted commit: nothing shown contains it.
  if (answer?.status === 404) return false;
  if (error || answer?.status !== 200) {
    throw new GhFailure(
      limitedAsDirected(answer) ??
        (error ? classify(error, stderr) : { kind: "failed" }),
    );
  }
  const status = answer.body.trim();
  if (containing.has(status)) return true;
  if (notContaining.has(status)) return false;
  throw new GhFailure({ kind: "failed" });
}

// Performs the read inside the boundary's tracked `gh` calls
// (`./performedRead.ts`).
export async function performContainmentRead(
  source: PublishedSource,
  read: ContainmentRead,
  signal: AbortSignal,
): Promise<Outcome> {
  const { revision, accepted } = read;
  const contained = await containsViaGh(source.repository, read, signal);
  return answered({ revision, accepted, contained });
}
