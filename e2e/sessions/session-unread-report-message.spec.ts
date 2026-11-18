// An ad-hoc session's unread report is read on its entry's message part:
// Mark as read collapses the part with the keyboard on its heading, the entry
// is no longer unread, and the saved record keeps the report's receipt as
// read without marking it done. A card entry's message part, its refusal and
// a long message are
// ../../dashboard/frontend-tests/sessions/session-unread-report-message.spec.ts;
// ./session-unread-report.spec.ts is the unread report's journey beside the
// native reading. Real start, launch, installed reporting command, store and
// page; only the synthetic `claude` and GitHub are fakes.

import {
  parts,
  sessionEntriesIn,
  sessionUnreadReportOf,
} from "../../dashboard/test-support/dashboardPage.ts";
import { expect } from "../../dashboard/test-support/dashboardTest.ts";
import { launchedAdHoc } from "../../dashboard/test-support/support/reportedLaunch.ts";
import {
  expectCollapsed,
  expectExpanded,
  messagePartOf,
} from "../../dashboard/test-support/support/sessionMessagePart.ts";
import {
  newerMessage,
  publishOrigin,
  recordOf,
  test,
} from "../../dashboard/test-support/support/unreadReportPage.ts";
import { openUntilRead } from "../../dashboard/test-support/pageRequestNotes.ts";

test("an ad-hoc session's message is read and marked read on its Recently done entry", async ({
  page,
  dashboard,
  origin,
}) => {
  const adHoc = await launchedAdHoc(
    dashboard,
    origin,
    "Look into the flaky check.",
  );
  await adHoc.report({ outcome: "unfinished", message: newerMessage });
  await publishOrigin(page, origin);
  await openUntilRead(page);
  const recent = sessionEntriesIn(parts(page).taken);
  await expect(recent).toHaveCount(1);
  const message = messagePartOf(recent);
  await expectExpanded(message, "Unfinished work", newerMessage);

  await message.markRead.click();

  await expectCollapsed(message, "Unfinished work");
  await expect(message.heading).toBeFocused();
  await expect(sessionUnreadReportOf(recent)).toHaveCount(0);
  await expect(recent.getByRole("status")).toHaveText("");
  const record = await recordOf(dashboard, adHoc.sessionId);
  expect(record?.reportRead).toBe(record?.completion?.receipt);
  expect(record?.doneAt).toBeUndefined();
});
