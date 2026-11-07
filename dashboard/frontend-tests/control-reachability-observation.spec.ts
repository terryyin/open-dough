// Exercise every-control observations with real browser scrolling and clipping.
import type { Locator } from "@playwright/test";
import { expect, test } from "../tests/support/pageTest.ts";
import {
  expectEveryControlReachable,
  tapWhereShown,
} from "../tests/pageLayout.ts";

test.use({ hasTouch: true });

test("every visible control can be scrolled whole into view, and a late clipped control is rejected", async ({
  page,
}) => {
  await page.setContent(`<style>
    section { width: 180px; height: 90px; overflow: auto; }
    button, input, select, textarea, summary { display: block; min-height: 44px; width: 140px; margin: 12px 0; box-sizing: border-box; }
    .hidden { display: none; }
  </style><section>
    <button>First</button><input aria-label="Input"><select aria-label="Select"><option>Choice</option></select>
    <textarea aria-label="Text"></textarea><details><summary>Last</summary></details>
    <button class="hidden" style="width: 400px">Hidden</button>
  </section>`);
  const area = page.locator("section");
  await expectEveryControlReachable(area);
  await expect(area.getByText("Last")).toBeInViewport({ ratio: 1 });
  expect(await area.evaluate((element) => element.scrollTop)).toBeGreaterThan(
    0,
  );
  await area.getByText("Last").evaluate((element) => {
    element.style.setProperty("width", "300px");
  });
  await expect(expectEveryControlReachable(area)).rejects.toThrow(
    "Last is cut by what clips it",
  );
});

test("a control revealed by earlier scrolling is still checked", async ({
  page,
}) => {
  await page.setContent(`<style>
    section { width: 180px; height: 90px; overflow: auto; }
    button { display: block; width: 140px; height: 44px; margin: 12px 0; }
    #revealed { display: none; width: 300px; }
  </style><section><div style="height: 120px"></div>
    <button>First</button><button>Next</button><button id="revealed">Revealed</button>
  </section>`);
  await page.locator("section").evaluate((element) => {
    element.addEventListener(
      "scroll",
      () => {
        const revealed = document.querySelector<HTMLElement>("#revealed");
        if (revealed) revealed.style.display = "block";
      },
      { once: true },
    );
  });
  await expect(
    expectEveryControlReachable(page.locator("section")),
  ).rejects.toThrow("Revealed is cut by what clips it");
});

test("unscrollable overflow is rejected while a modal control escapes its page ancestors", async ({
  page,
}) => {
  await page.setContent(`<style>
    section { width: 180px; height: 60px; overflow: hidden; }
    button { display: block; height: 44px; width: 140px; margin: 12px 0; }
  </style><section><button>First</button><button>Last</button>
    <dialog><button>Modal</button></dialog></section>`);
  await expect(
    expectEveryControlReachable(page.locator("section")),
  ).rejects.toThrow("First is cut by what clips it");
  await page.locator("dialog").evaluate((element) => {
    (element as HTMLDialogElement).showModal();
  });
  await expectEveryControlReachable(page.locator("dialog"));
  await page.getByRole("button", { name: "Modal" }).evaluate((element) => {
    element.addEventListener("click", () => {
      element.setAttribute("data-pressed", "yes");
    });
  });
  await tapWhereShown(page.getByRole("button", { name: "Modal" }));
  await expect(page.getByRole("button", { name: "Modal" })).toHaveAttribute(
    "data-pressed",
    "yes",
  );
});

// A native touch counted where it lands: the button counts each click it gets.
const countedTarget = `<style>
    #target { position: absolute; left: 20px; top: 20px; width: 80px; height: 50px; }
    #cover { position: absolute; inset: 0; }
  </style><button id="target"
    onclick="this.dataset.clicks = String(Number(this.dataset.clicks ?? 0) + 1)">Target</button>`;

// The control as the helper sees it, except that just before the helper's
// native touch the page changes the control. Only the timing is controlled:
// the change and the touch are the browser's own.
function changedBeforeTouch(
  control: Locator,
  change: (element: HTMLElement) => void,
): Locator {
  const page = control.page();
  const touchscreen = {
    async tap(x: number, y: number) {
      await control.evaluate(change);
      await page.touchscreen.tap(x, y);
    },
  };
  const changingPage = new Proxy(page, {
    get: (object, key): unknown =>
      key === "touchscreen" ? touchscreen : bound(object, key),
  });
  return new Proxy(control, {
    get: (object, key): unknown =>
      key === "page" ? () => changingPage : bound(object, key),
  });
}

// The object's own property, a method still called on that object.
function bound(object: object, key: string | symbol): unknown {
  const value: unknown = Reflect.get(object, key);
  return typeof value === "function"
    ? (value as (...args: unknown[]) => unknown).bind(object)
    : value;
}

test("a native touch clicks a control that stays where it was shown, once", async ({
  page,
}) => {
  await page.setContent(countedTarget);
  const target = page.getByRole("button", { name: "Target" });
  await tapWhereShown(target);
  await expect(target).toHaveAttribute("data-clicks", "1");
});

test("a control that moves before the touch is refused, not silently missed", async ({
  page,
}) => {
  await page.setContent(countedTarget);
  const target = page.getByRole("button", { name: "Target" });
  const moving = changedBeforeTouch(target, (element) => {
    element.style.setProperty("left", "300px");
  });
  await expect(tapWhereShown(moving)).rejects.toThrow(
    "native touch lands on the intended control",
  );
  await expect(target).not.toHaveAttribute("data-clicks");
});

test("a covered control is refused, naming what covers it, whether covered before or after it was measured", async ({
  page,
}) => {
  await page.setContent(`${countedTarget}<div id="cover"></div>`);
  const target = page.getByRole("button", { name: "Target" });
  await expect(tapWhereShown(target)).rejects.toThrow(
    /touch reaches the intended control[\s\S]*DIV#cover/,
  );
  await page.locator("#cover").evaluate((element) => {
    element.remove();
  });
  const coveredLate = changedBeforeTouch(target, (element) => {
    const cover = document.createElement("div");
    cover.id = "cover";
    element.after(cover);
  });
  await expect(tapWhereShown(coveredLate)).rejects.toThrow(
    /native touch lands on the intended control[\s\S]*DIV#cover/,
  );
  await expect(target).not.toHaveAttribute("data-clicks");
});
