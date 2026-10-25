import json
import subprocess
import unittest


def decision():
    return json.loads(subprocess.check_output(["python3", "entry/decision.py"], text=True))


def excluded(*rows):
    return [{"symbol": symbol, "dimension": dimension} for symbol, dimension in rows]


class DecisionTest(unittest.TestCase):
    def test_rank_follows_the_low_risk_baseline(self):
        ranked = decision()["ranked"]
        self.assertEqual([(row["rank"], row["symbol"]) for row in ranked], [(1, "BBB"), (2, "AAA")])
        self.assertEqual([row["ratio"] for row in ranked], [0.02, 0.03])

    def test_filtered_setups_appear_with_their_reason(self):
        result = decision()
        self.assertIn({"symbol": "CCC", "dimension": "relative_strength_gate"}, result["excluded_candidates"])
        self.assertIn({"symbol": "DDD", "dimension": "outside_area"}, result["excluded_candidates"])
        self.assertNotIn("CCC", [row["symbol"] for row in result["ranked"]])
        self.assertNotIn("DDD", [row["symbol"] for row in result["ranked"]])

    def test_excluded_list_keeps_existing_reasons_in_order(self):
        self.assertEqual(decision()["excluded_candidates"], EXPECTED_EXCLUDED)

    def test_candidates_without_a_setup_are_not_listed(self):
        result = decision()
        listed = [row["symbol"] for key in ("ranked", "excluded_candidates", "history") for row in result[key]]
        self.assertNotIn("NNN", listed)

    def test_history_keeps_its_reasons(self):
        self.assertEqual(decision()["history"], [
            {"symbol": "HHH", "reason": "already_held"},
            {"symbol": "OOO", "reason": "already_ordered"},
        ])


EXPECTED_EXCLUDED = excluded(
    ("CCC", "relative_strength_gate"), ("DDD", "outside_area"), ("EEE", "sector"),
    ("FFF", "excluded_instrument"), ("GGG", "industry"))
