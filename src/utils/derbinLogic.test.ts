import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isEasterEggCode,
  evaluateCalculatorExpression,
  generateRandomDhcpConfig,
  generateDerbinLicenseKey,
  calculateStealthAuditScore,
  buildInjectedPacket,
  validateUserProfilePayload,
  validateProxyConfigPayload,
} from './derbinLogic';

test('calculator evaluates arithmetic and detects secret 333 easter egg code', () => {
  const res1 = evaluateCalculatorExpression('333');
  assert.equal(res1.isEasterEgg, true);
  assert.equal(res1.result, '333');

  const res2 = evaluateCalculatorExpression('111 * 3');
  assert.equal(res2.result, '333');
  assert.equal(res2.isEasterEgg, true);

  const res3 = evaluateCalculatorExpression('349 + 450');
  assert.equal(res3.result, '799');
  assert.equal(res3.isEasterEgg, false);
  assert.equal(isEasterEggCode('222'), true);
  assert.equal(isEasterEggCode('999'), false);
});

test('DHCP generator creates coherent RFC1918 subnet parameters', () => {
  const dhcp = generateRandomDhcpConfig(88);
  assert.equal(dhcp.ip, '192.168.88.1');
  assert.equal(dhcp.startIp, '192.168.88.10');
  assert.equal(dhcp.endIp, '192.168.88.254');
  assert.equal(dhcp.mask, '255.255.255.0');
});

test('stealth audit score scales accurately with active WFP filter toggles', () => {
  const full = calculateStealthAuditScore({
    tracerouteBypass: true,
    disableMdns: true,
    routerMode: true,
    blockCrossNet: true,
  });
  assert.equal(full.scorePct, 100);
  assert.equal(full.tone, 'emerald');

  const partial = calculateStealthAuditScore({
    tracerouteBypass: true,
    disableMdns: true,
    routerMode: false,
    blockCrossNet: false,
  });
  assert.equal(partial.scorePct, 50);
  assert.equal(partial.tone, 'amber');
});

test('packet injector formats hex dump and decoded fields', () => {
  const pkt = buildInjectedPacket('chat', '!derbin ios26 test', new Date('2026-10-26T18:00:00Z'));
  assert.equal(pkt.hexId, '0x03');
  assert.equal(pkt.name, 'ChatMessage');
  assert.equal(pkt.fields['Payload Message'], '!derbin ios26 test');
});

test('license key generator creates deterministic format per tier', () => {
  const key = generateDerbinLicenseKey('lifetime', 'abc12345');
  assert.ok(key.startsWith('DRB-LIFE-IOS26-'));
});

test('Firestore Dirty Dozen payload validation rejects invalid writes', () => {
  const validBase = {
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

  // Valid payload passes
  assert.equal(validateUserProfilePayload(validBase, 'user_1', true, 'user_1').valid, true);

  // 1. Unverified email rejected
  assert.equal(validateUserProfilePayload(validBase, 'user_1', false, 'user_1').valid, false);

  // 2. Identity spoofing rejected
  assert.equal(
    validateUserProfilePayload({ ...validBase, uid: 'user_2' }, 'user_1', true, 'user_1').valid,
    false
  );

  // 5. Shadow field injection rejected
  assert.equal(
    validateUserProfilePayload({ ...validBase, isAdmin: true }, 'user_1', true, 'user_1').valid,
    false
  );

  // 6. Value poisoning (oversized displayName) rejected
  assert.equal(
    validateUserProfilePayload({ ...validBase, displayName: 'x'.repeat(200) }, 'user_1', true, 'user_1').valid,
    false
  );

  // 7. Invalid enum rejected
  assert.equal(
    validateUserProfilePayload({ ...validBase, subscriptionPlan: 'godmode' }, 'user_1', true, 'user_1').valid,
    false
  );

  // 8. Forged timestamp rejected
  assert.equal(
    validateUserProfilePayload({ ...validBase, createdAt: '2020-01-01' }, 'user_1', true, 'user_1').valid,
    false
  );

  // 10 & 12. Orphaned subcollection write and out-of-bounds pingSpoofMs rejected
  const validCfg = {
    uid: 'user_1',
    name: 'FunTime Stealth',
    serverAddress: 'funtime.su',
    accountName: 'omar_torrez',
    dhcpSubnet: '192.168.178.1',
    pingSpoofMs: 15,
    jitterSmoothPct: 85,
    tracerouteBypass: true,
    routerMode: true,
    createdAt: 'SERVER_TIMESTAMP',
    updatedAt: 'SERVER_TIMESTAMP',
  };
  assert.equal(
    validateProxyConfigPayload(validCfg, 'user_1', true, 'user_1', 'cfg_1', false).valid,
    false
  );
  assert.equal(
    validateProxyConfigPayload({ ...validCfg, pingSpoofMs: 9999 }, 'user_1', true, 'user_1', 'cfg_1', true).valid,
    false
  );
});
