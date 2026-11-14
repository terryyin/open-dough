# 0005 — Native validation and A/B testing

**Status:** Accepted

**Date:** 2026-09-10

**Decision makers:** Terry Yin

**Consulted:** Terry Yin.

## Context

Open Dough runs in Codex, Cursor, and Claude Code. Choose evidence that
answers the decision at hand about Open Dough's delivery or behavior.

## Decision

### 1. Choose evidence for the change

Identify the intended outcome, affected hosts, and material risks. Reuse
evidence when the relevant behavior, integration, and runtime conditions
still match. For routine guidance edits, use the representative behavior
review in [maintainer guidance](../../AGENTS.md) and applicable deterministic
checks. Use representative cases for shared mechanisms and check host-specific
behavior on the affected host.

### 2. Keep deterministic checks in CI

Use deterministic checks for installation, updates, coexistence, shared
runtime behavior, and host adapters. Exercise real commands where they give
repeatable evidence. Use controlled inputs and counterexamples to check
runners and assessors. Use actual host sessions for native behavior evidence.

### 3. Track native acceptance separately

Require native evidence before release for a new or materially changed host
integration, or when a consequential acceptance risk needs a real session
to resolve it. Use the native interface, an isolated case, and a prompt that
leaves the expected answer to the assessor. Judge the observed outcome and
proof. Record deferred observations as pending. Record any human-approved
release exception with its scope and remaining evidence.

### 4. Compare outcomes when choosing an improvement

Use on-demand A/B testing or a comparable experiment when a decision depends
on the effect of a change. State the expected gain and quality criteria
before running it. Use the same task in isolated runs under matched
conditions. Pin the Open Dough payload in each arm and vary the factor
under test. Judge outcomes and proof first, then compare total effort,
including recovery and human interventions. Follow
[ADR 0010](./0010-definition-of-improvement-accepted.md).

Run representative examples from real work on demand. Keep them in
Open Dough. Record each example’s origin and retain the smallest runnable context
that preserves the decision and its proof. Tag each example with the workflow
or problem it represents and the traits that help select it, such as host,
project environment, or expected duration.

### 5. Assess now and delete spent evidence

Record the candidate, host, required outcome, decisive evidence, and
judgment. Retain reusable examples and lasting findings. Remove spent run
artifacts at wrap-up and use Git for recovery of tracked evidence.
