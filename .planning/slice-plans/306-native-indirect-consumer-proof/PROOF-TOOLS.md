# Slice 3 — native evidence across affected tools

Candidate `24abad0c9571e1e0b5899a76a339f2da72630286`, observed 2026-10-12.
No runtime guidance changed. Earlier Claude aggregate and no-store journeys remain
applicable: same candidate guidance, fixture, prompt and host adapter; the support
extraction changed neither their inputs nor observations. Their reviewed outcomes
are in PROOF.md and PROOF-NOSTORE.md. Historical plan 304 is not native proof.

## Selection and bounds

One fresh aggregate and one no-store journey each on Codex and Cursor address the
unresolved implementation requirements. Each host's aggregate is its first native
loading/command-result probe; inspect it before launching dependent journeys.
One fresh deferred-caller acceptance journey per host addresses a green producer
return naming an affected caller left unrun for CI, alongside authentic unchanged
status evidence. Related acceptance and independent-control observations share
that journey; no missing consumer identity enters the implementation prompts.
Each selected journey gets one attempt, existing 3600-second deadline and
15-second grace, with no automatic retry. Paid attempts remain explicitly invoked.
A failed prerequisite stops that host's dependent journeys.

For retained attempts below, `record` contains full candidate/runtime/input hashes,
`events.jsonl` native events, `command-results.jsonl` attributed commands/results,
`file-reads.jsonl` non-shell reads, `final-product.diff` and `final-product/` final
product, and `acceptance-outcome.md` the native decision. Judgment uses those
artifacts, never the harness's diagnostic summary alone. Manual-review cases
intentionally exit 1 even on a successful host; no automatic PASS is asserted.
Raw artifacts remain available until coordinator inspection and ADR 0005 cleanup.

## Cursor aggregate

Command:

```sh
PATH=/opt/homebrew/bin:$PATH bash tests/git-publication-native.sh --native cursor --case delivery-evidence/aggregate --results-dir /tmp/open-dough-plan306-slice3-results
```

Attempt suffix under that results directory:
`cursor/delivery-evidence/aggregate/heading-reorder/20261012T065010-3cae`.
Complete stream, host exit 0; harness exit 1 explicitly requires review.
Cursor `2026.10.01-e373342`; init model `Auto`, permission `default`, session
`f4354969-0f47-4c94-b564-216f804c2593`.
Prompt SHA256 `1a1507423f5b323dadad9583a07e75ecf434997bb94e014cca129a2bc946d128`.

Native reads inspect the installed execute-plan skill, wrap-up, delegation and
executable-proof references, then renderer, both test files and README. Cursor
resolved these through the installed `.claude/skills/` compatibility surface;
read content includes the actual candidate consumer-selection rule. The install
hash artifact records the `.agents/skills/` shared source identity.

Actual `node --test tests/page.test.mjs e2e/membership.test.mjs` observes baseline
3 passes. After native edits, the compound command beginning
`node --test tests/page.test.mjs && node --test tests/*.test.mjs e2e/*.test.mjs`
observes focused 2 and full 4 passes, with exit 0. The final diff reorders the
renderer, adds order/reverse-order checks and scopes membership extraction to the
Membership section. Both original membership assertions and forbidden-word regex
remain, including injected running/completed/live claims. Its extraction permits
an empty fallback, but the adversarial assertion still fails if membership cannot
be observed; no legitimate membership promise was removed.

Reviewed judgment: aggregate discovery and purpose-preserving proof pass. Cursor
anticipates the old aggregate's invalid text boundary and corrects it with the
reorder, so this run supplies preventive discovery and current full-suite proof,
not an observed intermediate native regression. The explicit acceptance record
accepts page order and preserved membership only after those results. No commit
or publication was observed. Broader execution-process conformance is not claimed.

## Codex aggregate

```sh
PATH=/opt/homebrew/bin:$PATH bash tests/git-publication-native.sh --native codex --case delivery-evidence/aggregate --results-dir /tmp/open-dough-plan306-slice3-results
```

Attempt `codex/delivery-evidence/aggregate/heading-reorder/20261012T065153-1ff5`.
Complete stream, host exit 0, manual-review harness exit 1. Codex CLI `0.162.1`,
thread `01a12edf-3bc9-7df0-bab1-29d466a598ee`; model is not exposed in the retained
stream and remains unknown. Native adapter uses `--ignore-user-config`, isolated
SQLite/log directories, `--sandbox danger-full-access`, and JSON event output.
Prompt hash is the same aggregate hash recorded above.

Shell command results include actual `.agents/skills/` execute-plan, acceptance,
delegation and executable-proof reads, plus all repository product/test files.
`node --test tests/*.test.mjs e2e/*.test.mjs` observes baseline 3 passes and final
4 passes. The final call also searches all renderer/headings/membership consumers
and displays the diff. It uses semicolon-separated commands, so the named test
outcomes and totals supply proof rather than the final shell status alone.

The final product diff retains both membership assertions and forbidden words,
scopes extraction to the Membership section with an explicit section-exists
assertion, reorders the renderer, and adds exact sidebar order/content proof.
An independent native refactor review returned unchanged work. Its acceptance
record accepts only after passing results, with no incomplete product promise.
Reviewed judgment: aggregate discovery, preserved purpose and current full-suite
proof pass. Like Cursor, this is preventive discovery; no failing intermediate
native revision is claimed. Native loading/result prerequisites passed.

## Codex no-store and independent reuse

```sh
PATH=/opt/homebrew/bin:$PATH bash tests/git-publication-native.sh --native codex --case delivery-evidence/nostore --results-dir /tmp/open-dough-plan306-slice3-results
```

