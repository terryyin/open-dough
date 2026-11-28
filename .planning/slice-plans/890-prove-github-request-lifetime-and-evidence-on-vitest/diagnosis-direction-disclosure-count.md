# Diagnosis: direction disclosure count

Identity: `SEED-413#github-request-lifetime-and-evidence-via-vitest`

## Failure

- Signature: `e2e/stories/direction-disclosure.spec.ts:219` `toHaveCount(0)` on `getByRole('region', { name: 'Near-future direction' })` received 1 for 5 seconds, after `chooseProject(page, "Doughnut")` in "changing projects removes previous direction while reading and starts each observation collapsed".
- CI: repo `terryyin/open-dough`, run `46043952030`, attempt 1, job `140658404365` (`e2e / shard 2/6`), SHA `98f31733eaf295a5d88a5e8184f9b69d284d06f0`, https://github.com/terryyin/open-dough/actions/runs/46043952030
- Reproduction: not yet reproduced locally. Rate unknown.

## Attribution

`2950e48ddd61bfbe9fde0a130028b414651b1a6e` passed CI. The only product change after it, through `98f31733`, is `dashboard/backend-tests/observation/authenticated-read-diagnostics-admission-node.spec.ts`. That spec is not in the e2e shard. `dee41091` is plan text only. This story does not change `direction-disclosure.spec.ts` or the direction UI.

## Hypotheses

1. The region stays because the in-progress read has not cleared the previous project's direction. Experiment: read the spec and the direction component and name the condition that removes the region. Do not rerun the shard yet. Stopping count for any later focused run: one, after that condition is named.

## Ruled out

None yet.

## Round

Round 1 paused overrun. The clock settled 38 active minutes. The reader did not return a condition that removes the region, and no local run was started. Reproduction rate is still unknown. No hypothesis was confirmed or refuted. Cumulative active minutes 38. The owed repair remains. The next experiment, if another round is authorized, has to be a different kind: one focused local run of `e2e/stories/direction-disclosure.spec.ts` after the removal condition is named. This round did not name it.
