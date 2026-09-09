# Open Dough maintainer guidance

Internal to this repository; do not distribute via the installer.

## Skill authoring

Use this guideline when adding or editing a skill. Spend time on the skill's
useful behavior; keep the surrounding process small.

### Naming

- Open Dough skills use `dough-<purpose>` in lowercase kebab-case. Do not add a
  second `dough-` prefix when the source name already has one.
- Internal maintainer skills use a clear kebab-case `name` without requiring the
  `dough-` prefix.
- The directory name matches the frontmatter `name`.

### Frontmatter

Every `SKILL.md` starts with YAML frontmatter that includes:

- `name` — the skill id (lowercase letters, digits, hyphens).
- `description` — what the skill does and when to use it, in third person, with
  concrete trigger terms so the host can select it.

### Layout

Keep shared behavior in one source with only the smallest platform adaptation.

| Kind | Source of truth | Platform roots |
| --- | --- | --- |
| Open Dough skills | `src/skills/<name>/` | Released client payload installs to `.agents/skills/` (Codex and Cursor share this root) and `.claude/skills/` |
| Internal skill | `.agents/skills/<name>/SKILL.md` | Claude Code may use a thin discovery pointer under `.claude/skills/<name>/` that defers to the shared source |

When changing Open Dough client-payload guidance, edit `src/skills/<name>/`.
Do not hand-synchronize this repository's installed managed copies under
`.agents/skills/` or `.claude/skills/`; update those only from a released
payload. Internal maintainer skills remain authored in `.agents/skills/`.

Recognition records live beside the Open Dough skill under `src/skills/` for
maintainers; the installer does not ship them. Do not invent a separate behavior
copy per tool.

Follow [ADR 0003](docs/adrs/0003-tagged-release-versioning-accepted.md) for
Proposed, Promoted, and Released guidance. Promotion changes payload
declarations, not source locations. Installed describes a client project copy.

### Runtime audience

Follow [ADR 0006](docs/adrs/0006-write-skills-for-executing-agents-accepted.md):
write published skills and rules for the agent working in this project, meaning
its task's established project, not the Open Dough source or skill directory.
“Client project,” “client payload,” recognition, extraction, and promotion are
maintainer concepts; do not export them as required runtime vocabulary. Keep
maintenance analysis in maintainer records. When a task needs multiple locations,
name the target project, installed skill directory, or Open Dough release source
explicitly. Preserve required project context and genuine missing-input checks.
Review descriptions, headings, examples, templates, and linked references for
the same perspective, including wording without the literal word “client.”

### References

- Link here from skills that author or review guidance (for example
  `extract-guidance`).
- Prefer repository-relative links. Point at paths supplied by the client project from skill
  prose; do not hard-code another project's layout or decisions into a reusable
  skill.

### Behavior review

Before treating a skill change as ready, walk one representative use and confirm:

1. **Invocation context** — the `description` and body make clear when the skill
   applies (and when it does not).
2. **Required context** — inputs supplied by the client project or repository are explicit; the
   skill stops usefully when they are missing.
3. **Useful outcome** — a concrete example produces the intended result (for
   conflict-aware skills: cite the conflict, stop the conflicting path, and leave
   the decision with a human).

Unusual host or delivery cases get manual attention when they arise.
Installation, update, and coexistence keep their own functional checks in the
stories that own them.

## Cross-tool delivery

Open Dough skills and rules must work in Codex, Cursor, and Claude Code.

- Keep one shared behavioral source; adapt only what a host requires to find or
  apply that source.
- Judge a conventional skill change by the behavior review above, not by a
  routine per-tool discovery recheck.
- When installation, update, or coexistence is in scope for the change, verify
  those outcomes with the checks those stories already define. Success on one
  tool does not prove another. File presence alone does not prove useful
  behavior.
