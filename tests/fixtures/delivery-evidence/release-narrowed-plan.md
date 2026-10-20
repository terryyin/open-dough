# Expose release progress and preserve terminal startup failures

**Identity:** SEED-120#story-release-progress
**Source:** [selected story](../../seeds/SEED-120-release-readiness.md#story-release-progress)

## Execution boundary

Controlled status-projection replay, adapted from plan 360 at `906631e26` and
`installation_status._operation` at `403d1fb1b`. This increment publishes the
supplied record facts through `python3 deployment/status.py INPUT.json`;
it does not run a deployment or independently prove Docker, record writing,
helper supervision, logs or historical host qualification.

Inputs under `records/` independently supply identity, container, API status,
completed stages, measured capacity and joined helper outcomes. The healthy
input also supplies its known in-progress stage, as correction 361's record
contract later did; the historical record writer lacked that fact. This replay
can test its status projection, not repair or reprove that historical writer.

## Ordered slices

### 1. Durable operation and helper facts
Type: Structure
Status: done
Proof: supplied records retain operation identity, completed stages and joined
helper facts. Record generation is an existing prerequisite, not proved here.

### 2. Container identity and API readiness
Type: Structure
Status: done
Proof: supplied container, identity and API facts are unchanged inputs; no
Docker engine or application is contacted by this controlled replay.

### 3. Publish the newest operation in status
Type: Behavior
Status: planned
Proof: `python3 -m unittest discover -s tests -p 'test_*.py'` observes identity,
container state, API code and the newest operation's phase, last completed
stage, timestamps, elapsed time, outcome and error. One invocation reads one
local input and returns one JSON object with no application response body.

Owns `deployment/status.py` and status output. The current phase is `running`
until the top-level record has an outcome and `finished` afterward. This
selected increment adds the elapsed-time field to the earlier projection.

### 4. Live helper lines and automatic coordinator outcome
Type: Behavior
Status: planned
Proof: later deployment integration observes live helper output and the
coordinator's recorded outcome. Those producer and orchestration changes are
outside this returned status projection.
