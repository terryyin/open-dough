# SEED-204: Attach an image when starting a session

<a id="attach-image-at-launch"></a>

### Attach an image when starting a session

**Identity:** SEED-204#attach-image-at-launch

**Beneficiary:** A developer starting any dashboard session who wants to show
the agent a screenshot, mockup, or other image alongside the instruction.

**Goal:** Every session-starting dialog lets the developer attach one or more
images, and the started session receives each image as a local file path in its
starting instruction, so the agent can open it.

**Scope (cohesive):**

- One attachment capability in the shared launch dialog (`LaunchDialog`), so
  every session-starting dialog — project sessions, story and correction
  starts, and any other dialog built on it — gains it identically, with the
  same wording, controls, and limits. No per-dialog variant.
- One server path: the dashboard uploads the chosen image to the dashboard
  server, which copies it into a temporary folder owned by that launch and adds
  its absolute path to the instruction handed to the host. The same path works
  for every supported host (Claude Code, Codex, Cursor).
- The developer can see, remove, and replace attachments before Start; a
  dismissed or refused launch keeps or discards them with the same rule the
  dialog already applies to the instruction draft.
- Images are bounded (accepted image types and a size limit) and rejected
  uploads say why without losing the draft.

**Examples:**

- Starting a project session with a pasted or picked screenshot launches the
  session with an instruction that names the copied image's temporary path;
  the agent can read that file.
- The same attachment control and behavior appear when starting a story.
- Removing the attachment before Start launches with no image path.
- A non-image file or an oversized image is refused in the dialog with a
  reason; the instruction and other choices remain.
