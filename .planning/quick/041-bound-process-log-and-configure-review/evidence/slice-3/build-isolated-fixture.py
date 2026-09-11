#!/usr/bin/env python3
"""Build disposable Git fixtures for Quick 041 Slice 3 retention proof.

Creates isolated repositories under --root (default
/tmp/open-dough-quick-041-slice-3-fixture). Does not write into this Open Dough
worktree's history or create its .planning/open-dough.json.
"""

from __future__ import annotations

import argparse
import os
import pathlib
import shutil
import subprocess
import sys

DEFAULT_ROOT = pathlib.Path("/tmp/open-dough-quick-041-slice-3-fixture")


def count_physical_lines(path: pathlib.Path) -> int:
    data = path.read_bytes()
    if not data:
        return 0
    return data.count(b"\n") + (0 if data.endswith(b"\n") else 1)


def occurrence(
    execution: str,
    evidence: str,
    effect: str,
    inference: str,
) -> list[str]:
    return [
        f"- Execution: `{execution}`",
        "  - Tool: Cursor",
        "  - Open Dough release: unreleased",
        f"  - Evidence: {evidence}",
        f"  - Observed effect: {effect}",
        f"  - Inference: {inference}",
    ]


def issue(code: str, title: str, description: list[str], occurrences: list[list[str]]) -> list[str]:
    lines = [f"## {code} — {title}", "", *description, "", "### Occurrences", ""]
    for index, row in enumerate(occurrences):
        lines.extend(row)
        if index != len(occurrences) - 1:
            lines.append("")
    return lines


def pad(prefix: str, count: int) -> list[str]:
    return [f"Human note: {prefix} {index:04d}" for index in range(1, count + 1)]


def build_base_log() -> str:
    header = ["# DearDough Process Findings", ""]
    dd001 = issue(
        "DD-001",
        "Occasional extra blank line in generated notes",
        [
            "A generated note file sometimes contained one extra blank line.",
            "The extra line did not change review conclusions or hide evidence.",
        ],
        [
            occurrence(
                "record:slice-3-dd001-a",
                "`records/pruned-dd001-rereview.md` event B1",
                "one extra blank line appeared in a generated note",
                "cosmetic only; no current action",
            )
        ],
    )
    dd002 = issue(
        "DD-002",
        "Repeated lookup of the same planning filename",
        [
            "The execution reconstructed the same planning filename after it had",
            "already been established, adding repeated lookup without new evidence.",
        ],
        [
            occurrence(
                "record:slice-3-dd002-a",
                "`records/pruned-dd002-occurrence-rereview.md` event C1 for the established name",
                "the planning filename was recovered once, then looked up again",
                "retaining the established name would avoid the extra lookup",
            ),
            occurrence(
                "record:slice-3-dd002-b",
                "distinct execution recovered the same filename after a later focus switch",
                "the already established name was reconstructed during product review",
                "the distinct execution supports keeping one established name across focuses",
            ),
            occurrence(
                "record:slice-3-dd002-c",
                "restates `record:slice-3-dd002-a` with no new locator or effect",
                "the same lookup was described again without additional evidence",
                "this row adds no learning beyond the first occurrence",
            ),
        ],
    )
    dd003 = issue(
        "DD-003",
        "Plan-conflict handoff skipped, then the approved contract was rewritten",
        [
            "The execution treated an apparently accidental plan restriction as",
            "resolved by rewriting the historical contract instead of stopping for",
            "the human decision. The delivered outcome changed a promised constraint.",
        ],
        [
            occurrence(
                "record:slice-3-dd003-a",
                "`records/dd003-new-recurrence.md` events R1-R2 analog in the original execution",
                "an approved restriction was rewritten without a human decision",
                "skipping the handoff can change the source outcome; current and likely to recur",
            )
        ],
    )
    dd004 = issue(
        "DD-004",
        "Verbose model identifier punctuation in one occurrence row",
        [
            "One occurrence used an extra comma in a model identifier line.",
            "The identifier remained readable and was not reused as evidence.",
        ],
        [
            occurrence(
                "record:slice-3-dd004-a",
                "one model line contained `GPT-5,`",
                "the extra comma did not affect matching or review",
                "one-off formatting; no current action",
            )
        ],
    )

    core_without_dd001_pad = header + dd001 + [""] + dd002 + [""] + dd003 + [""] + dd004
    core_count = len(core_without_dd001_pad)
    # Two extra blank lines will be inserted after DD-001 notes and after DD-004
    # notes so padding sits inside those issues. Target 995 including those blanks.
    remaining = 995 - (core_count + 2)
    if remaining < 2:
        raise SystemExit(f"core too large: {core_count}")
    dd001_pad, dd004_pad = remaining // 2, remaining - remaining // 2
    lines = (
        header
        + dd001
        + [""]
        + pad("dd001-low", dd001_pad)
        + [""]
        + dd002
        + [""]
        + dd003
        + [""]
        + dd004
        + [""]
        + pad("dd004-low", dd004_pad)
    )
    if len(lines) != 995:
        raise SystemExit(f"expected 995 lines, built {len(lines)}")
    return "\n".join(lines) + "\n"


