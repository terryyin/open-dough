import { expect, test } from "vitest";
import { page, userEvent, type Locator } from "vitest/browser";
import {
  controlsAreReachable,
  noSidewaysScroll,
  phone,
  resizeLaunchViewport,
  tap,
} from "./launch-layout-page.ts";
import { openRefinement } from "./refinement-launch-page.ts";

function labelOf(input: Locator) {
  const label = (input.element() as HTMLInputElement).labels?.item(0);
  if (!label) throw new Error("The launch choice has no label.");
  return page.elementLocator(label);
}

async function setChoiceAfterTap(control: Locator, value: string) {
  // Verify the native touch hit without opening a picker that selectOptions leaves open.
  const select = control.element();
  const keepPickerClosed = (event: Event) => {
    event.preventDefault();
  };
  select.addEventListener("mousedown", keepPickerClosed);
  try {
    await tap(control);
  } finally {
    select.removeEventListener("mousedown", keepPickerClosed);
  }
  await control.selectOptions(value);
  expect(
    control.element().matches(":open"),
    "native select menu closed before continuing the dialog",
  ).toBe(false);
}

test("touch rotation and restricted height preserve the refinement draft and choices, and Cancel sends nothing", async () => {
  const { form, launcher, start } = await openRefinement(phone.portrait, true);
  const { instruction, host, model, dialog, options, cancel } = form;
  let draft =
    "Keep the selected story.\n\nExplain the next step 日本語.\nPreserve this final line.";
  await instruction.fill(draft);
  await setChoiceAfterTap(host, "codex");
  await expect
    .element(dialog)
    .toHaveAccessibleName("Start refinement in Codex");
  await host.selectOptions("claude");
  await setChoiceAfterTap(model, "sonnet");
  await tap(
    labelOf(dialog.getByRole("radio", { name: "Standard", exact: true })),
  );
  await tap(options);
  const explore = dialog.getByRole("checkbox", {
    name: "Explore",
    exact: true,
  });
  await expect.element(explore).toBeVisible();
  await tap(labelOf(explore));
  await expect.element(explore).toBeChecked();

  for (const view of [phone.landscape, phone.short, phone.portrait]) {
    await resizeLaunchViewport(view);
    await expect.element(instruction).toHaveValue(draft);
    await expect.element(model).toHaveValue("sonnet");
    await expect
      .element(options)
      .toHaveTextContent("Refinement options Explore (1)");
    for (const control of [
      cancel,
      form.start,
      dialog.getByText("The session runs in this project's folder.", {
        exact: true,
      }),
    ])
      await expect.element(control).toBeInViewport({ ratio: 1 });
    await tap(instruction);
    await expect.element(instruction).toHaveFocus();
    if (view === phone.short) {
      const field = instruction.element() as HTMLTextAreaElement;
      const { selectionStart, selectionEnd } = field;
      const text = "Edited with limited visible height.";
      await userEvent.keyboard("{Enter}");
      await userEvent.type(instruction, text, { skipClick: true });
      draft = `${draft.slice(0, selectionStart)}\n${text}${draft.slice(selectionEnd)}`;
      await expect.element(instruction).toHaveValue(draft);
    }
    noSidewaysScroll(dialog);
    controlsAreReachable(dialog);
    expect(start).not.toHaveBeenCalled();
  }
  await tap(cancel);
  await expect.element(dialog).not.toBeInTheDocument();
  await expect.element(launcher).toHaveFocus();
  expect(start).not.toHaveBeenCalled();
});
