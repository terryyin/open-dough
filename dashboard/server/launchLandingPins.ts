import type { LaunchLanding } from "../src/launchLanding.ts";
import {
  defaultGitOutputLimit,
  runGit,
  runGitUntilClosed,
} from "./gitRunner.ts";

export const landingGitCall = (cwd: string) => ({
  cwd,
  maxBuffer: defaultGitOutputLimit,
  signal: AbortSignal.timeout(30_000),
});

type Comparison = Pick<LaunchLanding, "base" | "revision">;
export type HeldPin = { readonly ref: string; readonly objectId: string };

export function comparisonPins(prefix: string, { base, revision }: Comparison) {
  return [
    { ref: `${prefix}base`, objectId: base },
    { ref: `${prefix}revision`, objectId: revision },
  ];
}

async function updatePins(repository: string, commands: readonly string[]) {
  if (commands.length === 0) return;
  await runGitUntilClosed(["update-ref", "--stdin", "-z"], {
    ...landingGitCall(repository),
    input: commands.join(""),
  });
}

export async function writePins(
  repository: string,
  pins: readonly HeldPin[],
): Promise<void> {
  if (
    pins.some(
      ({ ref, objectId }) => ref.includes("\0") || objectId.includes("\0"),
    )
  )
    throw new Error("Pin refs and object IDs cannot contain NUL.");
  await updatePins(
    repository,
    pins.map(({ ref, objectId }) => `update ${ref}\0${objectId}\0\0`),
  );
}

// Holds a comparison's two ends under its prefix so the pair outlives its branches.
export function pinPair(
  repository: string,
  prefix: string,
  pair: Comparison,
): Promise<void> {
  return writePins(repository, comparisonPins(prefix, pair));
}

// Every reference held under the prefix, ordered by Git ref name.
export async function heldPins(
  repository: string,
  prefix: string,
): Promise<HeldPin[]> {
  const listed = await runGit(
    ["for-each-ref", "--format=%(refname) %(objectname)", prefix],
    landingGitCall(repository),
  );
  return listed.stdout
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [ref = "", objectId = ""] = line.split(" ");
      return { ref, objectId };
    });
}

// Releases the observed refs together, leaving replacements for a new observation.
export async function removePins(repository: string, prefix: string) {
  const pins = await heldPins(repository, prefix);
  await updatePins(
    repository,
    pins.map(({ ref, objectId }) => `delete ${ref}\0${objectId}\0`),
  );
}
