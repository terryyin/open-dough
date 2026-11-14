// The Sessions sidebar and its toggle in the banner or side panel header.

export const sessionsSidebarId = "sessions-sidebar";

const sessionsButtonSelector = `[aria-controls="${sessionsSidebarId}"]`;

export const shownSessionsButton = () =>
  [...document.querySelectorAll<HTMLElement>(sessionsButtonSelector)].find(
    (button) =>
      button.getClientRects().length > 0 &&
      getComputedStyle(button).visibility === "visible",
  );

// After the panel closes, the banner's button is the focus return target.
export const bannerSessionsButton = () =>
  document.querySelector<HTMLElement>(`.banner ${sessionsButtonSelector}`);

// Whether an event happened on the sidebar or its Sessions button,
// which move around the sidebar, not the page beside or under it.
export const onSessionsSidebar = (event: Event) =>
  event.target instanceof Element &&
  event.target.closest(`#${sessionsSidebarId}, ${sessionsButtonSelector}`) !==
    null;
