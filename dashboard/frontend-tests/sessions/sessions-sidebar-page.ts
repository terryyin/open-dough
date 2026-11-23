export function present<T>(found: T | null | undefined, what: string): T {
  if (found === null || found === undefined) throw new Error(`No ${what}`);
  return found;
}

export function entries() {
  return [
    ...document.querySelectorAll<HTMLElement>(
      ".sessions-sidebar-sessions li.sessions-sidebar-session-entry",
    ),
  ];
}

export function entryOf(title: string) {
  return entries().find((entry) => titleOf(entry).textContent === title);
}

export function titleOf(entry: HTMLElement) {
  return present(
    entry.querySelector<HTMLElement>("h3.sessions-sidebar-session-entry-title"),
    "row title",
  );
}

export function openControlOf(entry: HTMLElement) {
  return present(
    entry.querySelector<HTMLButtonElement>(
      "button.sessions-sidebar-session-entry-open",
    ),
    "row open control",
  );
}

export function hiddenStateLabelOf(entry: HTMLElement) {
  return present(
    entry.querySelector<HTMLElement>(":scope > .visually-hidden"),
    "hidden state label",
  );
}
