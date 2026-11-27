import { expect, onTestFinished, test, vi } from "vitest";
import { page } from "vitest/browser";
import {
  button,
  covering,
  divider,
  drag,
  focusDivider,
  keyStep,
  measured,
  minimum,
  mountWidthTerminal,
  openTerminal,
  panel,
  press,
  sidebar,
  sidebarKey,
  wide,
  widthIs,
  widthKey,
  withWidthStorage,
} from "./side-panel-width-view.ts";

function watchErrors() {
  const errors: string[] = [];
  const heard = (event: ErrorEvent) => {
    // Match the page-error boundary: uncaught script exceptions carry an error.
    const thrown: unknown = event.error;
    if (thrown !== null && thrown !== undefined) errors.push(event.message);
  };
  window.addEventListener("error", heard);
  onTestFinished(() => {
    window.removeEventListener("error", heard);
  });
  return errors;
}

async function halfRoom() {
  await expect.element(divider).toBeVisible();
  const room = measured();
  const initial = Math.round((room.page.width + room.panel.width) / 2);
  await widthIs(initial);
  return initial;
}

test("less room and Maximize temporarily fit a chosen width without replacing it", async () => {
  withWidthStorage();
  await mountWidthTerminal();
  const chosen = (await halfRoom()) + 200;
  await drag(-200);
  await widthIs(chosen);
  expect(localStorage.getItem(widthKey)).toBe(String(chosen));

  await page.viewport(1000, wide.height);
  const squeezed = 1000 - minimum;
  await widthIs(squeezed);
  await button("Maximize").click();
  await expect.element(divider).not.toBeInTheDocument();
  await button("Restore").click();
  await widthIs(squeezed);
  expect(localStorage.getItem(widthKey)).toBe(String(chosen));

  await page.viewport(760, wide.height);
  await covering();
  expect(localStorage.getItem(widthKey)).toBe(String(chosen));
  await page.viewport(wide.width, wide.height);
  await widthIs(chosen);
});

test("an unusable kept width starts at half the room and leaves the sidebar preference", async () => {
  withWidthStorage();
  const errors = watchErrors();
  localStorage.setItem(sidebarKey, "true");
  localStorage.setItem(widthKey, "wide");
  const mounted = await mountWidthTerminal();
  await expect.element(sidebar).toBeVisible();
  await halfRoom();
  for (const [index, malformed] of ["0", "Infinity"].entries()) {
    localStorage.setItem(widthKey, malformed);
    mounted.restart(index + 1);
    await expect.element(panel).not.toBeInTheDocument();
    await openTerminal();
    await expect.element(sidebar).toBeVisible();
    await halfRoom();
  }
  const chosen = (await halfRoom()) + keyStep;
  focusDivider();
  await press("ArrowLeft");
  await widthIs(chosen);
  expect(localStorage.getItem(sidebarKey)).toBe("true");
  expect(localStorage.getItem(widthKey)).toBe(String(chosen));
  mounted.restart(3);
  await expect.element(panel).not.toBeInTheDocument();
  await openTerminal();
  await widthIs(chosen);
  expect(errors).toEqual([]);
});

test("when browser storage is refused, the panel starts at half and resizes for the lifetime of the page", async () => {
  const errors = watchErrors();
  const refused = vi
    .spyOn(window, "localStorage", "get")
    .mockImplementation(() => {
      throw new DOMException("Storage is refused.", "SecurityError");
    });
  onTestFinished(() => {
    refused.mockRestore();
  });
  expect(() => window.localStorage.getItem(widthKey)).toThrow(
    "Storage is refused.",
  );
  const mounted = await mountWidthTerminal();
  const half = await halfRoom();
  await drag(-200);
  await widthIs(half + 200);
  mounted.restart(1);
  await expect.element(panel).not.toBeInTheDocument();
  await openTerminal();
  await widthIs(half);
  expect(errors).toEqual([]);
});
