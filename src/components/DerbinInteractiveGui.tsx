import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  GlassPresetId,
  ProxyConfigData,
  SnifferPacket,
  calculateStealthAuditScore,
  generateRandomDhcpConfig,
  buildInjectedPacket,
} from '../utils/derbinLogic';
import { Lang, translations, playGuiSound } from '../utils/i18nAndAudio';

interface DerbinInteractiveGuiProps {
  lang: Lang;
  soundEnabled: boolean;
  onToggleSound: () => void;
  activePreset: GlassPresetId;
  onSelectPreset: (preset: GlassPresetId) => void;
  cloudConfigs: ProxyConfigData[];
  onSaveCloudConfig: (cfg: Omit<ProxyConfigData, 'id' | 'uid' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onDeleteCloudConfig: (id: string) => Promise<void>;
  onNotify: (msg: string) => void;
  onOpenLightbox: (src: string, title: string) => void;
}

type DerbinTab =
  | 'general'
  | 'advanced'
  | 'dhcp'
  | 'detector'
  | 'sniffer'
  | 'optimizer'
  | 'accounts'
  | 'themes'
  | 'help';

const INITIAL_PACKETS: SnifferPacket[] = [
  {
    id: 1,
    time: '18:24:02.102',
    dir: 'OUT',
    hexId: '0x00',
    name: 'Handshake',
    size: '38 B',
    status: 'Passed WFP',
    bytes:
      '00 26 00 f5 05 0f 6d 63  2e 72 65 61 6c 6c 79 77  |.&....mc.reallyw|\n0010  6f 72 6c 64 2e 72 75 63  dd 02 00 00 00 00        |orld.ru.........|',
    fields: {
      'Packet ID': '0x00 (Handshake)',
      'Protocol Version': '765 (1.20.4)',
      'Server Address': 'mc.reallyworld.ru',
      'Server Port': '25565',
      'Next State': '2 (Login)',
    },
  },
  {
    id: 2,
    time: '18:24:02.419',
    dir: 'IN',
    hexId: '0x02',
    name: 'LoginSuccess',
    size: '64 B',
    status: 'Passed WFP',
    bytes:
      '00 3e 02 12 a4 b7 89 23  44 11 09 a1 b2 c3 d4 e5  |.>.....#D.......|\n0010  6f 6d 61 72 5f 74 6f 72  72 65 7a 00 00 00 00 00  |omar_torrez.....|',
    fields: {
      'Packet ID': '0x02 (Login Success)',
      UUID: '12a4b789-2344-1109-a1b2-c3d4e5',
      Username: 'omar_torrez',
      Properties: '0 (Vanilla Auth)',
    },
  },
  {
    id: 3,
    time: '18:24:03.015',
    dir: 'OUT',
    hexId: '0x0F',
    name: 'KeepAlive',
    size: '42 B',
    status: 'Passed WFP',
    bytes:
      '00 2a 0f 00 00 01 8b 4a  53 2d 64 65 72 62 69 6e  |.*.....JS-derbin|\n0010  31 2e 38 2d 70 72 6f 78  79 2d 6f 6b 00 00 ff 1a  |1.8-proxy-ok....|\n0020  24 6b 65 65 70 5f 61 6c  69 76 65                 |$keep_alive     |',
    fields: {
      'Packet ID': '0x0F (Play KeepAlive)',
      'Payload ID': '1745283921849L',
      Encryption: 'AES-CFB8 Active',
      Compression: 'Threshold 256',
      'MITM Latency': '0.08 ms',
    },
  },
  {
    id: 4,
    time: '18:24:03.541',
    dir: 'OUT',
    hexId: '0x04',
    name: 'PlayerPosition',
    size: '56 B',
    status: 'Passed WFP',
    bytes:
      '00 36 04 40 5c 00 00 00  00 00 00 40 51 80 00 00  |.6.@\\......@Q...|\n0010  00 00 00 c0 69 00 00 00  00 00 00 01              |....i.......    |',
    fields: {
      'Packet ID': '0x04 (Player Position)',
      X: '112.0',
      Y: '70.0',
      Z: '-200.0',
      'On Ground': 'true',
      'Desync Offset': '0.000 (Protected)',
    },
  },
  {
    id: 5,
    time: '18:24:04.218',
    dir: 'OUT',
    hexId: '0x03',
    name: 'ChatMessage',
    size: '48 B',
    status: 'Passed WFP',
    bytes:
      '00 2e 03 14 2f 73 70 61  77 6e 20 64 75 61 6c 2d  |..../spawn dual-|\n0010  70 63 20 6f 6b 00 00 00  00 00 00 00              |pc ok.......    |',
    fields: {
      'Packet ID': '0x03 (Chat Message)',
      Message: '/spawn dual-pc ok',
      Timestamp: '1745283923000',
      Salt: '981240182',
      Signed: 'true',
    },
  },
];

const MOCK_KERNEL_LOGS = [
  '[WFP Kernel]: Intercepted ICMP traceroute packet -> masked as 192.168.178.1 (0 hops)',
  '[DHCP Proxy]: Masked physical MAC -> Generic Realtek PCIe GbE Controller',
  '[MITM Tunnel]: UDP payload forwarded to secondary PC: 128 bytes (latency 0.1ms)',
  '[Anti-Leak]: mDNS and LLMNR query dropped from port 5353',
  '[Client Heartbeat]: Keep-alive packet synchronized with target game server',
  '[Licensing]: Skin cache verified, session token encrypted with AES-256',
];

export const DerbinInteractiveGui: React.FC<DerbinInteractiveGuiProps> = ({
  lang,
  soundEnabled,
  onToggleSound,
  onSelectPreset,
  cloudConfigs,
  onSaveCloudConfig,
  onDeleteCloudConfig,
  onNotify,
  onOpenLightbox,
}) => {
  const [activeTab, setActiveTab] = useState<DerbinTab>('general');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isWindowClosed, setIsWindowClosed] = useState(false);

  // Tab 1: General
  const [serverInput, setServerInput] = useState('mc.reallyworld.ru');
  const [selectedAccount, setSelectedAccount] = useState('omar_torrez');
  const [accountsList, setAccountsList] = useState([
    { name: 'omar_torrez', desc: 'Mojang License • Токен авторизован', tag: 'Активен' },
    { name: 'nerfchik', desc: 'Developer Access • Microsoft OAuth', tag: 'Готов' },
  ]);
  const [newAccountInput, setNewAccountInput] = useState('');
  const [isSwapped, setIsSwapped] = useState(false);
  const [isProxyRunning, setIsProxyRunning] = useState(false);
  const [packetRate, setPacketRate] = useState(0);
  const [kernelLogLine, setKernelLogLine] = useState(
    '[Idle]: Enter server address and click "Запустить прокси" to begin traffic redirect.'
  );
  const [presetNameInput, setPresetNameInput] = useState('FunTime Stealth');

  // Tab 2: Advanced Routing
  const [tracerouteBypass, setTracerouteBypass] = useState(true);
  const [disableMdns, setDisableMdns] = useState(true);
  const [routerMode, setRouterMode] = useState(true);
  const [blockCrossNet, setBlockCrossNet] = useState(true);
  const [licenseSupport, setLicenseSupport] = useState(true);
  const [secureChat, setSecureChat] = useState(true);
  const [directConnect, setDirectConnect] = useState(true);
  const [showKickErrors, setShowKickErrors] = useState(false);
  const [autoLatency, setAutoLatency] = useState(true);
  const [pingCorrection, setPingCorrection] = useState(true);
  const [logPacketsChk, setLogPacketsChk] = useState(false);

  // Tab 3: DHCP
  const [dhcpConfig, setDhcpConfig] = useState(() => generateRandomDhcpConfig(178));
  const [isDhcpRunning, setIsDhcpRunning] = useState(false);

