import { expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";
import type { FinalReportRead } from "../../src/finalReportContract.ts";
import { sessionKey } from "../../src/sessionReference.ts";
import type { SessionServices } from "../../src/sessionServices.ts";
import { retainedReport } from "./final-report-mount.ts";
import {
  close,
  expectReportSessionName,
  openReport,
  panel,
  reportText,
} from "./final-report-page.ts";
import { mountSessionCards, sessionsReading } from "./session-card-mount.ts";
import { card } from "./session-card-page.ts";

test("changing selection cancels a held report and never shows its text as the next session", async () => {
  const first = retainedReport("Held result", "held-report-session");
  const second = retainedReport("Next result", "next-retained-session");
  const lateText = "First conversation report a5df85d90a";
  const nextText = "Second conversation's own result";

  let releaseFirst: () => void = () => {
    throw new Error("No held report to release.");
  };
  const held = new Promise<FinalReportRead>((resolve) => {
    releaseFirst = () => {
      resolve({ kind: "available", turnId: "first-turn", text: lateText });
    };
  });
  const readFinalReport = vi
    .fn<SessionServices["readFinalReport"]>()
    .mockReturnValueOnce(held)
    .mockResolvedValueOnce({
      kind: "available",
      turnId: "second-turn",
      text: nextText,
    });
  await mountSessionCards({
    reading: sessionsReading("two reports", first, second),
    readFinalReport,
  });
  const openers = card.getByRole("button", {
    name: "Read final report",
    exact: true,
  });
  await expect.poll(() => openers.all().length).toBe(2);
  const openerFor = (key: string) => {
    const opener = openers
      .all()
      .find(
        (candidate) =>
          candidate
            .element()
            .closest("[data-shows-session]")
            ?.getAttribute("data-shows-session") === key,
      );
    if (!opener) throw new Error(`No report opener for ${key}.`);
    return opener;
  };
  const firstOpener = openerFor(sessionKey(first.session));
  const secondOpener = openerFor(sessionKey(second.session));

  await openReport(firstOpener);
  await expect.element(panel.getByText("Reading final report…")).toBeVisible();
  await expect.poll(() => readFinalReport.mock.calls.length).toBe(1);
  const original = readFinalReport.mock.calls[0]?.[1];
  expect(original?.aborted).toBe(false);
  await openReport(secondOpener);
  await expect.element(reportText(nextText)).toHaveTextContent(nextText);
  expect(original?.aborted).toBe(true);
  expectReportSessionName();

  releaseFirst();
  await held;
  await expect.element(reportText(nextText)).toHaveTextContent(nextText);
  await expect
    .element(panel.getByText(lateText, { exact: true }))
    .not.toBeInTheDocument();
  await userEvent.click(close);
  await expect.element(secondOpener).toHaveFocus();
  expect(
    readFinalReport.mock.calls.map(([subject]) => subject.session),
  ).toEqual([first.session.sessionId, second.session.sessionId]);
});
