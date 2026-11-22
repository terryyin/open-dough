import { expect, onTestFinished, test } from "vitest";
import { page, userEvent, type Locator } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { contrastRatio } from "../../test-support/composedColours.ts";
import { browserSession } from "../review/browser-session.ts";
import {
  decorativeIcon,
  expectDocumentStill,
  focusedAndVisible,
  narrowViewport,
  paintedBackground,
  readsWhole,
  textContrast,
  zoomedViewport,
} from "./board-accessibility.ts";
import { mountBoard, withBoardStorage } from "./board-mount.ts";
import {
  answerTerminal,
  openRecord,
  openSidebarSession,
  sidebar,
  terminal,
} from "./board-session-view.ts";
import { boardWork, story } from "./board-work.ts";
import { withWidthStorage } from "./side-panel-width-view.ts";

const title = `A long story title that the narrow sidebar cuts ${"and goes on ".repeat(4)}to its end`;

function fitsViewport(element: Element) {
  const { left, top, right, bottom } = element.getBoundingClientRect();
  return (
    left >= -1 &&
    top >= -1 &&
    right <= innerWidth + 1 &&
    bottom <= innerHeight + 1
  );
}

async function expectIconControl(
  control: Locator,
  name: string,
  tooltip: string,
) {
  await expect.element(control).toHaveAccessibleName(name);
  const button = control.element();
  if (!(button instanceof HTMLButtonElement) || button.parentElement === null)
    throw new Error(`Expected the ${name} frame control.`);
  const tip = button.parentElement.querySelector(".frame-tooltip > span");
  if (!tip) throw new Error(`Expected a tooltip for ${name}.`);
  expect(tip.textContent).toBe(tooltip);
  expect(tip.parentElement?.getAttribute("aria-hidden")).toBe("true");

  const mark = button.querySelector("img.product-mark");
  const icon = mark ?? button.querySelector("svg");
  if (!icon) throw new Error(`Expected the ${name} icon.`);
  if (mark) {
    expect(mark.getAttribute("alt")).toBe("");
    expect(mark.getAttribute("aria-hidden")).toBe("true");
    expect(mark.getAttribute("src")).toBe("/icon-64.png");
  } else {
    decorativeIcon(button);
  }
  const { width, height } = icon.getBoundingClientRect();
  const iconSize = mark ? 32 : 20;
  expect(width).toBeCloseTo(iconSize, 0);
  expect(height).toBeCloseTo(iconSize, 0);
  const frameSize =
    Number.parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue(
        "--control-size",
      ),
    ) * Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
  const frame = button.getBoundingClientRect();
  expect(frame.width).toBeCloseTo(frameSize, 0);
  expect(frame.height).toBeCloseTo(frameSize, 0);

  await userEvent.unhover(button);
  button.blur();
  expect(tip.checkVisibility()).toBe(false);
  if (!mark)
    expect(
      contrastRatio(getComputedStyle(icon).color, paintedBackground(icon)),
    ).toBeGreaterThanOrEqual(3);
  await control.hover();
  await expect
    .poll(() => tip.checkVisibility() && fitsViewport(tip))
    .toBe(true);
  await userEvent.unhover(button);
  await expect.poll(() => tip.checkVisibility()).toBe(false);

  button.focus();
  await userEvent.tab({ shift: true });
  await userEvent.tab();
  focusedAndVisible(button);
  expect(tip.checkVisibility() && fitsViewport(tip)).toBe(true);
  expect(
    contrastRatio(
      getComputedStyle(button).outlineColor,
      paintedBackground(button.parentElement),
    ),
  ).toBeGreaterThanOrEqual(3);
}