  // Tab 4: Detector 4.3
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditScore, setAuditScore] = useState(100);
  const [auditLogs, setAuditLogs] = useState(
    '[SYSTEM READY]: Click "Запустить аудит скрытности" to trigger real-time browser & network leak audit.'
  );
  const [stepBadges, setStepBadges] = useState(['SECURE', 'PASS', 'PASS', 'PASS']);

  // Tab 5: Sniffer
  const [packets, setPackets] = useState<SnifferPacket[]>(INITIAL_PACKETS);
  const [selectedPktId, setSelectedPktId] = useState<number>(3);
  const [snifferDirFilter, setSnifferDirFilter] = useState<'all' | 'OUT' | 'IN'>('all');
  const [snifferTypeFilter, setSnifferTypeFilter] = useState<string>('all');
  const [isSnifferLive, setIsSnifferLive] = useState(true);
  const [injectType, setInjectType] = useState<'chat' | 'position' | 'keepalive' | 'status'>('chat');
  const [injectPayload, setInjectPayload] = useState('!derbin dual-pc stealth test active');

  // Tab 6: Optimizer
  const [pingSpoofMs, setPingSpoofMs] = useState(0);
  const [jitterSmoothPct, setJitterSmoothPct] = useState(85);
  const [currentPing, setCurrentPing] = useState(22);
  const [minPing, setMinPing] = useState(18);
  const [maxPing, setMaxPing] = useState(26);
  const [jitterVal, setJitterVal] = useState('0.6');
  const [isBenchmarkingPing, setIsBenchmarkingPing] = useState(false);
  const [tcpNoDelay, setTcpNoDelay] = useState(true);
  const [wfpBypass, setWfpBypass] = useState(true);
  const [antiSpike, setAntiSpike] = useState(true);
  const [mtuClamp, setMtuClamp] = useState(true);
  const pingCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Tab 8: Themes
  const [blurVal, setBlurVal] = useState(34);
  const [satVal, setSatVal] = useState(190);

  const guiBoxRef = useRef<HTMLDivElement | null>(null);

  const t = (key: string) => translations[lang][key] || key;

  const stealthSummary = calculateStealthAuditScore({
    tracerouteBypass,
    disableMdns,
    routerMode,
    blockCrossNet,
  });

  useEffect(() => {
    if (!isProxyRunning) return;
    let idx = 0;
    const timer = setInterval(() => {
      setPacketRate((prev) => prev + Math.floor(Math.random() * 8) + 12);
      setKernelLogLine(MOCK_KERNEL_LOGS[idx % MOCK_KERNEL_LOGS.length]);
      idx++;
    }, 750);
    return () => clearInterval(timer);
  }, [isProxyRunning]);

  useEffect(() => {
    if (!isSnifferLive) return;
    const timer = setInterval(() => {
      const types = [
        { hex: '0x0F', name: 'KeepAlive', size: '42 B', dir: 'OUT' as const },
        { hex: '0x04', name: 'PlayerPosition', size: '56 B', dir: 'OUT' as const },
        { hex: '0x21', name: 'ChunkData', size: '1.2 KB', dir: 'IN' as const },
        { hex: '0x1F', name: 'EntityVelocity', size: '32 B', dir: 'IN' as const },
      ];
      const pick = types[Math.floor(Math.random() * types.length)];
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(
        now.getSeconds()
      ).padStart(2, '0')}.${String(now.getMilliseconds()).padStart(3, '0')}`;

      const pkt: SnifferPacket = {
        id: Date.now(),
        time: timeStr,
        dir: pick.dir,
        hexId: pick.hex,
        name: pick.name,
        size: pick.size,
        status: 'Passed WFP',
        bytes: `00 2a ${pick.hex.slice(2)} 00 00 01 8b 4a  53 2d 64 65 72 62 69 6e  |.*.....JS-derbin|\n0010  31 2e 38 2d 70 72 6f 78  79 2d 6f 6b 00 00 ff 1a  |1.8-proxy-ok....|`,
        fields: {
          'Packet ID': `${pick.hex} (${pick.name})`,
          'Captured Direction': pick.dir,
          Size: pick.size,
          Integrity: 'AES-CFB8 Valid',
        },
      };
      setPackets((prev) => [pkt, ...prev.slice(0, 24)]);
    }, 3500);
    return () => clearInterval(timer);
  }, [isSnifferLive]);

  useEffect(() => {
    if (activeTab !== 'optimizer') return;
    const canvas = pingCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let history = new Array(80).fill(22 + pingSpoofMs);
    let phase = 0;

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let y = 20; y < h; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      phase += 0.08;
      const optJitterFactor = ((100 - jitterSmoothPct) / 100) * 0.9;
      const baseTarget = 22 + pingSpoofMs;
      const noise = (Math.sin(phase) * 2 + (Math.random() - 0.5) * 8) * optJitterFactor;
      const curPingVal = Math.max(5, Math.round(baseTarget + noise));

      history = [...history.slice(1), curPingVal];
      setCurrentPing(curPingVal);
      setMinPing(Math.min(...history));
      setMaxPing(Math.max(...history));

      ctx.beginPath();
      const step = w / (history.length - 1);
      for (let i = 0; i < history.length; i++) {
        const val = history[i];
        const y = h - ((val / 160) * (h - 20) + 10);
        const x = i * step;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          const prevX = (i - 1) * step;
          const prevY = h - ((history[i - 1] / 160) * (h - 20) + 10);
          const cx = (prevX + x) / 2;
          ctx.quadraticCurveTo(prevX, prevY, cx, (prevY + y) / 2);
        }
      }

      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, 'rgba(59, 130, 246, 0.28)');
      grad.addColorStop(1, 'rgba(59, 130, 246, 0.0)');
      ctx.fillStyle = grad;
      ctx.fill();
    };

    draw();
    const timer = setInterval(draw, 100);
    return () => clearInterval(timer);
  }, [activeTab, pingSpoofMs, jitterSmoothPct]);

  const handleRunDiagnostic = async () => {
    if (isAuditing) return;
    setIsAuditing(true);
    playGuiSound('scan', soundEnabled);
    setAuditScore(0);
    setStepBadges(['PENDING', 'PENDING', 'PENDING', 'PENDING']);
    let logs = `[${new Date().toLocaleTimeString()}][INIT] Starting Derbin Kernel Undetect Audit...\n`;
    setAuditLogs(logs);

    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    await sleep(300);
    playGuiSound('scan', soundEnabled);
    logs += `[STEP 1/4] Probing WebRTC & STUN host address candidates...\n[SUCCESS] WebRTC leak test passed. WFP Shield: OK\n`;
    setAuditLogs(logs);
    setAuditScore(25);
    setStepBadges(['PASS', 'PENDING', 'PENDING', 'PENDING']);

    await sleep(300);
    playGuiSound('scan', soundEnabled);
    logs += `[STEP 2/4] Inspecting active desktop capture handles (AnyDesk/Discord/Echo hook audit)...\n[SUCCESS] Screen-share hook scan clean.\n`;
    setAuditLogs(logs);
    setAuditScore(50);
    setStepBadges(['PASS', 'SECURE', 'PENDING', 'PENDING']);

    await sleep(300);
    playGuiSound('scan', soundEnabled);
    logs += `[STEP 3/4] Verifying JVM memory map & Native Bytecode patches...\n[SUCCESS] Memory space untouched. Paladin check: CLEAN.\n`;
    setAuditLogs(logs);
    setAuditScore(75);
    setStepBadges(['PASS', 'SECURE', '100% CLEAN', 'PENDING']);

    await sleep(300);
    playGuiSound('success', soundEnabled);
    logs += `[STEP 4/4] Probing gateway hop count & TTL consistency...\n[AUDIT COMPLETED] OVERALL VERDICT: 100% UNDETECTED. Ready for AnyDesk/Echo checks!\n`;
    setAuditLogs(logs);
    setAuditScore(100);
    setStepBadges(['PASS', 'SECURE', '100% CLEAN', 'VERIFIED']);
    setIsAuditing(false);
    onNotify('Аудит скрытности успешно завершён: 0 следов инъекций!');
  };

  const handleExportAuditReport = () => {
    playGuiSound('click', soundEnabled);
    const reportText = `=====================================================
DERBIN UNDETECT DIAGNOSTIC AUDIT REPORT
Version: derbin v1.8 (Dual-PC Undetect Architecture)
Generated At: ${new Date().toISOString()}
Audited Device: Gaming Primary PC (Active Gateway: 192.168.178.181)
=====================================================
FINAL SECURITY VERDICT: 100% UNDETECTED
Dual-PC Anti-Cheat Rule 4.3 Evasion: FULLY COMPLIANT
=====================================================`;
    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `derbin-audit-report-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onNotify('Протокол аудита сохранён на устройство!');
  };

  const handleExportPcap = () => {
    playGuiSound('click', soundEnabled);
    const blob = new Blob([JSON.stringify(packets, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `derbin-packets-capture-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onNotify('Дамп сетевых пакетов экспортирован в JSON!');
  };

  const filteredPackets = packets.filter((p) => {
    if (snifferDirFilter !== 'all' && p.dir !== snifferDirFilter) return false;
    if (snifferTypeFilter !== 'all' && p.name !== snifferTypeFilter) return false;
    return true;
  });

  const activePacket = packets.find((p) => p.id === selectedPktId) || packets[0];

  const CheckBoxIcon = ({ checked }: { checked: boolean }) => (
    <span className={`derbin-check-box relative p-0.5 ${checked ? 'checked' : ''}`}>
      <span
        className={`h-3.5 w-4 rounded-full transition-all duration-300 shadow-sm ${
          checked
            ? 'translate-x-1.5 bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)]'
            : '-translate-x-1.5 bg-white/60'
        }`}
      />
    </span>
  );

  return (
    <section id="preview" className="relative bg-transparent px-5 py-[100px] z-10 border-t border-white/[0.04]">
      <div className="mx-auto w-full max-w-[1240px]">
        {/* Section Header (Exact Original) */}
        <div className="mx-auto mb-12 max-w-[850px] text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <svg viewBox="0 0 18 18" className="h-[18px] w-[18px] text-[var(--brand-accent)]" fill="currentColor">
              <path d="M8.75348 17.6952C7.72056 14.0706 3.94416 10.3084 0.305928 9.27938C-0.101976 9.14829 -0.101976 8.8599 0.305928 8.72226C3.95074 7.68666 7.72056 3.931 8.76005 0.299863C8.8719 -0.0999545 9.14164 -0.0999545 9.25349 0.299863C10.2864 3.931 14.0628 7.68666 17.6945 8.72226C18.1024 8.85335 18.1024 9.14829 17.6945 9.27938C14.0562 10.3084 10.2798 14.0706 9.24691 17.6952C9.13506 18.1016 8.86532 18.1016 8.75348 17.6952Z" />
            </svg>
            <h4 className="text-base font-medium text-[var(--brand-accent)]">{t('prev.eyebrow')}</h4>
          </div>
          <h2 className="text-[clamp(2.2rem,4.5vw,3.6rem)] font-semibold leading-[1.1] tracking-[-0.03em] text-[#f1f1ef]">
            {t('prev.heading')}
          </h2>
          <p className="mt-4 text-[#adadad] text-sm max-w-xl mx-auto">
            Полная интерактивная копия GUI из <code className="text-blue-400 font-mono">derbin-1.8-all.jar</code>:
            переключайте вкладки, управляйте маршрутизацией 2-х ПК, настраивайте DHCP и тестируйте функционал прямо в
            браузере!
          </p>

          {/* Interactive GUI Status Badge */}
          <div className="mt-7 inline-flex items-center gap-2 px-5 py-2 rounded-full liquid-btn-glass text-xs font-semibold text-blue-300">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
            <span>Интерактивный Web GUI • Кликабельная копия софта v1.8</span>
          </div>
        </div>

        {/* ================= 1. INTERACTIVE DERBIN GUI CONTAINER ================= */}
        {!isWindowClosed && (
          <motion.div
            ref={guiBoxRef}
            id="derbin-gui-container"
            initial={{ opacity: 0, y: 36, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.12 }}
            transition={{ type: 'spring', stiffness: 220, damping: 24 }}
            className="derbin-app-window max-w-4xl mx-auto shadow-2xl relative border border-white/25"
          >
            {/* Custom Title Bar */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.08] bg-black/30">
              <div className="flex items-center gap-3">
                <img
                  src="/logo.svg"
                  alt="Derbin"
                  className="h-6 w-6 object-contain drop-shadow-[0_0_8px_rgba(59,130,246,0.4)]"
                />
                <span className="text-lg font-bold tracking-tight text-white font-['Fredoka']">Derbin</span>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-white/[0.08] text-[#adadad] border border-white/10">
                  v1.8
                </span>
                <div
                  className={`hidden sm:inline-flex items-center gap-1.5 ml-2 text-[11px] font-mono px-2.5 py-0.5 rounded-full border ${
                    stealthSummary.tone === 'emerald'
                      ? 'text-blue-400 bg-blue-500/10 border-blue-500/25'
                      : stealthSummary.tone === 'amber'
                      ? 'text-amber-400 bg-amber-500/10 border-amber-500/25'
                      : 'text-rose-400 bg-rose-500/10 border-rose-500/25'
                  }`}
                >
                  <span className="h-2 w-2 rounded-full bg-current animate-pulse"></span>
                  <span>{stealthSummary.statusLabel}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onToggleSound}
                  className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-[#adadad] hover:text-white bg-white/[0.05] hover:bg-white/10 border border-white/10 px-2.5 py-1 rounded-lg transition mr-1"
                >
                  <i
                    className={`ph-bold ${
                      soundEnabled ? 'ph-speaker-high text-blue-400' : 'ph-speaker-slash text-[#777]'
                    } text-xs`}
                  ></i>
                  <span>{soundEnabled ? 'Звук: Вкл' : 'Звук: Выкл'}</span>
                </button>
                <a
                  href="https://discord.gg/ehWheFqAu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center gap-1 text-[11px] text-[#96afff] bg-[#5865f2]/15 hover:bg-[#5865f2]/30 border border-[#5865f2]/30 px-2.5 py-1 rounded-lg transition mr-1"
                >
                  <i className="ph-bold ph-discord-logo text-xs"></i>
                  <span>Discord</span>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setIsMinimized(!isMinimized);
                    onNotify(!isMinimized ? 'Окно derbin свёрнуто' : 'Окно derbin развёрнуто');
                  }}
                  className="w-7 h-7 rounded-lg hover:bg-white/10 text-[#adadad] hover:text-white flex items-center justify-center transition text-xs font-mono"
                  title="Свернуть"
                >
                  ─
                </button>
                <button
                  type="button"
                  onClick={() => onNotify('Окно развернуто в оптимальном масштабе.')}
                  className="w-7 h-7 rounded-lg hover:bg-white/10 text-[#adadad] hover:text-white flex items-center justify-center transition text-xs"
                  title="Развернуть"
                >
                  □
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsWindowClosed(true);
                    onNotify('Окно derbin скрыто. Нажмите "Интерактивный Web GUI" выше для восстановления.');
                  }}
                  className="w-7 h-7 rounded-lg hover:bg-rose-500/30 text-[#adadad] hover:text-rose-400 flex items-center justify-center transition text-xs"
                  title="Закрыть"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Segmented Tab Bar */}
            <div className="px-5 pt-3 pb-2 border-b border-white/[0.06] bg-black/20 overflow-x-auto">
              <div className="flex items-center gap-1.5 min-w-max">
                {(
                  [
                    { id: 'general', label: 'Основные', icon: 'ph-house' },
                    { id: 'advanced', label: 'Маршрутизация', icon: 'ph-git-fork' },
                    { id: 'dhcp', label: 'DHCP', icon: 'ph-network' },
                    { id: 'detector', label: 'Детектор проверок', icon: 'ph-shield-check' },
                    { id: 'sniffer', label: 'Сниффер', icon: 'ph-terminal-window' },
                    { id: 'optimizer', label: 'Оптимизатор', icon: 'ph-chart-line-up' },
                    { id: 'accounts', label: 'Аккаунты', icon: 'ph-user-circle' },
                    { id: 'themes', label: 'Темы', icon: 'ph-palette' },
                    { id: 'help', label: 'Справка', icon: 'ph-question' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      playGuiSound('tab', soundEnabled);
                      setActiveTab(tab.id);
                      setIsMinimized(false);
                    }}
                    className={`derbin-tab-item ${activeTab === tab.id ? 'active' : ''}`}
                  >
                    <i className={`ph-bold ${tab.icon} text-sm text-[var(--brand-accent)]`}></i>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Window Body */}
            {!isMinimized && (
              <div className="p-5 sm:p-7 min-h-[460px] transition-all duration-300">
                {/* TAB 1: GENERAL */}
                {activeTab === 'general' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-semibold text-white tracking-tight">Управление подключением</h3>
                      <span className="text-xs text-[#9196a8]">derbin dual-pc proxy engine</span>
                    </div>

                    <div className="derbin-card p-5 sm:p-6 space-y-5">
                      <div>
                        <label className="block text-xs font-medium text-[#9196a8] mb-1.5">
                          Адрес сервера Minecraft
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={serverInput}
                            onChange={(e) => setServerInput(e.target.value)}
                            className="derbin-input w-full font-mono"
                          />
                          <select
                            aria-label="Выбор сервера"
                            value={
                              ['mc.reallyworld.ru', 'funtime.su', 'spookytime.su', 'holyworld.ru', 'hypixel.net'].includes(
                                serverInput
                              )
                                ? serverInput
                                : 'mc.reallyworld.ru'
                            }
                            onChange={(e) => setServerInput(e.target.value)}
                            className="derbin-input w-44 cursor-pointer"
                          >
                            <option value="mc.reallyworld.ru">ReallyWorld</option>
                            <option value="funtime.su">FunTime</option>
                            <option value="spookytime.su">SpookyTime (СП)</option>
                            <option value="holyworld.ru">HolyWorld</option>
                            <option value="hypixel.net">Hypixel</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-[#9196a8] mb-1.5">Аккаунт Minecraft</label>
                        <select
                          aria-label="Выбор аккаунта Minecraft"
                          value={selectedAccount}
                          onChange={(e) => setSelectedAccount(e.target.value)}
                          className="derbin-input w-full cursor-pointer"
                        >
                          {accountsList.map((a) => (
                            <option key={a.name} value={a.name}>
                              {a.name} ({a.tag})
                            </option>
                          ))}
                          <option value="none">[Без аккаунта — пиратский режим]</option>
                        </select>
                      </div>

                      {/* Dual-PC Devices Visualizer */}
                      <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                        <div className="text-xs font-semibold text-[#adadad] uppercase tracking-wider mb-3 text-center">
                          Схема работы двух устройств (Dual-PC Undetect)
                        </div>

                        <div className="flex items-center justify-around gap-2 sm:gap-4">
                          <div
                            className={`flex flex-col items-center text-center p-3 rounded-xl bg-white/[0.02] border w-36 transition-all ${
                              !isSwapped ? 'border-blue-500/40' : 'border-white/5'
                            }`}
                          >
                            <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-400 flex items-center justify-center text-2xl mb-2 shadow-[0_0_15px_rgba(59,130,246,0.25)]">
                              <i className="ph-bold ph-desktop"></i>
                            </div>
                            <span className="text-xs font-bold text-white">
                              {isSwapped ? 'Второй ПК' : 'Игровой ПК'}
                            </span>
                            <span
                              className={`text-[10px] font-semibold mt-0.5 ${
                                !isSwapped ? 'text-blue-400' : 'text-[#adadad]'
                              }`}
                            >
                              {isSwapped ? 'Ведомый (MITM)' : 'Контроллер (Active)'}
                            </span>
                            <span className="text-[10px] font-mono text-[#777] mt-1">0.1 ms</span>
                          </div>

                          <div className="flex flex-col items-center">
                            <button
                              type="button"
                              onClick={() => {
                                setIsSwapped(!isSwapped);
                                onNotify(
                                  !isSwapped
                                    ? 'Управление передано на Второй ПК (Swap активен)'
                                    : 'Управление возвращено на Игровой ПК (Swap отключен)'
                                );
                              }}
                              className="p-3 rounded-xl bg-white/10 hover:bg-blue-500/20 hover:border-blue-500/40 border border-white/15 text-white transition hover:scale-110 active:scale-95 shadow-lg group"
                              title="Поменять управление ПК (Swap)"
                            >
                              <i className="ph-bold ph-arrows-left-right text-xl text-blue-400 group-hover:rotate-180 transition-transform duration-300"></i>
                            </button>
                            <span className="text-[9px] text-[#777] font-mono mt-1">SWAP</span>
                          </div>

                          <div
                            className={`flex flex-col items-center text-center p-3 rounded-xl bg-white/[0.02] border w-36 transition-all ${
                              isSwapped ? 'border-blue-500/40' : 'border-white/5'
                            }`}
                          >
                            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 text-[#adadad] flex items-center justify-center text-2xl mb-2">
                              <i className="ph-bold ph-laptop"></i>
                            </div>
                            <span className="text-xs font-bold text-white">
                              {isSwapped ? 'Игровой ПК' : 'Второй ПК'}
                            </span>
                            <span
                              className={`text-[10px] font-semibold mt-0.5 ${
                                isSwapped ? 'text-blue-400' : 'text-[#adadad]'
                              }`}
                            >
                              {isSwapped ? 'Контроллер (Active)' : 'MITM Прокси'}
                            </span>
                            <span className="text-[10px] font-mono text-[#777] mt-1">{dhcpConfig.ip}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            const next = !isProxyRunning;
                            setIsProxyRunning(next);
                            if (next) {
                              playGuiSound('success', soundEnabled);
                              onNotify('Прокси derbin успешно запущен! MITM-туннель активен.');
                            } else {
                              playGuiSound('click', soundEnabled);
                              setPacketRate(0);
                              setKernelLogLine('[Idle]: Proxy session stopped. Reconnect anytime.');
                              onNotify('Прокси derbin остановлен.');
                            }
                          }}
                          className={
                            isProxyRunning
                              ? 'px-6 py-3 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all'
                              : 'liquid-btn-primary px-6 py-3 rounded-xl text-xs font-semibold text-white flex items-center gap-2'
                          }
                        >
                          <i className={`ph-bold ${isProxyRunning ? 'ph-stop' : 'ph-play'}`}></i>
                          <span>{isProxyRunning ? 'Остановить прокси' : 'Запустить прокси'}</span>
                        </button>

                        <div className="flex items-center gap-3 text-xs">
                          <span className="h-2.5 w-2.5 rounded-full bg-blue-500 animate-pulse"></span>
                          <span className={`font-mono ${isProxyRunning ? 'text-blue-400' : 'text-[#adadad]'}`}>
                            {isProxyRunning
                              ? '🟢 Прокси активно • Трафик перенаправлен'
                              : 'Ожидание запуска прокси'}
                          </span>
                        </div>
                      </div>

                      {/* Cloud Preset Save (Firebase Integration) */}
                      <div className="pt-3 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                          <input
                            type="text"
                            value={presetNameInput}
                            onChange={(e) => setPresetNameInput(e.target.value)}
                            placeholder="Имя облачного пресета..."
                            className="derbin-input w-full text-xs"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              onSaveCloudConfig({
                                name: presetNameInput || 'Derbin Preset',
                                serverAddress: serverInput,
                                accountName: selectedAccount,
                                dhcpSubnet: dhcpConfig.ip,
                                pingSpoofMs,
                                jitterSmoothPct,
                                tracerouteBypass,
                                routerMode,
                              })
                            }
                            className="liquid-btn-glass px-4 py-2 rounded-xl text-xs font-semibold text-blue-400 whitespace-nowrap"
                          >
                            + В облако Firebase
                          </button>
                        </div>

                        {cloudConfigs.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {cloudConfigs.slice(0, 3).map((cfg) => (
                              <span
                                key={cfg.id || cfg.name}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 text-[11px]"
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    setServerInput(cfg.serverAddress);
                                    setSelectedAccount(cfg.accountName);
                                    onNotify(`Загружен пресет "${cfg.name}"`);
                                  }}
                                  className="text-white hover:text-blue-400"
                                >
                                  {cfg.name}
                                </button>
                                {cfg.id && (
                                  <button
                                    type="button"
                                    onClick={() => onDeleteCloudConfig(cfg.id!)}
                                    className="text-[#777] hover:text-rose-400"
                                  >
                                    ✕
                                  </button>
                                )}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="rounded-xl bg-black/60 border border-white/10 p-3.5 font-mono text-xs text-[#788a80]">
                      <div className="flex items-center justify-between text-white/50 mb-1.5 border-b border-white/5 pb-1 text-[11px]">
                        <span>DERBIN KERNEL PACKET MONITOR</span>
                        <span className="text-blue-400">
                          {isProxyRunning ? `${packetRate * 14} PACKETS / SEC • 0.1ms` : '0 PACKETS / SEC'}
                        </span>
                      </div>
                      <div className="text-blue-400/90 text-[11px] truncate">{kernelLogLine}</div>
                    </div>
                  </div>
                )}

                {/* TAB 2: ADVANCED */}
                {activeTab === 'advanced' && (
                  <div className="space-y-6">
                    <div className="derbin-card p-5 sm:p-6 space-y-4">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/[0.08] pb-3">
                        <i className="ph-bold ph-git-fork text-[var(--brand-accent)] text-base"></i>
                        <span>Маршрутизация и Сеть</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label
                          onClick={() => setTracerouteBypass(!tracerouteBypass)}
                          className="derbin-check-label"
                        >
                          <CheckBoxIcon checked={tracerouteBypass} />
                          <span>Обход traceroute</span>
                        </label>
                        <label onClick={() => setDisableMdns(!disableMdns)} className="derbin-check-label">
                          <CheckBoxIcon checked={disableMdns} />
                          <span>Отключить mDNS и LLMNR</span>
                        </label>
                        <label onClick={() => setRouterMode(!routerMode)} className="derbin-check-label">
                          <CheckBoxIcon checked={routerMode} />
                          <span>Режим роутера</span>
                        </label>
                        <label onClick={() => setBlockCrossNet(!blockCrossNet)} className="derbin-check-label">
                          <CheckBoxIcon checked={blockCrossNet} />
                          <span>Блокировка трафика между сетями</span>
                        </label>
                      </div>

                      <div className="pt-2">
                        <label className="block text-xs font-medium text-[#9196a8] mb-1.5">
                          Сетевой интерфейс для второго устройства
                        </label>
                        <select className="derbin-input w-full cursor-pointer font-mono text-xs">
                          <option>
                            Realtek PCIe GbE Family Controller-WFP Native MAC Layer LightWeight Filter
                          </option>
                          <option>Realtek PCIe GbE Family Controller-QoS Packet Scheduler-0000</option>
                          <option>Realtek PCIe GbE Family Controller-WFP 802.3 MAC Layer LightWeight Filter-0000</option>
                          <option>Realtek PCIe GbE Family Controller 192.168.178.181</option>
                        </select>
                      </div>
                    </div>

                    <div className="derbin-card p-5 sm:p-6 space-y-4">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/[0.08] pb-3">
                        <i className="ph-bold ph-shield-check text-[var(--brand-accent)] text-base"></i>
                        <span>Прокси и Защита</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="derbin-tooltip-container">
                          <label
                            onClick={() => setLicenseSupport(!licenseSupport)}
                            className="derbin-check-label w-full"
                          >
                            <CheckBoxIcon checked={licenseSupport} />
                            <span className="flex items-center gap-1.5">
                              <span>Поддержка лицензии</span>
                              <i className="ph-bold ph-info text-xs text-blue-400"></i>
                            </span>
                          </label>
                          <div className="derbin-tooltip-box">
                            Позволяет полноценно общаться в режиме защищённого чата и видеть скины на серверах,
                            использующих проверку лицензии. Требуется учётная запись с действующей лицензией.
                          </div>
                        </div>

                        <label onClick={() => setSecureChat(!secureChat)} className="derbin-check-label">
                          <CheckBoxIcon checked={secureChat} />
                          <span>Защищённый чат</span>
                        </label>

                        <label onClick={() => setDirectConnect(!directConnect)} className="derbin-check-label">
                          <CheckBoxIcon checked={directConnect} />
                          <span>Разрешить прямые подключения</span>
                        </label>

                        <label onClick={() => setShowKickErrors(!showKickErrors)} className="derbin-check-label">
                          <CheckBoxIcon checked={showKickErrors} />
                          <span>Показывать ошибки при кике</span>
                        </label>
                      </div>

                      <div className="pt-2">
                        <label className="block text-xs font-medium text-[#9196a8] mb-1.5">
                          Адрес прокси-сервера:
                        </label>
                        <input
                          type="text"
                          defaultValue="127.0.0.1:25565"
                          className="derbin-input w-full font-mono text-xs"
                        />
                      </div>
                    </div>

                    <div className="derbin-card p-5 sm:p-6 space-y-3">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/[0.08] pb-3">
                        <i className="ph-bold ph-gauge text-[var(--brand-accent)] text-base"></i>
                        <span>Сетевая оптимизация и сниффинг</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <label onClick={() => setAutoLatency(!autoLatency)} className="derbin-check-label">
                          <CheckBoxIcon checked={autoLatency} />
                          <span>Auto Latency</span>
                        </label>
                        <label onClick={() => setPingCorrection(!pingCorrection)} className="derbin-check-label">
                          <CheckBoxIcon checked={pingCorrection} />
                          <span>Ping Correction</span>
                        </label>
                        <label onClick={() => setLogPacketsChk(!logPacketsChk)} className="derbin-check-label">
                          <CheckBoxIcon checked={logPacketsChk} />
                          <span>Логировать пакеты</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: DHCP */}
                {activeTab === 'dhcp' && (
                  <div className="space-y-6">
                    <div className="derbin-card p-5 sm:p-6 space-y-3">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/[0.08] pb-3">
                        <i className="ph-bold ph-cpu text-[var(--brand-accent)] text-base"></i>
                        <span>Сетевой интерфейс для DHCP сервера</span>
                      </h4>
                      <select className="derbin-input w-full cursor-pointer font-mono text-xs">
                        <option>Realtek PCIe GbE Family Controller 192.168.178.181</option>
                        <option>Intel(R) Wi-Fi 6 AX201 160MHz (Не рекомендуется: Wi-Fi)</option>
                      </select>
                    </div>

                    <div className="derbin-card p-5 sm:p-6 space-y-4">
                      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <i className="ph-bold ph-sliders text-[var(--brand-accent)] text-base"></i>
                          <span>Параметры сети (DHCP)</span>
                        </h4>
                        <button
                          type="button"
                          onClick={() => {
                            const next = generateRandomDhcpConfig();
                            setDhcpConfig(next);
                            onNotify(`Сгенерирована новая чистая подсеть 192.168.${next.subnetOctet}.0/24!`);
                          }}
                          className="px-3 py-1 rounded-lg bg-white/10 hover:bg-blue-500/20 text-xs text-blue-400 border border-white/10 transition flex items-center gap-1.5"
                        >
                          <i className="ph-bold ph-shuffle"></i>
                          <span>Случайный IP</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-[#9196a8] mb-1">IP address</label>
                          <input
                            type="text"
                            value={dhcpConfig.ip}
                            onChange={(e) => setDhcpConfig({ ...dhcpConfig, ip: e.target.value })}
                            className="derbin-input w-full font-mono text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[#9196a8] mb-1">Mask</label>
                          <input
                            type="text"
                            value={dhcpConfig.mask}
                            onChange={(e) => setDhcpConfig({ ...dhcpConfig, mask: e.target.value })}
                            className="derbin-input w-full font-mono text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[#9196a8] mb-1">Start ip</label>
                          <input
                            type="text"
                            value={dhcpConfig.startIp}
                            onChange={(e) => setDhcpConfig({ ...dhcpConfig, startIp: e.target.value })}
                            className="derbin-input w-full font-mono text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[#9196a8] mb-1">End ip</label>
                          <input
                            type="text"
                            value={dhcpConfig.endIp}
                            onChange={(e) => setDhcpConfig({ ...dhcpConfig, endIp: e.target.value })}
                            className="derbin-input w-full font-mono text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[#9196a8] mb-1">DNS 1</label>
                          <input
                            type="text"
                            value={dhcpConfig.dns1}
                            onChange={(e) => setDhcpConfig({ ...dhcpConfig, dns1: e.target.value })}
                            className="derbin-input w-full font-mono text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[#9196a8] mb-1">DNS 2</label>
                          <input
                            type="text"
                            value={dhcpConfig.dns2}
                            onChange={(e) => setDhcpConfig({ ...dhcpConfig, dns2: e.target.value })}
                            className="derbin-input w-full font-mono text-xs"
                          />
                        </div>
                      </div>

                      <div className="pt-3 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => {
                            const next = !isDhcpRunning;
                            setIsDhcpRunning(next);
                            onNotify(next ? 'Локальный DHCP сервер derbin запущен!' : 'DHCP сервер остановлен.');
                          }}
                          className={
                            isDhcpRunning
                              ? 'px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 transition shadow-lg shadow-rose-600/30 flex items-center gap-2'
                              : 'liquid-btn-primary px-6 py-2.5 rounded-xl text-xs font-semibold text-white flex items-center gap-2'
                          }
                        >
                          <i className="ph-bold ph-power"></i>
                          <span>{isDhcpRunning ? 'Остановить DHCP сервер' : 'Запустить DHCP сервер'}</span>
                        </button>
                        <span className={`text-xs font-mono ${isDhcpRunning ? 'text-blue-400' : 'text-[#adadad]'}`}>
                          {isDhcpRunning ? 'DHCP: Запущен (192.168.x.x)' : 'DHCP: Остановлен'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: DETECTOR 4.3 */}
                {activeTab === 'detector' && (
                  <div className="space-y-6">
                    <div className="derbin-card p-5 sm:p-6 space-y-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
                        <div>
                          <h4 className="text-sm font-bold text-white flex items-center gap-2">
                            <i className="ph-bold ph-shield-check text-[var(--brand-accent)] text-lg"></i>
                            <span>Анализатор безопасности и чекеров (Error / AnyDesk)</span>
                          </h4>
                          <p className="text-xs text-[#9196a8] mt-1">
                            Стресс-тестирование системы на палевность (Echo, AnyDesk, Process Hacker, Paladin)
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={handleExportAuditReport}
                            className="px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/10 text-xs font-semibold text-white border border-white/10 transition flex items-center gap-1.5"
                          >
                            <i className="ph-bold ph-download-simple text-blue-400"></i>
                            <span>Отчёт .txt</span>
                          </button>
                          <button
                            type="button"
                            disabled={isAuditing}
                            onClick={handleRunDiagnostic}
                            className="liquid-btn-primary px-5 py-2 rounded-xl text-xs font-semibold text-white flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                          >
                            <i className={`ph-bold ${isAuditing ? 'ph-spinner animate-spin' : 'ph-play'}`}></i>
                            <span>{isAuditing ? 'Диагностика...' : 'Запустить аудит скрытности'}</span>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                        <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex items-center gap-4">
                          <div className="relative w-16 h-16 flex items-center justify-center">
                            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                              <path
                                className="text-white/10"
                                strokeWidth="3.5"
                                stroke="currentColor"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                              <path
                                className="text-blue-400 transition-all duration-700 ease-out"
                                strokeDasharray={`${auditScore}, 100`}
                                strokeWidth="3.5"
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                            </svg>
                            <span className="absolute text-xs font-bold text-white font-mono">{auditScore}%</span>
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white">СТАТУС: ЧИСТ</div>
                            <div className="text-[11px] text-blue-400 font-semibold">0 следов инъекций</div>
                            <div className="text-[10px] text-[#777] font-mono mt-0.5">Dual-PC Rule 4.3: PASS</div>
                          </div>
                        </div>

                        <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-[#9196a8]">WebRTC утечка IP:</span>
                            <span className="font-mono text-blue-400 font-bold">Изолирован</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-[#9196a8]">JVM инъекции:</span>
                            <span className="font-mono text-blue-400 font-bold">0 хуков (Clean)</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-[#9196a8]">Маскировка TTL:</span>
                            <span className="font-mono text-blue-400 font-bold">128 (Windows native)</span>
                          </div>
                        </div>

                        <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-[#9196a8]">Трейсы AnyDesk:</span>
                            <span className="font-mono text-blue-400 font-bold">0 сигнатур</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-[#9196a8]">WFP MAC Layer:</span>
                            <span className="font-mono text-blue-400 font-bold">Активен (Ring-0)</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-[#9196a8]">Prefetch &amp; USN:</span>
                            <span className="font-mono text-blue-400 font-bold">Чисто (No .jar)</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        {[
                          {
                            title: 'WebRTC & STUN Leak Benchmark',
                            desc: 'Локальные кандидаты ICE изолированы внутри виртуальной подсети 192.168.178.1',
                          },
                          {
                            title: 'Screen Capture & Spy-API Monitor',
                            desc: 'Хуки захвата экрана сторонними утилитами модерации не обнаружены',
                          },
                          {
                            title: 'JVM Integrity & Memory Signatures',
                            desc: 'Сигнатуры Paladin, Process Hacker, Echo и Everything не находят модификаций памяти',
                          },
                          {
                            title: 'TTL Mask & Traceroute Verification',
                            desc: 'Сетевой узел второго ПК маскируется под домашний маршрутизатор (TTL=128, 1 Hop)',
                          },
                        ].map((step, i) => (
                          <div
                            key={step.title}
                            className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 transition"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold font-mono">
                                ✓
                              </div>
                              <div>
                                <div className="text-xs font-bold text-white">{step.title}</div>
                                <div className="text-[10px] text-[#adadad]">{step.desc}</div>
                              </div>
                            </div>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              {stepBadges[i]}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="rounded-xl bg-black/70 border border-white/10 p-3.5 font-mono text-xs text-[#788a80]">
                        <div className="flex items-center justify-between text-white/50 mb-1.5 border-b border-white/5 pb-1 text-[11px]">
                          <span>DIAGNOSTIC AUDIT LOG STREAM</span>
                          <span className="text-blue-400 font-semibold">
                            {isAuditing ? 'SCANNING...' : 'SYSTEM READY'}
                          </span>
                        </div>
                        <div className="text-blue-400/90 text-[11px] leading-relaxed max-h-24 overflow-y-auto whitespace-pre-wrap">
                          {auditLogs}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 5: SNIFFER */}
                {activeTab === 'sniffer' && (
                  <div className="space-y-6">
                    <div className="derbin-card p-5 sm:p-6 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
                        <div className="flex items-center gap-2">
                          <i className="ph-bold ph-terminal-window text-[var(--brand-accent)] text-lg"></i>
                          <div>
                            <h4 className="text-sm font-bold text-white">WFP Сетевой Сниффер и Hex-Инспектор</h4>
                            <div className="text-[11px] text-[#9196a8]">
                              Перехват и разбор пакетов протокола Minecraft в реальном времени
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <select
                            aria-label="Фильтр направления"
                            value={snifferDirFilter}
                            onChange={(e) => setSnifferDirFilter(e.target.value as 'all' | 'OUT' | 'IN')}
                            className="derbin-input px-2.5 py-1 text-xs cursor-pointer"
                          >
                            <option value="all">Все направления</option>
                            <option value="OUT">C -&gt; S (Исходящие)</option>
                            <option value="IN">S -&gt; C (Входящие)</option>
                          </select>

                          <select
                            aria-label="Фильтр типа"
                            value={snifferTypeFilter}
                            onChange={(e) => setSnifferTypeFilter(e.target.value)}
                            className="derbin-input px-2.5 py-1 text-xs cursor-pointer"
                          >
                            <option value="all">Все типы пакетов</option>
                            <option value="KeepAlive">KeepAlive (0x0F)</option>
                            <option value="PlayerPosition">Position (0x04)</option>
                            <option value="ChatMessage">Chat (0x03)</option>
                            <option value="Handshake">Handshake (0x00)</option>
                          </select>

                          <button
                            type="button"
                            onClick={() => setIsSnifferLive(!isSnifferLive)}
                            className="px-3 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 text-xs font-semibold flex items-center gap-1 transition"
                          >
                            <i className={`ph-bold ${isSnifferLive ? 'ph-pause' : 'ph-play'}`}></i>
                            <span>{isSnifferLive ? 'Пауза' : 'Старт'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setPackets([]);
                              onNotify('Буфер сниффера очищен');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-[#adadad] hover:text-white border border-white/10 transition"
                            title="Очистить лог"
                          >
                            <i className="ph-bold ph-trash"></i>
                          </button>

                          <button
                            type="button"
                            onClick={handleExportPcap}
                            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-[#adadad] hover:text-white border border-white/10 transition"
                            title="Экспорт JSON"
                          >
                            <i className="ph-bold ph-download-simple"></i>
                          </button>
                        </div>
                      </div>

                      <div className="rounded-xl border border-white/10 overflow-hidden bg-black/50">
                        <div className="max-h-48 overflow-y-auto">
                          <table className="w-full text-left text-xs font-mono">
                            <thead className="bg-white/[0.04] text-[#9196a8] border-b border-white/10 sticky top-0 text-[10px] uppercase tracking-wider">
                              <tr>
                                <th className="p-2.5">Время</th>
                                <th className="p-2.5">Напр.</th>
                                <th className="p-2.5">ID</th>
                                <th className="p-2.5">Тип</th>
                                <th className="p-2.5">Размер</th>
                                <th className="p-2.5">WFP Статус</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.04]">
                              {filteredPackets.map((p) => (
                                <tr
                                  key={p.id}
                                  onClick={() => {
                                    playGuiSound('click', soundEnabled);
                                    setSelectedPktId(p.id);
                                  }}
                                  className={`derbin-table-row ${
                                    activePacket?.id === p.id ? 'derbin-hex-active' : ''
                                  }`}
                                >
                                  <td className="p-2.5 text-[#adadad]">{p.time}</td>
                                  <td className="p-2.5">
                                    {p.dir === 'OUT' ? (
                                      <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-semibold text-[9px] border border-blue-500/30">
                                        C-&gt;S
                                      </span>
                                    ) : (
                                      <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-semibold text-[9px] border border-amber-500/30">
                                        S-&gt;C
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-2.5 text-blue-400 font-bold">{p.hexId}</td>
                                  <td className="p-2.5 text-white font-medium">{p.name}</td>
                                  <td className="p-2.5 text-[#adadad]">{p.size}</td>
                                  <td className="p-2.5">
                                    <span className="inline-flex items-center gap-1 text-[10px] text-blue-400 font-semibold">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> {p.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {activePacket && (
                        <div className="rounded-xl bg-black/70 border border-white/10 p-4 font-mono text-xs space-y-3">
                          <div className="flex items-center justify-between border-b border-white/5 pb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-white font-bold">
                                Пакет: {activePacket.hexId} {activePacket.name}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[10px] font-semibold">
                                {activePacket.size}
                              </span>
                            </div>
                            <span className="text-[#777] text-[10px]">
                              Route: Device 1 -&gt; WFP 192.168.178.181 -&gt; Server
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <div className="text-[10px] text-[#9196a8] mb-1 uppercase tracking-wider">
                                RAW HEX BYTES &amp; ASCII DECODE
                              </div>
                              <pre className="p-2.5 rounded-lg bg-black/90 border border-white/5 text-[11px] text-blue-400 derbin-hex-cell leading-tight overflow-x-auto">
                                {activePacket.bytes}
                              </pre>
                            </div>
                            <div>
                              <div className="text-[10px] text-[#9196a8] mb-1 uppercase tracking-wider">
                                DECODED PROTOCOL FIELDS
                              </div>
                              <div className="p-2.5 rounded-lg bg-black/90 border border-white/5 text-[11px] text-[#adadad] space-y-1 font-mono leading-relaxed">
                                {Object.entries(activePacket.fields).map(([k, v]) => (
                                  <div key={k}>
                                    <span className="text-white font-bold">{k}:</span>{' '}
                                    <span className="text-blue-400">{v}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
                        <div className="text-xs font-semibold text-white flex items-center gap-2">
                          <i className="ph-bold ph-paper-plane-tilt text-blue-400"></i>
                          <span>Инжектор тестовых пакетов в сетевой туннель</span>
                        </div>
                        <div className="flex flex-wrap sm:flex-nowrap gap-2">
                          <select
                            aria-label="Тип пакета"
                            value={injectType}
                            onChange={(e) =>
                              setInjectType(e.target.value as 'chat' | 'position' | 'keepalive' | 'status')
                            }
                            className="derbin-input w-48 text-xs cursor-pointer"
                          >
                            <option value="chat">0x03 Chat Message</option>
                            <option value="position">0x04 Player Position</option>
                            <option value="keepalive">0x0F KeepAlive</option>
                            <option value="status">0x19 Entity Action</option>
                          </select>
                          <input
                            type="text"
                            value={injectPayload}
                            onChange={(e) => setInjectPayload(e.target.value)}
                            className="derbin-input w-full text-xs font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const pkt = buildInjectedPacket(injectType, injectPayload, new Date());
                              setPackets((prev) => [pkt, ...prev.slice(0, 24)]);
                              setSelectedPktId(pkt.id);
                              playGuiSound('success', soundEnabled);
                              onNotify(`Пакет ${pkt.hexId} (${pkt.name}) успешно отправлен через WFP шлюз!`);
                            }}
                            className="liquid-btn-primary px-5 py-2 rounded-xl text-xs font-semibold text-white whitespace-nowrap flex items-center gap-1.5 shadow-md"
                          >
                            <i className="ph-bold ph-lightning"></i>
                            <span>Инжектировать</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 6: OPTIMIZER */}
                {activeTab === 'optimizer' && (
                  <div className="space-y-6">
                    <div className="derbin-card p-5 sm:p-6 space-y-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
                        <div className="flex items-center gap-2">
                          <i className="ph-bold ph-chart-line-up text-[var(--brand-accent)] text-lg"></i>
                          <div>
                            <h4 className="text-sm font-bold text-white">
                              Оптимизатор сетевой задержки и Сглаживатель Пинга
                            </h4>
                            <div className="text-[11px] text-[#9196a8]">
                              Аппаратная стабилизация джиттера и визуальный осциллограф пакетов
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={async () => {
                            if (isBenchmarkingPing) return;
                            setIsBenchmarkingPing(true);
                            playGuiSound('scan', soundEnabled);
                            await new Promise((r) => setTimeout(r, 250));
                            setIsBenchmarkingPing(false);
                            setJitterVal('0.4');
                            playGuiSound('success', soundEnabled);
                            onNotify(`Реальный пинг замерен: ${currentPing} ms (Джиттер: ±0.4 ms)`);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/40 text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
                        >
                          <i className="ph-bold ph-wifi-high"></i>
                          <span>
                            {isBenchmarkingPing ? 'Замеряем реальный пинг...' : 'Замерить реальный интернет-пинг'}
                          </span>
                        </button>
                      </div>

                      <div className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                          <div className="flex items-center gap-3">
                            <span className="text-white/50 text-[11px]">LIVE PACKET OSCILLOSCOPE</span>
                            <span className="px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 font-bold text-[11px] border border-blue-500/30">
                              PING: {currentPing} ms
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[#9196a8] text-[11px]">
                            <span>
                              MIN: <strong className="text-white">{minPing}ms</strong>
                            </span>
                            <span>
                              MAX: <strong className="text-white">{maxPing}ms</strong>
                            </span>
                            <span>
                              JITTER: <strong className="text-blue-400">±{jitterVal}ms</strong>
                            </span>
                          </div>
                        </div>

                        <div className="w-full h-36 relative rounded-lg overflow-hidden bg-black/80 border border-white/5 flex items-center justify-center">
                          <canvas
                            ref={pingCanvasRef}
                            width={700}
                            height={140}
                            className="w-full h-full block"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                          <div className="flex justify-between text-xs text-[#9196a8]">
                            <span className="text-white font-medium">Искусственный спуф пинга (Target Delay)</span>
                            <span className="font-mono text-blue-400 font-bold">
                              {pingSpoofMs === 0 ? '+0 ms (Native)' : `+${pingSpoofMs} ms (Spoof)`}
                            </span>
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={120}
                            value={pingSpoofMs}
                            onChange={(e) => setPingSpoofMs(Number(e.target.value))}
                            className="w-full accent-emerald-500 cursor-pointer"
                          />
                          <p className="text-[10px] text-[#777]">
                            Сдвигает среднее значение пинга в сетевом стеке для маскировки под обычного игрока
                          </p>
                        </div>

                        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                          <div className="flex justify-between text-xs text-[#9196a8]">
                            <span className="text-white font-medium">Сглаживание джиттера (Jitter Smoothing)</span>
                            <span className="font-mono text-blue-400 font-bold">
                              {jitterSmoothPct}% ({jitterSmoothPct > 70 ? 'Высокое' : 'Среднее'})
                            </span>
                          </div>
                          <input
                            type="range"
                            min={10}
                            max={100}
                            value={jitterSmoothPct}
                            onChange={(e) => setJitterSmoothPct(Number(e.target.value))}
                            className="w-full accent-emerald-500 cursor-pointer"
                          />
                          <p className="text-[10px] text-[#777]">
                            Устраняет резкие микроспайки в пакетах между контроллером и вторым ПК
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <label onClick={() => setTcpNoDelay(!tcpNoDelay)} className="derbin-check-label">
                          <CheckBoxIcon checked={tcpNoDelay} />
                          <div className="text-xs">
                            <div className="font-bold text-white">TCP_NODELAY (Отключение Nagle)</div>
                            <div className="text-[10px] text-[#adadad]">
                              Мгновенная отправка пакетов без ожидания буфера
                            </div>
                          </div>
                        </label>
                        <label onClick={() => setWfpBypass(!wfpBypass)} className="derbin-check-label">
                          <CheckBoxIcon checked={wfpBypass} />
                          <div className="text-xs">
                            <div className="font-bold text-white">WFP Ring-0 MAC Bypass</div>
                            <div className="text-[10px] text-[#adadad]">Аппаратный приоритет сетевых прерываний</div>
                          </div>
                        </label>
                        <label onClick={() => setAntiSpike(!antiSpike)} className="derbin-check-label">
                          <CheckBoxIcon checked={antiSpike} />
                          <div className="text-xs">
                            <div className="font-bold text-white">Anti-Spike Protection</div>
                            <div className="text-[10px] text-[#adadad]">Сглаживание лагов при скачках Wi-Fi</div>
                          </div>
                        </label>
                        <label onClick={() => setMtuClamp(!mtuClamp)} className="derbin-check-label">
                          <CheckBoxIcon checked={mtuClamp} />
                          <div className="text-xs">
                            <div className="font-bold text-white">MTU Clamp (1472 байта)</div>
                            <div className="text-[10px] text-[#adadad]">Исключает фрагментацию IP пакетов</div>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 7: ACCOUNTS */}
                {activeTab === 'accounts' && (
                  <div className="space-y-6">
                    <div className="derbin-card p-5 sm:p-6 space-y-4">
                      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <i className="ph-bold ph-users text-[var(--brand-accent)] text-base"></i>
                          <span>Управление игровыми аккаунтами</span>
                        </h4>
                        <span className="text-xs text-[#9196a8]">{accountsList.length} аккаунта активно</span>
                      </div>

                      <div className="space-y-2.5">
                        {accountsList.map((a) => (
                          <div
                            key={a.name}
                            className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/15 transition"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-blue-500/20 border border-blue-500/40 text-blue-400 font-bold flex items-center justify-center font-mono">
                                {a.name.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="text-xs font-bold text-white">{a.name}</div>
                                <div className="text-[10px] text-[#adadad]">{a.desc}</div>
                              </div>
                            </div>
                            <span className="px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-400 text-[10px] font-semibold border border-blue-500/30">
                              {a.tag}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-3 border-t border-white/[0.06] flex gap-2">
                        <input
                          type="text"
                          value={newAccountInput}
                          onChange={(e) => setNewAccountInput(e.target.value)}
                          placeholder="Введите никнейм для добавления..."
                          className="derbin-input w-full text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const name = newAccountInput.trim();
                            if (!name) {
                              onNotify('Введите никнейм аккаунта!');
                              return;
                            }
                            setAccountsList((prev) => [
                              ...prev,
                              {
                                name,
                                desc: 'Пользовательский аккаунт • Добавлен вручную',
                                tag: 'Активен',
                              },
                            ]);
                            setSelectedAccount(name);
                            setNewAccountInput('');
                            onNotify(`Аккаунт ${name} успешно добавлен в derbin!`);
                          }}
                          className="liquid-btn-primary px-5 py-2 rounded-xl text-xs font-semibold text-white whitespace-nowrap"
                        >
                          + Добавить
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 8: THEMES */}
                {activeTab === 'themes' && (
                  <div className="space-y-6">
                    <div className="derbin-card p-5 sm:p-6 space-y-5">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/[0.08] pb-3">
                        <i className="ph-bold ph-paint-brush text-[var(--brand-accent)] text-base"></i>
                        <span>Кастомизация прозрачности и оттенка стекла</span>
                      </h4>

                      <div>
                        <label className="block text-xs font-medium text-[#9196a8] mb-2.5">
                          Акцентный цвет интерфейса
                        </label>
                        <div className="flex flex-wrap gap-2.5">
                          <button
                            type="button"
                            onClick={() => {
                              document.documentElement.style.setProperty('--brand-primary', '#2563eb');
                              document.documentElement.style.setProperty('--brand-accent', '#60a5fa');
                              onSelectPreset('prismatic_ios26');
                            }}
                            className="px-3.5 py-2 rounded-xl bg-blue-500/20 border border-blue-500/50 text-blue-400 text-xs font-semibold flex items-center gap-2 hover:scale-105 transition"
                          >
                            <span className="w-3 h-3 rounded-full bg-blue-400"></span> Sapphire Blue (Default)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              document.documentElement.style.setProperty('--brand-primary', '#0284c7');
                              document.documentElement.style.setProperty('--brand-accent', '#38bdf8');
                              onSelectPreset('obsidian_frost');
                            }}
                            className="px-3.5 py-2 rounded-xl bg-sky-500/20 border border-sky-500/50 text-sky-400 text-xs font-semibold flex items-center gap-2 hover:scale-105 transition"
                          >
                            <span className="w-3 h-3 rounded-full bg-sky-400"></span> Ocean Azure
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              document.documentElement.style.setProperty('--brand-primary', '#6366f1');
                              document.documentElement.style.setProperty('--brand-accent', '#818cf8');
                              onNotify('Тема оформления обновлена (Indigo Soft)');
                            }}
                            className="px-3.5 py-2 rounded-xl bg-indigo-500/20 border border-indigo-500/50 text-indigo-400 text-xs font-semibold flex items-center gap-2 hover:scale-105 transition"
                          >
                            <span className="w-3 h-3 rounded-full bg-indigo-400"></span> Indigo Soft
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              document.documentElement.style.setProperty('--brand-primary', '#0ea5e9');
                              document.documentElement.style.setProperty('--brand-accent', '#7dd3fc');
                              onNotify('Тема оформления обновлена (Ice Glacier)');
                            }}
                            className="px-3.5 py-2 rounded-xl bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 text-xs font-semibold flex items-center gap-2 hover:scale-105 transition"
                          >
                            <span className="w-3 h-3 rounded-full bg-cyan-400"></span> Ice Glacier
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              document.documentElement.style.setProperty('--brand-primary', '#1d4ed8');
                              document.documentElement.style.setProperty('--brand-accent', '#93c5fd');
                              onSelectPreset('amber_gold');
                            }}
                            className="px-3.5 py-2 rounded-xl bg-blue-600/20 border border-blue-500/50 text-blue-300 text-xs font-semibold flex items-center gap-2 hover:scale-105 transition"
                          >
                            <span className="w-3 h-3 rounded-full bg-blue-300"></span> Midnight Royal
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                        <div>
                          <div className="flex justify-between text-xs text-[#9196a8] mb-1.5">
                            <span>Размытие стекла (Backdrop Blur)</span>
                            <span className="font-mono text-white">{blurVal}px</span>
                          </div>
                          <input
                            type="range"
                            min={12}
                            max={50}
                            value={blurVal}
                            onChange={(e) => {
                              const v = Number(e.target.value);
                              setBlurVal(v);
                              document.documentElement.style.setProperty('--glass-blur', `${v}px`);
                            }}
                            className="w-full accent-blue-500 cursor-pointer"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-xs text-[#9196a8] mb-1.5">
                            <span>Насыщенность отражения (Saturation)</span>
                            <span className="font-mono text-white">{satVal}%</span>
                          </div>
                          <input
                            type="range"
                            min={100}
                            max={250}
                            value={satVal}
                            onChange={(e) => {
                              const v = Number(e.target.value);
                              setSatVal(v);
                              document.documentElement.style.setProperty('--glass-saturate', `${v}%`);
                            }}
                            className="w-full accent-blue-500 cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 9: HELP */}
                {activeTab === 'help' && (
                  <div className="space-y-6">
                    <div className="derbin-card p-5 sm:p-6 space-y-4">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/[0.08] pb-3">
                        <i className="ph-bold ph-book-open text-[var(--brand-accent)] text-base"></i>
                        <span>Инструкция по безопасности и обходу проверок</span>
                      </h4>
                      <div className="space-y-3.5 text-xs text-[#ededeb] leading-relaxed">
                        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300">
                          <strong>Как работает схема двух ПК:</strong> Игровой клиент запускается на первом ПК
                          абсолютно «чистым» без внедрения читов в память процесса. Все манипуляции с пакетами и ботами
                          происходят на втором ПК через WFP-фильтр.
                        </div>
                        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                          <strong>Почему 0 банов на проверках:</strong> Любая проверка экрана (чекер Error на FunTime, AnyDesk, Paladin, Process
                          Hacker, Everything) проверяет только игровой ПК, где нет ни одного файла софта, а сетевой
                          шлюз маскируется под домашний роутер.
                        </div>
                        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                          <strong>Поддержка серверов:</strong> Полная совместимость с серверами FunTime (чекер Error ничего не находит), HolyWorld, SpookyTime
                          (СП — spookytime.su), ReallyWorld и любыми проектами со строгой модерацией.
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
};
