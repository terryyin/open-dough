# Slice 2 delivery-repair refactor check

[Active plan](PLAN.md). `/root/refactor_2_repair`, about 10 active minutes.
Outcome: none — already clean. No product or test edits by this pass; no
commit, push, formatter, hook or lint command. No unresolved gap or stop.

The incoming repair renames `dashboard/src/StoryNotes.tsx` to
`StoryNotesControl.tsx`, preserving its exported `StoryNotes` and component
body. `StoryCard.tsx:39` and `DoneStoryCard.tsx:36` import the new path.
The old filename remains only in historical consumer/proof records; no
runtime import retains it. `source-review.md` names the new component.
The test callback calls `attachment.print(output)` through its attachment,
and the retained screen handle is evaluated directly after close. The
original attachment, mounted-screen, output and focus assertions remain.

Read-only checks covered duplication, names, shared knowledge, live callers,
test boundaries and file sizes. The component/control name fits the domain;
`storyNotes.ts` remains the page-state owner. `localSettingState.ts` retains
the prior coherent cadence/sequence/generation seam. There is no new domain
representation, subsystem crossing, generator trigger or speculative code.
The failure/unreadable presentation remains the immediate next slice 3.
ADR 0008's machine-local evidence and ADR 0002's direct model are preserved.
All changed paths were checked with `wc -l`; none exceeds 250 lines
(`dashboard/README.md` is exactly 250). `git diff --check` passes.

The installed `test-entry-rules.mjs --project . --changed` resolved MakeMe
and page objects for the incoming frontend/E2E specs and their helpers.
Both selected conventions were read; current builders, explicit expectations,
service substitutes, held answers and focused UI mechanics satisfy them.
No test edits invalidate independent assertions or setup.

## Consumer trace

Installed command, from this checkout:

```sh
node .agents/skills/dough-execute-plan/scripts/consumer-trace.mjs --checkout . --base ab91ef3234f6c1a496bf309932ba327ad09ebb44 --term StoryNotes.tsx --term StoryNotesControl.tsx --term 'Terminal while notes open'
```

Complete generated discovery is inspectable at
`/tmp/open-dough-slice2-repair-consumer-trace.md`; the same full record with
all 858 rows explicitly disposed, none blank, is at
`/tmp/open-dough-slice2-repair-consumer-trace-disposed.md`.
Its 16 reused and 842 excluded rows retain terms and first matching lines.
The exclusions cover automatic generic plan/README/source-review filenames,
unrelated local close/hold/count/saved/subscribe methods, unchanged cadence
imports/build-fixture options, historical records, and unchanged server
stores/contracts. These are per-row reasons, not unexamined file-kind claims.
281 rows reuse or reassess a specific prior source/refactor disposition;
the remaining rows match only those generic groups, the historical review
completion report, or the unchanged server review-store basename.

Prior complete [source trace](slice-2-consumers.md) and
[shared-state trace](slice-2-refactor.md) retain the incoming implementation's
purpose mappings. Their historical old module paths remain baseline evidence;
the two actual current card imports above supersede their runtime path text.

| Affected purpose and boundary | Disposition and actual observation |
| --- | --- |
| Renamed UI module and its card imports; static contract | Reused fresh root-owned `npm run typecheck:dashboard`, passed after repair; export, props and state contracts unchanged. Formatter/project-service validation remains root-owned delivery work. |
| Every card's Notes, composer/list/count, blank rejection, captured POST, ordering, other-story isolation, focus and single announcement; real built frontend with external notes service | Reused fresh four-case notes command below, 4 passed in 9.5s; inspected `story-notes.spec.ts` desktop/phone and next-read setup/assertions plus `storyNotesPage.ts` observations. |
| Terminal attachment across open, use and close; real frontend with external program/socket | Reused the same fresh command's terminal case: independently counted attachment, original screen handle, output printed while modal is open, output after close and opener focus. Callback keeps its attachment receiver; no assertion was removed. |
| Shared note/review read cadence, stale/unknown/recovery and Board/sidebar sharing; frontend | Reused F in `slice-2-refactor.md`: 29 passed in 24.2s. Common state seam, review consumers, service answers, held-response ordering, independent card/cue assertions, touch/layout observations and resource setup are unchanged by the repair. |
| Real page/server notes persistence and review refresh/persistence/failed-save/ad-hoc cue behavior | Reused E in `slice-2-refactor.md`: 5 passed in 14.6s. Note component body, page owners, server/HOME setup, restart/read/save operations and observing E2E assertions are unchanged. |
| Server notes admission, schema and unreadable-file preservation | Reused slice-1 proof linked from `source-review.md`; exact server/store/contract/setup/assertion locations are unchanged. |

Fresh root-owned command reported and retained in
[slice-2 proof](slice-2-proof.md):

```sh
caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config dashboard/frontend.playwright.config.ts --reporter=list stories/story-notes.spec.ts
```

No accepted proof was invalidated by this independent pass; tests skipped —
no refactor edits. Reused resource decision: awake macOS on AC, 16 cores,
48 GiB, last load 7.37; focused default two-worker runs sequenced under
`caffeinate -s -i`, no competing owned heavy proof. No new expensive command
was launched. Reconsider if workload, contention, runtime or failures change.
No deferred required observation remains with this review.

## REFACTOR COMPLETE
