# Deliberate Intent proof

<a id="deliberate-intent-proof"></a>

### Deliberate Intent proof

**Identity:** SEED-223#deliberate-intent-proof
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/451-deliberate-intent-proof/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"fe0e0db3922d90b3db7e18cf94ce6ba8d73ee22b81281cfe2f34c22858f9ca18","plan":"19899e26f5b4fc9df560690762da22884532b785046507cfc95eed9e41db249f"}}
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
