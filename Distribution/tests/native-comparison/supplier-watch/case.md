# Supplier publication during an active watch

Controlled preparation for SEED-356. This case preserves the pre-correction
ad-hoc supplier agreement, partial consumer work and paused supplier. An ordinary
continuation turn is followed by one actual new watch request. A separate
controller can publish nonqualifying and qualifying Git states during that turn.

## Selection

- workflow: blocked execution after a developer requests supplier monitoring
- behavior: independent in-flight producer events and exactly one continuation
- environment: isolated small Node project and local Git remote
- hosts: codex substitute only; real-native route deliberately unavailable
- prerequisites: Bash 5, Git, Node 24, jq; an explicit external controlled clock
- decisions and proof: paused/early-publication hold, partial-work preservation,
  qualifying continuation once with independent and executed proof
- duration: controlled checks only; native observation intervals are unsettled

## Current boundary

`case.bash` refuses the real-native route before any model session starts.
There is no timer mode. Tests advance the external FIFO through `nonqualifying`
and `qualifying` releases while a genuine owned substitute process remains
active. These barriers prove the journey/controller/retention lifecycle; they
do not create native watch handles or establish repeated native model activity.
Turn start is not a watch-handle exposure boundary and remains labeled unknown.

The controller snapshots the consumer at early publication and keeps raw
evidence outside its task workspace. The assessor separates quality from the
unobserved native reproduction signal. An early ended clean hold retains a
not-reproduced reason and unobserved qualifying continuation, with no automatic
resume or fabricated publication. It cannot pass a full matched quality result.

Before any native use, settle the observation window, authentic watch/response
observation and full native allocation. See the current SEED-356 plan and its
`reproducer-design.md`; no interval or budget extension is selected here.

The original paused forced-wake and ordinary unblocked cases remain unchanged
correctness regressions. Source provenance and causal limits are in
`../paused-supplier/case.md` and SEED-356's differential investigation.
