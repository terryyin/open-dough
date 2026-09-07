# Agnix evaluation — 2026-09-07

**Recommendation: defer adoption as a required check; retain for occasional
advisory audits.** It found one concrete defect and one worthwhile policy
question, but its defaults produce too much noise for these projects. Do not
build a replacement yet; start with narrow deterministic checks if this need
recurs. This is a research recommendation, not an accepted ADR or execution plan.

## Trial and results

Ran the checksum-verified macOS ARM binary from [agnix v0.52.1](https://github.com/agent-sh/agnix/releases/tag/v0.52.1)
in temporary storage against the live Open Dough and Doughnut repositories.
No fixes, project configuration, dependencies, hooks, or editor integrations
were installed. This note is the only file added by this evaluation.

| Project / scan | Files checked | Errors | Warnings | Info |
| --- | ---: | ---: | ---: | ---: |
| Open Dough, defaults | 54 | 25 | 42 | 1 |
| Doughnut, defaults | 94 | 44 | 149 | 2 |
| Open Dough, scoped | 17 | 25 | 3 | 1 |
| Doughnut, scoped | 65 | 9 | 124 | 2 |

Default command: `agnix --format json .` from each project root. Scoped runs
added `--config /private/tmp/agnix-evaluation-20260907/scoped.toml`, containing:

```toml
tools = ["codex", "cursor", "claude-code"]
exclude = ["node_modules/**", ".git/**", "target/**", "tests/fixtures/**", ".planning/**", "packages/generated/**"]
```

No rules were suppressed. Scoping changes both files and applicable checks.
All four runs exited 1.

## Does the feedback make sense?

- **Real defect, high value:** `CUR-003` identifies invalid YAML in Doughnut's
  `.cursor/rules/unit-testing.mdc:2`: the description starts with a quoted
  fragment followed by unquoted text. Ruby's independent Psych YAML parser
  also rejects it. Quoting the complete description would address the syntax;
  left unchanged. Actual Cursor loading behavior was not tested.
- **Useful policy question:** `CC-SK-006` flags Open Dough's Claude
  `release-version` skill for permitting model invocation. Explicit-only
  invocation is worth considering for release actions, but this is not a
  malformed skill or evidence of unauthorized execution; it already requires
  user intent.
  [Claude documents the optional invocation control](https://code.claude.com/docs/en/skills#control-who-invokes-a-skill).
- **False errors dominate:** all 67 `XML-001` errors across the default scans
  concern command placeholders, template placeholders, or generated generic
  type names—not intended XML. Open Dough repeats six placeholder findings
  across source and three installed copies. That is **67 of 69 errors**, not
  67 independent defects. Scoped scans still contain 32 such errors out of 34.
- **Context-blind warnings:** Doughnut's ten `CDX-AG-005` missing-file reports
  include rule basenames whose directory is explained in `AGENTS.md`, an
  illustrative `NN-slug` path, and even the version constraint `>=26.7`.
  `AGM-004` misses project context already in the opening paragraphs;
  portability warnings object to deliberately shared `.cursor/` references.
  Open Dough's precedence warning misses the `CLAUDE.md` → `@AGENTS.md` import.
- **Writing heuristics need human judgment:** Doughnut receives 64 overlapping
  negative-instruction warnings. Some flag an “Avoid” example followed by
  “Prefer”, or a prohibition with its alternative already adjacent.
  “Normally” in “displayed normally” is treated as ambiguous frequency.
  Eight file-size warnings are useful review prompts, not proof of harm.

Reviewed every error category and representative source context across all
warning categories; this was not an exhaustive labeling study or a recall test.

## Coverage and adoption limits

A direct scan of Doughnut's `.claude/skills` checked **zero files and exited 0**:
its 19 skill directories are symlinks. Scanning `.agents/skills` checked 35
files. The full scan reaches canonical content, but the zero-file success does
not establish coverage of Claude-specific checks through symlinked paths.

Native discovery, invocation/application, and intended behavior remain
**unverified in each of Codex, Cursor, and Claude Code**, as do installation,
updating, and coexistence of an integration. Static lint cannot replace those
acceptance checks.

Earlier market review: agnix had about 404 GitHub stars; no general linter
demonstrated industry-default adoption. Shared formats are more established
than best-practice lint policies.

## Revisit or build

Revisit after another real guidance-loading failure, or an upstream release
addressing Markdown placeholders, contextual paths, and symlink scan coverage.
Require useful findings to dominate triage on both projects before making
selected rules blocking; keep writing checks advisory.

If failures recur, consider a small shared validator for YAML/frontmatter,
resource references, installation drift, and discovery coverage. It should
understand placeholders and symlinks, deduplicate installed copies, and separate
format requirements from preferences. Compare a narrow agnix configuration or
upstream fixes first. No scheduled monitor or implementation was started.

## Reproduction context

Open Dough HEAD: `22b65e63090836b5441c8b4c9a4b3e8afd271d50`;
Doughnut HEAD: `151b81bd0839a29273c4c0e5c489456971070ac7`.
Scans included working-tree files: a parallel task had added Doughnut's
`dough-update` and `dough-adr-awareness` skills before the scans and edited
Open Dough Plan 015 during evaluation. Existing guidance hashes were unchanged
at the comparison check; this evaluation made no source edits.

Raw reports, configuration, binary, and before-state hashes are in
`/private/tmp/agnix-evaluation-20260907/` (temporary). Counts and conclusions
are preserved here.
