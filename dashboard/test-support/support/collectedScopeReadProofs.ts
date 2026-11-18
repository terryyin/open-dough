// Public collected-scope reads after retained summary evidence is present:
// each requested path answers one selected build's case and file points, and
// every listed origin returns the same body.
import { collectedScopeHistory } from "./collectedScopeHistory.ts";
import { expect } from "./preparationPage.ts";

export type CollectedScopeReading = readonly [
  scope: string,
  caseMs: number,
  fileMs: number,
];

export async function expectCollectedScopePoints(
  origins: readonly string[],
  {
    key,
    revision,
    through,
    scopes,
  }: {
    readonly key: string;
    readonly revision: string;
    readonly through: string;
    readonly scopes: readonly CollectedScopeReading[];
  },
): Promise<void> {
  const [firstOrigin, ...otherOrigins] = origins;
  if (firstOrigin === undefined)
    throw new Error("expectCollectedScopePoints needs at least one origin");
  for (const [scope, caseMs, fileMs] of scopes) {
    const first = await collectedScopeHistory(
      firstOrigin,
      scope,
      revision,
      through,
    );
    expect(first.status).toBe(200);
    expect(first.body.entries.find((entry) => entry.key === key)).toMatchObject(
      {
        kind: "point",
        key,
        selected: true,
        readings: [
          { kind: "point", unit: "case", ms: caseMs },
          { kind: "point", unit: "file", ms: fileMs },
        ],
      },
    );
    for (const origin of otherOrigins) {
      expect(
        await collectedScopeHistory(origin, scope, revision, through),
      ).toEqual(first);
    }
  }
}
