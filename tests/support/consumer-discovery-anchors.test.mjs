import assert from "node:assert/strict";
import { test } from "node:test";
import {
  backlogOf,
  projectFile,
  run,
  scratchProject,
} from "./product-backlog-fixture.mjs";
import { dependency, updateDependency } from "./story-dependencies-fixture.mjs";

const supplier = { identity: "SEED-S#supplier", link: "seeds/S.md#supplier" };

async function discover(project) {
  const result = await run(project, [
    "discover-consumers",
    "--supplier-identity",
    supplier.identity,
  ]);
  assert.equal(result.code, 0, result.stderr);
  return JSON.parse(result.stdout);
}

test("documentation anchors leave neighboring unqueued consumers and plan-homed corrections discoverable", async (t) => {
  const project = scratchProject(t, backlogOf([], []));
  projectFile(
    project,
    "seeds/S.md",
    '---\nid: SEED-S\n---\n\n# Supplier\n\n<a id="supplier"></a>\n\n### Supplier endpoint\n',
  );
  const examples = [
    [
      "001",
      "client-installation-and-update",
      "## Current contract\n\nInstallation guidance.",
    ],
    [
      "010",
      "pending-lifecycle-validation-obligations",
      "## Separately pending lifecycle validation obligations\n\nNot a selected story.",
    ],
    [
      "028",
      "native-one-shot-other-hosts",
      "Closed: native setup validation was completed.",
    ],
  ];
  const identities = [];
  for (const [number, anchor, prose] of examples) {
    const story = {
      identity: `SEED-${number}#consumer`,
      link: `seeds/${number}.md#consumer`,
    };
    projectFile(
      project,
      `seeds/${number}.md`,
      `---\nid: SEED-${number}\n---\n\n# Guidance\n\n<a id="${anchor}"></a>\n\n${prose}\n\n<a id="consumer"></a>\n\n### Neighboring consumer\n\nRequires the endpoint.\n`,
    );
    const updated = await updateDependency(
      project,
      story,
      dependency(supplier),
    );
    assert.equal(updated.code, 0, updated.stderr);
    identities.push(story.identity);
  }
  const correction = {
    identity: "slice-plans/100-correction",
    link: "slice-plans/100-correction/PLAN.md",
  };
  projectFile(
    project,
    correction.link,
    `# Correction\n\n**Identity:** ${correction.identity}\n\n<a id="evidence"></a>\n\n## Evidence\n\nCompleted behavior.\n`,
  );
  const updated = await updateDependency(
    project,
    correction,
    dependency(supplier),
  );
  assert.equal(updated.code, 0, updated.stderr);
  identities.push(correction.identity);

  const result = await discover(project);
  assert.deepEqual(result.problems, []);
  assert.deepEqual(
    result.consumers.map((entry) => entry.identity).sort(),
    identities.sort(),
  );
});

test("records outside navigation anchors still report their missing home", async (t) => {
  for (const [fence, name] of [
    ["dough-story-dependencies", "Dependency"],
    ["dough-story-state", "Preparation"],
  ]) {
    const project = scratchProject(t, backlogOf([], []));
    projectFile(
      project,
      "seeds/orphan.md",
      `# Notes\n\n\`\`\`json ${fence}\n{}\n\`\`\`\n\n<a id="notes"></a>\n\n## Notes\n\nDocumentation.\n`,
    );
    const result = await discover(project);
    assert.deepEqual(result.consumers, []);
    assert.deepEqual(result.problems, [
      {
        path: "seeds/orphan.md",
        problem: `${name} record has no canonical home.`,
      },
    ]);
  }
});

test("documentation mentioning record names does not declare a home or dependency", async (t) => {
  const project = scratchProject(t, backlogOf([], []));
  projectFile(
    project,
    "seeds/notes.md",
    '# Notes\n\n<a id="notes"></a>\n\n## Notes\n\nThe dough-story-state and dough-story-dependencies records are documented here.\n',
  );
  const result = await discover(project);
  assert.deepEqual(result.consumers, []);
  assert.deepEqual(result.problems, []);
});

test("listed malformed homes and unqueued anchored records still report discovery gaps", async (t) => {
  const project = scratchProject(
    t,
    backlogOf(
      [],
      ["- [Broken listed home](seeds/broken.md#listed) — SEED-B#listed"],
    ),
  );
  projectFile(
    project,
    "seeds/broken.md",
    `---\nid: SEED-B\n---\n\n# Broken homes\n
<a id="listed"></a>
Ordinary-looking prose still belongs to the listed home.

<a id="identity"></a>
**Identity:** SEED-B#identity

<a id="preparation"></a>
\`\`\`json dough-story-state
{}
\`\`\`

<a id="dependencies"></a>
\`\`\`json dough-story-dependencies
{}
\`\`\`

<a id="wrong-heading-identity"></a>
## Mistaken story heading
**Identity:** SEED-B#wrong-heading-identity

<a id="wrong-heading-preparation"></a>
## Mistaken story heading
\`\`\`json dough-story-state
{}
\`\`\`

<a id="wrong-heading-dependencies"></a>
## Mistaken story heading
\`\`\`json dough-story-dependencies
{}
\`\`\`
`,
  );
  const result = await discover(project);
  assert.deepEqual(result.consumers, []);
  assert.deepEqual(
    result.problems.map((entry) => entry.href).sort(),
    [
      "listed",
      "identity",
      "preparation",
      "dependencies",
      "wrong-heading-identity",
      "wrong-heading-preparation",
      "wrong-heading-dependencies",
    ]
      .map((anchor) => `seeds/broken.md#${anchor}`)
      .sort(),
  );
  for (const problem of result.problems) {
    assert.match(problem.problem, /no "### " story heading/);
  }
});
