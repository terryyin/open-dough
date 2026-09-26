// What the accessible-overview journeys publish: work too long for any line,
// and a backlog too long for one screen. Only raw backlog files are written
// here; what the page shows is for each test to observe.

export const revision = "7c0ffee1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f607";

// One word no line can hold, as a title, a path, and an anchor may each be.
const unbroken = "Uninterruptedlyconcatenated".repeat(5);
const longPath = `seeds/SEED-090-${"a-very-long-file-name-".repeat(6)}end.md`;
const longAnchor = `${"a-long-anchor-".repeat(6)}end`;

export const longTitle = `Keep a title holding one ${unbroken} word, and many ordinary words after it, readable wherever the overview is opened and however narrow the window becomes`;
export const longIdentity = `SEED-090#${longAnchor}`;
export const longPlan = `slice-plans/090-${"readable-".repeat(12)}overview/PLAN.md`;
export const longAddress = `https://status.example.com/${"notes/".repeat(24)}2026-09?view=full#api`;
export const unusableTarget = `javascript:${"x".repeat(140)}`;

export const longBacklog = `# Product backlog

## Near-future direction

Give developers visibility into a project's published work, including ${unbroken} when someone records it.
Derive it solely from Git state published to origin.

## Taken

- [${longTitle}](${longPath}#${longAnchor}) — ${longIdentity} ([plan](${longPlan}))
- [Repair the installer's update report](slice-plans/059-installer-update-report/PLAN.md)

## Backlog list

- [Read the hosting provider's note](${longAddress}) — NOTE-7#api
- [Keep a target that is not offered as a link readable](${unusableTarget}) — HOSTILE-1#x
- [Queue trunk integration for agents on the same machine](seeds/SEED-008-sync.md#same-machine-merge-queue) — SEED-008#same-machine-merge-queue
`;

export const queuedCount = 40;
export const queuedTitle = (place: number) =>
  `Queued work number ${place} waits for its turn`;
const queuedPlaces = Array.from(
  Array(queuedCount).keys(),
  (index) => index + 1,
);
export const queuedTitles = queuedPlaces.map(queuedTitle);

export const largeBacklog = `# Product backlog

## Taken

- [Repair the installer's update report](slice-plans/059-installer-update-report/PLAN.md)

## Backlog list

${queuedPlaces
  .map(
    (place) =>
      `- [${queuedTitle(place)}](seeds/SEED-1${place}-queued.md#story) — SEED-1${place}#story`,
  )
  .join("\n")}
`;
