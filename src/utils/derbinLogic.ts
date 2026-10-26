export type SubscriptionPlan = 'free' | '30d' | '90d' | 'lifetime';
export type HwidStatus = 'bound' | 'unbound' | 'reset_ready';
export type GlassPresetId = 'amber_gold' | 'emerald_liquid' | 'prismatic_ios26' | 'obsidian_frost';
export type Currency = 'RUB' | 'USD' | 'EUR' | 'UAH';

export interface PlanPriceDetail {
  priceFormatted: string;
  periodFormatted: string;
  periodEn: string;
  numeric: number;
}

export const CURRENCY_CONFIG: Record<
  Currency,
  {
    symbol: string;
    label: string;
    plans: Record<SubscriptionPlan, PlanPriceDetail>;
  }
> = {
  RUB: {
    symbol: '₽',
    label: 'RUB (₽)',
    plans: {
      free: { priceFormatted: '0 ₽', periodFormatted: '/ пробный', periodEn: '/ free', numeric: 0 },
      '30d': { priceFormatted: '349 ₽', periodFormatted: '/ 30 дней', periodEn: '/ 30 days', numeric: 349 },
      '90d': { priceFormatted: '799 ₽', periodFormatted: '/ 3 месяца', periodEn: '/ 3 months', numeric: 799 },
      lifetime: { priceFormatted: '4 999 ₽', periodFormatted: '/ навсегда', periodEn: '/ lifetime', numeric: 4999 },
    },
  },
  USD: {
    symbol: '$',
    label: 'USD ($)',
    plans: {
      free: { priceFormatted: '$0', periodFormatted: '/ trial', periodEn: '/ free', numeric: 0 },
      '30d': { priceFormatted: '$3.99', periodFormatted: '/ 30 дней', periodEn: '/ 30 days', numeric: 3.99 },
      '90d': { priceFormatted: '$8.99', periodFormatted: '/ 3 месяца', periodEn: '/ 3 months', numeric: 8.99 },
      lifetime: { priceFormatted: '$54.99', periodFormatted: '/ навсегда', periodEn: '/ lifetime', numeric: 54.99 },
    },
  },
  EUR: {
    symbol: '€',
    label: 'EUR (€)',
    plans: {
      free: { priceFormatted: '0 €', periodFormatted: '/ пробный', periodEn: '/ free', numeric: 0 },
      '30d': { priceFormatted: '3.69 €', periodFormatted: '/ 30 дней', periodEn: '/ 30 days', numeric: 3.69 },
      '90d': { priceFormatted: '8.29 €', periodFormatted: '/ 3 месяца', periodEn: '/ 3 months', numeric: 8.29 },
      lifetime: { priceFormatted: '49.99 €', periodFormatted: '/ навсегда', periodEn: '/ lifetime', numeric: 49.99 },
    },
  },
  UAH: {
    symbol: '₴',
    label: 'UAH (₴)',
    plans: {
      free: { priceFormatted: '0 ₴', periodFormatted: '/ пробный', periodEn: '/ free', numeric: 0 },
      '30d': { priceFormatted: '165 ₴', periodFormatted: '/ 30 дней', periodEn: '/ 30 days', numeric: 165 },
      '90d': { priceFormatted: '375 ₴', periodFormatted: '/ 3 месяца', periodEn: '/ 3 months', numeric: 375 },
      lifetime: { priceFormatted: '2 350 ₴', periodFormatted: '/ навсегда', periodEn: '/ lifetime', numeric: 2350 },
    },
  },
};

export function getPlanPrice(plan: SubscriptionPlan, currency: Currency = 'RUB'): PlanPriceDetail {
  return CURRENCY_CONFIG[currency]?.plans[plan] || CURRENCY_CONFIG.RUB.plans[plan];
}

