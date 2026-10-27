import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lang, playGuiSound } from '../utils/i18nAndAudio';

interface ServerNodeStatus {
  id: string;
  name: string;
  sub: string;
  tag: string;
  badge: string;
  badgeColor: string;
  iconBg: string;
  checkLabel: string;
  checkValue: string;
  checkHighlight?: boolean;
  ping: number;
  featureLabel: string;
  featureValue: string;
  lastChecked: string;
}

const SERVER_NODES: ServerNodeStatus[] = [
  {
    id: 'rw',
    name: 'ReallyWorld',
    sub: 'mc.reallyworld.ru',
    tag: 'RW',
    badge: 'UNDETECTED',
    badgeColor: 'emerald',
    iconBg: 'from-emerald-500/20 to-emerald-950/40 text-emerald-400 border-emerald-500/30',
    checkLabel: 'Проверка AnyDesk:',
    checkValue: '100% Pass (0 детектов)',
    checkHighlight: true,
    ping: 12,
    featureLabel: 'Защита чата / Mojang:',
    featureValue: 'Активна',
    lastChecked: '26 октября 2026, 23:40',
  },
  {
    id: 'ft',
    name: 'FunTime',
    sub: 'funtime.su (Анархия)',
    tag: 'FT',
    badge: 'UNDETECTED',
    badgeColor: 'emerald',
    iconBg: 'from-cyan-500/20 to-blue-950/40 text-cyan-400 border-cyan-500/30',
    checkLabel: 'Чекер Error (AnyDesk):',
    checkValue: 'Чисто (0 детектов)',
    checkHighlight: true,
    ping: 16,
    featureLabel: 'Обход Traceroute:',
    featureValue: '1 Hop (Router Mock)',
    lastChecked: '27 октября 2026, 00:20',
  },
  {
    id: 'hw',
    name: 'HolyWorld',
    sub: 'holyworld.ru',
    tag: 'HW',
    badge: 'UNDETECTED',
    badgeColor: 'emerald',
    iconBg: 'from-purple-500/20 to-indigo-950/40 text-purple-400 border-purple-500/30',
    checkLabel: 'Проверка Screen Share:',
    checkValue: '100% Pass',
    checkHighlight: true,
    ping: 19,
    featureLabel: 'Анти-детект трафика:',
    featureValue: 'Ring-0 MAC Filter',
    lastChecked: '26 октября 2026, 21:15',
  },
  {
    id: 'sp',
    name: 'SpookyTime (СП)',
    sub: 'spookytime.su (Вайтлист)',
    tag: 'SP',
    badge: 'UNDETECTED',
    badgeColor: 'emerald',
    iconBg: 'from-amber-500/20 to-amber-950/40 text-amber-400 border-amber-500/30',
    checkLabel: 'Voice / Chat аутентификация:',
    checkValue: 'Mojang Valid',
    checkHighlight: true,
    ping: 24,
    featureLabel: 'Приватность и логи:',
    featureValue: '0 утечек IP',
    lastChecked: '26 октября 2026, 19:30',
  },
  {
    id: 'hy',
    name: 'Hypixel Network',
    sub: 'hypixel.net (EU / US)',
    tag: 'HY',
    badge: 'UNDETECTED',
    badgeColor: 'emerald',
    iconBg: 'from-rose-500/20 to-red-950/40 text-rose-400 border-rose-500/30',
    checkLabel: 'Watchdog эмуляция:',
    checkValue: 'Синхронизировано',
    checkHighlight: true,
    ping: 34,
    featureLabel: 'Jitter Smoothing:',
    featureValue: 'Active (±0.4ms)',
    lastChecked: '26 октября 2026, 22:00',
  },
  {
    id: 'ms',
    name: 'MST Network / Custom',
    sub: 'Любые СНГ сервера',
    tag: 'MS',
    badge: 'UNDETECTED',
    badgeColor: 'emerald',
    iconBg: 'from-blue-500/20 to-slate-900/50 text-blue-400 border-blue-500/30',
    checkLabel: 'Пакетный WFP фильтр:',
    checkValue: '100% Прозрачен',
    checkHighlight: true,
    ping: 14,
    featureLabel: 'Блокировка mDNS/LLMNR:',
    featureValue: 'Включена',
    lastChecked: '26 октября 2026, 17:40',
  },
];

interface ServerStatusMonitoringSectionProps {
  lang: Lang;
  soundEnabled: boolean;
  onNotify?: (msg: string) => void;
}

