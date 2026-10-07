# Retained GitHub answers survive the dashboard process

**Identity:** SEED-118#reduce-repeated-reads-across-tabs-and-deployments
**Source:** [refined story](../../seeds/SEED-118-dashboard-reading-reliability.md#reduce-repeated-reads-across-tabs-and-deployments).
**Prepared:** 2026-10-08, planning only, in the established preparation
workspace `/Users/terryyin/git/open-dough/.worktrees/reduce-repeated-github-reads-across-tabs-and-dep`
on `claude/reduce-repeated-github-reads-across-tabs-and-dep`, under the
preparation assignment for `aki-chan`. Publication target: `origin/main`;
integration checkout: `/Users/terryyin/git/open-dough`.

## Goal and boundaries

Once one dashboard process of this user has read a published fact at a
resolved commit, a later or concurrent dashboard process on the same machine
answers it without asking GitHub: a page that outlives a production
replacement, or a second process reading the same revision, costs only the
fresh revision evidence (the configured ref, each recorded story branch head,
and any comparison and commit change list that reuse across revisions needs).

Include the story's five required behaviors: answers survive the process;
fresh revision evidence every time, with a retained answer serving only a
revision this process has heard GitHub name in this run; nothing durable but a
successful immutable answer; a bounded, owner-only, disposable store; and the
preserved sharing, admission, cooldown, visibility, and 30-second contracts,
with the request accounting and reading contract saying what survives.

Keep the story's exclusions: sharing one revision observation across visible
tabs (Terry deferred it on 2026-10-08), retention across machines, a store
shared with agent `gh` commands, proactive quota management, and request
counting in production. Terry's reported 403 stays unexplained here.

## Published baseline and integration context

Origin was inspected at the fetched `origin/main` on 2026-10-08; plans 273
(temporary-failure recovery) and 274 (recently-done progressive loading) are
allocated and unexecuted; 275 was free immediately before this write. The
basic-cards sibling landed (`01ef7774`) and was wrapped up (`52cf8772`) while
this plan was prepared: the backlog is now read at the newly named revision
itself, never compared, and the comparison and commit accounts govern the
records only; the memo owner and its key shape are unchanged. Plan 273
reuses `PinnedTexts`/`PinnedMemo` and adds an in-memory failure history; it
retains no successful answer across processes, and this plan retains no
failure. Where both touch the memo, the recovery plan's outcome retention
stays in process memory beside the store this plan adds; neither needs the
other first.

The refinement measured a first visit to Open Dough at 67 charged `gh`
requests on a fresh server and a reload at the same revision at 4 (ref plus
three recorded story branch heads); the production watcher replaces the
server on every trunk commit outside `.planning/**` and `docs/**`.

## Existing solutions and selected approach

PFE across the dashboard server:

| Need | Finding |
| --- | --- |
| One owner of reuse | **Reuse** `server/revisionMemo.ts`: every retained answer kind (`server/pinnedMemo.ts`, `server/pinnedTexts.ts`) is a string under a key `repository\0(commit sha \| blob \| latest)\0entry`, including file text, directory listings, blob text, last commit times, profile histories and additions, commit records, comparison accounts, and the per-source `latest` backlog revision. Failures are never kept. The store is added behind this one class; no second cache layer. |
| Not retained | **Preserve** `server/revisionChecks.ts` (branch-listing ETag hint), `server/branchHeads.ts`, `server/outstandingReads.ts`, `server/readAdmission.ts` (rate-limit wait), and plan 273's failure history: all stay per process. |
| Machine home | **Reuse** the `homedir()/.open-dough/dashboard` convention of `server/projectConfiguration.ts`, `server/launchAttemptStore.ts`, `server/launchRecordDocument.ts`, and `server/completionReporting.ts`, resolved through `HOME`; the test harness already starts servers in a temporary HOME and can restart one on the same machine directory. `server/machineJsonStore.ts` holds one JSON document per file and is not suited to thousands of independent entries; it is not reused. |
| Durability shape | **Gap:** no directory-of-entries store exists. Add one: one file per entry under `~/.open-dough/dashboard/retained-answers/`, named by a digest of the key, holding the key and the text; written atomically (temporary file then rename); read on a memo miss; a file whose key does not match, or that cannot be parsed, is a miss. |
| Accounting | **Change** `dashboard/GITHUB-REQUESTS.md` and `dashboard/PUBLISHED-OBSERVATION.md` where they say content is reused only while the process runs and that separately launched dashboards share nothing. |

Established structure and Accepted decisions support the work (ADR 0000:
feature-local design; ADR 0002: one representation of reuse). No North Star
topic is needed; the Proposed ADR 0008 informs the "rebuildable from origin"
boundary and binds nothing.

## Current decisions

- **Key and immutability.** Only the existing memo keys are retained. Every
  key but `latest` names exactly one text; `latest` is retained as a
  comparison input only, since `namedByRef` then asks GitHub for the
  comparison. Nothing is ever retained for a branch head, a check, a wait,
  a failure, or a missing record.
- **Revision gate.** The memo is consulted only through readers created for
  a revision the boundary has resolved in this process (`authenticatedRead.ts`
  resolves the ref or accepts a pinned revision a check named); this already
  holds and is proved, not re-implemented.
- **Synchronous miss path.** `RevisionMemo.held` is synchronous and
  `namedByRef` depends on it, so a miss reads one small file synchronously
  and a hit keeps the in-memory map as today; writes are atomic and may be
  synchronous, as `projectConfiguration.ts` already serializes its writes.
  A store that cannot be created or written is logged once and treated as
  absent; reading continues from GitHub.
- **Bound.** A fixed byte budget, default 64 MiB, overridable for tests by
  `DOUGH_RETAINED_ANSWERS_BYTES` in the pattern of `DOUGH_READ_TIMEOUT_MS`;
  the least recently used entries go first, last use tracked by the file's
  modification time, refreshed on a hit. Enforced after writes; a file the
  bound removes is simply a later miss.
- **Privacy.** The directory and files are created owner-only. Retained text
  reaches the browser only through the existing endpoints under their origin
  and access checks; deleting the directory loses nothing but requests.
- **Tests.** Specs run servers in temporary HOMEs, so each test has its own
  store; a restart on the same `machine` directory shares it, which is the
  proof's cross-process journey.

## Decisive premises and observations

| Premise | Consumed by | Observation | Result |
| --- | --- | --- | --- |
| Every reused answer passes through `RevisionMemo`'s string map under the key shape above; failures are never kept | Slice 1's placement behind one class | Read `server/revisionMemo.ts`, `server/pinnedMemo.ts`, `server/pinnedTexts.ts`; `grep -rn "new PinnedTexts\|new RevisionMemo" dashboard/server` | One construction in `installAuthenticatedReadMiddleware` (`authenticatedRead.ts:143`); `unlessFailed` keeps failures out |
| The branch-listing hint, branch heads, admission, and outstanding reads are separate from the memo | Slice 1's "not retained" boundary | `authenticatedRead.ts:140-146` boundary fields | `checks`, `branches`, `tracked` are separate objects |
| `held` is synchronous and `namedByRef` calls it synchronously | Synchronous miss-path decision | `revisionMemo.ts:12`, `pinnedMemo.ts:57-70` | Confirmed |
| The server resolves its machine home through `homedir()` and the harness runs each server in a temporary HOME, restarting on the same `machine` directory when asked | Slice 1's proof journey | `projectConfiguration.ts:32-38`; `tests/support/dashboardServer.ts:5-9,79-112`; `tests/responsiveRecovery.ts:87-120` | `machine` option and `restart`/`restartAfterPush` exist; `prebuilt` preview restarts on the same port |
| The fake GitHub records every `gh` call with kind, revision and path | Call-count proof | `tests/support/fakeGitHub.ts:27-60,138`; `production-watcher-updates.spec.ts:174-202` | `github.calls` with `request.kind/revision/path` |
| The existing reuse proof runs here | Named proof command | `env -u NODE_ENV npx playwright test --config dashboard/playwright.config.ts dashboard/tests/authenticated-read-revision-reuse.spec.ts --reporter=line` on 2026-10-08 | 6 passed in 5.5 s |
| The production preview inherits the watcher's environment, so replacements share one HOME | Relevance of slice 1 to production | `scripts/watch-dashboard.mjs:55,94,212` pass `process.env`; `productionDeployment.mjs:185-202` | Confirmed; the running preview is under Terry's login session |
| No existing spec expects a second process to reread content it did not read itself | Consumer search for slice 1 | `grep -rln "second server\|separately launched" dashboard/tests` → `authenticated-read-cooldown-reach.spec.ts:71-100` (second server in its own HOME, first never read the backlog); `production-watcher-updates.spec.ts:193-202` (same process, expects no reread) | Neither changes meaning; both rerun as consumers |
| First visit 67, reload 4 | Production observation baseline | Refinement measurement 2026-10-08 (`gh` wrapper on a throwaway server) | Recorded in the story |

No decisive premise needs a paid or state-changing observation; no probe
slice is required.

## Outside-in proof ownership

| Promise (story example) | Owning slice | Observable proof |
| --- | --- | --- |
| 1. Replacement at an unchanged revision costs ref and branch heads only; cards unchanged with fresh retrieval time | 1 | Boundary call counts across a same-machine restart; page reload after restart in preview mode |
| 3. A second process on the same machine asks ref and branch heads only; a different home retains nothing | 1 | Two servers on one machine directory; one on a fresh directory |
| 4. Failed, missing, and rate-limited answers are asked again by the next process | 1 | Fake GitHub failures at A in P1; P2's calls include them |
| 5. A logged-out `gh` fails at the ref; no retained text is shown | 1 | Auth-failure ref answer in P2; read problem, no snapshot, no content calls |
| Store absent, unreadable, foreign, or torn is a miss | 1 | Corrupt an entry file and remove the directory between processes |
| Documentation states what survives a process | 1 | `GITHUB-REQUESTS.md`, `PUBLISHED-OBSERVATION.md` wording |
| 2. After replacement the ref names B: ref, backlog at B, comparison, commits between, and touched records only | 2 | Moved-ref journey across a restart, mirroring `revisionReuseBoundary.ts` |
| 6. Over budget, least recently used answers go first; the current revision stays cheap | 3 | Tiny `DOUGH_RETAINED_ANSWERS_BYTES`; counts after eviction |
| 7. Two visible windows still check separately (unchanged, deferred) | none | Unchanged behavior; `authenticated-read-shared.spec.ts` stays green |

## Ordered slices

### 1. Answers read at a resolved commit survive the dashboard process
Type: Behavior
Status: planned
Proof: Add `authenticated-read-retained-answers.spec.ts` (dev boundary for
counts; one preview restart journey through `restart` from
`responsiveRecovery.ts` for the page) and keep the revision-reuse,
shared-read, cooldown-reach, and production-watcher-updates specs green.

Behavior: Process P1 on machine M read Open Dough at A (backlog, records,
done records, profiles, histories, additions, plans) → P1 closes and P2 starts
on M, the ref still names A → P2's read and the reloaded page cost the ref
and each recorded story branch head only; every card, credit, clock, and done
record is as before and the retrieval time is P2's. A process on another
machine directory reads as a first visit. A record that failed, was missing,
or was limited in P1 is asked again by P2. A `gh` that GitHub now refuses
fails P2 at the ref with no snapshot. An absent, foreign, or torn store file
is a miss.

Add the entry store behind `RevisionMemo` (read on miss, atomic write on
keep, owner-only directory under the machine home), constructed where
`PinnedTexts` is, with no change to `PinnedMemo`'s callers. Keep the
branch-listing hint, branch heads, admission, and outstanding reads per
process. Update the request accounting and the reading contract: content and
history already read at a commit by any dashboard process of this user on
this machine is not asked again; the ref, branch heads, checks, and
rate-limit waits remain per process.

Interim behavior: the store grows without bound until slice 3.

Safe stopping point: production replacements and sibling processes stop
paying first visits at an unchanged revision.

### 2. Reuse at a newer revision continues across processes
Type: Behavior
Status: planned
Proof: Extend `authenticated-read-retained-answers.spec.ts` with the
moved-ref journey using `revisionReuseBoundary.ts`'s helpers; keep
`authenticated-read-revision-reuse*.spec.ts` green.

Behavior: P1 answered the backlog at A → P2 starts and the ref names B, one
commit after A that touched one seed → P2 asks the ref, the backlog at B, the
comparison of B with A, that commit, and the touched seed; untouched records,
histories, additions, and plans are B's own from the retained answers,
exactly as a running process reuses them. When the comparison fails or exceeds its bounds,
B is read as a first visit, as today.

This is the retained `latest` pointer and comparison accounts doing in P2
what they do in P1; the slice proves it rather than adding a rule. If the
proof shows `latest` must not be retained, drop it from the store and record
the learning here.

Safe stopping point: a replacement that coincides with a publication costs
what the publication costs a running process.

### 3. The store stays within a fixed budget
Type: Behavior
Status: planned
Proof: Extend the same spec with a small `DOUGH_RETAINED_ANSWERS_BYTES`;
assert the directory's size and which revision rereads.

Behavior: The store holds answers for many revisions → a write takes it over
the budget → the least recently used entries are removed until it fits; a
later process rereads only what was removed, and the revision read most
recently stays cheap. A hit refreshes the entry's last use.

Keep the budget a constant with the environment override, in the existing
pattern; no configuration screen. Record the default in the request
accounting.

Safe stopping point: the store is disposable and bounded on every machine.

## Verification, delivery and sizing

All proof enters the existing Playwright Chromium suite with the synthetic
`gh` and fake GitHub; no live or credentialed GitHub dependency. Run from the
execution checkout with inherited variables unset:

```sh
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- --workers=2 <owning-and-affected-specs>
env -u NODE_ENV npm run typecheck:dashboard
```

Affected consumers to rerun with slice 1: `authenticated-read-revision-reuse*.spec.ts`,
`authenticated-read-shared*.spec.ts`, `authenticated-read-cooldown-reach.spec.ts`,
`production-watcher-updates.spec.ts`, `responsive-session-recovery-restart.spec.ts`,
and the agent-launch specs that restart on a `machine` directory only if the
store changes what they observe (they count launches, not reads). Before
changing the two documents' sentences, search their exact phrases in tests
and support (`grep -rn "share nothing\|while the dashboard process runs"`).

One bounded production observation after slice 1, as the story asks: count
`gh` invocations across one watcher replacement with a `PATH` wrapper, as the
refinement did, and compare with the 67/4 baseline; this is relevance
evidence, not a local gate.

Authorized execution applies its existing proof, refactoring, and delivery
gates, including post-change refactoring, where consolidating the machine-home
path constructions is in reach if the new store would otherwise be a fifth
copy. Planning grants no Take, implementation, commit, push, landing, or
workspace retirement.

No numeric slice target or hard limit was supplied. Slice 1 is the largest:
one store, one wiring point, one proof journey with its failure cases, and
the documentation; its breadth comes from the cases of one journey, not from
separate mechanisms. Slices 2 and 3 each add one case to the same spec.

## Preparation review

Cumulative design: one memo owner gains one persistence collaborator; no
second cache, no per-kind retention rules, no new boundary endpoint. The
examples exercise one rule (immutable answers keyed by sha survive the
process) with a bound. Refinement was not needed: no slice fragments one
result or combines independent outcomes, and every promise has an owner.
