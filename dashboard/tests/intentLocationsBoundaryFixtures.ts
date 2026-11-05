// Published settings and source files for Intent locations boundary checks.

export const knownSourceId = "open-dough";
export const backlog = `# Product backlog

## Taken

## Backlog list
`;
export const settingsPath = ".planning/open-dough.json";
export const featurePath = "e2e_test/features/recall/note.feature";
export const outsidePath = "README.md";
export const featureText = "Feature: Note\n";
export const settings = JSON.stringify({
  intent: {
    locations: [{ path: "e2e_test/features", kind: "gherkin" }],
  },
});

export const revisionOf = (byte: string) => byte.repeat(20);