def severe_issue_block(code: str) -> list[str]:
    return issue(
        code,
        "Failed write retry silently discarded uncommitted user edits",
        [
            "After a process-log write failed, a retry truncated the destination",
            "and reconstructed it from an incomplete candidate, dropping uncommitted",
            "human notes that existed only in the working tree.",
        ],
        [
            occurrence(
                "record:slice-3-severe",
                "`records/severe-failed-write-retry.md` events S1-S3",
                "uncommitted human notes were absent after the retry",
                "a failed write must leave original bytes unchanged; currently actionable",
            )
        ],
    )


def build_oversized_log() -> str:
    header = ["# DearDough Process Findings", ""]
    issues: list[str] = []
    for number in range(1, 9):
        code = f"DD-{number:03d}"
        rows = []
        for row in range(1, 5):
            rows.append(
                occurrence(
                    f"record:slice-3-over-{number:02d}-{row}",
                    f"unique locator OV-{number:02d}-{row} for a contract rewrite",
                    "an approved restriction was rewritten without a human decision",
                    "high impact, currently actionable, distinct evidence",
                )
            )
        issues.extend(
            issue(
                code,
                f"Approved contract rewritten without a handoff ({number:02d})",
                [
                    "A promised constraint was changed without stopping for the human",
                    f"decision. Unique issue {number:02d} is not a duplicate of the others.",
                ],
                rows,
            )
        )
        issues.append("")
    lines = header + issues
    remaining = 1020 - len(lines)
    if remaining < 0:
        raise SystemExit(f"oversized core too large: {len(lines)}")
    # Remaining lines are additional unique high-impact occurrence tails, not
    # cosmetic pads, so they stay decisive evidence.
    extra = []
    for index in range(1, remaining + 1):
        extra.append(
            f"- Execution: `record:slice-3-over-extra-{index:04d}`"
        )
        extra.append("  - Tool: Cursor")
        extra.append("  - Open Dough release: unreleased")
        extra.append(
            f"  - Evidence: unique locator OV-X-{index:04d} skipped a required handoff"
        )
        extra.append(
            "  - Observed effect: an approved restriction was rewritten without a human decision"
        )
        extra.append(
            "  - Inference: high impact, currently actionable, distinct evidence"
        )
        extra.append("")
    extra = extra[:remaining]
    lines = header + issues + extra
    if len(lines) != 1020:
        # Trim or extend with unique evidence locators that remain high-value.
        if len(lines) > 1020:
            lines = lines[:1020]
        else:
            while len(lines) < 1020:
                n = 1020 - len(lines)
                lines.append(f"Evidence locator OV-FILL-{n:04d}: contract rewrite without handoff")
    if len(lines) != 1020:
        raise SystemExit(f"expected 1020 lines, built {len(lines)}")
    return "\n".join(lines) + "\n"


def git(repo: pathlib.Path, *args: str) -> str:
    result = subprocess.run(
        ["git", "-C", str(repo), *args],
        check=True,
        capture_output=True,
        text=True,
    )
    return result.stdout.strip()


def init_repo(path: pathlib.Path, log_text: str, message: str) -> str:
    if path.exists():
        shutil.rmtree(path)
    path.mkdir(parents=True)
    git(path, "init")
    git(path, "checkout", "-b", "main")
    (path / "DearDough.md").write_text(log_text, encoding="utf-8")
    git(path, "add", "DearDough.md")
    env = {
        **os.environ,
        "GIT_AUTHOR_DATE": "2026-09-11T00:00:00 +0000",
        "GIT_COMMITTER_DATE": "2026-09-11T00:00:00 +0000",
    }
    subprocess.run(
        [
            "git",
            "-C",
            str(path),
            "-c",
            "user.name=Open Dough Slice 3 Fixture",
            "-c",
            "user.email=slice-3-fixture@example.invalid",
            "commit",
            "-m",
            message,
        ],
        check=True,
        capture_output=True,
        text=True,
        env=env,
    )
    return git(path, "rev-parse", "HEAD")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=pathlib.Path, default=DEFAULT_ROOT)
    args = parser.parse_args()
    root: pathlib.Path = args.root
    if root.exists():
        shutil.rmtree(root)
    root.mkdir(parents=True)

    base_text = build_base_log()
    oversized_text = build_oversized_log()
    (root / "generated-base.md").write_text(base_text, encoding="utf-8")
    (root / "generated-oversized.md").write_text(oversized_text, encoding="utf-8")

    base_sha = init_repo(root / "repo", base_text, "Commit 995-line process log")
    oversized_sha = init_repo(
        root / "oversized",
        oversized_text,
        "Commit 1020-line high-value process log",
    )

    base_lines = count_physical_lines(root / "repo" / "DearDough.md")
    oversized_lines = count_physical_lines(root / "oversized" / "DearDough.md")
    print(f"root={root}")
    print(f"base_sha={base_sha}")
    print(f"base_lines={base_lines}")
    print(f"oversized_sha={oversized_sha}")
    print(f"oversized_lines={oversized_lines}")
    if base_lines != 995 or oversized_lines != 1020:
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
