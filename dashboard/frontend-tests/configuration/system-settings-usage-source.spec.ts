// System settings → Usage mounted over the page's endpoint source
// (../../src/usageSource.ts): refusal wording for refused reads and Refreshes,
// and abort forwarding when a pending read is left.
import { createElement } from "react";
import { afterEach, expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { SystemSettingsUsage } from "../../src/SystemSettingsUsage.tsx";
import { pageUsageSource } from "../../src/usageSource.ts";
import {
  usageRefreshEndpoint,
  usageTokenIndexEndpoint,
} from "../../src/usageTokenIndex.ts";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";

afterEach(() => {
  vi.restoreAllMocks();
});

const requestUrl = (input: RequestInfo | URL): URL =>
  new URL(
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.href
        : input.url,
    window.location.origin,
  );

test("a refused read shows Usage could not be read. or the endpoint's own message", async () => {
  vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
    const url = requestUrl(input);
    if (url.pathname !== usageTokenIndexEndpoint) {
      return Promise.reject(new Error(`Unexpected request: ${url.pathname}`));
    }
    return Promise.resolve(
      url.searchParams.get("workflow") === "refinement"
        ? Response.json({ error: "Usage history is locked." }, { status: 503 })
        : Response.json({}, { status: 500 }),
    );
  });

  await mountComponent(
    createElement(SystemSettingsUsage, { source: pageUsageSource }),
  );

  await expect
    .element(page.getByRole("alert"))
    .toHaveTextContent("Codex: Usage could not be read.");

  await userEvent.selectOptions(
    page.getByRole("combobox", { name: "Launch workflow", exact: true }),
    "refinement",
  );

  await expect
    .element(page.getByRole("alert"))
    .toHaveTextContent("Codex: Usage history is locked.");
});

test("a refused Refresh shows Usage could not be refreshed. or the endpoint's own message", async () => {
  let refreshes = 0;
  vi.spyOn(globalThis, "fetch").mockImplementation((input, init) => {
    const url = requestUrl(input);
    if (url.pathname === usageTokenIndexEndpoint) {
      return Promise.resolve(Response.json(makeMe.aTokenIndexAnswer.please()));
    }
    if (url.pathname === usageRefreshEndpoint && init?.method === "POST") {
      refreshes += 1;
      return Promise.resolve(
        refreshes === 1
          ? Response.json({}, { status: 500 })
          : Response.json(
              { error: "Usage could not be refreshed: rollouts unavailable." },
              { status: 503 },
            ),
      );
    }
    return Promise.reject(new Error(`Unexpected request: ${url.pathname}`));
  });

  await mountComponent(
    createElement(SystemSettingsUsage, { source: pageUsageSource }),
  );

  await expect.element(page.getByText("1 task · Last 30 days")).toBeVisible();

  await userEvent.click(page.getByRole("button", { name: "Refresh" }));
  await expect
    .element(page.getByRole("alert"))
    .toHaveTextContent("Usage could not be refreshed.");

  await userEvent.click(page.getByRole("button", { name: "Refresh" }));
  await expect
    .element(page.getByRole("alert"))
    .toHaveTextContent("Usage could not be refreshed: rollouts unavailable.");
});

test("leaving a pending read aborts the page source's request", async () => {
  let executionSignal: AbortSignal | undefined;
  vi.spyOn(globalThis, "fetch").mockImplementation((input, init) => {
    const url = requestUrl(input);
    if (url.pathname !== usageTokenIndexEndpoint) {
      return Promise.reject(new Error(`Unexpected request: ${url.pathname}`));
    }
    if (url.searchParams.get("workflow") === "refinement") {
      return Promise.resolve(
        Response.json(
          makeMe.aTokenIndexAnswer.inWorkflow("refinement").please(),
        ),
      );
    }
    executionSignal = init?.signal ?? undefined;
    return new Promise<Response>((...[, reject]) => {
      init?.signal?.addEventListener(
        "abort",
        () => {
          reject(new DOMException("Aborted", "AbortError"));
        },
        { once: true },
      );
    });
  });

  await mountComponent(
    createElement(SystemSettingsUsage, { source: pageUsageSource }),
  );

  await expect.poll(() => executionSignal !== undefined).toBe(true);
  expect(executionSignal?.aborted).toBe(false);

  await userEvent.selectOptions(
    page.getByRole("combobox", { name: "Launch workflow", exact: true }),
    "refinement",
  );

  await expect.poll(() => executionSignal?.aborted).toBe(true);
  await expect.element(page.getByText("1 task · Last 30 days")).toBeVisible();
  await expect.element(page.getByRole("alert")).not.toBeInTheDocument();
});
