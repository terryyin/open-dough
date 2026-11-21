import { createElement } from "react";
import { expect, vi } from "vitest";
import { page } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import shippedDefinition from "../../../Distribution/src/skills/dough-story-refinement/references/refinement-options.json";
import { StartLaunch } from "../../src/StartLaunch.tsx";
import { optionsDefinitionSchema } from "../../src/commandOptions.ts";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import { launchDialog } from "./ad-hoc-launch-page.ts";
import { tap } from "./launch-layout-page.ts";

const shape = optionsDefinitionSchema.parse(shippedDefinition);
export const refinementChoices = [...shape.options, ...(shape.focuses ?? [])];

export async function openRefinement(
  viewport: { width: number; height: number },
  touch = false,
) {
  const source = makeMe.aPublishedSource.pygardon.please();
  const { request } = makeMe.aLaunchRecord
    .refining({
      source: source.id,
      identity: "SEED-3#long-title",
      title:
        "Let developers read a very long queued story title that wraps without widening the dialog: Supercalifragilisticexpialidocious-session-options-with-an-unbroken-name",
    })
    .please();
  if (request.workflow !== "refinement")
    throw new Error("Expected a refinement request");
  const start = vi.fn().mockResolvedValue(true);
  await mountComponent(
    createElement(StartLaunch, {
      work: request,
      sourceId: source.id,
      workflow: "refinement",
      establishesStart: false,
      note: undefined,
      attempt: undefined,
      options: {
        kind: "offered",
        options: refinementChoices,
        groups: shape.groups ?? [],
      },
      onStart: start,
    }),
    { viewport },
  );
  const launcher = page.getByRole("button", { name: "Start refinement" });
  if (touch) await tap(launcher);
  else await launcher.click();
  const form = launchDialog();
  await expect.element(form.instruction).toHaveFocus();
  return { launcher, form, start, work: request };
}
