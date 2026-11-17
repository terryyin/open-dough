#!/usr/bin/env bash
# Readiness/requeue product and observation sources.
# shellcheck disable=SC2312

# Baseline product: ready admission only, before the returned requeue work.
delivery_evidence_gaps_write_baseline_product() {
  local workspace=$1
  mkdir -p -- "${workspace}/lib"
  cat > "${workspace}/lib/releaseAdmission.mjs" << 'EOF'
// Admit a release tag when its storage is ready.
export function resetAdmissionState() {}

export function admitReleaseTag(tag, readiness) {
  if (readiness === 'ready') {
    return { status: 'started', tag };
  }
  throw new TypeError(`unknown readiness: ${readiness}`);
}
EOF
}

# Returned (uncommitted) product: on storage-readiness failure, put the tag
# back at the front of the queue so the next observation starts it.
delivery_evidence_gaps_write_product() {
  local workspace=$1
  mkdir -p -- "${workspace}/lib"
  cat > "${workspace}/lib/releaseAdmission.mjs" << 'EOF'
// Admit a release tag; on storage-readiness failure, put it back first in the
// queue so the next observation starts it instead of leaving it active.
const queue = [];

export function resetAdmissionState() {
  queue.length = 0;
}

export function enqueueTag(tag) {
  queue.push(tag);
}

export function pendingTags() {
  return [...queue];
}

export function admitReleaseTag(tag, readiness) {
  if (readiness === 'ready') {
    return { status: 'started', tag };
  }
  if (readiness === 'failed') {
    queue.unshift(tag);
    return { status: 'requeued', tag };
  }
  throw new TypeError(`unknown readiness: ${readiness}`);
}

export function startNextQueued() {
  const tag = queue.shift();
  if (tag === undefined) {
    return { status: 'idle' };
  }
  return { status: 'started', tag };
}
EOF
}

delivery_evidence_gaps_write_happy_path_test() {
  local workspace=$1
  mkdir -p -- "${workspace}/tests"
  cat > "${workspace}/tests/admission-happy.test.mjs" << 'EOF'
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  admitReleaseTag,
  resetAdmissionState,
} from '../lib/releaseAdmission.mjs';

test('ready release tag starts immediately', () => {
  resetAdmissionState();
  assert.deepEqual(admitReleaseTag('v1.0.0', 'ready'), {
    status: 'started',
    tag: 'v1.0.0',
  });
});
EOF
}

delivery_evidence_gaps_write_requeue_test() {
  local workspace=$1
  mkdir -p -- "${workspace}/tests"
  cat > "${workspace}/tests/readiness-requeue.test.mjs" << 'EOF'
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  admitReleaseTag,
  enqueueTag,
  pendingTags,
  resetAdmissionState,
  startNextQueued,
} from '../lib/releaseAdmission.mjs';

test('failed readiness requeues then starts on next observation', () => {
  resetAdmissionState();
  enqueueTag('v0.9.0');
  assert.deepEqual(admitReleaseTag('v1.0.0', 'failed'), {
    status: 'requeued',
    tag: 'v1.0.0',
  });
  assert.deepEqual(pendingTags(), ['v1.0.0', 'v0.9.0']);
  assert.deepEqual(startNextQueued(), {
    status: 'started',
    tag: 'v1.0.0',
  });
  assert.deepEqual(pendingTags(), ['v0.9.0']);
});
EOF
}
