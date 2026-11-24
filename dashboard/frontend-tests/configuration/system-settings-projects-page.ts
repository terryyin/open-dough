import { createElement, useState } from "react";
import { expect, vi } from "vitest";
import { page, userEvent, type Locator } from "vitest/browser";
import { useProjectKeyboardNavigation } from "../../src/projectKeyboardNavigation.ts";
import { ProjectsOnPage } from "../../src/projectList.tsx";
import { ProjectsSettings } from "../../src/ProjectsSettings.tsx";
import type { ProjectSettingsSource } from "../../src/projectSettingsSource.ts";
import type { PublishedSource } from "../../src/publishedSource.ts";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import {
  readSettingText,
  resizeSettingsViewport,
  tapSettingWhereShown,
  type SettingsViewport,
} from "./system-settings-browser.ts";

type ProjectSelection = (source: PublishedSource | undefined) => void;

export function projectReplies() {
  return {
    read: vi.fn<ProjectSettingsSource["read"]>().mockResolvedValue([]),
    add: vi
      .fn<ProjectSettingsSource["add"]>()
      .mockRejectedValue(new Error("Unexpected Add request")),
    setHidden: vi
      .fn<ProjectSettingsSource["setHidden"]>()
      .mockRejectedValue(new Error("Unexpected visibility request")),
    remove: vi
      .fn<ProjectSettingsSource["remove"]>()
      .mockRejectedValue(new Error("Unexpected Remove request")),
  };
}

function ProjectSettingsWithKeyboard({
  source,
  selected,
  select,
}: {
  readonly source: ProjectSettingsSource;
  readonly selected: PublishedSource | undefined;
  readonly select: ProjectSelection;
}) {
  useProjectKeyboardNavigation({ source: selected, selectProject: select });
  return createElement(ProjectsSettings, {
    source,
    selectedId: selected?.id,
    onSelect: select,
  });
}

function ProjectSettingsMount({
  source,
  projects,
  selected,
  observeSelection,
}: {
  readonly source: ProjectSettingsSource;
  readonly projects: readonly PublishedSource[];
  readonly selected: PublishedSource;
  readonly observeSelection: ProjectSelection;
}) {
  const [configured, replaceProjects] = useState(projects);
  const [active, setActive] = useState<PublishedSource | undefined>(selected);
  function select(project: PublishedSource | undefined) {
    setActive(project);
    observeSelection(project);
  }
  return createElement(
    "main",
    { className: "system-settings" },
    createElement(ProjectsOnPage, {
      projects: configured,
      replaceProjects,
      children: createElement(ProjectSettingsWithKeyboard, {
        source,
        selected: active,
        select,
      }),
    }),
  );
}

async function touch(control: Locator) {
  await expect.element(control).toBeVisible();
  control.element().scrollIntoView({ block: "nearest" });
  await tapSettingWhereShown(control);
}

