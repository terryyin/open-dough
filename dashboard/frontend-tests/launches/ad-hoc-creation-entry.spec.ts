import { createElement } from "react";
import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { CreationEntry } from "../../src/CreationEntry.tsx";
import { creationSchema } from "../../src/launchCreation.ts";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";

test("an unresolved creation names its stand-in host and displays the supplied inspection arguments", async () => {
  const record = creationSchema.parse(
    makeMe.aCreationRecord
      .adHoc({
        title: "Stand-in inspection",
        instruction: "Inspect.",
        host: "codex",
      })
      .unresolved({
        workspace: "/saved workspace",
        endpoint: "unix:///saved endpoint",
      })
      .please(),
  );
  await mountComponent(
    createElement(CreationEntry, {
      record: {
        ...record,
        recovery: {
          hostName: "Stand-in native host",
          inspectionArgs: [
            "/native space's tool",
            "history",
            "$(literal)",
            "a'b",
            "",
          ],
        },
      },
    }),
  );

  const entry = page.getByRole("article", {
    name: "Stand-in inspection unresolved creation",
  });
  await expect.element(entry).toBeVisible();
  await expect
    .element(
      entry.getByText(
        "Conversation creation in Stand-in native host unresolved",
      ),
    )
    .toBeVisible();
  await expect
    .element(entry.getByRole("code").last())
    .toHaveTextContent(
      String.raw`'/native space'\''s tool' 'history' '$(literal)' 'a'\''b' ''`,
    );
  await expect.element(entry.getByText(/Codex/)).not.toBeInTheDocument();
});
