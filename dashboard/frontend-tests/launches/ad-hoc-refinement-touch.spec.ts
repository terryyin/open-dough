import { expect, test } from "vitest";
import {
  chooseByTouch,
  controlsAreReachable,
  insertAtCaret,
  noSidewaysScroll,
  phone,
  resizeLaunchViewport,
  touch,
} from "./launch-layout-page.ts";
import { openRefinement } from "./refinement-launch-page.ts";

test("touch rotation and restricted height preserve the refinement draft and choices", async () => {
  const { form, start } = await openRefinement(
    phone.portrait,
    async (launcher) => {
      (await touch(launcher)).click();
    },
  );
  const { instruction, host, model, dialog, options, cancel } = form;
  let draft =
    "Keep the selected story.\n\nExplain the next step 日本語.\nPreserve this final line.";
  await instruction.fill(draft);
  await chooseByTouch(host, "codex");
  await expect
    .element(dialog)
    .toHaveAccessibleName("Start refinement in Codex");
  await chooseByTouch(host, "claude");
  await chooseByTouch(model, "sonnet");
  await expect.element(model).toHaveValue("sonnet");
  const standard = dialog.getByRole("radio", { name: "Standard", exact: true });
  (await touch(standard)).click();
  await expect.element(standard).toBeChecked();
  (await touch(options)).click();
  const explore = dialog.getByRole("checkbox", {
    name: "Explore",
    exact: true,
  });
  await expect.element(explore).toBeVisible();
  (await touch(explore)).click();
  await expect.element(explore).toBeChecked();
  const parts = [dialog, instruction, model];
  const mounted = parts.map((part) => part.element());

  for (const view of [phone.landscape, phone.short, phone.portrait]) {
    await resizeLaunchViewport(view);
    parts.forEach((part, index) => {
      expect(
        part.element() === mounted[index],
        "the same dialog, instruction and model survive the viewport change",
      ).toBe(true);
    });
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
    if (view === phone.short) {
      const field = instruction.element() as HTMLTextAreaElement;
      const caret = draft.indexOf("\n");
      field.setSelectionRange(caret, caret);
      const text = "\nEdited with limited visible height.";
      await insertAtCaret(instruction, text);
      draft = `${draft.slice(0, caret)}${text}${draft.slice(caret)}`;
      await expect.element(instruction).toHaveValue(draft);
    }
    (await touch(instruction)).focus();
    await expect.element(instruction).toHaveFocus();
    noSidewaysScroll(dialog);
    controlsAreReachable(dialog);
    expect(start).not.toHaveBeenCalled();
  }
});
