// @ts-check
// A Follow-up a Start request names (`../../../dashboard/src/followUpRequest.ts`):
// the retained Done session or done story it follows up, an optional file
// anchor on that story's comparison, waiting notes asked for at admission,
// and, once admission resolved them, the context and attached note versions
// kept on the recorded request.

/** @typedef {import("../../../dashboard/src/followUpRequest.ts").FollowUp} FollowUp */
/** @typedef {import("../../../dashboard/src/followUpRequest.ts").FollowUpFile} FollowUpFile */
/** @typedef {import("../../../dashboard/src/followUpRequest.ts").AttachedStoryNote} AttachedStoryNote */
/** @typedef {import("../../../dashboard/src/followUpContext.ts").FollowUpFileFacts} FollowUpFileFacts */
/** @typedef {import("../../../dashboard/src/launchRecord.ts").LaunchRecord} LaunchRecord */
/** @typedef {import("../../../dashboard/src/sessionReference.ts").SessionReference} SessionReference */
/**
 * A file anchor as the page names it, or the comparison facts a review or a
 * landed run supplies (`kind` stays off the request).
 * @typedef {FollowUpFile | (FollowUpFileFacts & {
 *   readonly completion?: string,
 *   readonly reference?: string,
 * })} FileAnchor
 */

export class FollowUpBuilder {
  /** @type {"session" | "story" | undefined} */
  #kind;
  /** @type {SessionReference | undefined} */
  #session;
  /** @type {string | undefined} */
  #identity;
  /** @type {string | undefined} */
  #revision;
  /** @type {FollowUpFile | undefined} */
  #file;
  /** @type {boolean} */
  #attachNotes = false;
  /** @type {string | undefined} */
  #context;
  /** @type {string | undefined} */
  #storyIdentity;
  /** @type {AttachedStoryNote[] | undefined} */
  #attached;

  /**
   * Follows up this retained session.
   * @param {LaunchRecord | SessionReference} source
   */
  ofSession(source) {
    const session = "request" in source ? source.session : source;
    this.#kind = "session";
    this.#session = { host: session.host, sessionId: session.sessionId };
    return this;
  }

  /**
   * Follows up this done story at the revision the page showed.
   * @param {string | { readonly identity: string }} story
   * @param {string} [revision]
   */
  ofStory(story, revision) {
    this.#kind = "story";
    this.#identity = typeof story === "string" ? story : story.identity;
    this.#revision = revision;
    return this;
  }

  /** Follows up a local Done card. @param {string} identity */
  ofLocalStory(identity) {
    return this.ofStory(identity);
  }

  /** Membership kept by admission for a session source. @param {string} identity */
  underStory(identity) {
    this.#storyIdentity = identity;
    return this;
  }

  /** Ask admission to attach the story's waiting notes. */
  attachingNotes() {
    this.#attachNotes = true;
    return this;
  }

  /**
   * Anchor on this file of the story's comparison.
   * @param {FileAnchor} file
   */
  anchoredAt(file) {
    this.#file = {
      path: file.path,
      baseline: file.baseline,
      tree: file.tree,
      ...(file.oldPath === undefined ? {} : { oldPath: file.oldPath }),
      ...("completion" in file && file.completion !== undefined
        ? { completion: file.completion }
        : {}),
      ...("reference" in file && file.reference !== undefined
        ? { reference: file.reference }
        : {}),
      ...(file.line === undefined || file.side === undefined
        ? {}
        : { line: file.line, side: file.side }),
    };
    return this;
  }

  /**
   * Context resolved from the source at admission, kept on the recorded request.
   * @param {string} context
   */
  withContext(context) {
    this.#context = context;
    return this;
  }

  /**
   * Versions admission attached, kept so delivery can mark those versions sent.
   * @param {readonly AttachedStoryNote[]} notes
   */
  withAttachedNotes(notes) {
    this.#attached = notes.map((note) => ({ ...note }));
    return this;
  }

  /** @returns {FollowUp} */
  please() {
    if (this.#kind === "session") {
      if (this.#session === undefined) throw new Error("state .ofSession(...)");
      if (
        this.#attachNotes ||
        this.#attached !== undefined ||
        this.#file !== undefined
      )
        throw new Error("a session follow-up names only its session");
      return {
        session: { ...this.#session },
        ...(this.#context === undefined ? {} : { context: this.#context }),
        ...(this.#storyIdentity === undefined
          ? {}
          : { storyIdentity: this.#storyIdentity }),
      };
    }
    if (this.#kind !== "story" || this.#identity === undefined)
      throw new Error("state .ofSession(...) or .ofStory(story, revision)");
    return {
      story: {
        identity: this.#identity,
        ...(this.#revision === undefined ? {} : { revision: this.#revision }),
        ...(this.#file === undefined ? {} : { file: { ...this.#file } }),
        ...(this.#attachNotes ? { notes: true } : {}),
      },
      ...(this.#context === undefined ? {} : { context: this.#context }),
      ...(this.#attached === undefined
        ? {}
        : { notes: this.#attached.map((note) => ({ ...note })) }),
    };
  }
}
