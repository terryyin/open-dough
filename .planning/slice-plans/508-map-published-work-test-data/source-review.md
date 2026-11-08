# Source review

Fresh Codex reviewer `source_review` ran without conversation inheritance.
The launch supplied only the selected story's Goal, Scope, and Key examples
and instructed the reviewer to read no project files and change nothing.
The numbered return is retained below.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| P01 | Maintainers reviewing published-work tests can read the facts that drive each case in the product’s vocabulary. | slice 9 |  |
| P02 | A story’s identity is recognizable across test entries without decoding fixture-specific fields. | slice 9 |  |
| P03 | A story’s home is recognizable across test entries without decoding fixture-specific fields. | slice 9 |  |
| P04 | A story’s membership is recognizable across test entries without decoding fixture-specific fields. | slice 9 |  |
| P05 | A story’s published revision is recognizable across test entries without decoding fixture-specific fields. | slice 9 |  |
| P06 | A story’s preparation is recognizable across test entries without decoding fixture-specific fields. | slice 3 |  |
| P07 | A story’s progress is recognizable across test entries without decoding fixture-specific fields. | slice 6 |  |
| P08 | Convert remaining valid setup for published project sources. | slice 2 |  |
| P09 | Convert remaining valid setup for story homes. | slice 1 | observed: product-backlog-refresh-fixture.mjs adoptedHomes and afterMove, exercised by the renamed and reanchored home tests in product-backlog-refresh.test.mjs |
| P10 | Convert remaining valid setup for backlog membership. | slice 1 | observed: product-backlog-fixture.mjs arrangedBacklog and product-backlog-merge-fixture.mjs mergeBacklog arrange Taken and queue facts; product-backlog-take.test.mjs and product-backlog-merge-order.test.mjs assert ordered membership |
| P11 | Convert remaining valid setup for published assignments. | slice 5 |  |
| P12 | Convert remaining valid setup for preparation. | slice 3 |  |
| P13 | Convert remaining valid setup for supplier agreements. | slice 4 |  |
| P14 | Convert remaining valid setup for slice plans. | slice 6 |  |
| P15 | Convert remaining valid setup for slice progress. | slice 6 |  |
| P16 | Convert remaining valid setup for done records. | slice 7 |  |
| P17 | Convert remaining valid setup for published Git comparison inputs. | slice 9 |  |
| P18 | Cover dashboard consumers that arrange these facts. | slice 9 |  |
| P19 | Cover skill consumers that arrange these facts. | slice 9 |  |
| P20 | Cover Node consumers that arrange these facts. | slice 9 |  |
| P21 | Cover shell consumers that arrange these facts. |  | G1 |
| P22 | Extend the shared MakeMe entry with real consumers. | slice 1 | observed: tests/support/makeMe.mjs aBacklogEntry feeds the shared product renderer in the Node fixtures and tests/support/render-published-backlog.mjs shell adapter |
| P23 | Extend the pilot’s profile builder with real consumers. | slice 5 |  |
| P24 | Keep defaults incidental. | slice 9 |  |
| P25 | Remove displaced fixture models as each family is converted. | slice 9 |  |
| P26 | Remove displaced fixture constructors as each family is converted. | slice 9 |  |
| P27 | Carry readiness `href` through the existing renderer. | slice 3 |  |
| P28 | Carry readiness `href` through the existing preparation commands. | slice 3 |  |
| P29 | Carry the product backlog entry’s plan link through the existing renderer. | slice 3 |  |
| P30 | Carry the product backlog entry’s plan link through the existing preparation commands. | slice 3 |  |
| P31 | Keep catalog pinned source facts distinct from expected card text. | slice 2 |  |
| P32 | Keep catalog pinned source facts distinct from expected card paths. | slice 2 |  |
| P33 | Keep catalog work records distinct from expected card text. | slice 2 |  |
| P34 | Keep catalog work records distinct from expected card paths. | slice 2 |  |
| P35 | Carry identities explicitly where they drive a case. | slice 9 |  |
| P36 | Carry homes explicitly where they drive a case. | slice 9 |  |
| P37 | Preserve independent expectations. | slice 9 |  |
| P38 | Use the existing CLI that the cases exercise. | slice 9 |  |
| P39 | Use the existing encoders that the cases exercise. | slice 9 |  |
| P40 | Use the existing observation boundaries that the cases exercise. | slice 9 |  |
| P41 | Use the real Git operations that the cases exercise. | slice 9 |  |
| P42 | Change test setup. | slice 9 |  |
| P43 | Preserve product contracts. | slice 9 |  |
| P44 | Preserve UI behavior. | slice 9 |  |
| P45 | Evaluate the converted families against their original cases. | slice 9 |  |
| P46 | Check that the facts governing each outcome remain visible. | slice 9 |  |
| P47 | Check that assertions still catch the same failure. | slice 9 |  |
| P48 | Check that shared setup removes a translation or a second model. | slice 9 |  |
| Q01 | Keep exact syntax explicit where it is the subject of the test. | slice 9 |  |
| Q02 | Keep malformed records explicit where they are the subject of the test. | slice 9 |  |
| Q03 | Keep legacy records explicit where they are the subject of the test. | slice 9 |  |
| Q04 | Keep captured evidence explicit where it is the subject of the test. | slice 9 |  |
| Q05 | Keep fault injection explicit where it is the subject of the test. | slice 9 |  |
| Q06 | When a native scenario changes its arranged input, update its evidence inputs. | slice 9 |  |
| Q07 | In mixed cases, convert the published facts in this story. | slice 9 |  |
| Q08 | In mixed cases, verify the existing journey. | slice 9 |  |
| Q09 | This story owns the published work facts arranged by the Git fixtures. | slice 8 |  |
| Q10 | The existing harness can be used where the shared Git materializer is unavailable. | slice 8 |  |
| X01 | Machine-local configuration belongs to later conversion stories. | slice 9 |  |
| X02 | Workspace state belongs to later conversion stories. | slice 9 |  |
| X03 | Session state belongs to later conversion stories. | slice 9 |  |
| X04 | Launches belong to later conversion stories. | slice 9 |  |
| X05 | Landing receipts belong to later conversion stories. | slice 9 |  |
| X06 | Intent evidence belongs to later conversion stories. | slice 9 |  |
| X07 | CI evidence belongs to later conversion stories. | slice 9 |  |
| X08 | Installation setup belongs to later conversion stories where applicable. | slice 9 |  |
| X09 | Native-runner setup belongs to later conversion stories where applicable. | slice 9 |  |
| X10 | The Git fixture migration owns the shared repository description. | slice 9 |  |
| X11 | The Git fixture migration owns the shared repository materializer. | slice 9 |  |
| J1.01 | The catalog project is pinned. | slice 2 |  |
| J1.02 | Its work includes a Taken correction. | slice 2 |  |
| J1.03 | Its work includes a queued story with a purpose. | slice 2 |  |
| J1.04 | Selecting the project triggers the dashboard read. | slice 2 |  |
| J1.05 | The dashboard reads the configured repository. | slice 2 |  |
| J1.06 | The dashboard reads the configured ref. | slice 2 |  |
| J1.07 | The dashboard then reads that revision. | slice 2 |  |
| J1.08 | The two cards show the selected project’s titles. | slice 2 |  |
| J1.09 | The cards show the selected project’s purpose as arranged in the example. | slice 2 |  |
| J1.10 | The fixture supplies source facts distinct from work facts. | slice 2 |  |
| J1.11 | The test checks the requests independently of the fixture’s source and work facts. | slice 2 |  |
| J1.12 | The test checks the visible text independently of the fixture’s source and work facts. | slice 2 |  |
| J2.01 | An existing story moves to a different home. | slice 1 | observed: product-backlog-refresh.test.mjs refresh reference carries the identity to a renamed canonical home, with afterMove planting the new file and removing the old |
| J2.02 | The move preserves the story’s identity. | slice 1 | observed: product-backlog-refresh.test.mjs renamed and reanchored cases compare the original identity in refreshed bytes and still address the entry by that identity |
| J2.03 | Refreshing the backlog makes the entry follow the moved home. | slice 1 | observed: product-backlog-refresh.test.mjs real refresh compares the updated href in the original queue position and confirms unchanged canonical home bytes |
| J2.04 | For a Taken story with a plan, the readiness journey reads its canonical entry. | slice 3 |  |
| J2.05 | The same readiness journey reads its recorded assessment. | slice 3 |  |
| J2.06 | If a separately published update changes membership, it does so only through the facts it writes. | slice 3 |  |
| J2.07 | If a separately published update changes assessment, it does so only through the facts it writes. | slice 3 |  |
| J3.01 | The consumer is ready. | slice 4 |  |
| J3.02 | Its supplier agreement is unsatisfied. | slice 4 |  |
| J3.03 | A start eligibility read still reports the dependency blocker. | slice 4 |  |
| J3.04 | A verified resolution clears that blocker. | slice 4 |  |
| J3.05 | Clearing that blocker does not renew the consumer’s readiness review. | slice 4 |  |
| J4.01 | The execution profile names an agent. | slice 5 |  |
| J4.02 | The execution profile names a story. | slice 5 |  |
| J4.03 | The plan shows ordered slices. | slice 6 |  |
| J4.04 | The plan shows recorded proof. | slice 6 |  |
| J4.05 | Reading the profile and plan makes the dashboard show the published owner. | slice 5 |  |
| J4.06 | Reading the profile and plan makes the dashboard show progress. | slice 6 |  |
| J4.07 | The execution-complete indication depends on its own proof even when the slices appear done. | slice 6 |  |
| J5.01 | Completing a Taken item through the product command leaves a durable done record. | slice 7 |  |
| J5.02 | A later read still shows the work after the plan or assignment has been removed. | slice 7 |  |
| J5.03 | A later read still shows its recorded attribution after the plan or assignment has been removed. | slice 7 |  |
| J6.01 | A reviewed story has published work. | slice 8 |  |
| J6.02 | Another author’s trunk commit is present alongside that work. | slice 8 |  |
| J6.03 | An unpublished worktree edit is present alongside that work. | slice 8 |  |
| J6.04 | Review selects the story’s published changes. | slice 8 |  |
| J6.05 | Review distinguishes local changes. | slice 8 |  |
| J6.06 | Git establishes the revisions the test checks. | slice 8 |  |
| J6.07 | Git establishes the ancestry the test checks. | slice 8 |  |
| J6.08 | After Story Branch integration retires its workspace, review from the done card still uses the comparison pair recorded at landing. | slice 9 |  |
