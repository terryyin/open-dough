// Chromium arguments every dashboard browser starts with
// (../../playwright.config.ts). A spec or fixture family that sets its own
// `launchOptions` replaces the configured value whole, so it spreads these
// into its own `args`.
//
// Key scrolling is instant. Chromium counts an aborted smooth-scroll
// compositor animation as finished: under competing load a reading key handed
// from the page body to the Board then fires `scrollend` with no movement.
// The flag also makes programmatic smooth reveals instant (accepted
// 2026-11-13).
export const dashboardBrowserArgs = ["--disable-smooth-scrolling"];
