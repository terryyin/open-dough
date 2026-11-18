export const apiKey = (page: import("@playwright/test").Page) =>
  page.getByLabel("API key", { exact: true });
export const save = (page: import("@playwright/test").Page) =>
  page.getByRole("button", { name: "Save API key", exact: true });
export const status = (page: import("@playwright/test").Page) =>
  page.getByRole("status").filter({ hasText: "API key:" });
