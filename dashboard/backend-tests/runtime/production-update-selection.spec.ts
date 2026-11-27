// Update selection (../../server/productionUpdates.mjs) compares each
// published commit with the last activation; only activation advances it.
import { expect, test } from "vitest";
import { updateSelection } from "../../server/productionUpdates.mjs";

const published = (commit: string) => ({ origin: "/origin.git", commit });
const a = published("A");

// Qualification results by published range, as `baseline..selected`.
function rangesQualifying(results: Record<string, boolean | Error>) {
  const asked: string[] = [];
  const qualify = ({
    baseline,
    selected,
  }: {
    baseline: { commit: string };
    selected: { commit: string };
  }) => {
    const range = `${baseline.commit}..${selected.commit}`;
    asked.push(range);
    const result = results[range];
    if (result instanceof Error) return Promise.reject(result);
    if (result === undefined)
      return Promise.reject(new Error(`Unexpected range ${range}`));
    return Promise.resolve({ qualifies: result });
  };
  return { qualify, asked };
}

test("excluded ranges keep the last activation as the baseline and stay quiet until it changes", async () => {
  const { qualify, asked } = rangesQualifying({
    "A..D": false,
    "A..E": true,
    "E..T": false,
  });
  const updates = updateSelection(a, qualify);
  expect(await updates.select(a)).toBe("unchanged");
  expect(await updates.select(published("D"))).toBe("excluded");
  expect(await updates.select(published("D"))).toBe("already-excluded");
  expect(await updates.select(published("E"))).toBe("candidate");
  expect(updates.baseline).toEqual(a);
  updates.activated(published("E"));
  expect(await updates.select(published("T"))).toBe("excluded");
  expect(updates.baseline).toEqual(published("E"));
  expect(asked).toEqual(["A..D", "A..E", "E..T"]);
});

test("rejected ranges and unactivated candidates keep the baseline and are checked again", async () => {
  const { qualify, asked } = rangesQualifying({
    "A..P": new Error("has an unsupported CI push path policy"),
    "A..Q": true,
  });
  const updates = updateSelection(a, qualify);
  for (let check = 0; check < 2; check += 1) {
    await expect(updates.select(published("P"))).rejects.toThrow(
      "has an unsupported CI push path policy",
    );
    expect(await updates.select(published("Q"))).toBe("candidate");
    expect(updates.baseline).toEqual(a);
  }
  expect(asked).toEqual(["A..P", "A..Q", "A..P", "A..Q"]);
});
