# Source commitments

Fresh reviewer: `/root/proof_source_review`, launched with `fork_turns: none`.
The input supplied only Terry's complete 2026-11-02 instruction and its
immediate conversational context, with no plan, product files or implementation
return. The reviewer was instructed to read no files and change nothing.

Original instruction: “Yes, let's change Intent proof to that: record only
passing scenarios, preserve retry counts, and show it as the last successful
proof. clean up earlier proof when a scenario fails, if any.” Context supplied
per-scenario committed proof, mixed-result runs, successful-after-retry labels,
time and revision, and the explicit replacement of retaining an old success
after failure.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| C1 | Record proof only for scenarios that pass. | slice 3 | |
| C2 | A passing scenario can produce proof even when another scenario fails and the overall run fails. | slice 3 | |
| C3 | Preserve retry/attempt counts for recorded passing proof. | slice 3 | |
| C4 | Retain the “Passed after retry” distinction when applicable. | slice 1 | |
| C5 | Present proof as the scenario’s last successful demonstration. | slice 1 | |
| C6 | Show when that successful demonstration occurred. | slice 1 | |
| C7 | Show the revision associated with that successful demonstration. | slice 1 | |
| C8 | When a scenario fails, remove its earlier proof, if any. | slice 3 | |

## Qualifications and examples

The source concerns Intent's existing per-scenario committed proof. In a mixed
run, A's pass can be retained while B's failure clears only B's earlier proof.
A retry-assisted success keeps its attempt count and label. Pass then failure
clears the earlier success; failure without earlier proof writes nothing.
Proof does not assert current health. The source does not authorize clearing
other scenarios merely because the overall run fails.

The reviewer identified intermediate retry timing as unspecified. The plan
uses the existing final-attempt boundary: intermediate failures wait for the
final outcome, preserving successful-after-retry proof.

## Acceptance observations

Pending implementation. Producer commitments span both recorders: slice 2
proves Pygardon and slice 3 proves Doughnut; slice 3's acceptance must retain
and compare both observations before closing those whole-product commitments.
