I'll follow the installed `dough-update` skill for a normal newer-release update—no force, and without ADR awareness.Capturing the project path and recorded source, then pinning the latest numeric release per the updater.Recorded SOURCE is usable. Pinning the highest numeric release from that source next.Inspecting the pinned helper scripts to confirm they only write the declared public payload paths.Inspection looks good — writes stay on the declared payload paths. Running the ordinary apply helper next (no `--force`, no `--url`).Updated Open Dough from **0.2.1** to **0.2.2**.

| | |
| --- | --- |
| **Source** | `file:///var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/tmp.MOcayjbQtG/fixture-source` |
| **Release** | `v0.2.2` (`f84d84de1bf2f713bb6e7fffadf221d4051e6115`) |
| **Tool / root** | Cursor → `.cursor/skills/` |
| **Payload** | `.cursor/skills/dough-update/SKILL.md`, `.cursor/skills/dough-adr-awareness/SKILL.md` |
| **Previous** | `0.2.1` |
| **Outcome** | updated from 0.2.1 to 0.2.2 |

Start a fresh session in Cursor, then invoke `/dough-update` to use the updated guidance.
