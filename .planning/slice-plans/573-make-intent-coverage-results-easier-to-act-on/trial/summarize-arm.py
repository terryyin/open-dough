#!/usr/bin/env python3
"""Summarize one trial arm's stream and meta into arm-summary.md facts."""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path


def main() -> int:
    arm = Path(sys.argv[1])
    stream = arm / "stream.jsonl"
    usage = {
        "input_tokens": 0,
        "output_tokens": 0,
        "cache_read_input_tokens": 0,
        "cache_creation_input_tokens": 0,
    }
    bash_cmds: list[str] = []
    model = None
    result_text = ""
    rate_limit = None
    tool_calls = 0

    if stream.exists():
        for line in stream.read_text(errors="replace").splitlines():
            line = line.strip()
            if not line:
                continue
            try:
                ev = json.loads(line)
            except json.JSONDecodeError:
                continue
            if ev.get("type") == "assistant":
                msg = ev.get("message") or {}
                model = model or msg.get("model")
                u = msg.get("usage") or {}
                for k in usage:
                    usage[k] += int(u.get(k) or 0)
                for part in msg.get("content") or []:
                    if not isinstance(part, dict):
                        continue
                    if part.get("type") == "tool_use":
                        tool_calls += 1
                        if part.get("name") == "Bash":
                            cmd = (part.get("input") or {}).get("command")
                            if cmd:
                                bash_cmds.append(cmd)
            elif ev.get("type") == "result":
                result_text = ev.get("result") or result_text
            elif ev.get("type") == "rate_limit_event":
                rate_limit = ev.get("rate_limit_info")

    extract = (arm / "result-extract.txt").read_text(errors="replace") if (arm / "result-extract.txt").exists() else ""
    body = result_text or extract
    meta_start = (arm / "meta-start.txt").read_text(errors="replace") if (arm / "meta-start.txt").exists() else ""
    meta_end = (arm / "meta-end.txt").read_text(errors="replace") if (arm / "meta-end.txt").exists() else ""

    def meta(key: str, blob: str) -> str:
        for line in blob.splitlines():
            if line.startswith(key + "="):
                return line.split("=", 1)[1]
        return ""

    start_ms = meta("start_ms", meta_start)
    end_ms = meta("end_ms", meta_end)
    elapsed = ""
    if start_ms.isdigit() and end_ms.isdigit():
        elapsed = str(int(end_ms) - int(start_ms))

    verdict = ""
    for pat in (
        r"\*\*Outcome:\s*([^*]+)\*\*",
        r"Outcome:\s*([^\n]+)",
        r"\*\*(Caught|Assertion gap|Confirmed missing test path|Insufficient evidence)[^*]*\*\*",
    ):
        m = re.search(pat, body)
        if m:
            verdict = m.group(1).strip() if m.lastindex else m.group(0)
            break

    out = arm / "arm-summary.md"
    lines = [
        f"# Arm {arm.name}",
        "",
        f"- model: `{model}`",
        f"- host elapsed_ms (meta): {elapsed or 'unavailable'}",
        f"- claude_exit: {meta('claude_exit', meta_end) or 'unavailable'}",
        f"- tool_calls (assistant tool_use): {tool_calls}",
        f"- bash_commands: {len(bash_cmds)}",
        f"- tokens_exposed_in_stream: input={usage['input_tokens']} output={usage['output_tokens']} cache_read={usage['cache_read_input_tokens']} cache_creation={usage['cache_creation_input_tokens']}",
        f"- rate_limit: {json.dumps(rate_limit) if rate_limit else 'none observed in stream'}",
        f"- verdict_guess: {verdict or 'not parsed'}",
        "",
        "## Meta start",
        "```",
        meta_start.rstrip(),
        "```",
        "",
        "## Meta end",
        "```",
        meta_end.rstrip(),
        "```",
        "",
        "## Bash commands (truncated)",
        "",
    ]
    for cmd in bash_cmds[:40]:
        lines.append(f"- `{cmd[:300]}`")
    if len(bash_cmds) > 40:
        lines.append(f"- … {len(bash_cmds) - 40} more")
    lines.extend(["", "## Result body (head)", "", "```", body[:8000], "```", ""])
    out.write_text("\n".join(lines))
    print(out)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
