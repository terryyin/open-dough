// Actual collected summary bytes beside the existing trunk Actions fixture.
import type { CiRunAnswer } from "./baseCiActions.ts";
import { summaryTextZipAnswer } from "./ciProofCollected.ts";
import type { FakeGitHub } from "./fakeGitHub.ts";
import { trunkActions, type TrunkProofs } from "./landedCiTrunk.ts";
import { publishes } from "./publishedRepository.ts";
import { originMain } from "./sessionDialog.ts";
import type { StartOrigin } from "./startOrigin.ts";

export type CollectedTrunkProofs = Readonly<
  Record<
    number,
    | TrunkProofs[number]
    | {
        readonly kind: "collected";
        readonly artifactId: number;
        readonly text: string;
      }
  >
>;

export function serveCollectedTrunkRuns(
  github: FakeGitHub,
  origin: StartOrigin,
  runs: (main: string) => readonly CiRunAnswer[],
  proofs: () => CollectedTrunkProofs,
): void {
  github.serve("terryyin/open-dough", async (call) => {
    const held = proofs();
    const ordinary: Record<number, TrunkProofs[number]> = {};
    for (const [run, proof] of Object.entries(held)) {
      ordinary[Number(run)] =
        proof.kind === "collected"
          ? {
              kind: "summary",
              artifactId: proof.artifactId,
              summary: JSON.parse(proof.text) as unknown,
            }
          : proof;
      if (
        proof.kind === "collected" &&
        call.request.kind === "actions-artifact-zip" &&
        call.request.artifactId === proof.artifactId
      )
        return summaryTextZipAnswer(proof.text);
    }
    const main = await originMain(origin);
    return (
      trunkActions(runs(main), ordinary)(call.argv, main) ??
      publishes({ revision: main })(call)
    );
  });
}
