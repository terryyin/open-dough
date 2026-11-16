Updated Open Dough from `0.2.1` to `v0.2.2` using the installed updater’s ordinary update path. Both `.agents/skills/` (Codex and Cursor) and `.claude/skills/` (Claude Code) now record `0.2.2`. I verified all 317 declared payload files in each root against the pinned release. The updater removed no files from either root and found all host hook registrations current. [Full payload manifest](/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/tmp.9AORQ4gd7C/install.sh:3)

- **Recorded source** `file:///private/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/tmp.BKlyu7GIsZ/fixture-source`
- **Pinned commit** `9e3f294e734e755f5df49c37c228c24c74c20239`

Start a fresh Codex session, then invoke `$dough-update` to use the updated guidance.