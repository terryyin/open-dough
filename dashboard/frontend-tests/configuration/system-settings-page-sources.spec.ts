import { createElement } from "react";
import { afterEach, expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { OpenAISettings } from "../../src/OpenAISettings.tsx";
import { ProjectsSettings } from "../../src/ProjectsSettings.tsx";
import { TerminalThemeSettings } from "../../src/TerminalThemeSettings.tsx";
import {
  openAIConfigurationEndpoint,
  openAISaveEndpoint,
} from "../../src/openAIConfiguration.ts";
import { pageOpenAIConfigurationSource } from "../../src/openAIConfigurationSource.ts";
import {
  projectAddEndpoint,
  projectSettingsEndpoint,
} from "../../src/projectConfiguration.ts";
import { ProjectsOnPage } from "../../src/projectList.tsx";
import { pageProjectSettingsSource } from "../../src/projectSettingsSource.ts";
import { SavedTerminalThemeProvider } from "../../src/savedTerminalTheme.ts";
import {
  terminalThemeEndpoint,
  terminalThemeSaveEndpoint,
} from "../../src/terminalThemeSetting.ts";
import { pageTerminalThemeSource } from "../../src/terminalThemeSource.ts";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";

afterEach(() => {
  vi.restoreAllMocks();
});

function refusedRequests() {
  return vi
    .spyOn(globalThis, "fetch")
    .mockRejectedValue(new Error("Unexpected settings request"));
}

function showsRefusal(message: string) {
  return expect
    .poll(() => {
      const alert = page.getByRole("alert").query()?.cloneNode(true);
      if (!(alert instanceof Element)) return undefined;
      alert.querySelectorAll("button").forEach((button) => {
        button.remove();
      });
      return alert.textContent.trim();
    })
    .toBe(message);
}

test("OpenAI shows its fallback for a refused status and the endpoint's own refusal when saving", async () => {
  const requests = refusedRequests()
    .mockResolvedValueOnce(Response.json({}, { status: 503 }))
    .mockResolvedValueOnce(
      Response.json(
        { error: "The credential folder is locked." },
        { status: 503 },
      ),
    );

  await mountComponent(
    createElement(OpenAISettings, { source: pageOpenAIConfigurationSource }),
  );
  await showsRefusal(
    "OpenAI configuration could not be updated. Retry the operation.",
  );

  await userEvent.fill(
    page.getByLabelText("API key", { exact: true }),
    "example-key",
  );
  await userEvent.click(page.getByRole("button", { name: "Save API key" }));
  await showsRefusal("The credential folder is locked.");

  expect(requests).toHaveBeenNthCalledWith(1, openAIConfigurationEndpoint, {});
  expect(requests).toHaveBeenNthCalledWith(2, openAISaveEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apiKey: "example-key" }),
  });
});

test("Terminal theme shows the endpoint's own read refusal and its fallback when saving", async () => {
  const requests = refusedRequests()
    .mockResolvedValueOnce(
      Response.json(
        { error: "The theme could not be opened." },
        { status: 503 },
      ),
    )
    .mockResolvedValueOnce(Response.json({}, { status: 503 }));

  await mountComponent(
    createElement(SavedTerminalThemeProvider, {
      source: pageTerminalThemeSource,
      children: createElement(TerminalThemeSettings),
    }),
  );
  await showsRefusal("The theme could not be opened.");

  await userEvent.selectOptions(
    page.getByRole("combobox", { name: "Terminal theme" }),
    "solarized-dark",
  );
  await showsRefusal(
    "The terminal theme could not be saved. Retry the operation; the previous theme was kept.",
  );

  expect(requests).toHaveBeenNthCalledWith(1, terminalThemeEndpoint, {});
  expect(requests).toHaveBeenNthCalledWith(2, terminalThemeSaveEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ theme: "solarized-dark" }),
  });
});

test("Projects shows its read fallback and links an endpoint refusal to the draft field", async () => {
  const requests = refusedRequests()
    .mockResolvedValueOnce(Response.json({}, { status: 503 }))
    .mockResolvedValueOnce(Response.json([], { status: 200 }))
    .mockResolvedValueOnce(
      Response.json(
        { error: "This checkout has a different origin.", field: "localPath" },
        { status: 400 },
      ),
    );

  await mountComponent(
    createElement(ProjectsOnPage, {
      projects: [],
      replaceProjects: () => {},
      children: createElement(ProjectsSettings, {
        source: pageProjectSettingsSource,
        selectedId: undefined,
        onSelect: () => {},
      }),
    }),
  );
  await showsRefusal("Project settings could not be read.");
  await userEvent.click(page.getByRole("button", { name: "Retry" }));
  await expect.element(page.getByRole("alert")).not.toBeInTheDocument();

  await userEvent.click(
    page.getByRole("button", { name: "Add project", exact: true }),
  );
  const dialog = page.getByRole("dialog", { name: "Add project" });
  const githubUrl = "https://github.com/example/sample-app";
  const localPath = "~/git/sample-app";
  await userEvent.fill(dialog.getByLabelText("GitHub URL"), githubUrl);
  await userEvent.fill(dialog.getByLabelText("Local path"), localPath);
  await userEvent.click(
    dialog.getByRole("button", { name: "Add", exact: true }),
  );
  await showsRefusal("This checkout has a different origin.");
  await expect
    .element(dialog.getByLabelText("Local path"))
    .toHaveAccessibleDescription("This checkout has a different origin.");

  const [readEndpoint, readOptions] = requests.mock.calls[0] ?? [];
  expect(readEndpoint).toBe(projectSettingsEndpoint);
  expect(readOptions?.signal).toBeInstanceOf(AbortSignal);
  expect(requests).toHaveBeenNthCalledWith(3, projectAddEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ githubUrl, localPath }),
  });
});
