import path from "node:path";
import { expect, onTestFinished, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { cursorHost } from "../../server/cursorHost.ts";
import { admitLaunchSettings } from "../../server/launchSettingsAdmission.ts";
import { installFakeCursor } from "../../test-support/support/fakeCursor.ts";

const request = makeMe.aLaunchRequest
  .adHoc({ host: "cursor" })
  .requestingModel("gpt-5.2")
  .withInstruction("Do work")
  .please();

test.each([
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
])(
  "model verification explains when $name",
  async ({ models, stderr, explanation }) => {
    const cursor = installFakeCursor();
    onTestFinished(() => {
      vi.unstubAllEnvs();
      cursor.cleanup();
    });
    for (const [key, value] of Object.entries(cursor.env))
      vi.stubEnv(key, value);
    vi.stubEnv(
      "PATH",
      [cursor.binDir, process.env["PATH"]].join(path.delimiter),
    );
    cursor.listModels(models, stderr);

    await expect(
      admitLaunchSettings(request, cursorHost),
    ).rejects.toMatchObject({
      status: 503,
      message: `Cursor model choices could not be verified. ${explanation}`,
    });
    expect(cursor.calls()).toEqual([]);
  },
);
