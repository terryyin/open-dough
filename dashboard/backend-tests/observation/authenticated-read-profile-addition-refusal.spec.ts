import { expect, test } from "vitest";
import { parseRequestedRead } from "../../server/requestedRead.ts";

const pin = "fa".repeat(20);
const profile = ".planning/agents/yui-chan.json";
const onlyProfile = "An addition read names only an agent profile path.";
const onlyPinned = "The pinned revision is not a commit sha.";
const onlyAddition =
  "An addition read names only a pinned revision and an agent profile path.";

test.each<[string, Record<string, string>, string]>([
  ["a moving ref", { revision: "main", path: profile }, onlyPinned],
  ["no pinned revision", { path: profile }, onlyPinned],
  [
    "another kind of record",
    { revision: pin, path: ".planning/PRODUCT-BACKLOG.md" },
    onlyProfile,
  ],
  [
    "directory traversal",
    { revision: pin, path: ".planning/agents/../secrets/yui-chan.json" },
    onlyProfile,
  ],
  ["a mixed revision check", { since: pin, path: profile }, onlyAddition],
  [
    "a story branch",
    { revision: pin, branch: "story/example", head: pin, path: profile },
    onlyAddition,
  ],
])(
  "refuses an addition read with %s before dispatch",
  (...[, query, message]) => {
    const params = new URLSearchParams({ ...query, committed: "added" });
    expect(parseRequestedRead(params)).toEqual({
      kind: "refused",
      status: 400,
      message,
    });
  },
);
