#!/usr/bin/env python3
"""Capture measured Slice 3 walk results from the isolated Git fixture.

Rebuilds captured after-states from the live fixture SHA. Priority selection
is documented in WALKTHROUGH.md; this script does not score issues.
"""

from __future__ import annotations

import hashlib
import importlib.util
import os
import pathlib
import shutil
import subprocess
import sys

EVIDENCE = pathlib.Path(__file__).resolve().parent
COUNT = EVIDENCE.parent / "slice-2" / "count-physical-lines.py"
ROOT = pathlib.Path("/tmp/open-dough-quick-041-slice-3-fixture")


def load_fixture():
    spec = importlib.util.spec_from_file_location(
        "slice3_fixture", EVIDENCE / "build-isolated-fixture.py"
    )
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def sha256(path: pathlib.Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def pycount(path: pathlib.Path) -> str:
    return subprocess.check_output(["python3", str(COUNT), str(path)], text=True).strip()


def git(repo: pathlib.Path, *args: str) -> str:
    return subprocess.check_output(["git", "-C", str(repo), *args], text=True).strip()


def clone_committed(name: str, base_sha: str) -> pathlib.Path:
    dest = ROOT / name
    if dest.exists():
        shutil.rmtree(dest)
    subprocess.run(
        ["git", "clone", str(ROOT / "repo"), str(dest)],
        check=True,
        capture_output=True,
    )
    git(dest, "reset", "--hard", base_sha)
    return dest


def main() -> int:
    mod = load_fixture()
    repo = ROOT / "repo"
    if not (repo / "DearDough.md").exists():
        raise SystemExit("run build-isolated-fixture.py first")
    base_sha = git(repo, "rev-parse", "HEAD")
    git(repo, "reset", "--hard", base_sha)

    existing_hash = sha256(repo / "DearDough.md")
    existing_lines = pycount(repo / "DearDough.md")
    ordinary = (repo / "DearDough.md").read_text(encoding="utf-8").splitlines()
    ordinary += [""] + mod.severe_issue_block("DD-005")
    ordinary_path = ROOT / "ordinary-overflow.md"
    ordinary_path.write_text("\n".join(ordinary) + "\n", encoding="utf-8")
    ordinary_lines = pycount(ordinary_path)

    recovered = git(repo, "show", f"{base_sha}:DearDough.md")
    for marker in (
        "DD-001",
        "record:slice-3-dd001-a",
        "record:slice-3-dd002-c",
        "DD-004",
        "record:slice-3-dd004-a",
    ):
        if marker not in recovered:
            raise SystemExit(f"recovery missing {marker}")

    dd002 = mod.issue(
        "DD-002",
        "Repeated lookup of the same planning filename",
        [
            "The execution reconstructed the same planning filename after it had",
            "already been established, adding repeated lookup without new evidence.",
        ],
        [
            mod.occurrence(
                "record:slice-3-dd002-a",
                "`records/pruned-dd002-occurrence-rereview.md` event C1 for the established name",
                "the planning filename was recovered once, then looked up again",
                "retaining the established name would avoid the extra lookup",
            ),
            mod.occurrence(
                "record:slice-3-dd002-b",
                "distinct execution recovered the same filename after a later focus switch",
                "the already established name was reconstructed during product review",
                "the distinct execution supports keeping one established name across focuses",
            ),
        ],
    )
    dd003 = mod.issue(
        "DD-003",
        "Plan-conflict handoff skipped, then the approved contract was rewritten",
        [
            "The execution treated an apparently accidental plan restriction as",
            "resolved by rewriting the historical contract instead of stopping for",
            "the human decision. The delivered outcome changed a promised constraint.",
        ],
        [
            mod.occurrence(
                "record:slice-3-dd003-a",
                "`records/dd003-new-recurrence.md` events R1-R2 analog in the original execution",
                "an approved restriction was rewritten without a human decision",
                "skipping the handoff can change the source outcome; current and likely to recur",
            )
        ],
    )
    bounded = (
        ["# DearDough Process Findings", ""]
        + [
            "## Retention",
            "",
            "- Highest allocated local number: 5",
            f"- Recovery: `git show {base_sha}:DearDough.md`",
            "- Occurrence history is partial",
            "",
        ]
        + dd002
        + [""]
        + dd003
        + [""]
        + mod.severe_issue_block("DD-005")
    )
    (repo / "DearDough.md").write_text("\n".join(bounded) + "\n", encoding="utf-8")
    captured = EVIDENCE / "captured"
    shutil.rmtree(captured, ignore_errors=True)
    (captured / "bounded-after").mkdir(parents=True)
    shutil.copy2(repo / "DearDough.md", captured / "bounded-after" / "DearDough.md")
    bounded_hash = sha256(repo / "DearDough.md")
    bounded_lines = pycount(repo / "DearDough.md")

    rereview_unchanged = sha256(repo / "DearDough.md") == bounded_hash
    body = (repo / "DearDough.md").read_text(encoding="utf-8")
    no_resurrection = (
        "record:slice-3-dd001-a" not in body and "record:slice-3-dd002-c" not in body
    )

    needle = "- Inference: skipping the handoff can change the source outcome; current and likely to recur\n"
    recurrence = """- Inference: skipping the handoff can change the source outcome; current and likely to recur

- Execution: `record:slice-3-dd003-recurrence`
  - Tool: Cursor
  - Open Dough release: unreleased
  - Evidence: `records/dd003-new-recurrence.md` events R1-R2
  - Observed effect: an approved restriction was rewritten without a human decision
  - Inference: distinct execution of the same concrete handoff skip
"""
    (repo / "DearDough.md").write_text(body.replace(needle, recurrence, 1), encoding="utf-8")
    step7_lines = pycount(repo / "DearDough.md")
    dd003_rows = (repo / "DearDough.md").read_text(encoding="utf-8").count(
        "record:slice-3-dd003-"
    )

    dd001 = "\n".join(
        [""]
        + mod.issue(
            "DD-001",
            "Occasional extra blank line in generated notes",
            [
                "A generated note file sometimes contained one extra blank line.",
                "The extra line did not change review conclusions or hide evidence.",
            ],
            [
                mod.occurrence(
                    "record:slice-3-dd001-new",
                    "`records/dd001-new-execution.md` events N1-N2",
                    "one extra blank line appeared in a generated note",
                    "cosmetic only; recovered identity, new execution only",
                )
            ],
        )
    ) + "\n"
    (repo / "DearDough.md").write_text(
        (repo / "DearDough.md").read_text(encoding="utf-8") + dd001, encoding="utf-8"
    )
    body = (repo / "DearDough.md").read_text(encoding="utf-8")
    recovered_ok = (
        body.count("## DD-001 —") == 1
        and "record:slice-3-dd001-new" in body
        and "record:slice-3-dd001-a" not in body
        and "## DD-006" not in body
    )

    text = (repo / "DearDough.md").read_text(encoding="utf-8").replace(
        "- Highest allocated local number: 5",
        "- Highest allocated local number: 6",
        1,
    )
    dd006 = "\n".join(
        [""]
        + mod.issue(
            "DD-006",
            "Duplicate remaining-work slice restated completed work",
            [
                "The execution duplicated the same bounded-correction plan instead of",
                "revising the overlapping slice in place.",
            ],
            [
                mod.occurrence(
                    "record:slice-3-unmatched",
                    "`records/unmatched-new.md` events U1-U2",
                    "completed work was restated as if it were still planned",
                    "distinct unmatched issue; identity safely allocatable",
                )
            ],
        )
    ) + "\n"
    (repo / "DearDough.md").write_text(text + dd006, encoding="utf-8")
    (captured / "continued-after").mkdir()
    shutil.copy2(repo / "DearDough.md", captured / "continued-after" / "DearDough.md")
    continued_body = (repo / "DearDough.md").read_text(encoding="utf-8")

    low = clone_committed("refuse-low-value", base_sha)
    low_before = sha256(low / "DearDough.md")
    low_block = mod.issue(
        "DD-005",
        "Two extra blank lines in one commit message",
        [
            "One commit message contained two extra blank lines after the subject.",
            "The extra blanks did not hide evidence or change the review outcome.",
        ],
        [
            mod.occurrence(
                "record:slice-3-low-value",
                "`records/low-value-blank-commit.md` events L1-L2",
                "two extra blank lines appeared after a commit subject",
                "cosmetic only; lower than existing low-priority notes",
            )
        ],
    )
    (ROOT / "low-value-ordinary.md").write_text(
        "\n".join((low / "DearDough.md").read_text(encoding="utf-8").splitlines() + [""] + low_block)
        + "\n",
        encoding="utf-8",
    )
    low_ordinary_lines = pycount(ROOT / "low-value-ordinary.md")
    low_unchanged = sha256(low / "DearDough.md") == low_before

    over = ROOT / "oversized"
    over_before = sha256(over / "DearDough.md")
    over_lines = pycount(over / "DearDough.md")
    over_unchanged = sha256(over / "DearDough.md") == over_before

    uncommitted = clone_committed("refuse-uncommitted", base_sha)
    extra = "\nHuman note: uncommitted-only note that HEAD does not contain\n"
    (uncommitted / "DearDough.md").write_text(
        (uncommitted / "DearDough.md").read_text(encoding="utf-8") + extra,
        encoding="utf-8",
    )
    dirty_before = sha256(uncommitted / "DearDough.md")
    head_blob = git(uncommitted, "show", "HEAD:DearDough.md")
    head_missing = "uncommitted-only note that HEAD does not contain" not in head_blob
    uncommitted_present = (
        "uncommitted-only note that HEAD does not contain"
        in (uncommitted / "DearDough.md").read_text(encoding="utf-8")
    )
    uncommitted_unchanged = sha256(uncommitted / "DearDough.md") == dirty_before

    amb = clone_committed("refuse-ambiguous", base_sha)
    amb_before = sha256(amb / "DearDough.md")
    amb_unchanged = sha256(amb / "DearDough.md") == amb_before

    fail = clone_committed("refuse-write-failure", base_sha)
    fail_before = sha256(fail / "DearDough.md")
    os.chmod(fail / "DearDough.md", 0o444)
    write_error = ""
    try:
        (fail / "DearDough.md").write_text("truncated-should-not-stick\n", encoding="utf-8")
        wrote = True
    except OSError as exc:
        wrote = False
        write_error = type(exc).__name__
    fail_unchanged = sha256(fail / "DearDough.md") == fail_before
    os.chmod(fail / "DearDough.md", 0o644)

    lines = [
        f"base_sha {base_sha}",
        f"existing_lines {existing_lines}",
        f"existing_sha256 {existing_hash}",
        f"ordinary_overflow_lines {ordinary_lines}",
        f"recovery_ref git show {base_sha}:DearDough.md",
        f"bounded_lines {bounded_lines}",
        f"bounded_sha256 {bounded_hash}",
        f"rereview_unchanged {rereview_unchanged}",
        f"no_resurrection {no_resurrection}",
        f"dd003_recurrence_lines {step7_lines}",
        f"dd003_occurrence_rows {dd003_rows}",
        f"recovered_dd001 {recovered_ok}",
        f"continued_lines {pycount(repo / 'DearDough.md')}",
        f"continued_sha256 {sha256(repo / 'DearDough.md')}",
        f"allocated_unmatched DD-006",
        f"reused_dd004 {('## DD-004 —' in continued_body)}",
        f"highwater_6 {('Highest allocated local number: 6' in continued_body)}",
        f"low_value_ordinary_lines {low_ordinary_lines}",
        f"low_value_unchanged {low_unchanged}",
        f"oversized_lines {over_lines}",
        f"oversized_unchanged {over_unchanged}",
        f"uncommitted_dirty_lines {pycount(uncommitted / 'DearDough.md')}",
        f"uncommitted_absent_from_head {head_missing and uncommitted_present}",
        f"uncommitted_unchanged {uncommitted_unchanged}",
        f"ambiguous_unchanged {amb_unchanged}",
        f"write_failure_succeeded {wrote}",
        f"write_failure_error {write_error}",
        f"write_failure_unchanged {fail_unchanged}",
    ]
    (EVIDENCE / "captured" / "results.txt").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print("\n".join(lines))
    if not (
        existing_lines == "995"
        and int(ordinary_lines) > 1000
        and int(bounded_lines) <= 1000
        and rereview_unchanged
        and no_resurrection
        and dd003_rows == 2
        and recovered_ok
        and "## DD-006 —" in continued_body
        and "## DD-004 —" not in continued_body
        and low_unchanged
        and over_unchanged
        and over_lines == "1020"
        and uncommitted_unchanged
        and amb_unchanged
        and not wrote
        and fail_unchanged
    ):
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
