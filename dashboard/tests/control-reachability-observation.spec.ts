// Exercise every-control observations with real browser scrolling and clipping.
import { expect, test } from "./dashboardTest.ts";
import { expectEveryControlReachable, tapWhereShown } from "./pageLayout.ts";

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
