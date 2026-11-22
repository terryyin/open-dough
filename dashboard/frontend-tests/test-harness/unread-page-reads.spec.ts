// Every page read a case leaves unsupplied rejects without reaching the
// network, so a case that touches a read it did not supply fails.
import { expect, onTestFinished, test, vi } from "vitest";
import type { PageReads } from "../../src/pageReads.tsx";
import { pageReadsSupplying } from "../../test-support/component-mount/unreadPageReads.ts";

// Each member of the page's reads, walked from the entry itself so a member
// added later is covered without naming it here.
function membersOf(value: unknown, path: string): [string, () => unknown][] {
  if (typeof value === "function")
    return [[path, (): unknown => Reflect.apply(value, undefined, [])]];
  if (typeof value !== "object" || value === null) return [];
  return Object.entries(value).flatMap(([name, member]) =>
    membersOf(member, path === "" ? name : `${path}.${name}`),
  );
}

const reads: PageReads = pageReadsSupplying({});
const members = membersOf(reads, "");

test("the walk reaches the story notes, CI follow-up and review state reads", () => {
  expect(members.map(([path]) => path)).toEqual(
    expect.arrayContaining([
      "storyNotes",
      "ciFollowUp.readCards",
      "ciFollowUp.readRetained",
      "reviewStates",
    ]),
  );
});

test.each(members)(
  "an unsupplied %s rejects without a fetch",
  async (...[, call]) => {
    const fetched = vi.fn();
    vi.stubGlobal("fetch", fetched);
    onTestFinished(() => {
      vi.unstubAllGlobals();
    });
    await expect(
      (async () => {
        await call();
      })(),
    ).rejects.toThrow(/^Unexpected .+ (read|attach)$/);
    expect(fetched).not.toHaveBeenCalled();
  },
);
