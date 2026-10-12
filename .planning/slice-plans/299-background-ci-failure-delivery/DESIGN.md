# Runtime direction and responsibility mapping

Supporting record for [plan 299](PLAN.md); slice status and current execution
ownership remain in that plan. This record grants no execution authority.

## Direction, domain mapping and PFE

Follow the [North Star](../../NORTH-STAR.md) topic "Background CI monitoring
and session delivery" and the delivered request ownership described in
[GitHub requests](../../../dashboard/GITHUB-REQUESTS.md), revised by this
preparation because the old process-local dashboard ownership cannot serve
standalone obligations. This is feature design, not acceptance of Proposed
ADRs 0007–0009. Current Accepted constraints:

- [0001 — Ubiquitous language](../../../docs/adrs/0001-ubiquitous-language-accepted.md):
  preserve distinct published story facts and local session/CI facts.
- [0002 — Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md):
  one conceptual solution, direct domain mapping, bounded proof and necessary
  whole-product structure rather than component-local duplicates.
- [0003 — Release lifecycle and versioning](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)
  and [0004 — Client installation and update](../../../docs/adrs/0004-client-installation-and-update-accepted.md):
  self-contained installed dependencies; runtime support is not fetched during use.
- [0005 — Native acceptance](../../../docs/adrs/0005-cross-tool-validation-accepted.md):
  feasibility before dependent work; separate native acceptance before release.
- [0006 — Write skills for executing agents](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md):
  one instruction source, minimal host adaptation and project-local perspective.

### One runtime, two entry adapters

The installed runtime owns durable subscriptions, evidence, delivery and
completion. It does not own GitHub admission: it is a client of the delivered
request owner of its own login, which stays on demand and which it neither
supervises nor restarts. It is started on demand by dashboard or installed skill entry
points, retained outside removable worktrees, and independent of Vite/browser
lifetime. A private per-user local endpoint and singleton lease identify one
owner. Clients verify protocol/runtime compatibility and project/session
binding before acknowledgment. A retained installed launcher watches the runtime child and restarts a failed
owner with bounded backoff. The launcher does no provider observation or AI
work. Replacement verifies the old owner and its exact upstream children have
ended/reconciled, then takes a fenced generation; PID existence alone is not
ownership. Launcher loss/reboot is resumed by the next installed, status or
dashboard entry. That unobserved interval remains a visible gap, reconciled
before completion; no unattended reboot-resurrection promise is inferred.

Reuse existing machine-JSON write discipline and mailbox ordered records,
extending them for recoverable ownership rather than inventing a second
journal. Keep native session identity/continuation in one retained session
representation: evolve current launch persistence to accommodate standalone
origin without fabricating a dashboard launch request. Subscription records
reference that binding. For a claim accepted before native launch, retain a
pending binding by the existing execution/start identity, reusing pending-native
reporting semantics. Store coverage while delivery is held, then bind exactly
the launched recipient; never discover a newest session by story/repository.
An authorized coordinator transfer requires a new binding generation preserving
obligations and revoking the old route, not silent rebinding. Dashboard launch/report receipts stay adapters of their
current authorization contract, not a competing CI registry. Active obligations
pin required records past normal retention.

The local protocol accepts fixed domain operations, not arbitrary commands,
paths or upstream URLs. Preserve the dashboard's loopback/same-origin/project
refusal. Standalone enrollment verifies repository, execution ownership and
native recipient through the installed entry path. Authenticate local callers,
protect endpoint/state for the same OS user, and keep credentials out of
receipts, browser state and persisted request keys.

### Domain-to-code responsibility map

New module names below are proposed responsibilities, not existing files.
Place shared runtime sources/dependencies in the declared installed payload;
use the existing execute-plan script graph unless modularization proves a
narrower shared home. Dashboard and host imports consume it, never copy it.

| Story concept | Existing candidate and planned ownership |
| --- | --- |
| Session binding | `dashboard/src/sessionReference.ts`, `hostSession.ts`, host identity and continuation modules. Expose the shared installed contract once; generalize retained session storage for standalone origin. Host adapters own native route validation. |
| Monitoring subscription | `ci-observer-owner.mjs`, `ci-mailbox-store.mjs`, `ci-mailbox-revision-coverage.mjs`, `launchRecordStore.ts`/`machineJsonStore.ts`. A runtime supervision module owns subscription transitions; mailbox compatibility reads do not claim it as a host-hook observer. |
| Accepted publication | `execution-increment-delivery.mjs`, `execution-increment-resume.mjs`, `history-preserving-publication.mjs`, installed landing/closure receipts. Retain operation ID, accepted evidence and publication sequence outside the worktree; registration recovers from these receipts. |
| CI evidence | `watch-ci-execution.mjs`, `ci-runs.mjs`, `ci-failures.mjs`, applicability/coverage classifiers. Reuse normalization and classification; separate shared acquisition evidence from per-subscription delivery dedup. |
| Failure delivery | Current Codex first-input intent/reconciliation, Claude attachment, Cursor terminal transport behind one session delivery port. Runtime owns durable delivery intents; hosts return accepted evidence, refusal or uncertainty. |
| Failure disposition | Existing `ci-monitor.md` handling and repair publication. One installed reporting operation records disposition/repair links; the supervisor does not diagnose test defects or invent repair authority. |
| Completion boundary | Existing completion record/report and `trunk-closure.mjs`/wrap-up integration. One runtime completion decision uses explicit acknowledged-publication fence and generation. Dashboard quiet-Done projection consumes that result. |
| Retirement request | `dough-land/scripts/worktree-retirement.mjs`; retain repository management context and closure authority outside the checkout. No duplicate cleanup checks in dashboard/runtime. |
| GitHub request admission | Delivered: `github-requests.mjs` and the request owner modules beside it, one owner process per API host and login. The runtime acquires CI evidence through `ci-github-actions.mjs`; it adds no admission of its own. |

