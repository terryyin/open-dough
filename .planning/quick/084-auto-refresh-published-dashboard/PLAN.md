# Keep published dashboard work fresh through one authenticated reader

Status: executing.

Identity: `SEED-026#auto-refresh-published-dashboard`

Source: [refined story](../../seeds/SEED-026-auto-refresh-published-dashboard.md#auto-refresh-published-dashboard).
Terry requested refinement, slice planning, and plan refinement if needed on
2026-09-23. This is planning authority only; no Take or implementation is
authorized by this plan.

## Goal and scope

A developer leaving the dashboard visible sees a new published `main` revision
for the selected project within 30 seconds when GitHub responds normally. An
unchanged revision causes no backlog, seed, or plan detail read. The displayed
revision and retrieval time remain truthful through progressive detail loading,
failure, hidden-page pauses, manual Refresh/Retry, and project switching.

Open Dough, Doughnut, and Pygardon use one loopback reader backed by the
launching person's authenticated `gh` access for initial, manual, detail, and
revision-only reads. Preserve one pinned Git revision per snapshot, catalog and
reachable-path restrictions, credential isolation, source-specific error
reporting, focus retention, and dev/built-preview parity. Remove the superseded
direct-browser GitHub reader and its unused test support after all callers
migrate. A missing `gh` login is an explicit read failure for any project.

The story observes `main` only. Execution-branch watching, webhook service,
dashboard sign-in/token entry, a configurable interval, durable server cache,
and cross-tab coordination are deferred. An in-memory ETag/SHA hint may avoid
repeated origin work but never becomes a source of project truth.

## Architecture and Proudly Found Elsewhere

Follow [North Star: one backlog interpretation, separate observation and
presentation](../../NORTH-STAR.md#one-backlog-interpretation-separate-observation-and-presentation),
updated for Terry's all-`gh` decision. Accepted [ADR 0002: Software development
lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
requires one coherent representation of the read responsibility and a dashboard
derived from published records. [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture.md)
remains Proposed; this plan does not accept it. No new ADR or North Star topic
is needed.

PFE inspected the dashboard's production read graph, callers, controlled HTTP
and `gh` fixtures, and the current UX documentation at
`17143fa26f7a58cbb072d8ea9c6f6e01b57bc043`:

| Responsibility | Existing owner and action |
| --- | --- |
| Catalog and selected project | `dashboard/src/publishedSource.ts` records the three repositories, `main`, and backlog paths; `App.tsx` owns selection, cancellation, last snapshot, and focus. Reuse those owners; retire the `access` split when all reads use `gh`. |
| Local authenticated boundary | `dashboard/server/privateRead.ts`, `ghRead.ts`, `privatePathAllowlist.ts`, and `localOrigin.ts` already validate catalog source, same-origin caller, pinned reachable paths, subprocess lifetime, and safe failures in dev and preview. Extend and rename this one boundary as needed; do not add a second proxy or expose credentials. |
| Snapshot and detail interpretation | `dashboard/src/publishedWork.ts`, `privateRead.ts`, `repositoryFileReads.ts`, `preparationEnrichment.ts`, and `fileContentCache.ts` already pin and interpret one revision. Reuse them for a known changed SHA; remove the public branch and `githubSource.ts` only after all callers migrate. An unchanged check must not enter backlog or detail enrichment. |
| Public and private proof | Public Playwright journeys currently intercept `api.github.com` through `githubOrigin.ts`; private boundary and page journeys use `support/privateReadServer.ts` and a synthetic `gh`. Extend the latter for all catalog sources, ETag/`304`, changed revisions, and request counts. Migrate affected public journeys without replacing the real App/readers with prebuilt snapshots. |

The common rule is one selected published source, one pinned revision, and one
reader. Temporary separate paths during migration are not an enduring design.

## Checked infrastructure assumption

The needed GitHub endpoint must return an ETag and allow an authenticated
conditional ref read through `gh api`. A read-only planning probe on 2026-09-23
ran this command from the owned workspace:

```sh
python3 - <<'PY'
import re
import subprocess
for repository in ('terryyin/open-dough', 'nerds-odd-e/doughnut', 'terryyin/pygardon'):
    endpoint = f'repos/{repository}/commits/main'
    first = subprocess.run(['gh', 'api', '--include', endpoint], capture_output=True, text=True)
    tag = re.search(r'(?im)^etag:\s*(.+?)\s*$', first.stdout)
    status = re.search(r'^HTTP/\S+\s+(\d+)', first.stdout, re.M)
    if first.returncode != 0 or not tag:
        print(f'{repository}: initial={status.group(1) if status else "missing"} etag={bool(tag)} conditional=skipped')
        continue
    second = subprocess.run(['gh', 'api', '--include', '-H', f'If-None-Match: {tag.group(1)}', endpoint], capture_output=True, text=True)
    answer = re.search(r'^HTTP/\S+\s+(\d+)', second.stdout + '\n' + second.stderr, re.M)
    print(f'{repository}: initial={status.group(1) if status else "missing"} etag=yes conditional={answer.group(1) if answer else "missing"} conditional_exit={second.returncode}')
PY
```

The critical postcondition was a first `200` with an ETag, followed by `304`
for unchanged `main`. Open Dough, Doughnut, and Pygardon each answered `200`
then `304`. `gh api` returned exit code 1 for each `304`; the reader must
classify its HTTP status before treating that exit as a failure. This proves
the observed endpoint behavior with current local `gh` access, not a lifetime
guarantee of GitHub availability or a zero-network-cost check. Reconfirm the
response shape in the controlled boundary proof.

## Proof ownership

| Final promise | Owning slice and observation |
| --- | --- |
| All three projects read through local authenticated `gh`; no browser credential or direct GitHub request; missing access is explicit | 1: real dev and built-preview page journeys with synthetic `gh`, browser request log, static asset inspection, and local-boundary refusal/lifecycle tests. |
| Pinned backlog, seed, and plan interpretation and project isolation survive the transport change | 1: public and private page journeys with different published records, source switches, and existing navigation/preparation assertions. |
| Unchanged checks use only a conditional revision request; changed `main` appears within 30 seconds with same-revision detail and stable focus | 2: controlled `gh` ETag/`304` and changed-SHA responses, virtual browser clock, call log, and real rendered snapshot. |
| Manual Refresh can retry same-revision unavailable detail; no old detail is borrowed | 1 preserves the manual read path; 4 proves recovery from a controlled unavailable detail. |
| Hidden pages pause, foreground resumes, and old-source work cannot leak | 3: controlled visibility, held subprocesses, source switching, and selected-project/focus observations. |
| Failure and rate-limit recovery preserve truthful evidence and bounded pacing | 4: controlled failed check and backlog answers, rate-limit direction, retained-snapshot status, manual Retry, and successful recovery. |
| Superseded read code/tests are removed and documentation describes actual behavior | 1 owns public transport removal; 4 owns final usage wording and full dashboard regression pass. |

Provider and `gh` fixtures may supply repository revisions, file bodies, ETags,
delays, and failures. They must not hand the UI a prebuilt `PublishedWork` or
skip the local read boundary when that boundary is the behavior under proof.

## Ordered slices

### 1. Read every project through the local authenticated boundary

Type: Behavior
Status: done

Behavior: With local `gh` access to a selected catalog project, opening or
manually refreshing the dashboard reads its published `main` backlog and
reachable details through the same local boundary for Open Dough, Doughnut,
and Pygardon. All displayed links and records remain pinned to the resolved
SHA. Missing access produces the selected project's safe, actionable failure;
no credential enters browser assets or responses.

Evolve the existing local boundary and client reader. Preserve catalog,
same-origin, reachable-path, timeout, cancellation, and safe-error rules.
Remove the public browser branch, unused `githubSource.ts`, and obsolete
browser-origin fixture code once affected callers use the unified path.
Migrate public page tests to the isolated fake-`gh` server harness without
weakening their membership, focus, accessibility, and navigation observations.

Proof: Exercise the real page in dev and built-preview launch modes with a
synthetic `gh` for each project; observe its `gh` arguments, rendered backlog
and detail, source evidence, pinned links, a missing-auth failure, and no
`api.github.com` browser request. Extend `private-read-boundary.spec.ts` and
`private-read-subprocess-lifecycle.spec.ts` for the common catalog boundary;
retain refusal-before-launch, path reachability, no-secret, disconnect, and
shutdown assertions. Run migrated project-selection, published-work, source
navigation, private overview/recovery, and readiness journeys plus dashboard
typecheck. Avoid treating a fixture's supplied SHA as proof that the page
actually selected and rendered the correct source.

Safe stopping point: all three projects remain readable and manually
refreshable through one source path; automatic checking can be added without
supporting two transports.

Delivered: one `/__authenticated-read` boundary
(`dashboard/server/authenticatedRead.ts`, `ghRead.ts`, `reachablePaths.ts`,
`pinnedTexts.ts`, `readFailureMessage.ts`; client
`dashboard/src/authenticatedRead.ts`) serves every catalog source; the
catalog's `access` split, `githubSource.ts`, and `githubOrigin.ts` are gone.
`gh` failures map to fixed safe messages (not logged in, rate limited, HTTP
status with access hint, unreachable, timed out, missing `gh`). A bounded
in-memory memo keyed by repository, pinned SHA, and path lets detail
reachability checks reuse the backlog read at that SHA; the membership read
always resolves `main` and reads the backlog afresh. Page journeys run under
`dashboard/tests/dashboardTest.ts`: a per-test fake GitHub behind the
synthetic `gh` and a built-preview server, failing any browser request to
`api.github.com`.

Accepted proof (coordinator-inspected):
`npx playwright test --config dashboard/playwright.config.ts dashboard/tests/authenticated-project-overview.spec.ts`
("authenticated project overview … (dev|preview launch mode)": per project
distinct SHA and records, exact `gh` argv pinned to `?ref=<sha>`, pinned
canonical links, not-logged-in failure with Retry, no `api.github.com`
request, credential marker absent from requests, responses, DOM, and built
assets); boundary, refusal, plugin-hook, and subprocess-lifecycle specs
`dashboard/tests/authenticated-read-*.spec.ts` for all three sources;
`dashboard/tests/project-read-recovery.spec.ts`; `npm run typecheck:dashboard`;
full `npm run test:dashboard` (81 passed after refactor).

Learnings for later slices: `runGh` returns stdout only and failure
classification would report `gh`'s exit-1 `304` as an HTTP failure, so the
revision-only operation must recognize `304` before classification. The
membership endpoint always resolves `main`; slice 2 needs a backlog read at
an already-known SHA. Add `--include`, ETag, and `304` answers in
`dashboard/tests/support/fakeGitHub.ts`. The implementer once observed, with
a virtual clock advanced during in-flight detail reads, the page left at
"Reading preparation…" past the browser's 30-second wait limit; unverified
and possibly pre-existing, but relevant to slices 2 and 4. Real `gh` failure
wording was classified against the synthetic `gh` only.

### 2. Refresh visible work only when the selected main revision changes

Type: Behavior
Status: done

Behavior: With a visible dashboard showing SHA A, scheduled authenticated
checks of the selected project's `main` at a cadence meeting the 30-second
target leave A and its retrieval time unchanged on an authorized `304` or
equivalent unchanged SHA, and request no backlog or details. When `main` moves
to B, the dashboard fetches one B-pinned backlog and its required details,
progressively renders them with B evidence, and preserves focus on a still
listed story.

Start with a 15-second visible-page check interval, leaving room for normal
read time within the 30-second user target; adjust only while preserving that
target and request pacing. Add one revision-only operation to the local
boundary. Handle the observed `gh api` exit-1 `304` as unchanged without
hiding actual errors. Reuse the
existing projection/enrichment pipeline with the already resolved B rather
than resolving `main` a second time. Keep ETag hints disposable and scoped by
catalog source. Let App own the visible-page schedule; avoid overlapping reads
and retain bounded pacing even after an error.

Proof: Extend the synthetic `gh` to answer ETag/`304` and changed-SHA reads.
Using the real page and a virtual clock, observe repeated unchanged checks in
the `gh` call log with zero backlog/seed/plan reads and unchanged source
evidence; publish B, advance the clock within 30 seconds, and observe B's
membership, detail, pinned links, and focus. Cover a changed ref during the
backlog read to prove B remains pinned. Assert `304` is not shown as a
failure. Run focused refresh, focus, preparation, boundary, and typecheck
regressions.

Safe stopping point: a visible page updates automatically on published `main`
changes and spends only revision checks during quiet periods; manual Retry and
the existing last-snapshot behavior remain usable.

Delivered: the boundary gained a revision check (`?source=<id>&since=<sha>`
answering `{revision, changed}`) using `gh api --include` with a per-source
in-memory ETag hint (`dashboard/server/revisionChecks.ts`); `ghRead.ts` reads
the included status line before failure classification, so `gh`'s exit-1
`304` is unchanged. A backlog read at a known SHA (`?source=<id>&revision=<sha>`)
lets a changed check read B without resolving `main` again. Request parsing
lives in `dashboard/server/requestedRead.ts`. Observation moved from `App.tsx`
into `dashboard/src/publishedObservation.ts` (`usePublishedObservation`),
which schedules one check 15 seconds after each settled read or check, never
overlapping a read. Pulled forward from slice 4 so a failure is neither hidden
nor permanent: a failed check marks the existing failed attempt (Retry) while
keeping the snapshot, and a later unchanged check clears it.

Accepted proof (coordinator-inspected):
`npx playwright test --config dashboard/playwright.config.ts dashboard/tests/auto-refresh.spec.ts dashboard/tests/authenticated-read-revision-check.spec.ts`
("auto refresh: quiet main is only checked, and newly published main appears
with its own detail and keeps focus": paused page clock stepped by
`passTimeUntilChecked` in `dashboard/tests/autoRefreshJourney.ts`, three
checks at about 15 seconds, conditional argv with A's ETag, zero content
reads, unchanged SHA and retrieval time, then B rendered with focus retained,
detail and links pinned to B, one conditional ref call plus B-pinned reads;
"main moving again while B's backlog is read leaves one snapshot pinned to
B, and the next check finds C"; boundary cases for `304`, same-SHA `200`,
moved SHA, per-source hints, rate-limit and missing-login failures,
refusals, and backlog at a known revision); `npm run typecheck:dashboard`;
full `npm run test:dashboard` (90 passed).

Learnings for later slices: the first check after each read is unconditional
because the membership read does not seed the ETag hint. Rate-limit direction
is not carried yet: `GhFailure` records only `rate-limited` and status, so
slice 4 must pass `X-Ratelimit-Reset`/`Retry-After` from the check's included
headers to the schedule. Slice 3 can gate the schedule effect in
`publishedObservation.ts` on visibility and use a zero delay on becoming
visible. Existing page specs run real timers, so a journey longer than 15
seconds could observe an extra `main` check. A read-only real `gh` probe
confirmed the `--include --jq .sha` shape for `200` and `304`;
`X-Ratelimit-Used` rose on some `304`s, so a check's allowance cost is
unproven; at 15 seconds one visible page makes at most 240 checks an hour.

### 3. Observe only the selected visible project

Type: Behavior
Status: planned

Behavior: A hidden page suspends scheduled checks, then checks promptly when
visible again. Switching projects cancels or ignores the old project's late
check/read and starts only the new project's observation. Focus remains stable
or the existing missing-work notice explains its loss.

Use App's existing cancellation and selected-project ownership so automatic
checks and full reads share one current source. Resume with one prompt check
after visibility returns, without overlapping an existing read. Do not add
presence, branch, or persistent server state.

Proof: In controlled browser journeys, hide/reveal the page and inspect the
`gh` call log for no hidden checks and one prompt foreground check. Hold and
release an old project's check and detail responses around a source switch;
assert the selected project's membership, SHA, retrieval time, focus, and
check schedule remain isolated. Reuse `project-read-isolation.spec.ts`,
`refresh-focus.spec.ts`, and subprocess-lifecycle cases at their real
boundaries. Run focused project selection, visibility, and typecheck checks.

Safe stopping point: the page checks only its selected visible source, and
late work from a previous source cannot change its displayed evidence.

### 4. Recover from failed automatic reads without misstating work

Type: Behavior
Status: planned

Behavior: A failed revision check or backlog read keeps the last successful
snapshot labeled with its original SHA and retrieval time and reports the
failed attempt. Automatic retries remain bounded and respect GitHub's
rate-limit direction when supplied. Success clears the failure; manual Retry
stays available, including for unavailable detail at the same revision.

Reuse App's attempt/snapshot separation and the local boundary's safe errors.
Carry rate-limit/reset direction to the scheduling owner where available,
without treating a `304` as a failure or retrying aggressively. Update
dashboard usage and test guidance to describe authenticated access,
automatic freshness, visible/hidden behavior, and retained-snapshot meaning.

Proof: In controlled browser journeys, fail a revision check, a B backlog
read, and a same-revision detail; issue a rate-limit response and restore
access. Inspect `gh` call counts and timing, accessible alert/status text,
retained A evidence, successful B evidence, manual Retry, and absence of
rapid retry. Reuse `read-failure-refresh.spec.ts` and `project-read-recovery.spec.ts` cases
at their real boundaries. Run the full dashboard suite, typecheck, lint, and
`git diff --check` after the shared transport and fixture migration.

Safe stopping point: failed reads cannot misstate published work, and
automatic checks recover without a tight retry loop.

## Current decisions and remaining work

- The browser receives only same-origin validated results; `gh` owns the
  authenticated GitHub call. An HTTP `304` is observed by the local boundary,
  which returns an unchanged-revision result to the browser.
- The selected source's SHA is the comparison key. A changed SHA triggers a
  B-pinned read even when the commit does not change planning files; unchanged
  SHA never triggers automatic detail reads. No execution branch is watched.
- The story is not complete after transport unification alone. Leave the
  backlog item queued until separately authorized execution claims it.

## Execution

- Mode: Story Branch Mode, executed by Claude Code on 2026-09-23 from Terry's
  `/dough-execute-plan 84` instruction. Replanning permission: unchanged
  planning authority (no `--replan`/`--no-replan`).
- Execution checkout: `/Users/terryyin/git/open-dough-worktrees/084-auto-refresh-published-dashboard`,
  branch `claude/084-auto-refresh-published-dashboard`, created by this
  execution from `origin/main` at `a9b3c647f9db7d28d6819446d3669d55ee0b5f76`.
  Originating and integration checkout: `/Users/terryyin/git/open-dough` (`main`).
- Claim: `2c80a051cd8b48b9a5fa03928057e06ef073864b` accepted on `origin/main`
  (`pendingCi: unobserved`; planning-only paths are CI-ignored).
- Increment target: `origin` `refs/heads/claude/084-auto-refresh-published-dashboard`.
- CI observer: GitHub Actions `ci.yml` / `CI`, mailbox
  `/tmp/dough-ci-501/watch-x41GQ4`, target branch
  `claude/084-auto-refresh-published-dashboard`.
- Published revisions: `dcb0944029136ae1b3893b8d61be1668b498bc84` (slice 1)
  on `origin/claude/084-auto-refresh-published-dashboard`.
- CI run 35862495063 on `dcb0944` failed only
  `src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery-resume-ownership.test.mjs`
  "ambiguous matching owners return a gap and preserve existing state"
  (`recovered` instead of `unobserved`, an observer-ownership timing race).
  This story changes no `src/`, `tests/`, or `scripts/` file; the dashboard
  and lint jobs passed. The Taken 085 execution owns that test's repair on
  `cursor/085-accept-delivery-evidence` (`6c08878`, `0c7df6a`), so no repair
  was made here.
