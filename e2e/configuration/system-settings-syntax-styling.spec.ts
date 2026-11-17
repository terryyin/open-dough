// Syntax styling chosen in System settings is saved on choosing and kept
// across reload. Reader Off/Default behaviour is
// ../../dashboard/frontend-tests/review/story-review-syntax-styling-off.spec.ts.
import { existsSync, readFileSync } from "node:fs";
import { expect, test } from "../../dashboard/tests/support/pageTest.ts";
import { systemSettingsMachine } from "../../dashboard/tests/support/systemSettingsMachine.ts";
import {
  chooseSyntaxStyling,
  expectSyntaxStylingShown,
  syntaxStylingFile,
} from "../../dashboard/tests/support/syntaxStylingSettingsPage.ts";

let fixture: ReturnType<typeof systemSettingsMachine>;
test.beforeEach(() => {
  fixture = systemSettingsMachine();
});
test.afterEach(async () => fixture.close());

const savedStyling = () =>
  JSON.parse(readFileSync(syntaxStylingFile(fixture.home), "utf8")) as unknown;

test("syntax styling Off is chosen in System settings, saved on choosing, and kept across reload", async ({
  page,
}) => {
  const server = await fixture.start("preview");
  await page.goto(`${server.baseURL}/?view=settings`);
  await expect(
    page.getByRole("heading", { name: "Syntax styling", exact: true }),
  ).toBeVisible();
  await expectSyntaxStylingShown(page, "Default");
  expect(existsSync(syntaxStylingFile(fixture.home))).toBe(false);

  await chooseSyntaxStyling(page, "Off");
  expect(savedStyling()).toEqual({ styling: "off" });

  await page.reload();
  await expectSyntaxStylingShown(page, "Off");
  expect(savedStyling()).toEqual({ styling: "off" });
  expect(server.claudeCalls()).toEqual([]);
});
