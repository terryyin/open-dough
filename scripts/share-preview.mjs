// Preview inputs and text for scripts/test-shares.mjs. Allocation stays in
// share-deal.mjs; this module reads a browser test group's spec files and
// duration list.
import { dealShares, readDurationList } from "./share-deal.mjs";
import { formatSeconds } from "./duration-list.mjs";

// A browser test group's spec files under ROOT of specDir, as its
// configuration discovers them (dashboard/tests/support/testFiles.mjs).
// Imported only when used: runner fixtures copy the runner modules without
// the dashboard tree (Distribution/tests/helpers/copy-runner.bash).
async function listDashboardSpecFiles(specDir, root) {
  const { dashboardSpecFiles } = await import(
    new URL("../dashboard/tests/support/testFiles.mjs", import.meta.url)
  );
  return dashboardSpecFiles(specDir, [root]);
}

export async function previewFromOptions(options) {
  const specDir = options["spec-dir"];
  const listPath = options.list ?? `${specDir}/longest-first`;
  const labels = await listDashboardSpecFiles(specDir, options.root ?? ".");
  const allocation = dealShares(
    labels,
    readDurationList(listPath).seconds,
    Number(options["split-count"]),
  );
  return formatPreview(allocation, { listName: listPath });
}

// The preview text: the list and job counts, each share's predicted total,
// then each unrecorded job with its share and assumed seconds.
export function formatPreview(allocation, { listName }) {
  const jobCount = allocation.recordedCount + allocation.unrecordedCount;
  const assumption =
    allocation.recordedMedian === allocation.assumedSeconds
      ? "the recorded median"
      : "no usable recorded median";
  const lines = [
    `Predicted job-seconds per share from ${listName}: ${jobCount} jobs, ${allocation.recordedCount} recorded, ${allocation.unrecordedCount} unrecorded at ${formatSeconds(allocation.assumedSeconds)} s each (${assumption}).`,
  ];
  for (const share of allocation.shares) {
    const unrecorded = share.jobs.filter((job) => !job.recorded).length;
    lines.push(
      `share ${share.index}/${allocation.shareCount}: ${formatSeconds(share.predicted)} predicted (${share.jobs.length} jobs, ${unrecorded} unrecorded)`,
    );
  }
  if (allocation.unrecordedCount > 0) {
    lines.push(
      `unrecorded jobs (${allocation.unrecordedCount}), each assumed at ${formatSeconds(allocation.assumedSeconds)} s; a refresh of ${listName} records them:`,
    );
    for (const share of allocation.shares) {
      for (const job of share.jobs) {
        if (!job.recorded) {
          lines.push(
            `  share ${share.index}/${allocation.shareCount}  ${job.label}`,
          );
        }
      }
    }
  }
  return `${lines.join("\n")}\n`;
}
