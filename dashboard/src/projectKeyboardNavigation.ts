import { useEffect, useLayoutEffect, useRef } from "react";
import { projectRadioName } from "./ProjectSelect.tsx";
import { adjacentSource, type PublishedSource } from "./publishedSource.ts";

// Page-wide Left/Right project cycling. Native project radios, editing, other
// arrow-operated controls, already-handled keys, modifiers, and an open modal
// keep their own keyboard meaning; elsewhere an unmodified arrow selects the
// adjacent catalog project through the same callback as pointer selection.

export type ProjectArrowEligibility = {
  readonly key: string;
  readonly altKey: boolean;
  readonly ctrlKey: boolean;
  readonly metaKey: boolean;
  readonly shiftKey: boolean;
  readonly defaultPrevented: boolean;
  readonly target: EventTarget | null;
};

type FocusAfterSwitch = "refresh" | "selected-project" | "unchanged";

function isProjectRadio(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLInputElement &&
    target.type === "radio" &&
    target.name === projectRadioName
  );
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  if (target.isContentEditable) {
    return true;
  }
  if (target instanceof HTMLTextAreaElement) {
    return !target.readOnly && !target.disabled;
  }
  if (!(target instanceof HTMLInputElement) || target.disabled) {
    return false;
  }
  if (
    target.type === "button" ||
    target.type === "submit" ||
    target.type === "reset" ||
    target.type === "checkbox" ||
    target.type === "radio" ||
    target.type === "file" ||
    target.type === "image" ||
    target.type === "hidden"
  ) {
    return false;
  }
  return !target.readOnly;
}

function isArrowOperatedControl(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) {
    return false;
  }
  if (target instanceof HTMLSelectElement) {
    return true;
  }
  if (target instanceof HTMLInputElement) {
    return (
      target.type === "range" ||
      target.type === "number" ||
      target.type === "date" ||
      target.type === "time" ||
      target.type === "datetime-local" ||
      target.type === "month" ||
      target.type === "week" ||
      target.type === "radio" ||
      target.type === "checkbox"
    );
  }
  const role = target.getAttribute("role");
  return (
    role === "slider" ||
    role === "spinbutton" ||
    role === "listbox" ||
    role === "menu" ||
    role === "menubar" ||
    role === "tablist" ||
    role === "tree" ||
    role === "grid" ||
    role === "radiogroup" ||
    role === "combobox"
  );
}

function isInsideOpenDialog(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest("dialog[open]") !== null;
}

export function isProjectArrowShortcutEligible(
  event: ProjectArrowEligibility,
): boolean {
  if (event.defaultPrevented) {
    return false;
  }
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
    return false;
  }
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
    return false;
  }
  if (isInsideOpenDialog(event.target)) {
    return false;
  }
  if (isProjectRadio(event.target)) {
    return false;
  }
  if (isEditableTarget(event.target)) {
    return false;
  }
  if (isArrowOperatedControl(event.target)) {
    return false;
  }
  return true;
}

function isReadControl(element: Element): boolean {
  if (!(element instanceof HTMLElement)) {
    return false;
  }
  const name = element.getAttribute("aria-label");
  return name === "Refresh" || name === "Retry";
}

function focusSelectedProjectRadio(): void {
  document
    .querySelector<HTMLInputElement>(
      `input[type="radio"][name="${projectRadioName}"]:checked`,
    )
    ?.focus();
}

function focusReadControl(): void {
  document
    .querySelector<HTMLElement>(
      'button[aria-label="Refresh"], button[aria-label="Retry"]',
    )
    ?.focus();
}

function focusStillUseful(): boolean {
  const focused = document.activeElement;
  return (
    focused instanceof HTMLElement &&
    focused.isConnected &&
    focused !== document.body &&
    focused !== document.documentElement
  );
}

// Banner read control survives a project switch by role; story/roster content
// does not. Capture the intent before React replaces the observation.
function focusAfterProjectSwitch(focused: Element | null): FocusAfterSwitch {
  if (!(focused instanceof HTMLElement) || !focused.isConnected) {
    return "selected-project";
  }
  if (isReadControl(focused)) {
    return "refresh";
  }
  if (isProjectRadio(focused) || focused.closest(".banner")) {
    return "unchanged";
  }
  return "selected-project";
}

export function useProjectKeyboardNavigation({
  source,
  selectProject,
}: {
  readonly source: PublishedSource;
  readonly selectProject: (next: PublishedSource) => void;
}): void {
  const sourceRef = useRef(source);
  sourceRef.current = source;
  const selectProjectRef = useRef(selectProject);
  selectProjectRef.current = selectProject;
  const previousSourceId = useRef(source.id);
  const focusAfterSwitch = useRef<FocusAfterSwitch | undefined>(undefined);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!isProjectArrowShortcutEligible(event)) {
        return;
      }
      event.preventDefault();
      focusAfterSwitch.current = focusAfterProjectSwitch(
        document.activeElement,
      );
      const step = event.key === "ArrowRight" ? 1 : -1;
      selectProjectRef.current(adjacentSource(sourceRef.current, step));
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useLayoutEffect(() => {
    if (previousSourceId.current === source.id) {
      return;
    }
    previousSourceId.current = source.id;
    const planned = focusAfterSwitch.current;
    focusAfterSwitch.current = undefined;
    if (planned === "refresh") {
      focusReadControl();
      return;
    }
    if (planned === "unchanged") {
      return;
    }
    if (planned === "selected-project" || !focusStillUseful()) {
      focusSelectedProjectRadio();
    }
  }, [source.id]);
}
