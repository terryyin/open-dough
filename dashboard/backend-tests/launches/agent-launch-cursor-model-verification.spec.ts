import { launch } from "../../tests/agentLaunchBoundary.ts";
import { expect, test } from "../../tests/support/cursorStart.ts";

test.use({ serverMode: "boundary" });

for (const failure of [
  {
    name: "Cursor exits unsuccessfully",
    models: undefined,
    stderr: "Private diagnostic from Cursor.",
    explanation:
      "Cursor CLI exited with code 1 while listing models. Run cursor-agent models for details, then retry, or use your Cursor setting.",
  },
  {
    name: "Cursor returns no recognizable models",
    models: [],
    stderr: undefined,
    explanation:
      "Cursor CLI returned no recognizable models. Retry, or use your Cursor setting.",
  },
]) {
  test(`model verification explains when ${failure.name}`, async ({
    dashboard,
    cursor,
  }) => {
    cursor.listModels(failure.models, failure.stderr);
    const response = await launch(dashboard, {
      source: "open-dough",
      host: "cursor",
      workflow: "ad-hoc",
      model: "gpt-5.2",
      instruction: "Do work",
    });

    expect(response.status).toBe(503);
    expect(JSON.parse(response.body)).toEqual({
      error: `Cursor model choices could not be verified. ${failure.explanation}`,
    });
    expect(cursor.calls()).toEqual([]);
  });
}
