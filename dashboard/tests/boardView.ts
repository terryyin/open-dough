// One reading of the Board for a journey that combines its view, paging,
// swipe, scroll and slide. The scenario supplies every column, control and
// measured place; geometry stays with the caller. A journey that needs one
// helper, such as showColumn, imports it from ./boardPage.ts.

import type { Locator, Page } from "@playwright/test";
import { expect } from "./dashboardTest.ts";
import { compactProjectSelectCut } from "./pageLayout.ts";
import { dispatchBoardTouch } from "./phoneBoardTouch.ts";
import {
  boardScroll,
  columnReadingRoom,
  expectColumnReading,
  expectEndsWithShown,
  expectStoryCardsKeepTheirShare,
  expectView,
  recordSlides,
  scrollYOf,
  slidesOf,
  wheelTo,
} from "./boardPage.ts";
import {
  columns,
  columnPagingControl,
  showColumn as revealColumn,
  tapColumnIndicator,
  type ColumnName,
} from "./boardColumnNavigation.ts";

export class BoardView {
  constructor(readonly page: Page) {}

  // Exactly the `shown` columns fill the Board and the controls read
  // `controls`. `cut` names text the design cuts off.
  async shows(
    shown: readonly ColumnName[],
    controls: readonly (string | RegExp)[],
    cut: readonly string[] = [],
  ): Promise<this> {
    await expectView(this.page, shown, controls, cut);
    return this;
  }

  // One phone column, read whole, with the compact project title cut by design.
  async showsPhoneColumn(
    shown: ColumnName,
    controls: readonly (string | RegExp)[],
  ): Promise<this> {
    await expectColumnReading(
      this.page,
      shown,
      controls,
      compactProjectSelectCut,
    );
    return this;
  }

  // The phone's shown columns, with the compact project title cut by design.
  async showsPhone(
    shown: readonly ColumnName[],
    controls: readonly (string | RegExp)[],
  ): Promise<this> {
    await this.shows(shown, controls, compactProjectSelectCut);
    return this;
  }

  pagingControl(column: ColumnName): Locator {
    return columnPagingControl(this.page, column);
  }

  async pageTo(column: ColumnName): Promise<this> {
    await this.pagingControl(column).click();
    return this;
  }

  async showColumn(column: ColumnName): Promise<this> {
    await revealColumn(this.page, column);
    return this;
  }

  // The page column the Board sits in, for a caller's own measurement.
  pageColumn(): Locator {
    return this.page.locator(".page-column");
  }

  async keepsStoryCardShare(shown: number): Promise<this> {
    await expectStoryCardsKeepTheirShare(this.page, shown);
    return this;
  }

  async wheelTo(y: number): Promise<this> {
    await wheelTo(this.page, y);
    return this;
  }

  scrollY(): Promise<number> {
    return scrollYOf(this.page);
  }

  scrollRegion(): Locator {
    return boardScroll(this.page);
  }

  async countSlides(): Promise<this> {
    await recordSlides(this.page);
    return this;
  }

  slides(): Promise<number> {
    return slidesOf(this.page);
  }

  async endsWith(shown: readonly ColumnName[]): Promise<this> {
    await expectEndsWithShown(this.page, shown);
    return this;
  }

  // Hidden columns keep their place in the reading order.
  async keepsColumnReadingOrder(): Promise<this> {
    const regions = this.page.getByRole("region", {
      name: /^(Backlog|Taken|Recently done)$/,
    });
    await expect(regions).toHaveCount(columns.length);
    for (const [index, column] of columns.entries()) {
      await expect(regions.nth(index)).toHaveAccessibleName(column);
    }
    return this;
  }

  touchStroke(stroke: Parameters<typeof dispatchBoardTouch>[1]) {
    return this.page
      .locator(".board-view")
      .evaluate(dispatchBoardTouch, stroke);
  }

  touchAction() {
    return this.page
      .locator(".board-view")
      .evaluate((view) => getComputedStyle(view).touchAction);
  }

  async tapIndicator(column: ColumnName): Promise<this> {
    await tapColumnIndicator(this.page, column);
    return this;
  }

  columnReadingRoom(column: ColumnName) {
    return columnReadingRoom(this.page, column);
  }
}

export const boardView = (page: Page) => new BoardView(page);
