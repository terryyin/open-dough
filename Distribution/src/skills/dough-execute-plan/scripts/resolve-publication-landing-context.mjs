// An omitted landingContext resolves only for the open expectation's remote
// and target; `null` names a publication that is no landing, such as a
// session record commit. Explicit landingContext still wins and is validated
// by its caller. Kept apart
// from first-landing-expectation.mjs so the reporting-dir clear copy never
// needs publication-git.
import { readFile } from "node:fs/promises";
import { openFirstLandingExpectation } from "./first-landing-expectation.mjs";
import { managementContext } from "./publication-git.mjs";

export async function resolvePublicationLandingContext({
  landingContext,
  workspace,
  branch,
  remote,
  targetRef,
}) {
  if (typeof landingContext === "string" && landingContext !== "") {
    return landingContext;
  }
  if (landingContext === null) return undefined;
  if (
    typeof workspace !== "string" ||
    workspace === "" ||
    typeof branch !== "string" ||
    branch === "" ||
    typeof remote !== "string" ||
    remote === "" ||
    typeof targetRef !== "string" ||
    targetRef === ""
  ) {
    return undefined;
  }
  let repository;
  try {
    repository = await managementContext(workspace);
  } catch {
    return undefined;
  }
  const open = await openFirstLandingExpectation({
    repository,
    workspace,
    branch,
  });
  if (!open) return undefined;
  const context = JSON.parse(await readFile(open.landingContext, "utf8"));
  return context.remote === remote && context.target === targetRef
    ? open.landingContext
    : undefined;
}

// The publication's landing context, resolved once, and the launch reference
// it names, so the accepted pair joins that session's evidence. Kept out of
// execution-session-evidence.mjs so execution start never needs landing.
export async function resolveLaunchLanding(request) {
  const landingContext = await resolvePublicationLandingContext(request);
  const reference = landingContext
    ? JSON.parse(await readFile(landingContext, "utf8")).reference
    : undefined;
  return { landingContext, reference };
}
