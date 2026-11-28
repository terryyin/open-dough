# Hosted HTTP cutover proof

Branch candidate `39fbba2cde1d8a7c37a94255af2a5a9a8623cb97`,
[run 46094541878, attempt 1](https://github.com/terryyin/open-dough/actions/runs/46094541878).

## Round 1

- [Frontend](https://github.com/terryyin/open-dough/actions/runs/46094541878/job/140822782443): the mounted keyboard journey has a shown revision and no Refresh control. `ProjectActions` shows Refresh alongside a durable confirmation. Test whether the mounted snapshot lacks confirmation metadata formerly inferred from retrieval time.
- [Backend](https://github.com/terryyin/open-dough/actions/runs/46094541878/job/140822782676): five revision reuse cases expect a REST backlog read after a verified Git observation. The live route had already read and pinned those bytes from Git. Trace each fixture's first comparison and retain proof of subsequent pinned records and reuse.
- [E2E](https://github.com/terryyin/open-dough/actions/runs/46094541878/job/140822782596): five published-facts isolation cases expect exactly one REST matching-refs call when the Board checks. Preserve the selected project's actual check request and each pending fact group's state transitions. Verify that no stale response crosses projects.

Reproduce the exact named failures once against the unmodified candidate
using focused commands and their actual frontend, HTTP and Chromium
boundaries. Then correct identified fixture or production causes and replay
each affected proof once through its actual boundary. Inspect later
terminal hosted jobs from the same attempt before treating the inventory as
complete. No temporary production diagnostics are in scope for this round.

Slice 9 is paused at 3.5 active minutes, before its first passing proof.
Its 12 source paths are held in the exact CI repair stash and tracked by
the private record retained with this execution. The candidate checkout is
clean apart from this diagnosis record.

### Reproduction result

One focused pass on the unmodified candidate reproduced every reported
signature on macOS with Node 24.21.0 on AC power. The three narrow group
commands ran together, with a single E2E worker. No broad suite or second
worktree ran. Exact argv and terminal output are retained in the
`s8-ci-{frontend,backend,e2e}-baseline` run records and logs.

- Frontend: one case, one failure at Refresh. The mounted snapshot supplier
  returns only revision and backlog. Removing inferred product confirmation
  time exposed that the fixture supplied no origin confirmation.
- Backend: five entry failures in five serial files during this reproduction.
  Their first comparisons and detail calls match the hosted evidence. The
  absent REST backlog call is exactly the now-verified Git backlog pin.
- E2E: five of six cases failed at the retired REST listing assertion. The
  independent alternate-project completion control passed.

The candidate's new read boundary intentionally explains all three changes
in observation. No product failure was needed to reproduce these signatures.
The repair will forward explicitly provided confirmation in the mount,
retain the comparison and pinned answers in the HTTP tests, and observe
one real scheduled browser check for the selected source and exact pin.
One focused replay per affected family will establish the repair. Inspect
the terminal hosted inventory for any other failure before returning.

### Repair

The mounted keyboard scenario supplies an explicit origin ask and confirmation,
and its existing Board frame reader forwards them on ref reads. The HTTP
reuse cases still check the exact B backlog bytes where the scenario asks for
them, while their provider ledgers now contain only the actual comparisons,
commit fetches, and pinned detail calls. The fixture for a direct cold
pinned read in a separate process still expects a REST backlog read.
In Chromium the existing isolation page object observes one live authenticated
check with the selected source and full displayed revision at the expected
pace. The original held groups, both late outcomes, retained focus, and
same-source pinned REST reads still pass.

The terminal hosted inventory contains only the three recorded failures.
The first focused repair replay passed the one keyboard case, all 24
HTTP cases, six Chromium cases, and Dashboard typecheck. A final frontend
fixture shortening brought it within the 250-line formatted limit.
Repeat the keyboard case and typecheck once to verify the shortening
retains the explicit confirmation and queue semantics. No backend or
Chromium proof changed.

The final mounted keyboard and typecheck replays both passed. Their exact
records are `s8-ci-frontend-size-final` and `s8-ci-typecheck-size-final`
in Git evidence. The focused evidence covers all three hosted signatures.
The repair remains uncommitted for the coordinator's delivery and hosted
verification.
