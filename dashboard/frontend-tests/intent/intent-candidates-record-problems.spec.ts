// Intent explains an absent, empty, mismatched or unreadable Test
// Optimization Candidates record in its own words on the Optimization
// Candidates view, and each project's locations stay browsable on CI status
// after its record fails (example 7; ../../src/IntentCandidatesRecord.tsx).
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { pygardonFeatures } from "../../../Distribution/tests/support/publishedFilesTestData.mjs";
import type { IntentCandidatesReadResult } from "../../src/authenticatedIntentCandidatesRead.ts";
import type { PublishedWork } from "../../src/publishedWork.ts";
import { testOptimizationCandidatesPath as recordPath } from "../../src/testOptimizationCandidatesPath.ts";
import { intentBrowser } from "./intent-browser-page.ts";
import { intentCandidates, textAsRead } from "./intent-candidates-page.ts";
import {
  mountPageIntentReading,
  projectsPublishedWithCandidates,
  type CandidatesPublication,
} from "./intent-revision-fixtures.ts";

// A project's candidates publication and its published work.
type PublishedProject = CandidatesPublication & {
  readonly work: PublishedWork;
};

const projectWith = (
  id: string,
  label: string,
  scenario: string,
  candidates: IntentCandidatesReadResult,
): PublishedProject => {
  const source = makeMe.aPublishedSource
    .with({ id, label, repository: `terryyin/${id}` })
    .please();
  const work = makeMe.aPublishedWork
    .of(source)
    .at(id.slice(0, 2).repeat(20))
    .please();
  return { source, work, scenario, candidates };
};

const projects = [
  projectWith("doughnut", "Doughnut", "Doughnut job", { status: "absent" }),
  projectWith("open-dough", "Open Dough", "Open Dough job", {
    status: "present",
    text: makeMe.aTestOptimizationCandidatesRecord.please(),
  }),
  projectWith("pygardon", "Pygardon", "Pygardon job", {
    status: "present",
    text: "# Not A Candidates Record\n\n## Something else\n\nBody that Intent must not partially show.\n",
  }),
  projectWith("unread", "Unread", "Unread job", {
    status: "unreadable",
    recovery: undefined,
  }),
] as const;

const { record } = intentCandidates();

// Chooses the record of `work`'s shown revision.
async function chooseRecordOf(work: PublishedWork) {
  return (await intentCandidates().choose()).isRecordedAt(work.revision);
}

async function recordReads(expected: string) {
  await expect.poll(() => textAsRead(record)).toContain(expected);
}

// Leaves the record for CI status, where the project's own jobs feature opens.
async function browsesLocations({ scenario }: PublishedProject) {
  await intentCandidates().leaveForCiStatus();
  await (
    await intentBrowser().open(pygardonFeatures.jobs)
  ).shows(`Scenario: ${scenario}`);
}

test("each unavailable record keeps its own explanation, and the project's locations stay browsable", async () => {
  const [absent, empty, mismatched, unreadable] = projects;
  const { reads, readSource } = projectsPublishedWithCandidates(projects);
  const intent = await mountPageIntentReading(readSource, absent.work);

  const candidates = await chooseRecordOf(absent.work);
  await recordReads(
    "No Test Optimization Candidates record has been published for Doughnut at this revision.",
  );
  await browsesLocations(absent);

  intent.showProject(empty.work);
  await chooseRecordOf(empty.work);
  await recordReads(
    "This record has no pending candidates or accepted necessary costs.",
  );
  for (const section of ["Pending candidates", "Accepted necessary costs"])
    await expect
      .poll(() => textAsRead(record.getByRole("region", { name: section })))
      .toContain("None.");
  await candidates.showsNoFailure();
  await browsesLocations(empty);

  intent.showProject(mismatched.work);
  await chooseRecordOf(mismatched.work);
  await recordReads(
    `${recordPath} is not a Test Optimization Candidates record, so Intent shows none of its contents.`,
  );
  expect(textAsRead(record)).not.toContain("Body that Intent must not");
  await browsesLocations(mismatched);

  intent.showProject(unreadable.work);
  await chooseRecordOf(unreadable.work);
  await recordReads(`${recordPath} could not be read at this revision.`);
  await expect
    .element(record.getByRole("button", { name: "Retry", exact: true }))
    .toBeVisible();
  await browsesLocations(unreadable);

  expect(reads, "one record read per project, in order").toEqual(
    projects.map(({ work }) => work.revision),
  );
});
