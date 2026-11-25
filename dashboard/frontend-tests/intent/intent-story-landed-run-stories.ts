// The Done story (./intent-story-compare-stories.ts) offering a captured
// landed run beside its published completion: the completion, recorded by
// `agent`, can include merged changes; the landed run cannot.
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import {
  doneCompletion,
  openDoneStoryComparison,
} from "./intent-story-compare-stories.ts";

export const oid = (digit: string) => digit.repeat(40);

export const landedRun = makeMe.aReviewRun
  .keyed("captured-landing")
  .launchedAt("2026-11-01T01:00:00Z")
  .comparing(oid("1"), oid("2"))
  .please();

export const landedRunLaunched = new Date(
  landedRun.launchedAt ?? "",
).toLocaleString();

export const openWithLandedRun = ({ agent = "claude" } = {}) =>
  openDoneStoryComparison({
    review: (query) =>
      Promise.resolve(
        query.run === landedRun.key
          ? makeMe.aStoryReview
              .landed()
              .adding("landed.txt")
              .onRun(landedRun)
              .please()
          : {
              ...makeMe.aStoryReview
                .published(doneCompletion)
                .by(agent)
                .adding("branch.ts")
                .please({
                  from: oid("8"),
                  changes: makeMe.aStoryReview
                    .adding("branch.ts")
                    .adding("incoming.ts"),
                }),
              runs: [landedRun],
            },
      ),
  });