export const ServerStatusMonitoringSection: React.FC<ServerStatusMonitoringSectionProps> = ({
  lang,
  soundEnabled,
  onNotify,
}) => {
  const isRu = lang === 'ru';
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState('27 октября 2026, 01:00');
  const [nodes, setNodes] = useState(SERVER_NODES);

  const handleRefresh = () => {
    playGuiSound('click', soundEnabled);
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      const now = new Date();
      const updatedTime = `${now.getDate()} октября 2026, ${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}`;
      setLastSyncTime(updatedTime);
      setNodes((prev) =>
        prev.map((n) => ({
          ...n,
          ping: Math.max(9, Math.round(n.ping + (Math.random() * 2 - 1))),
        }))
      );
      if (onNotify) {
        onNotify(isRu ? 'Статус серверов обновлен: все узлы 100% Undetected!' : 'Server status refreshed: all nodes 100% Undetected!');
      }
    }, 600);
  };

  return (
    <section
      id="status"
      className="relative bg-transparent px-5 py-[110px] z-10 border-t border-white/[0.04]"
    >
      <div className="mx-auto w-full max-w-[1240px]">
        {/* Title and Subtitle matching Screenshot 2 */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ type: 'spring', stiffness: 220, damping: 24 }}
          className="mx-auto mb-10 max-w-[950px] text-center"
        >
          <h2 className="text-[clamp(2.4rem,4.8vw,4.2rem)] font-extrabold leading-[1.08] tracking-[-0.035em] text-white">
            {isRu ? 'Живой статус обходов по серверам' : 'Live Bypass Status by Server'}
          </h2>

          <p className="mt-4 text-[#adadad] text-base sm:text-lg max-w-3xl mx-auto leading-relaxed">
            {isRu
              ? 'Автоматический мониторинг серверных античитов и проверок модерации. Все узлы синхронизированы с версией v1.8.'
              : 'Automated monitoring of server anti-cheats and staff moderation checks. All nodes synchronized with version v1.8.'}
          </p>

          {/* Status Bar Pill matching Screenshot 2 */}
          <div className="mt-7 inline-flex flex-wrap items-center justify-center gap-3 sm:gap-6 px-6 py-2.5 rounded-full sadnes-card border border-white/10 text-xs sm:text-sm text-[#adadad]">
            <div className="flex items-center gap-2 font-medium text-emerald-400">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
              </span>
              <span>{isRu ? 'Сеть: 100% Онлайн' : 'Network: 100% Online'}</span>
            </div>

            <span className="text-white/20 hidden sm:inline">•</span>

            <div className="flex items-center gap-1.5">
              <span>{isRu ? 'Последняя синхронизация:' : 'Last sync:'}</span>
              <span className="font-semibold text-white">{lastSyncTime}</span>
            </div>

            <span className="text-white/20 hidden sm:inline">•</span>

            <div className="flex items-center gap-1.5">
              <span>{isRu ? 'Аптайм шлюза:' : 'Gateway uptime:'}</span>
              <span className="font-semibold text-emerald-400">99.98%</span>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              title={isRu ? 'Проверить состояние серверов' : 'Check server status'}
              className="ml-2 p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition"
            >
              <i className={`ph-bold ph-arrows-clockwise ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`}></i>
            </button>
          </div>
        </motion.div>

        {/* 6 Server Cards Grid (3 columns on desktop, 2 on tablet, 1 on mobile) matching Screenshot 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {nodes.map((node, idx) => (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, y: 36, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{
                type: 'spring',
                stiffness: 240,
                damping: 22,
                delay: idx * 0.08,
              }}
              whileHover={{ y: -6, scale: 1.012 }}
              whileTap={{ scale: 0.97, y: 2 }}
              onClick={() => playGuiSound('click', soundEnabled)}
              className="sadnes-card rounded-[24px] p-6 flex flex-col justify-between border border-white/10 hover:border-emerald-500/40 transition-all duration-300 relative overflow-hidden group cursor-pointer"
            >
              {/* Subtle top glow */}
              <div className="absolute -top-16 -right-16 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/15 transition-all duration-500"></div>

              {/* Card Header: Icon + Name/Sub + Undetected Badge */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-5">
                  <div className="flex items-center gap-3.5">
                    {/* Tag box like RW, FT, HW, SP, HY, MS */}
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${node.iconBg} border flex items-center justify-center font-bold text-sm tracking-wider shadow-inner`}
                    >
                      {node.tag}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white tracking-tight leading-snug">
                        {node.name}
                      </h3>
                      <p className="text-xs text-[#8c8c8e] font-mono mt-0.5">{node.sub}</p>
                    </div>
                  </div>

                  {/* Undetected Badge */}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>{node.badge}</span>
                  </span>
                </div>

                {/* Details Table Rows */}
                <div className="space-y-3 pt-3 border-t border-white/[0.06] text-xs">
                  {/* Row 1: Check Type */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[#9e9e9e]">{node.checkLabel}</span>
                    <span className="font-semibold text-emerald-400 text-right">{node.checkValue}</span>
                  </div>

                  {/* Row 2: WFP Ping */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[#9e9e9e]">{isRu ? 'Средний WFP пинг:' : 'Average WFP ping:'}</span>
                    <span className="font-bold text-white font-mono">{node.ping} ms</span>
                  </div>

                  {/* Row 3: Feature / Protection */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[#9e9e9e]">{node.featureLabel}</span>
                    <span className="font-semibold text-emerald-400 text-right">{node.featureValue}</span>
                  </div>

                  {/* Row 4: Moderation check timestamp */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/[0.04]">
                    <span className="text-[#6f6f73]">{isRu ? 'Проверено модерацией:' : 'Verified by staff:'}</span>
                    <span className="text-[#8c8c8e] text-[11px]">{node.lastChecked}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
