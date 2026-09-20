// The one project this dashboard observes. It is fixed here on purpose: there
// is no project picker, registration, sign-in, or token.
export const publishedSource = {
  repository: "terryyin/open-dough",
  ref: "main",
  backlogPath: ".planning/PRODUCT-BACKLOG.md",
} as const;

export type PublishedSource = typeof publishedSource;
