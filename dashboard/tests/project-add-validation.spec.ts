import { mkdirSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { expect, test } from "./support/pageTest.ts";
import { addProject } from "../server/projectAddition.ts";
import {
  appendConfiguredProject,
  configuredProjects,
} from "../server/projectConfiguration.ts";
import { ProjectInputProblem, type ProjectInput } from "../src/projectInput.ts";
import { failsWith, publishes } from "./support/fakeGitHub.ts";
import {
  projectAdditionFixture,
  validationRepository,
} from "./support/projectAdditionFixture.ts";

test.describe.configure({ mode: "serial" });
let fixture: Awaited<ReturnType<typeof projectAdditionFixture>>;
test.beforeEach(async () => {
  fixture = await projectAdditionFixture();
});
test.afterEach(async () => fixture.close());

async function refuses(input: ProjectInput, field: string, message: string) {
  const bytes = readFileSync(fixture.file, "utf8");
  const projects = configuredProjects();
  await expect(
    addProject(input, new AbortController().signal),
  ).rejects.toMatchObject({
    field,
    message,
  });
  expect(readFileSync(fixture.file, "utf8")).toBe(bytes);
  expect(configuredProjects()).toEqual(projects);
  expect(readdirSync(path.dirname(fixture.file))).toEqual([
    "projects-development.json",
  ]);
}

test("a non-GitHub URL is refused at its field without an external read", async () => {
  await refuses(
    { ...fixture.input, githubUrl: "https://gitlab.com/example/sample-app" },
    "githubUrl",
    "Enter a GitHub repository URL in HTTPS or SSH form.",
  );
  expect(fixture.github.calls).toEqual([]);
});

test("an unreadable GitHub repository is refused at its URL field", async () => {
  fixture.github.serve(
    validationRepository,
    failsWith("gh: Not Found (HTTP 404)"),
  );
  await refuses(
    fixture.input,
    "githubUrl",
    `The repository ${validationRepository} could not be read through the local GitHub CLI. Check gh access and try again.`,
  );
  expect(fixture.github.calls.map((call) => call.argv)).toEqual([
    ["api", `repos/${validationRepository}`, "--jq", ".default_branch"],
  ]);
});

for (const kind of [
  "missing",
  "non-checkout",
  "nested checkout folder",
] as const) {
  test(`${kind} is refused at the local path field before GitHub is read`, async () => {
    const localPath = path.join(
      kind === "nested checkout folder" ? fixture.checkout : fixture.home,
      "folder",
    );
    if (kind !== "missing") {
      mkdirSync(localPath);
    }
    const message =
      kind === "missing"
        ? `The local folder ${localPath} was not found.`
        : `The local folder ${localPath} is not the root of a Git checkout with an origin repository.`;
    await refuses({ ...fixture.input, localPath }, "localPath", message);
    expect(fixture.github.calls).toEqual([]);
  });
}

test("a different origin names both repositories and refuses the local path", async () => {
  fixture.setOrigin("https://github.com/another/different.git");
  await refuses(
    fixture.input,
    "localPath",
    `The origin of ${fixture.checkout} is another/different, but the GitHub URL names ${validationRepository}.`,
  );
  expect(fixture.github.calls).toEqual([]);
});

for (const duplicate of ["repository", "id"] as const) {
  test(`a case-insensitive duplicate ${duplicate} is refused without replacing saved projects`, async () => {
    appendConfiguredProject({
      id: duplicate === "id" ? "SAMPLE-APP" : "different-id",
      label: "Already configured",
      repository:
        duplicate === "repository"
          ? "EXAMPLE/SAMPLE-APP"
          : "another/sample-app",
      ref: "previous-branch",
      backlogPath: ".planning/PRODUCT-BACKLOG.md",
      localPath: "~/previous-checkout",
    });
    await refuses(
      { ...fixture.input, githubUrl: "git@github.com:Example/Sample-App.git" },
      "githubUrl",
      duplicate === "repository"
        ? `${validationRepository} is already configured.`
        : "The project id sample-app is already configured. Projects sharing an id would share session records.",
    );
    expect(configuredProjects()).toHaveLength(1);
  });
}

test("concurrent validated additions recheck admission and save exactly one append", async () => {
  let release: () => void = () => undefined;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  const published = publishes({
    revision: "ab".repeat(20),
    defaultBranch: "release+next",
  });
  fixture.github.serve(validationRepository, async (call) => {
    await held;
    return published(call);
  });
  const first = addProject(fixture.input, new AbortController().signal);
  const second = addProject(
    { ...fixture.input, githubUrl: "git@github.com:EXAMPLE/SAMPLE-APP.git" },
    new AbortController().signal,
  );
  const results = Promise.allSettled([first, second]);
  try {
    await expect.poll(() => fixture.github.calls.length).toBe(2);
    expect(readFileSync(fixture.file, "utf8")).toBe("[]\n");
  } finally {
    release();
  }
  const settled = await results;
  expect(
    settled.filter((result) => result.status === "fulfilled"),
  ).toHaveLength(1);
  const refusal = settled.find((result) => result.status === "rejected");
  expect(refusal?.reason).toBeInstanceOf(ProjectInputProblem);
  expect(refusal?.reason).toMatchObject({
    field: "githubUrl",
    message: `${validationRepository} is already configured.`,
  });
  const saved = JSON.parse(readFileSync(fixture.file, "utf8")) as unknown[];
  expect(saved).toEqual([
    {
      id: "sample-app",
      label: "Sample App",
      repository: validationRepository,
      ref: "release+next",
      backlogPath: ".planning/PRODUCT-BACKLOG.md",
      localPath: fixture.checkout,
    },
  ]);
  expect(configuredProjects()).toEqual(saved);
  expect(readdirSync(path.dirname(fixture.file))).toEqual([
    "projects-development.json",
  ]);
});
