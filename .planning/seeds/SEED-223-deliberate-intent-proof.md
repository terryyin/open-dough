# Deliberate Intent proof

<a id="deliberate-intent-proof"></a>

### Deliberate Intent proof

**Identity:** SEED-223#deliberate-intent-proof
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"unselected"}
```

**Goal:** Keep published Intent proof in the product repository without normal
test runs accumulating proof changes or creating incidental commits.

Terry's 2026-11-02 instruction authorizes implementation, release publication,
ordinary guidance updates across production-dashboard projects, and requests to
the affected projects to migrate their own proof producers.

Normal test runs leave proof byte-for-byte untouched. An explicit recording
option generates or refreshes compact proof using the same tests. Each
proof-bearing Intent location declares a project-owned command or skill for
generation; the dashboard shows that instruction and describes proof as the
last deliberate published verification, with its existing source/time limits.
Explicit refresh preserves unexecuted scenarios and removes an executed
unsuccessful scenario's earlier success. Historical proof stays readable.

Examples: an ordinary passing or failing run changes no proof; an explicitly
recorded focused run updates only its executed scenarios; a missing generation
instruction is explained without hiding readable existing proof. Guidance
rolls out to every production project; producer migration applies to projects
with Cucumber proof and is owned by each project's execution.

No dashboard command execution, new proof runners, or new test-framework
adapters are requested. CI comparison planning must use deliberate published
proof and must not reinstate automatic recording.