test("the Sessions sidebar and terminal read clearly, keep their names, and fit a narrow and a zoomed window", async () => {
  withBoardStorage("0");
  withWidthStorage();
  answerTerminal();
  const browser = browserSession();
  const wasTouch = matchMedia("(any-pointer: coarse)").matches;
  onTestFinished(async () => {
    await browser.send("Emulation.setTouchEmulationEnabled", {
      enabled: wasTouch,
    });
  });
  await browser.send("Emulation.setTouchEmulationEnabled", { enabled: false });
  const working = story(title, 413);
  const waiting = story("Repair the installer’s update report", 59);
  const { records } = makeMe.aMachineAnswer
    .observing(
      makeMe.anObservedLaunch
        .of(openRecord(working))
        .withSessionState(makeMe.aSessionState.loaded("working").please())
        .please(),
      makeMe.anObservedLaunch
        .of(openRecord(waiting))
        .withSessionState(
          makeMe.aSessionState
            .loaded("waiting")
            .waitingFor("input needed")
            .please(),
        )
        .please(),
    )
    .please();
  await mountBoard(
    [boardWork([working], { taken: [waiting] })],
    narrowViewport,
    {
      records,
      launched: records,
    },
  );
  const banner = page.getByRole("banner");
  const button = banner.getByRole("button", { name: "Sessions", exact: true });
  const workingBadge = banner.getByRole("img", { name: "1 session working" });
  const waitingBadge = banner.getByRole("img", {
    name: "1 session needs attention",
  });
  await expect.element(workingBadge).toHaveTextContent("1");
  await expect.element(waitingBadge).toHaveTextContent("1");
  const badges = workingBadge.element().parentElement;
  if (badges === null) throw new Error("Expected the Sessions badges.");
  expect([...badges.querySelectorAll("[role=img]")]).toEqual([
    workingBadge.element(),
    waitingBadge.element(),
  ]);
  expect(fitsViewport(badges)).toBe(true);
  expect(badges.scrollWidth).toBeLessThanOrEqual(badges.clientWidth + 1);
  expect(badges.scrollHeight).toBeLessThanOrEqual(badges.clientHeight + 1);

  await button.click();
  await expect
    .element(sidebar.getByRole("button", { name: title, exact: true }))
    .toBeVisible();
  await expect
    .poll(
      () =>
        sidebar
          .getByRole("button", { name: waiting.title, exact: true })
          .elements().length,
    )
    .toBe(1);
  await expect
    .poll(() => sidebar.element().querySelectorAll("time").length)
    .toBe(2);
  await expectIconControl(button, "Sessions", "Sessions (⌘B)");
  const heading = sidebar.getByRole("heading", {
    name: "Sessions",
    exact: true,
  });
  const first = sidebar.getByRole("listitem").first();
  const time = first.element().querySelector("time");
  if (time === null) throw new Error("Expected the first session’s time.");
  for (const part of [
    heading.element(),
    first.getByRole("heading").element(),
    time,
  ])
    textContrast(part);

  for (const { width, height } of [narrowViewport, zoomedViewport]) {
    await page.viewport(width, height);
    await expect.element(sidebar).toBeVisible();
    expectDocumentStill();
    expect(sidebar.element().scrollWidth).toBeLessThanOrEqual(
      sidebar.element().clientWidth + 1,
    );
    expect(readsWhole(heading.element())).toBe(true);
    for (const elapsed of sidebar.element().querySelectorAll("time"))
      expect(readsWhole(elapsed)).toBe(true);
  }
  await page.viewport(narrowViewport.width, narrowViewport.height);
  await openSidebarSession(title);
  await expect
    .poll(() => terminal.element().querySelector(".xterm-rows")?.textContent)
    .toContain("Session attached");
  const terminalTitle = terminal.getByRole("heading", {
    level: 2,
    name: title,
  });
  const metadata = terminal.getByText("Execution session", { exact: true });
  textContrast(terminalTitle.element());
  textContrast(metadata.element());
  const close = terminal.getByRole("button", { name: "Close", exact: true });
  await expectIconControl(
    terminal.getByRole("button", { name: "Mark as done", exact: true }),
    "Mark as done",
    "Mark as done",
  );
  await expectIconControl(close, "Close", "Close (⌘⇧Esc)");

  for (const { width, height } of [narrowViewport, zoomedViewport]) {
    await page.viewport(width, height);
    await expect.element(close).toBeVisible();
    expect(fitsViewport(close.element())).toBe(true);
    await expect
      .element(terminal.getByRole("button", { name: /^(Maximize|Restore)$/ }))
      .not.toBeInTheDocument();
    const screen = terminal.element().querySelector(".terminal-screen");
    const rows = screen?.querySelector(".xterm-screen");
    if (!screen || !rows)
      throw new Error("Expected the attached terminal screen.");
    await expect
      .poll(
        () =>
          rows.getBoundingClientRect().right <=
          screen.getBoundingClientRect().right + 0.5,
      )
      .toBe(true);
    expectDocumentStill();
    expect(readsWhole(metadata.element())).toBe(true);
  }
});
