// @ts-check
// The file a story follow-up anchors on, as the page names it in the Start
// request (`fileFollowUpOf` sends it): a path, and a line and side, on the
// comparison a kept launch landed. The launch built by `makeMe.aLaunchRecord`
// with a reporting context and landing supplies the comparison's endpoints and
// the reporting reference that names its landed run.

/** @typedef {import("../../../dashboard/src/launchRecord.ts").LaunchRecord} LaunchRecord */
/** @typedef {import("../../../dashboard/src/followUpContext.ts").FollowUpFileFacts} FollowUpFileFacts */
/** @typedef {import("../../../dashboard/src/followUpRequest.ts").FollowUpFile} FollowUpFile */
/** @typedef {Pick<FollowUpFileFacts, "path" | "line" | "side">} FileAnchor */
/** @typedef {FollowUpFileFacts & { readonly reference: NonNullable<FollowUpFile["reference"]> }} LandedFileFacts */

export class FileFollowUpBuilder {
  /** @type {LaunchRecord | undefined} */
  #launch;
  /** @type {FileAnchor | undefined} */
  #anchor;

  /**
   * On the landed run of this kept launch.
   * @param {LaunchRecord} launch
   */
  onLandedRunOf(launch) {
    this.#launch = launch;
    return this;
  }

  /** @param {FileAnchor} anchor the file and, when given, its line and side */
  at(anchor) {
    this.#anchor = anchor;
    return this;
  }

  /** @returns {LandedFileFacts} */
  please() {
    const launch = this.#launch;
    const anchor = this.#anchor;
    if (anchor === undefined) throw new Error("state .at({ path })");
    const reference = launch?.request.reporting?.reference;
    const landing = launch?.landing;
    if (reference === undefined || landing === undefined)
      throw new Error("state .onLandedRunOf(a launch reporting its landing)");
    return {
      ...anchor,
      kind: "landed",
      baseline: landing.base,
      tree: landing.revision,
      reference,
    };
  }
}
