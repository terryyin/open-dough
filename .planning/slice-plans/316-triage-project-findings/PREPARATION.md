# Preparation evidence

Appendix of [this executable plan](PLAN.md); no independent execution state.

## Preparation observations and limits

Observed in the established preparation checkout at `e0c1a8dc` on 2026-10-19,
Node 24.21.0, with Homebrew Bash first on PATH. These settle current reusable
mechanisms, not future guidance-following behavior.

| Premise and consuming operation | Observation and result |
| --- | --- |
| Publication can accept a maintenance candidate without consuming unrelated default-checkout work | `PATH=/opt/homebrew/bin:$PATH npm test -- src/skills/dough-execute-plan/scripts/publication.test.mjs src/skills/dough-execute-plan/scripts/publication-checkout-maintenance.test.mjs src/skills/dough-execute-plan/scripts/publication-checkout-unavailable.test.mjs tests/update-adds-new-payload-skill.sh tests/payload-declaration-links.sh` exited 0. Inspected publication fixtures create local bare origins, publish real SHAs, read remote contents, and compare dirty/unpublished checkout contents. Refresh cases exercise actual fast-forward, repeat, preservation, and missing/unavailable checkout outcomes. |
| A new declared skill can arrive through the existing updater without a new platform mechanism | The same run's `update-adds-new-payload-skill.sh` creates older/newer local release fixtures, invokes the real apply command, compares installed payload bytes in shared Codex/Cursor and Claude roots, verifies VERSION, and preserves sentinels. `payload-declaration-links.sh` also passed its undeclared-dependency counterexamples. This is delivery proof only. |
| Prior local/shared mistakes and stale fix prose are real inputs, not invented edge cases | Reused the [17-session review](../../../docs/maintainer/empirical-process-control-research.md#project-findings-workflow-follow-up). `git -C /Users/terryyin/git/doughnut show --stat --oneline 2381cf9e60` confirmed the correction returned shared findings and removed local stories. `git -C /Users/terryyin/git/pygardon show --stat --oneline 5911d5e76` confirmed story closure. Reading `scripts/pygardon-ci-discovery.mjs` and `ProjectFindings.md` there found five-second discovery with at most three reads alongside the stale one-second assessment. No claim about current endpoint performance or repair effectiveness follows. |

The last row is historical/design evidence from the named projects, not a claim
that their consuming CI operations were rerun. Implementation proof uses isolated
representative snapshots with actual classification and Git outcomes. No production
project is needed for the first implementation. Existing all-host installation
mechanisms can be reused, but the new entry point's native behavior is unproved.
Only a paid native observation can settle that latter premise; slice 1 bounds
the first such observation, and slice 3 owns the remaining affected-host proof.
No native sessions or paid observations ran during preparation.

During landing, trunk `0715a4a5` added Story 13 and clarified this delegated
explicit-invocation case. The content conflict was two additions at the end of
Story 12. Preserve both sections and the new queue order; include the caller's
propagated authority in first-use proof. This does not add a wrapper, project
discovery service, or cross-project write to this plan.

The canonical plan directory was empty after earlier wrap-ups. Git's allocated
plan paths end at 315; this plan uses 316 rather than reusing an earlier number.
