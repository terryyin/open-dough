// Native catalog fixture data and paging; it never supplies dashboard records.
import type { FakeCodex } from "./fakeCodexTypes.ts";

export function defaultCodexModels(): FakeCodex["models"] {
  return [
    {
      model: "native-sol",
      displayName: "Native Sol",
      description: "Host supplied Sol description",
      supportedReasoningEfforts: [
        { reasoningEffort: "low", description: "Quick" },
        { reasoningEffort: "ultra", description: "Deep" },
      ],
    },
    {
      model: "native-luna",
      displayName: "Native Luna",
      description: "Host supplied Luna description",
      supportedReasoningEfforts: [
        { reasoningEffort: "low", description: "Quick" },
      ],
    },
  ];
}

export function answerCodexCatalog(
  fixture: FakeCodex,
  params: Record<string, unknown>,
  waiting: Array<() => void>,
  reply: (result: unknown) => void,
  refuse: (error: unknown) => void,
): void {
  const offset = Number(params["cursor"] ?? 0);
  const next = offset + fixture.modelPageSize;
  const page = {
    data: fixture.models.slice(offset, next),
    nextCursor: next < fixture.models.length ? String(next) : null,
  };
  const catalog = () => {
    if (fixture.catalogError) refuse(fixture.catalogError);
    else reply(page);
  };
  if (fixture.holdCatalog) waiting.push(catalog);
  else catalog();
}