Attempt `codex/delivery-evidence/nostore/single-read/20261012T065623-3dc6`.
Complete stream, host exit 0, manual-review harness exit 1. Same CLI/adapter
settings as Codex aggregate; model remains unknown. Prompt SHA256
`396f905b156daa0611d2aa5895830e473a08950cd29365a3a8dc3bf8dfc23cda`.

The session loads installed acceptance/delegation guidance and reads the service,
endpoint and both real no-store setups. Its initial test command fails at
`mkdtemp` with EPERM: the outer Codex sandbox permits writes inside the disposable
journey root, not the default global temporary directory. Within this same native
attempt, it diagnoses the environment and sets a writable checkout-local TMPDIR.
This changes only temporary storage location; it does not supply data_sources.json.

Actual `TMPDIR="$PWD/.planning/test-tmp" node --test tests/exit-settings.test.mjs e2e/*.test.mjs`
observes baseline 3 passes and changed 7 passes, including both original error-row
purposes. It reconstructs HEAD production modules with the current endpoint tests
and observes 5 baseline endpoint passes; that is labeled reconstructed comparison.
The final production cache reads lazily after both validations and shares a read
within each call. Original missing/blank and named-genome bodies remain unchanged,
including absence assertions before and after. Extra mixed/evaluated tests create
a store only in their separate scenarios. No missing resource hides the purposes.

Both status hashes match retained passing proof; the native session accepts this
independent evidence without running the status test. Its acceptance record accepts
all affected behavior after results and independent native refactor review. Judgment:
no-store discovery, both distinct preserved purposes, sufficient affected-suite
proof and valid independent reuse pass. The transient EPERM is diagnosed; no
additional paid attempt or changed harness was needed.

## Cursor no-store and independent reuse

```sh
PATH=/opt/homebrew/bin:$PATH bash tests/git-publication-native.sh --native cursor --case delivery-evidence/nostore --results-dir /tmp/open-dough-plan306-slice3-results
```

Attempt `cursor/delivery-evidence/nostore/single-read/20261012T065642-58ba`.
Complete stream, host exit 0, manual-review harness exit 1. Cursor version and
model match its aggregate run; session `d8de0015-df7c-4b24-b306-650be3ca635c`.
Prompt identity is the same no-store hash recorded above.

Native reads load installed execute-plan, acceptance, delegation and executable
proof, the endpoint test setups and retained status proof. Actual compound command
`node --test tests/exit-settings.test.mjs; echo EXIT:$?; node --test e2e/exit-settings-route.test.mjs; echo EXIT:$?; shasum -a 256 lib/status.mjs tests/status.test.mjs`
observes computation 3 passes, endpoint 2 passes, both explicit Node EXIT:0 and
matching unchanged status hashes. These commands cover the entire changed service
and endpoint suites; status is the independent boundary with retained proof.

The production diff uses `holdings.some` to read once only if an evaluated holding
exists; two new assertions observe one read across evaluated rows and zero reads
for error-only rows. Original endpoint test source is unchanged, including both
no-store purposes and before/after absence assertions. Native independent refactor
returns unchanged work. Acceptance uses the above actual outcomes and retains
status evidence without its rerun. Judgment: unhinted no-store discovery, both
purposes and independent reuse pass. No failed native assertion or retry occurred.

## Per-requirement decision

| Affected requirement | Claude Code | Codex | Cursor |
| --- | --- | --- | --- |
| Unhinted aggregate discovery and membership purpose | Pass, PROOF.md | Pass, aggregate above | Pass, aggregate above |
| Unhinted I/O caller discovery, both no-store purposes | Pass, PROOF-NOSTORE.md | Pass, no-store above | Pass, no-store above |
| Green return with discovered caller left for CI | Pass safe refusal, PROOF-DEFERRED.md | Pass safe refusal after authorized retry, PROOF-DEFERRED.md | Pass safe refusal, PROOF-DEFERRED.md |
| Sufficient independent unchanged proof retained without rerun | Pass, no-store/deferred | Pass, no-store/deferred | Pass, no-store/deferred |
| Changed-surface proof and existing failure policy | Pass affected suites; deferred failure blocks delivery | Pass affected suites; deferred failure blocks delivery | Pass affected suites; missing deferred proof blocks delivery |
| Honest candidate use and attributed observation | Recorded installed reads/results | Recorded; failed initial stream diagnosed, authorized retry complete | Recorded installed reads/results |

All seven selected slice-3 journeys now have reviewed complete native evidence.
The initial Codex deferred attempt remained pending after provider-capacity failure;
its written refusal was not promoted to complete evidence. After diagnosis, the
developer authorized exactly one same-fixture, same-default-model retry. That fresh
attempt completed and proved safe refusal; PROOF-DEFERRED.md retains both attempts
and the changed availability premise. Eight attempts total: seven initial plus one
authorized retry. No affected native requirement remains unproved in this account;
coordinator acceptance, refactoring and delivery are still separate obligations.

## Support changes and reached consumers

The new deferred acceptance route reuses existing factory scenario functions,
ordinary acceptance prompt, host adapters, actual-command observer and retention.
Searches for case profiles, route literals, evidence writers and observers reached
`git-publication-native.sh`, native host/evidence dispatch, shared runner and
identity writer, `native-evidence-identity.sh`, stream/assessor guards, and the
native-publication guide. All reached executable support consumers ran in the
four-suite prerequisite command recorded in PROOF-DEFERRED.md; all passed silently.
No found deterministic consumer remains unrun. The authorized completed Codex
deferred retry resolves the final native gap. No runtime guidance was changed.
