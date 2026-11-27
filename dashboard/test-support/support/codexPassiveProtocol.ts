import type { CodexCall } from "./fakeCodex.ts";

type ProtocolExpect = {
  (actual: unknown): {
    toBe(expected: unknown): void;
    toEqual(expected: unknown): void;
  };
  any(constructor: StringConstructor): unknown;
};

// A saved-session observation reads metadata and at most its latest turn.
export function expectPassiveCodexReads(
  calls: readonly CodexCall[],
  expect: ProtocolExpect,
) {
  expect(
    calls.every(({ method }) =>
      [
        "initialize",
        "initialized",
        "thread/read",
        "thread/turns/list",
      ].includes(method),
    ),
  ).toBe(true);
  for (const { method, params } of calls) {
    if (method === "thread/read")
      expect(params).toEqual({
        threadId: expect.any(String),
        includeTurns: false,
      });
    if (method === "thread/turns/list")
      expect(params).toEqual({
        threadId: expect.any(String),
        limit: 1,
        sortDirection: "desc",
        itemsView: "notLoaded",
      });
  }
}
