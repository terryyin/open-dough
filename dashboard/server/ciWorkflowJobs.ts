// Read just the workflow's jobs, names and dependencies. Nested properties
// such as steps and strategy may use YAML syntax this reader does not need.
type Line = { readonly indent: number; readonly text: string };
type Block = [line: Line, ...children: Line[]];

export type WorkflowJob = {
  readonly id: string;
  readonly name?: string;
  readonly needs: readonly string[];
};

const jobId = /^[a-zA-Z_][a-zA-Z0-9_-]*$/;
const expression = /\$\{\{(?:'(?:''|[^'])*'|[^'}]|\}(?!\}))*\}\}/g;

function linesOf(workflow: string): Line[] {
  return workflow.split(/\r?\n/).flatMap((line) => {
    const text = line.trimEnd().trimStart();
    if (text === "" || text.startsWith("#")) return [];
    const indent = /^ */.exec(line)?.[0].length ?? 0;
    return [{ indent, text: line.trimEnd().slice(indent) }];
  });
}

// Split siblings from their subtrees without interpreting nested settings.
function blocks(lines: readonly Line[]): Block[] {
  const level = lines[0]?.indent ?? 0;
  const result: Block[] = [];
  for (const line of lines) {
    if (line.indent < level) return [];
    if (line.indent === level) result.push([line]);
    else result.at(-1)?.push(line);
  }
  return result;
}

function field(line: Line): { key: string; value: string } | undefined {
  const match =
    /^(?:([a-zA-Z_][\w-]*)|'([a-zA-Z_][\w-]*)'|"([a-zA-Z_][\w-]*)"):(?:[ \t]+(.*)|$)/.exec(
      line.text,
    );
  const key = match?.[1] ?? match?.[2] ?? match?.[3];
  return key === undefined ? undefined : { key, value: match?.[4] ?? "" };
}

function scalar(text: string): string | undefined {
  const single = /^'((?:''|[^'])*)'(?:\s+#.*)?$/.exec(text);
  if (single?.[1] !== undefined) return single[1].replaceAll("''", "'");
  const double = /^"([^"\\]*)"(?:\s+#.*)?$/.exec(text);
  if (double?.[1] !== undefined) return double[1];
  // A # inside an Actions expression is part of the expression.
  const masked = text.replaceAll(expression, (part) => "x".repeat(part.length));
  const comment = masked.search(/(?:^|\s)#/);
  const plain = (comment === -1 ? text : text.slice(0, comment)).trimEnd();
  if (plain === "" || /^[-?:](?:\s|$)|^[&*!|>{}[%@'"`\]]|:\s|:$/.test(plain)) {
    return undefined;
  }
  return plain;
}

function emptyOrComment(value: string): boolean {
  return value === "" || value.startsWith("#");
}

function needIds(
  value: string,
  children: readonly Line[],
): string[] | undefined {
  let values: string[];
  if (emptyOrComment(value)) {
    const itemIndent = children[0]?.indent;
    if (itemIndent === undefined) return undefined;
    values = [];
    for (const child of children) {
      if (child.indent !== itemIndent || !child.text.startsWith("- "))
        return undefined;
      values.push(child.text.slice(2).trimStart());
    }
  } else {
    if (children.length > 0) return undefined;
    const list = /^\[([^\]]*)\](?:\s+#.*)?$/.exec(value);
    const items = list?.[1]?.trim();
    values =
      items === undefined ? [value] : items === "" ? [] : items.split(",");
  }
  const ids: string[] = [];
  for (const item of values) {
    const id = scalar(item.trim());
    if (id === undefined || !jobId.test(id)) return undefined;
    ids.push(id);
  }
  return ids;
}

function readJob(
  id: string,
  properties: readonly Line[],
): WorkflowJob | undefined {
  let name: string | undefined;
  let needs: string[] | undefined;
  const seen = new Set<string>();
  const fields = blocks(properties);
  if (fields.length === 0) return undefined;
  for (const [line, ...children] of fields) {
    const property = field(line);
    if (property === undefined || seen.has(property.key)) return undefined;
    seen.add(property.key);
    if (property.key === "name") {
      name = scalar(property.value);
      if (
        children.length > 0 ||
        name === undefined ||
        name === "" ||
        name.replaceAll(expression, "").includes("${{")
      )
        return undefined;
    }
    if (property.key === "needs") {
      needs = needIds(property.value, children);
      if (needs === undefined) return undefined;
    }
  }
  return { id, ...(name === undefined ? {} : { name }), needs: needs ?? [] };
}

export function readWorkflowJobs(workflow: string): WorkflowJob[] | undefined {
  const lines = linesOf(workflow);
  if (lines[0]?.text === "---") lines.shift();
  if (lines.at(-1)?.text === "...") lines.pop();
  if (lines[0]?.indent !== 0) return undefined;
  let jobs: WorkflowJob[] | undefined;
  for (const [line, ...children] of blocks(lines)) {
    const root = field(line);
    if (root === undefined) return undefined;
    if (root.key !== "jobs") continue;
    if (jobs !== undefined || !emptyOrComment(root.value)) return undefined;
    jobs = [];
    for (const [jobLine, ...properties] of blocks(children)) {
      const job = field(jobLine);
      if (
        job === undefined ||
        !jobId.test(job.key) ||
        !emptyOrComment(job.value) ||
        jobs.some(({ id }) => id === job.key)
      )
        return undefined;
      const read = readJob(job.key, properties);
      if (read === undefined) return undefined;
      jobs.push(read);
    }
  }
  return jobs === undefined || jobs.length === 0 ? undefined : jobs;
}

export function workflowJobNameMatcher(
  job: WorkflowJob,
): (name: string) => boolean {
  if (job.name === undefined) {
    const matrixPrefix = `${job.id} (`;
    return (name) =>
      name === job.id ||
      (name.startsWith(matrixPrefix) &&
        name.endsWith(")") &&
        name.length > matrixPrefix.length + 1);
  }
  const [first = "", ...rest] = job.name.split(expression);
  if (rest.length === 0) return (name) => name === first;
  const last = rest.pop() ?? "";
  return (name) => {
    if (!name.startsWith(first) || !name.endsWith(last)) return false;
    let offset = first.length;
    for (const part of rest) {
      const next = name.indexOf(part, offset);
      if (next === -1) return false;
      offset = next + part.length;
    }
    return offset <= name.length - last.length;
  };
}