export interface UserProfileData {
  uid: string;
  displayName: string;
  minecraftNick: string;
  subscriptionPlan: SubscriptionPlan;
  licenseKey: string;
  hwidStatus: HwidStatus;
  glassPreset: GlassPresetId;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface ProxyConfigData {
  id?: string;
  uid: string;
  name: string;
  serverAddress: string;
  accountName: string;
  dhcpSubnet: string;
  pingSpoofMs: number;
  jitterSmoothPct: number;
  tracerouteBypass: boolean;
  routerMode: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface SnifferPacket {
  id: number;
  time: string;
  dir: 'OUT' | 'IN';
  hexId: string;
  name: string;
  size: string;
  status: string;
  bytes: string;
  fields: Record<string, string>;
}

const VALID_ID_REGEX = /^[a-zA-Z0-9_\-]+$/;
const VALID_MC_NICK_REGEX = /^[a-zA-Z0-9_]+$/;
const VALID_PLANS = new Set<string>(['free', '30d', '90d', 'lifetime']);
const VALID_HWID = new Set<string>(['bound', 'unbound', 'reset_ready']);
const VALID_PRESETS = new Set<string>(['amber_gold', 'emerald_liquid', 'prismatic_ios26', 'obsidian_frost']);

export function isValidDocumentId(id: string): boolean {
  return typeof id === 'string' && id.length >= 1 && id.length <= 128 && VALID_ID_REGEX.test(id);
}

export function sanitizeUserProfileInput(input: Partial<UserProfileData>, authUid: string): UserProfileData {
  const cleanNick = (input.minecraftNick || 'omar_torrez').replace(/[^a-zA-Z0-9_]/g, '').slice(0, 32);
  const minecraftNick = cleanNick.length >= 2 ? cleanNick : 'player_01';
  const rawDisplay = (input.displayName || minecraftNick).trim().slice(0, 60);
  const displayName = rawDisplay.length >= 1 ? rawDisplay : minecraftNick;
  const subscriptionPlan: SubscriptionPlan = VALID_PLANS.has(String(input.subscriptionPlan))
    ? (input.subscriptionPlan as SubscriptionPlan)
    : 'free';
  const hwidStatus: HwidStatus = VALID_HWID.has(String(input.hwidStatus))
    ? (input.hwidStatus as HwidStatus)
    : 'bound';
  const glassPreset: GlassPresetId = VALID_PRESETS.has(String(input.glassPreset))
    ? (input.glassPreset as GlassPresetId)
    : 'prismatic_ios26';
  const rawKey = (input.licenseKey || 'DERBIN-FREE-TRIAL').trim().slice(0, 64);
  const licenseKey = rawKey.length >= 4 ? rawKey : 'DERBIN-FREE-TRIAL';

  return {
    uid: authUid.slice(0, 128),
    displayName,
    minecraftNick,
    subscriptionPlan,
    licenseKey,
    hwidStatus,
    glassPreset,
  };
}

export function validateUserProfilePayload(
  payload: Record<string, unknown>,
  authUid: string,
  emailVerified: boolean,
  pathUserId: string,
  serverTimeToken = 'SERVER_TIMESTAMP'
): { valid: boolean; reason?: string } {
  if (!authUid || !emailVerified) {
    return { valid: false, reason: 'PERMISSION_DENIED: unauthenticated or unverified email' };
  }
  if (!isValidDocumentId(pathUserId) || authUid !== pathUserId) {
    return { valid: false, reason: 'PERMISSION_DENIED: path userId mismatch or invalid ID' };
  }

  const allowedKeys = [
    'uid',
    'displayName',
    'minecraftNick',
    'subscriptionPlan',
    'licenseKey',
    'hwidStatus',
    'glassPreset',
    'createdAt',
    'updatedAt',
  ];
  const keys = Object.keys(payload);
  if (keys.length !== allowedKeys.length || !allowedKeys.every((k) => keys.includes(k))) {
    return { valid: false, reason: 'PERMISSION_DENIED: invalid or shadow keys present' };
  }

  if (typeof payload.uid !== 'string' || !isValidDocumentId(payload.uid) || payload.uid !== authUid) {
    return { valid: false, reason: 'PERMISSION_DENIED: uid spoofing' };
  }
  if (typeof payload.displayName !== 'string' || payload.displayName.length < 1 || payload.displayName.length > 60) {
    return { valid: false, reason: 'PERMISSION_DENIED: displayName out of bounds' };
  }
  if (
    typeof payload.minecraftNick !== 'string' ||
    payload.minecraftNick.length < 2 ||
    payload.minecraftNick.length > 32 ||
    !VALID_MC_NICK_REGEX.test(payload.minecraftNick)
  ) {
    return { valid: false, reason: 'PERMISSION_DENIED: invalid minecraftNick' };
  }
  if (typeof payload.subscriptionPlan !== 'string' || !VALID_PLANS.has(payload.subscriptionPlan)) {
    return { valid: false, reason: 'PERMISSION_DENIED: invalid subscriptionPlan enum' };
  }
  if (typeof payload.licenseKey !== 'string' || payload.licenseKey.length < 4 || payload.licenseKey.length > 64) {
    return { valid: false, reason: 'PERMISSION_DENIED: invalid licenseKey length' };
  }
  if (typeof payload.hwidStatus !== 'string' || !VALID_HWID.has(payload.hwidStatus)) {
    return { valid: false, reason: 'PERMISSION_DENIED: invalid hwidStatus enum' };
  }
  if (typeof payload.glassPreset !== 'string' || !VALID_PRESETS.has(payload.glassPreset)) {
    return { valid: false, reason: 'PERMISSION_DENIED: invalid glassPreset enum' };
  }
  if (payload.createdAt !== serverTimeToken || payload.updatedAt !== serverTimeToken) {
    return { valid: false, reason: 'PERMISSION_DENIED: temporal integrity violation' };
  }

  return { valid: true };
}

export function validateProxyConfigPayload(
  payload: Record<string, unknown>,
  authUid: string,
  emailVerified: boolean,
  pathUserId: string,
  configId: string,
  parentUserExists: boolean,
  serverTimeToken = 'SERVER_TIMESTAMP'
): { valid: boolean; reason?: string } {
  if (!authUid || !emailVerified) {
    return { valid: false, reason: 'PERMISSION_DENIED: unauthenticated or unverified' };
  }
  if (!parentUserExists) {
    return { valid: false, reason: 'PERMISSION_DENIED: orphaned write without parent user' };
  }
  if (!isValidDocumentId(pathUserId) || !isValidDocumentId(configId) || authUid !== pathUserId) {
    return { valid: false, reason: 'PERMISSION_DENIED: invalid path ID or owner mismatch' };
  }

  const allowedKeys = [
    'uid',
    'name',
    'serverAddress',
    'accountName',
    'dhcpSubnet',
    'pingSpoofMs',
    'jitterSmoothPct',
    'tracerouteBypass',
    'routerMode',
    'createdAt',
    'updatedAt',
  ];
  const keys = Object.keys(payload);
  if (keys.length !== allowedKeys.length || !allowedKeys.every((k) => keys.includes(k))) {
    return { valid: false, reason: 'PERMISSION_DENIED: invalid keys in ProxyConfig' };
  }
  if (payload.uid !== authUid) {
    return { valid: false, reason: 'PERMISSION_DENIED: uid mismatch' };
  }
  if (typeof payload.name !== 'string' || payload.name.length < 1 || payload.name.length > 50) {
    return { valid: false, reason: 'PERMISSION_DENIED: invalid preset name' };
  }
  if (typeof payload.serverAddress !== 'string' || payload.serverAddress.length < 3 || payload.serverAddress.length > 100) {
    return { valid: false, reason: 'PERMISSION_DENIED: invalid serverAddress' };
  }
  if (
    typeof payload.accountName !== 'string' ||
    payload.accountName.length < 2 ||
    payload.accountName.length > 32 ||
    !VALID_MC_NICK_REGEX.test(payload.accountName)
  ) {
    return { valid: false, reason: 'PERMISSION_DENIED: invalid accountName' };
  }
  if (typeof payload.dhcpSubnet !== 'string' || payload.dhcpSubnet.length < 7 || payload.dhcpSubnet.length > 20) {
    return { valid: false, reason: 'PERMISSION_DENIED: invalid dhcpSubnet' };
  }
  if (typeof payload.pingSpoofMs !== 'number' || payload.pingSpoofMs < 0 || payload.pingSpoofMs > 120) {
    return { valid: false, reason: 'PERMISSION_DENIED: pingSpoofMs out of bounds' };
  }
  if (typeof payload.jitterSmoothPct !== 'number' || payload.jitterSmoothPct < 10 || payload.jitterSmoothPct > 100) {
    return { valid: false, reason: 'PERMISSION_DENIED: jitterSmoothPct out of bounds' };
  }
  if (typeof payload.tracerouteBypass !== 'boolean' || typeof payload.routerMode !== 'boolean') {
    return { valid: false, reason: 'PERMISSION_DENIED: boolean flags required' };
  }
  if (payload.createdAt !== serverTimeToken || payload.updatedAt !== serverTimeToken) {
    return { valid: false, reason: 'PERMISSION_DENIED: timestamp mismatch' };
  }

  return { valid: true };
}

export function isEasterEggCode(input: string): boolean {
  const trimmed = String(input).trim();
  return trimmed === '333' || trimmed === '222' || trimmed === '111';
}

export function evaluateCalculatorExpression(expr: string): { result: string; isEasterEgg: boolean; error: boolean } {
  const trimmed = String(expr).trim();
  if (!trimmed) {
    return { result: '0', isEasterEgg: false, error: false };
  }
  if (isEasterEggCode(trimmed)) {
    return { result: trimmed, isEasterEgg: true, error: false };
  }

  const sanitized = trimmed.replace(/[^0-9+\-*/.%]/g, '');
  if (!sanitized || /^[*/+%]/.test(sanitized) || /[+\-*/.%]$/.test(sanitized)) {
    return { result: 'Ошибка', isEasterEgg: false, error: true };
  }

  try {
    const val = Function(`"use strict"; return (${sanitized});`)();
    if (typeof val !== 'number' || !Number.isFinite(val)) {
      return { result: 'Ошибка', isEasterEgg: false, error: true };
    }
    const formatted = Number.isInteger(val) ? String(val) : String(Number(val.toFixed(4)));
    return {
      result: formatted,
      isEasterEgg: isEasterEggCode(formatted),
      error: false,
    };
  } catch {
    return { result: 'Ошибка', isEasterEgg: false, error: true };
  }
}

export function generateRandomDhcpConfig(subnetOctet?: number): {
  subnetOctet: number;
  ip: string;
  mask: string;
  startIp: string;
  endIp: string;
  dns1: string;
  dns2: string;
} {
  const octet =
    typeof subnetOctet === 'number' && subnetOctet >= 20 && subnetOctet <= 240
      ? Math.floor(subnetOctet)
      : Math.floor(Math.random() * 150) + 20;
  return {
    subnetOctet: octet,
    ip: `192.168.${octet}.1`,
    mask: '255.255.255.0',
    startIp: `192.168.${octet}.10`,
    endIp: `192.168.${octet}.254`,
    dns1: '1.1.1.1',
    dns2: '1.0.0.1',
  };
}

export function generateDerbinLicenseKey(plan: SubscriptionPlan, seed?: string): string {
  const prefix =
    plan === 'lifetime'
      ? 'DRB-LIFE'
      : plan === '90d'
      ? 'DRB-90D'
      : plan === '30d'
      ? 'DRB-30D'
      : 'DRB-FREE';
  const token = (seed || Math.random().toString(36).substring(2, 10)).toUpperCase().replace(/[^A-Z0-9]/g, 'X').slice(0, 8);
  return `${prefix}-IOS26-${token.padEnd(8, '7')}`;
}

export function calculateStealthAuditScore(flags: {
  tracerouteBypass: boolean;
  disableMdns: boolean;
  routerMode: boolean;
  blockCrossNet: boolean;
}): {
  scorePct: number;
  statusLabel: string;
  verdictTitle: string;
  verdictDesc: string;
  tone: 'emerald' | 'amber' | 'rose';
} {
  const activeCount = [
    flags.tracerouteBypass,
    flags.disableMdns,
    flags.routerMode,
    flags.blockCrossNet,
  ].filter(Boolean).length;

  const scorePct = activeCount * 25;
  if (scorePct === 100) {
    return {
      scorePct: 100,
      statusLabel: 'Dual-PC Undetect Active (100%)',
      verdictTitle: 'СТАТУС: ЧИСТ',
      verdictDesc: '0 следов инъекций • 1 Hop',
      tone: 'emerald',
    };
  }
  if (scorePct >= 50) {
    return {
      scorePct,
      statusLabel: `Partial Shield (${scorePct}%)`,
      verdictTitle: 'ВНИМАНИЕ: ЧАСТИЧНО',
      verdictDesc: 'Включите все 4 фильтра WFP',
      tone: 'amber',
    };
  }
  return {
    scorePct,
    statusLabel: 'Risk Detected • Shield Weak',
    verdictTitle: 'РИСК ДЕТЕКТА 4.3',
    verdictDesc: 'Сетевой мост открыт',
    tone: 'rose',
  };
}

export function buildInjectedPacket(
  typeSelect: 'chat' | 'position' | 'keepalive' | 'status',
  rawPayload: string,
  nowDate = new Date()
): SnifferPacket {
  const payload = (rawPayload || '').trim() || '!derbin dual-pc stealth test active';
  const timeStr = `${String(nowDate.getHours()).padStart(2, '0')}:${String(nowDate.getMinutes()).padStart(2, '0')}:${String(
    nowDate.getSeconds()
  ).padStart(2, '0')}.${String(nowDate.getMilliseconds()).padStart(3, '0')}`;

  if (typeSelect === 'chat') {
    const asciiPreview = payload.slice(0, 12);
    const hexPart = asciiPreview
      .split('')
      .map((c) => c.charCodeAt(0).toString(16).padStart(2, '0'))
      .join(' ');
    const lenHex = (payload.length + 14).toString(16).padStart(2, '0');
    return {
      id: nowDate.getTime(),
      time: timeStr,
      dir: 'OUT',
      hexId: '0x03',
      name: 'ChatMessage',
      size: `${payload.length + 14} B`,
      status: 'Injected via WFP',
      bytes: `00 ${lenHex} 03 12 ${hexPart.padEnd(24, ' ')} |.${asciiPreview.padEnd(12, '.')}|\n0010  ff aa 01 00 20 44 65 72  62 69 6e 21 00           |...Derbin!..    |`,
      fields: {
        'Packet ID': '0x03 (Chat Message)',
        'Payload Message': payload,
        'Injected Gateway': '192.168.178.181 (Device 2)',
        'Signed State': 'Valid AES-256 Key',
      },
    };
  }

  if (typeSelect === 'position') {
    return {
      id: nowDate.getTime(),
      time: timeStr,
      dir: 'OUT',
      hexId: '0x04',
      name: 'PlayerPosition',
      size: '56 B',
      status: 'Injected via WFP',
      bytes:
        '00 36 04 40 5c 00 00 00  00 00 00 40 51 80 00 00  |.6.@\\......@Q...|\n0010  00 00 00 c0 69 00 00 00  00 00 00 01              |....i.......    |',
      fields: {
        'Packet ID': '0x04 (Player Position)',
        X: '145.24',
        Y: '72.0',
        Z: '-85.6',
        'Custom Payload': payload,
      },
    };
  }

  if (typeSelect === 'keepalive') {
    return {
      id: nowDate.getTime(),
      time: timeStr,
      dir: 'OUT',
      hexId: '0x0F',
      name: 'KeepAlive',
      size: '42 B',
      status: 'Injected via WFP',
      bytes:
        '00 2a 0f 00 00 01 8b 4a  53 2d 64 65 72 62 69 6e  |.*.....JS-derbin|\n0010  31 2e 38 2d 70 72 6f 78  79 2d 6f 6b 00 00 ff 1a  |1.8-proxy-ok....|',
      fields: {
        'Packet ID': '0x0F (KeepAlive)',
        'Challenge ID': String(nowDate.getTime()),
        Comment: payload,
      },
    };
  }

  return {
    id: nowDate.getTime(),
    time: timeStr,
    dir: 'OUT',
    hexId: '0x19',
    name: 'EntityAction',
    size: '28 B',
    status: 'Injected via WFP',
    bytes: '00 1c 19 01 00 03 00 00  00 00 00 00 00 00 00 00  |................|',
    fields: {
      'Packet ID': '0x19 (Entity Action)',
      Action: 'START_SPRINTING',
      'Aux Data': payload,
    },
  };
}
