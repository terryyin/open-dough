# Frontend CI consumer diagnosis

[Run 44294037209, attempt 1, Distribution Tests (3/3)](https://github.com/terryyin/open-dough/actions/runs/44294037209/job/134766289227) on `29793da8db41e4e3fa0541b5eda880f8e74735c9` failed three assertions in `browser-group-shards.test.mjs` and `ci-browser-groups.test.mjs`. The job finished while the attempt's sibling jobs were still running. They require their own verdicts.

The shared test helper `browserGroupConfigs.mjs` recognizes only an npm script that directly invokes Playwright with a config and a config that passes string literals to `prepareFocusedRun`. The frontend now stages routing in `scripts/test-frontend.mjs` and takes its group prefix, root and job from `frontendSelection.mjs`. The helper therefore loses the frontend root, shard group and times directory.

Reproduce the two affected test files once on the accepted branch revision to match all three failures. Repair how these consumers discover the actual frontend command and group contract, retaining their checks of times labels, job, root, settings, shard partition and invalid pattern refusal. Then run the two focused files and reachable consumers once on the candidate. The next accepted repair publication should pass the two previously failing files on Distribution Tests (3/3). Observe its first applicable attempt and diagnose any remaining defect.

Slice 3 and a plan evidence note are preserved by the CI repair stash with record `/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/dough-ci-repair-stash-jmVLwR/record.json`. The repair owns this file and the proven affected consumers.

Apply the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).

## Round 1 outcome

The terminal attempt diagnostic confirmed inventory completeness, one failed job and the same three assertions. A single guarded run on `29793da8d` reproduced all three locally. The two frontend shard checks received an undefined test root and the browser group check received no times directory. Eight other assertions passed.

The consumer now resolves the workflow's frontend npm script against the wrapper and reads the actual frontend group metadata. The shard check compares the frontend runner's own selected labels with every physical spec, including the unsplit selection. The invalid-pattern check still exercises the shared declaration logic and asserts the missing pattern is identified. A report fixture exercised the actual frontend writer and observed `1.2<TAB>frontend-tests/timed.mounted.spec.ts`. The proof declaration checks still observe the expected shard parts, artifact names and case units.

One guarded run after this change passed all 25 tests in the two failing files and the shared shard and proof declaration consumer files. The Mac was on AC. These short Node checks ran without a Chromium process. Exact commands, terminal records and consumer evidence are in the checkout's Git evidence directory as `frontend-ci-repair-before.log.run.json`, `frontend-ci-repair-after.log.run.json` and `frontend-ci-repair-return.md`.

The coordinator owns the next hosted observation. The first applicable attempt on the accepted repair revision should pass the original Distribution Tests (3/3) assertions.
