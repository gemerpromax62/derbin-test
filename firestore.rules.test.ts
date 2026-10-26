import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateUserProfilePayload,
  validateProxyConfigPayload,
  isValidDocumentId,
} from './src/utils/derbinLogic';

const baseProfile = {
  uid: 'user_1',
  displayName: 'omar_torrez',
  minecraftNick: 'omar_torrez',
  subscriptionPlan: '90d',
  licenseKey: 'DRB-90D-IOS26-12345678',
  hwidStatus: 'bound',
  glassPreset: 'prismatic_ios26',
  createdAt: 'SERVER_TIMESTAMP',
  updatedAt: 'SERVER_TIMESTAMP',
};

const baseConfig = {
  uid: 'user_1',
  name: 'ReallyWorld Bypass',
  serverAddress: 'mc.reallyworld.ru',
  accountName: 'omar_torrez',
  dhcpSubnet: '192.168.178.1',
  pingSpoofMs: 0,
  jitterSmoothPct: 85,
  tracerouteBypass: true,
  routerMode: true,
  createdAt: 'SERVER_TIMESTAMP',
  updatedAt: 'SERVER_TIMESTAMP',
};

test('Dirty Dozen #1: Unverified email write returns PERMISSION_DENIED', () => {
  const res = validateUserProfilePayload(baseProfile, 'user_1', false, 'user_1');
  assert.equal(res.valid, false);
});

test('Dirty Dozen #2: Identity spoofing on profile create returns PERMISSION_DENIED', () => {
  const res = validateUserProfilePayload({ ...baseProfile, uid: 'user_2' }, 'user_1', true, 'user_1');
  assert.equal(res.valid, false);
});

test('Dirty Dozen #3 & #4: Cross-user profile and private access returns PERMISSION_DENIED', () => {
  const res = validateUserProfilePayload(baseProfile, 'user_2', true, 'user_1');
  assert.equal(res.valid, false);
});

test('Dirty Dozen #5: Shadow field injection (isAdmin: true) returns PERMISSION_DENIED', () => {
  const res = validateUserProfilePayload({ ...baseProfile, isAdmin: true }, 'user_1', true, 'user_1');
  assert.equal(res.valid, false);
});

test('Dirty Dozen #6: Value poisoning with oversized displayName returns PERMISSION_DENIED', () => {
  const res = validateUserProfilePayload(
    { ...baseProfile, displayName: 'A'.repeat(500) },
    'user_1',
    true,
    'user_1'
  );
  assert.equal(res.valid, false);
});

test('Dirty Dozen #7: Invalid enum state injection returns PERMISSION_DENIED', () => {
  const res = validateUserProfilePayload(
    { ...baseProfile, subscriptionPlan: 'godmode' },
    'user_1',
    true,
    'user_1'
  );
  assert.equal(res.valid, false);
});

test('Dirty Dozen #8 & #9: Forged client timestamp returns PERMISSION_DENIED', () => {
  const res = validateUserProfilePayload(
    { ...baseProfile, createdAt: '1999-01-01T00:00:00Z' },
    'user_1',
    true,
    'user_1'
  );
  assert.equal(res.valid, false);
});

test('Dirty Dozen #10: Orphaned subcollection write returns PERMISSION_DENIED', () => {
  const res = validateProxyConfigPayload(baseConfig, 'user_1', true, 'user_1', 'cfg_1', false);
  assert.equal(res.valid, false);
});

test('Dirty Dozen #11: Path ID poisoning returns PERMISSION_DENIED', () => {
  assert.equal(isValidDocumentId('invalid$id!@#'), false);
  const res = validateProxyConfigPayload(baseConfig, 'user_1', true, 'user_1', 'invalid$id!@#', true);
  assert.equal(res.valid, false);
});

test('Dirty Dozen #12: Out-of-bounds numeric telemetry returns PERMISSION_DENIED', () => {
  const res = validateProxyConfigPayload(
    { ...baseConfig, pingSpoofMs: 9999 },
    'user_1',
    true,
    'user_1',
    'cfg_1',
    true
  );
  assert.equal(res.valid, false);
});
