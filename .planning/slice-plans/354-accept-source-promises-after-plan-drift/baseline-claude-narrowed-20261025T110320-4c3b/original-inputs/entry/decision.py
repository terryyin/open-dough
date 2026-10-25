"""Assemble the entry decision from the supplied scan outcomes."""
import json
import sys
from pathlib import Path

EXCLUSION_DIMENSIONS = ("sector", "industry", "excluded_instrument", "outside_area", "relative_strength_gate")
HISTORY_REASONS = {"holdings": "already_held", "entry_orders": "already_ordered"}


def rank_key(row):
    newer_first = tuple(-int(part) for part in row["setup_date"].split("-"))
    return (row["ratio"], newer_first, row["symbol"])


def build_decision(inputs):
    blocked = {symbol: reason for key, reason in HISTORY_REASONS.items()
               for symbol in inputs[key]}
    ranked, excluded, history = [], [], []
    for candidate in inputs["candidates"]:
        symbol, setup = candidate["symbol"], candidate.get("setup")
        if setup is None:
            continue
        if candidate.get("filter"):
            if candidate["filter"] in EXCLUSION_DIMENSIONS:
                excluded.append({"symbol": symbol, "dimension": candidate["filter"]})
            continue
        if symbol in blocked:
            history.append({"symbol": symbol, "reason": blocked[symbol]})
            continue
        ranked.append({
            "symbol": symbol, "setup_date": setup["date"], "atr": setup["atr"],
            "buy_stop": setup["buy_stop"], "ratio": round(setup["atr"] / setup["buy_stop"], 6),
        })
    ranked.sort(key=rank_key)
    for position, row in enumerate(ranked, start=1):
        row["rank"] = position
    excluded.sort(key=lambda row: (row["symbol"], row["dimension"]))
    return {"market_session": inputs["market_session"], "rank_source": "low-risk baseline",
            "ranked": ranked, "excluded_candidates": excluded, "history": history}


if __name__ == "__main__":
    source = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).with_name("inputs.json")
    print(json.dumps(build_decision(json.loads(source.read_text())), indent=2))