export async function mountProjectsSettings(
  source: ProjectSettingsSource,
  selected: PublishedSource,
  projects: readonly PublishedSource[],
  observeSelection: ProjectSelection,
  viewport?: SettingsViewport,
) {
  await mountComponent(
    createElement(ProjectSettingsMount, {
      source,
      selected,
      projects,
      observeSelection,
    }),
    viewport && { viewport },
  );
  const region = page.getByRole("region", { name: "Projects", exact: true });
  const opener = region.getByRole("button", {
    name: "Add project",
    exact: true,
  });
  const dialog = page.getByRole("dialog", { name: "Add project", exact: true });
  const url = dialog.getByRole("textbox", { name: "GitHub URL", exact: true });
  const path = dialog.getByRole("textbox", {
    name: "Execution checkout",
    exact: true,
  });
  const add = dialog.getByRole("button", { name: "Add", exact: true });
  const cancel = dialog.getByRole("button", { name: "Cancel", exact: true });
  const refusal = dialog.getByRole("alert");
  const projectHeading = (label: string) =>
    region.getByRole("heading", { name: label, exact: true });
  const projectRow = (label: string) =>
    region.getByRole("listitem").filter({
      has: page.getByRole("heading", { name: label, exact: true }),
    });
  const removal = (label: string) =>
    page.getByRole("dialog", { name: `Remove ${label}?`, exact: true });

  return {
    openAdd: () => userEvent.click(opener),
    submitAdd: () => userEvent.click(add),
    touchOpenAdd: () => touch(opener),
    touchSubmitAdd: () => tapSettingWhereShown(add),
    touchUrl: () => touch(url),
    touchPath: () => touch(path),
    typeUrl: (value: string) => userEvent.keyboard(value),
    fillPath: (value: string) => userEvent.fill(path, value),
    async fillDraft(githubUrl: string, localPath: string) {
      await userEvent.fill(url, githubUrl);
      await userEvent.fill(path, localPath);
    },
    async showsDraft(githubUrl: string, localPath: string) {
      await expect.element(url).toHaveValue(githubUrl);
      await expect.element(path).toHaveValue(localPath);
    },
    showsEnabledOpener: () => expect.element(opener).toBeEnabled(),
    showsEnabledAdd: () => expect.element(add).toBeEnabled(),
    showsOpenAdd: () => expect.element(dialog).toBeVisible(),
    showsClosedAdd: () => expect.element(dialog).not.toBeInTheDocument(),
    showsFocusedUrl: () => expect.element(url).toHaveFocus(),
    showsFocusedPath: () => expect.element(path).toHaveFocus(),
    showsFocusedOpener: () => expect.element(opener).toHaveFocus(),
    showsRefusal: (message: string) =>
      expect.element(refusal).toHaveTextContent(message),
    async showsPathRefusal(message: string) {
      await expect.element(refusal).toHaveTextContent(message);
      const alertId = refusal.element().id;
      expect(alertId).not.toBe("");
      await expect.element(path).toHaveAttribute("aria-invalid", "true");
      await expect.element(path).toHaveAttribute("aria-describedby", alertId);
      await expect.element(path).toHaveAccessibleDescription(message);
      await expect.element(url).toHaveAttribute("aria-invalid", "false");
    },
    readRefusal: () => readSettingText(refusal),
    cancel: () => userEvent.click(cancel),
    async focusCancel() {
      await expect.element(cancel).toBeEnabled();
      (cancel.element() as HTMLElement).focus();
      await expect.element(cancel).toHaveFocus();
    },
    escape: () => userEvent.keyboard("{Escape}"),
    projectArrow: (direction: "Left" | "Right") =>
      userEvent.keyboard(`{Arrow${direction}}`),
    showsProject: (label: string) =>
      expect.element(projectHeading(label)).toBeVisible(),
    showsNoProject: (label: string) =>
      expect.element(projectHeading(label)).not.toBeInTheDocument(),
    async readProject(label: string, localPath: string) {
      const row = projectRow(label);
      await expect
        .element(row.getByText(localPath, { exact: true }))
        .toBeVisible();
      await readSettingText(row.getByRole("definition").last());
    },
    async touchRemoveProject(label: string) {
      await touch(
        projectRow(label).getByRole("button", {
          name: `Remove project ${label}`,
          exact: true,
        }),
      );
      await tapSettingWhereShown(
        removal(label).getByRole("button", { name: "Remove", exact: true }),
      );
      await expect.element(removal(label)).not.toBeInTheDocument();
    },
    async fitsAddWithoutSidewaysScrolling() {
      await expect.element(dialog).toBeVisible();
      const container = dialog.element();
      const body = container.querySelector(".launch-dialog-body");
      if (body === null)
        throw new Error("The Add project dialog has no reading body");
      for (const element of [document.documentElement, container, body]) {
        expect(element.scrollWidth).toBeLessThanOrEqual(element.clientWidth);
      }
    },
    useViewport: resizeSettingsViewport,
  };
}