### GitHub transport and ownership

Delivered and unchanged by this plan: every Open Dough GitHub request is an
explicit `gh api` request admitted by the request owner of its API host and
login, with eight turns, directed cooldown, exponential fallback, one recovery
probe, a hold that survives owner replacement, and reconciliation of an
earlier owner's children. A known hold suspends acquisition instead of
counting toward the observer's three-error loss path. Agent diagnostics use
`ci-github-diagnostic.mjs`.

What remains here: the runtime asks under its own environment's login, so a
subscription whose session used another login needs a decision in slice 3 —
serve it from a runtime started under that login, or name a gap. Registration
can request one shared recheck but cannot bypass admission. Poll only while
unsettled obligations need acquisition; dormant enrollment needs no periodic
GitHub reads. Mixed installed versions must still leave one owner per login:
a newer install replaces an older owner through the existing generation claim,
carrying its stored hold, and an older consumer that meets a newer owner gets
a named failure, never a second allowance (obligations G12 and G22).

Share acquisition by repository/target/provider/auth context and cadence where
requests are equivalent; keep subscription evidence and delivery ownership
separate. A failure seen by one subscription cannot suppress another's event.
Pending/no-run evidence remains refreshable; terminal evidence is attempt-specific
and later attempts remain discoverable. Stop acquisition only when no subscriber
needs it. Preserve bounded observation and visible budget expiry.

### Publication, completion and native delivery integrity

Retain publication intent before push, exact accepted receipt after confirmed
acceptance, and idempotent registration before coverage acknowledgment. Resume
never infers publication from current HEAD or a moving target tip. Completion
submits the acknowledged publication IDs/targets and a generation; service
arrival order or alphabetic coverage filenames cannot establish the final SHA.
Reserve the next boundary generation before admitting repair work or a new
publication, so runtime settlement cannot race an active writer. An accepted
repair then binds that generation to its new acknowledged publication fence. Recover missing registration instead of fencing past it.

Every covered publication needs applicable terminal evidence or a disposition
per existing guidance; the final boundary needs affirmative effective success.
Unresolved older failures, missing evidence, uncertain delivery and attention
hold settlement. A failure disposition may link an owned repair, whose relevant
CI must settle; a newer unrelated green publication is insufficient. Preserve
ignored-only basis, incomplete/cancelled and infrastructure/flaky-test rules.

Write a stable failure delivery intent before the native call. Serialize sends
per recipient; confirm native acceptance with turn/message/history evidence.
Replayed events with accepted receipts are suppressed. Possible acceptance with
missing acknowledgment enters reconciliation; if the host cannot establish the
answer, hold uncertain delivery without blind retry. Avoid a claim of exactly
once across the native-call/storage crash window. Do not replace a session,
fork a running Claude session, overwrite a developer's composer, or inherit
Cursor Recover's replacement fallback. Host capability is specific to native
session form and continuation route, not just a host-name boolean.

Only actionable CI failure starts an agent turn. Coverage, throttle and
retirement gaps remain visible for developer judgment. Delivery/repair authorization has a durable generation, rechecked at dispatch.
Stop/delete revokes it before later sends. Already-dispatched input cannot be
promised recalled: retain accepted/revoked-after-dispatch or uncertain evidence
and reconcile it without resending. A missing worktree or session yields a gap;
supervision never recreates them. A retirement permit uses the same per-execution
transition serialization as publication/repair admission, so active owned writers
or a newly reserved generation prevent cleanup.

## Current decisions

- One installed machine runtime owns supervision; dashboard and standalone are
  origins, not separate observation policies. GitHub admission belongs to the
  delivered request owners, one per API host and login.
- The source story's domain model is used directly at persistence/protocol/UI
  boundaries; host adapters contain only native identity/input transport.
- Shared acquisition does not share execution ownership or failure disposition.
- Completion uses an explicit acknowledged-publication generation/fence; only
  settled closure plus retained authority permits existing retirement.
- Uncertain delivery reconciles or remains visible; exactly-once native input
  is not claimed without evidence. No fallback watcher or final wait.
- Host/form feasibility must precede dependent behavior; Claude is observed
  first without excluding the other promised hosts from acceptance.
