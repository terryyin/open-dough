// Where the Sessions sidebar and the banner's Sessions button that toggles it
// (`./SessionsSidebar.tsx`) are found on the page, and nowhere else.

export const sessionsSidebarId = "sessions-sidebar";

const sessionsButtonSelector = `[aria-controls="${sessionsSidebarId}"]`;

export const sessionsButton = () =>
  document.querySelector<HTMLElement>(sessionsButtonSelector);

// Whether an event happened on the sidebar or the banner's Sessions button,
// which move around the sidebar, not the page beside or under it.
export const onSessionsSidebar = (event: Event) =>
  event.target instanceof Element &&
  event.target.closest(`#${sessionsSidebarId}, ${sessionsButtonSelector}`) !==
    null;
