// The GitHub Actions requests one `gh` invocation handed to the fake GitHub
// may ask (./ghRequest.ts): the selected workflow, its runs, one run's
// artifacts by name, and one artifact's zip.

export type GhActionsRequest =
  | {
      // A selected Actions workflow by filename or id.
      readonly kind: "actions-workflow";
      readonly repository: string;
      readonly workflow: string;
    }
  | {
      // Push runs of a selected Actions workflow on one branch (`branch=`),
      // "" when none is named.
      readonly kind: "actions-runs";
      readonly repository: string;
      readonly workflowId: string;
      readonly branch: string;
    }
  | {
      // One run's artifacts, of one name (`name=`) when one is named.
      readonly kind: "actions-run-artifacts";
      readonly repository: string;
      readonly runId: number;
      readonly name: string | undefined;
    }
  | {
      // One artifact's zip archive.
      readonly kind: "actions-artifact-zip";
      readonly repository: string;
      readonly artifactId: number;
    };

const repository = "repos\\/([^/]+\\/[^/]+)\\/actions\\/";
const pattern = (path: string) => new RegExp(`^${repository}${path}$`);

// The Actions request `endpoint` names, undefined when it names none.
export function parseActionsRequest(
  endpoint: string,
): GhActionsRequest | undefined {
  const workflow = pattern("workflows\\/([^/?]+)").exec(endpoint);
  if (workflow?.[1] !== undefined && workflow[2] !== undefined)
    return {
      kind: "actions-workflow",
      repository: workflow[1],
      workflow: decodeURIComponent(workflow[2]),
    };
  const runs = pattern("workflows\\/([^/]+)\\/runs(?:\\?(.*))?").exec(endpoint);
  if (runs?.[1] !== undefined && runs[2] !== undefined)
    return {
      kind: "actions-runs",
      repository: runs[1],
      workflowId: decodeURIComponent(runs[2]),
      branch: new URLSearchParams(runs[3] ?? "").get("branch") ?? "",
    };
  const artifacts = pattern("runs\\/(\\d+)\\/artifacts(?:\\?(.*))?").exec(
    endpoint,
  );
  if (artifacts?.[1] !== undefined && artifacts[2] !== undefined)
    return {
      kind: "actions-run-artifacts",
      repository: artifacts[1],
      runId: Number(artifacts[2]),
      name: new URLSearchParams(artifacts[3] ?? "").get("name") ?? undefined,
    };
  const zip = pattern("artifacts\\/(\\d+)\\/zip").exec(endpoint);
  if (zip?.[1] !== undefined && zip[2] !== undefined)
    return {
      kind: "actions-artifact-zip",
      repository: zip[1],
      artifactId: Number(zip[2]),
    };
  return undefined;
}

export function isActionsRequest(request: {
  readonly kind: string;
}): request is GhActionsRequest {
  return request.kind.startsWith("actions-");
}
