import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lang, playGuiSound } from '../utils/i18nAndAudio';

interface WhyDerbinAlphaSectionProps {
  lang: Lang;
  soundEnabled: boolean;
}

interface Pillar {
  id: string;
  icon: string;
  titleRu: string;
  titleEn: string;
  tagRu: string;
  tagEn: string;
  descRu: string;
  descEn: string;
  proofBadgeRu: string;
  proofBadgeEn: string;
  accent: string;
}

const PILLARS: Pillar[] = [
  {
    id: 'dual_pc',
    icon: 'ph-desktop',
    tagRu: 'ФУНДАМЕНТАЛЬНЫЙ ИММУНИТЕТ',
    tagEn: 'FUNDAMENTAL IMMUNITY',
    titleRu: '0 байтов и 0 процессов на игровом ПК',
    titleEn: '0 Bytes & 0 Processes on Gaming PC',
    descRu:
      'AnyDesk, Paladin, Process Hacker, Echo, Everything, журналы USN, Prefetch и CrashDumps — модераторы часами сканируют систему и не могут найти даже намёка на софт! На игровом компьютере работает чистая ванильная игра без единого стороннего потока, а весь перехват трафика вынесен на второе устройство.',
    descEn:
      'AnyDesk, Paladin, Process Hacker, Echo and USN logs can scan your PC for hours and find zero traces. The game runs pure vanilla without injected threads, while all logic runs completely isolated on a secondary machine.',
    proofBadgeRu: 'AnyDesk 8.1 / Paladin: 100% CLEAN',
    proofBadgeEn: 'AnyDesk 8.1 / Paladin: 100% CLEAN',
    accent: '#3b82f6',
  },
  {
    id: 'wfp_kernel',
    icon: 'ph-cpu',
    tagRu: 'RING-0 АППАРАТНЫЙ УРОВЕНЬ',
    tagEn: 'RING-0 HARDWARE LAYER',
    titleRu: 'Сетевой фильтр WFP MAC Layer',
    titleEn: 'WFP Kernel MAC-Layer Packet Filter',
    descRu:
      'Собственный драйвер Windows Filtering Platform перехватывает и модифицирует игровые пакеты прямо в сетевом стеке до того, как они попадут в сетевую карту. Задержка обработки составляет всего 0.08 мс — в 20 раз быстрее человеческой реакции.',
    descEn:
      'Custom Windows Filtering Platform driver intercepts network packets inside the network stack before physical transmission. Pipeline latency is just 0.08ms — 20x faster than human reflexes.',
    proofBadgeRu: 'Задержка туннеля: 0.08 ms',
    proofBadgeEn: 'Pipeline Latency: 0.08 ms',
    accent: '#60a5fa',
  },
  {
    id: 'zero_lag',
    icon: 'ph-lightning',
    tagRu: 'СТАБИЛЬНОСТЬ И ПЛАВНОСТЬ',
    tagEn: 'ROCK-SOLID SMOOTHNESS',
    titleRu: '0 просадок FPS — честные 360+ кадров',
    titleEn: 'Zero FPS Drops — Pure 360+ Native Frames',
    descRu:
      'Обычные инжект-клиенты жрут память JVM, вызывают микрофризы в комбате и рушат плавность картинки. derbin Alpha не трогает рендер Minecraft вообще — игра летает с максимальной герцовкой вашего монитора (240–360+ FPS) без пролагов.',
    descEn:
      'Conventional cheat clients inject into JVM memory, destroying frame pacing and causing micro-stutters during combat. derbin Alpha never touches client rendering — your display delivers maximum refresh rate effortlessly.',
    proofBadgeRu: 'Нагрузка на CPU: 0.0%',
    proofBadgeEn: 'CPU Impact: 0.0%',
    accent: '#2563eb',
  },
  {
    id: 'router_ttl',
    icon: 'ph-network',
    tagRu: 'СЕТЕВАЯ МАСКИРОВКА',
    tagEn: 'NETWORK MASQUERADE',
    titleRu: 'Имитация домашнего роутера (TTL 128)',
    titleEn: 'Home Router Simulation (TTL 128)',
    descRu:
      'Любой traceroute и сканирование сокетов видят стандартный домашний роутер: ровно 1 хоп, нативный Windows TTL 128 и полная блокировка утечек mDNS/LLMNR. Сетевой трафик выглядит для античита и проверяющих как обычный домашний интернет.',
    descEn:
      'Traceroute and packet sniffers see a standard home router: exactly 1 hop, native Windows TTL 128 and strict mDNS/LLMNR leak isolation. Traffic is identical to ordinary domestic Ethernet.',
    proofBadgeRu: 'Traceroute: 1 Hop (Protected)',
    proofBadgeEn: 'Traceroute: 1 Hop (Protected)',
    accent: '#93c5fd',
  },
  {
    id: 'record_zero_bans',
    icon: 'ph-shield-check',
    tagRu: 'РЕКОРД НАДЁЖНОСТИ В СНГ',
    tagEn: 'RELIABILITY RECORD',
    titleRu: '0 банов на проверках за 365+ дней работы',
    titleEn: '0 Bans on Staff Checks Across 365+ Days',
    descRu:
      'Пока пользователи других читов улетают в бан через 2–3 дня после очередной волны детектов, клиенты derbin Alpha спокойно играют месяцами на FunTime, ReallyWorld, HolyWorld и SpookyTime (СП). На FunTime чекер Error не находит ничего! При любых обновлениях античита мы моментально выпускаем хуки и патчи.',
    descEn:
      'While users of conventional cheats get banned within 2-3 days, derbin Alpha users play for months untouched across FunTime, ReallyWorld, HolyWorld and SpookyTime (spookytime.su). The FunTime Error checker finds zero traces!',
    proofBadgeRu: '1 год на рынке: 0 банов на проверках',
    proofBadgeEn: '1 Year in Production: 0 Bans',
    accent: '#38bdf8',
  },
  {
    id: 'fast_hotfixes',
    icon: 'ph-arrow-counter-clockwise',
    tagRu: 'ОПЕРАТИВНОСТЬ РАЗРАБОТКИ',
    tagEn: 'DEV VELOCITY',
    titleRu: 'Мгновенные хотфиксы в день обновлений',
    titleEn: 'Same-Day Anti-Cheat Hotfixes',
    descRu:
      'Разработчики nerfchik и omar_torrez лично следят за патчами серверов 24/7. Как только сервер выкатывает новый плагин проверки — мы выпускаем адаптивный патч в течение нескольких часов.',
    descEn:
      'Lead engineers nerfchik and omar_torrez monitor server patches 24/7. As soon as server moderation deploys a new check plugin, adaptive hotfixes roll out within hours.',
    proofBadgeRu: 'Время реакции: < 2 часов',
    proofBadgeEn: 'Response Time: < 2 hours',
    accent: '#60a5fa',
  },
];

export interface BypassComparisonRow {
  featureRu: string;
  featureEn: string;
  fakerRu: string;
  fakerEn: string;
  takkerRu: string;
  takkerEn: string;
  xamelionRu: string;
  xamelionEn: string;
  derbinRu: string;
  derbinEn: string;
  derbinNoteRu?: string;
  derbinNoteEn?: string;
}

const COMPARISON_ROWS: BypassComparisonRow[] = [
  {
    featureRu: 'Наличие файлов софта на игровом ПК',
    featureEn: 'Files & loaders on Gaming PC',
    fakerRu: 'Есть (.exe, loader в USN)',
    fakerEn: 'Yes (.exe, USN loader traces)',
    takkerRu: 'Есть (палится реестр и Prefetch)',
    takkerEn: 'Yes (Registry & Prefetch leak)',
    xamelionRu: 'Есть (создает виртуальный диск)',
    xamelionEn: 'Yes (Virtual drive artifacts)',
    derbinRu: '0 байтов (Чистая система, 2-й ПК)',
    derbinEn: '0 Bytes (Pristine PC, Dual-PC)',
  },
  {
    featureRu: 'Чекер Error (FunTime) и проверки AnyDesk',
    featureEn: 'Error Checker (FunTime) & AnyDesk',
    fakerRu: '100% Бан (детект процесса)',
    fakerEn: '100% Ban (Process detected)',
    takkerRu: 'Палится по хукам и сокетам',
    takkerEn: 'Caught by hooks & open sockets',
    xamelionRu: 'Палится Process Hacker & Paladin',
    xamelionEn: 'Caught by Process Hacker',
    derbinRu: 'Чекер Error ничего не находит (PASS)',
    derbinEn: 'Error checker finds zero (PASS)',
  },
  {
    featureRu: 'Влияние на FPS и задержку ввода',
    featureEn: 'FPS drop & input latency impact',
    fakerRu: 'Просадки до 35-40% и фризы',
    fakerEn: 'Drops 35-40% and frame spikes',
    takkerRu: 'Микрофризы в PvP 1 на 1',
    takkerEn: 'Micro-stutters in 1v1 PvP',
    xamelionRu: 'Задержка пакетов 15–25 ms',
    xamelionEn: 'Packet latency +15-25ms',
    derbinRu: '0% влияния (нативные 360+ FPS)',
    derbinEn: '0% impact (native 360+ FPS)',
  },
  {
    featureRu: 'Сетевая маскировка и Traceroute (TTL)',
    featureEn: 'Network masking & Traceroute',
    fakerRu: 'Палевный VPN / мусорный TTL',
    fakerEn: 'Suspicious VPN / odd TTL',
    takkerRu: '2+ хопа в сетевой трассировке',
    takkerEn: '2+ hops in traceroute',
    xamelionRu: 'Утечки mDNS/LLMNR протоколов',
    xamelionEn: 'mDNS/LLMNR protocol leaks',
    derbinRu: '1 Hop, Windows TTL 128 (Роутер)',
    derbinEn: '1 Hop, Windows TTL 128 (Router)',
  },
  {
    featureRu: 'Реакция на патчи и ситуация на FunTime',
    featureEn: 'Patch velocity & FunTime status',
    fakerRu: 'Днями без фиксов после патча',
    fakerEn: 'Days without fixes after patch',
    takkerRu: 'Игнорируют волны банов',
    takkerEn: 'Ignores staff banwaves',
    xamelionRu: 'Обновления 1-2 раза в месяц',
    xamelionEn: 'Updates once a month',
    derbinRu: 'Хотфикс за 2 часа! Стабильно',
    derbinEn: 'Hotfix in 2h! Rock-solid',
    derbinNoteRu:
      'Недавно на FunTime был детект из-за нашей тупости, но в течение 2 часов мы всё починили и сейчас всё работает стабильно!',
    derbinNoteEn:
      'Recently had a brief oversight on FunTime, but within 2 hours we patched everything and it works perfectly!',
  },
  {
    featureRu: 'Связь напрямую с создателями софта',
    featureEn: 'Direct contact with software creators',
    fakerRu: 'Бот поддержки / автоответчик',
    fakerEn: 'Support bot / automated script',
    takkerRu: 'Тикеты висят без ответа',
    takkerEn: 'Tickets ignored for days',
    xamelionRu: 'Закрытый Discord для избранных',
    xamelionEn: 'Closed gatekept Discord',
    derbinRu: 'Личный контакт с omar & nerfchik 24/7',
    derbinEn: 'Direct access to omar & nerfchik',
  },
];

export const WhyDerbinAlphaSection: React.FC<WhyDerbinAlphaSectionProps> = ({
  lang,
  soundEnabled,
}) => {
  const [activePillar, setActivePillar] = useState<string>('dual_pc');
  const [showComparison, setShowComparison] = useState(true);

  const isRu = lang === 'ru';

  return (
    <section
      id="why-derbin"
      className="relative bg-transparent px-5 py-[110px] z-10 border-t border-white/[0.04]"
    >
      <div className="mx-auto w-full max-w-[1240px]">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ type: 'spring', stiffness: 220, damping: 24 }}
          className="mx-auto mb-16 max-w-[900px] text-center"
        >
          <div className="mb-4 flex items-center justify-center gap-2">
            <svg viewBox="0 0 18 18" className="h-[18px] w-[18px] text-[var(--brand-accent)]" fill="currentColor">
              <path d="M8.75348 17.6952C7.72056 14.0706 3.94416 10.3084 0.305928 9.27938C-0.101976 9.14829 -0.101976 8.8599 0.305928 8.72226C3.95074 7.68666 7.72056 3.931 8.76005 0.299863C8.8719 -0.0999545 9.14164 -0.0999545 9.25349 0.299863C10.2864 3.931 14.0628 7.68666 17.6945 8.72226C18.1024 8.85335 18.1024 9.14829 17.6945 9.27938C14.0562 10.3084 10.2798 14.0706 9.24691 17.6952C9.13506 18.1016 8.86532 18.1016 8.75348 17.6952Z" />
            </svg>
            <h4 className="text-base font-semibold text-blue-400">
              {isRu ? 'Ультимативное превосходство' : 'Ultimate Superiority'}
            </h4>
          </div>

          <h2 className="text-[clamp(2.2rem,4.5vw,3.8rem)] font-bold leading-[1.08] tracking-[-0.035em] text-white">
            {isRu ? (
              <>
                Почему наш <span className="text-blue-400">derbin Alpha</span> ахуенный и из-за чего он разносит всё
              </>
            ) : (
              <>
                Why <span className="text-blue-400">derbin Alpha</span> Dominates & Crushes All Competitors
              </>
            )}
          </h2>

          <p className="mt-5 text-[#adadad] text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            {isRu
              ? 'Технический разбор революционной архитектуры: почему это единственный софт в СНГ, который физически невозможно обнаружить ни одной проверкой AnyDesk и Paladin.'
              : 'Engineering breakdown of our breakthrough architecture: why it is physically impossible to detect via AnyDesk or Paladin memory scans.'}
          </p>

          {/* Key Metric Badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full liquid-btn-glass text-xs font-semibold text-blue-300">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
              {isRu ? '0 инъекций в JVM' : '0 JVM Injections'}
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full liquid-btn-glass text-xs font-semibold text-emerald-400">
              <i className="ph-bold ph-shield-check text-sm"></i>
              {isRu ? '0 банов на проверках за 365+ дней' : '0 bans on checks in 365+ days'}
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full liquid-btn-glass text-xs font-semibold text-white">
              <i className="ph-bold ph-gauge text-sm text-blue-400"></i>
              {isRu ? '360+ FPS без лагов' : '360+ FPS native'}
            </span>
          </div>
        </motion.div>

        {/* 6 High-Impact Liquid Glass Advantage Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {PILLARS.map((pillar, idx) => (
            <motion.div
              key={pillar.id}
              initial={{ opacity: 0, y: 35, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{
                type: 'spring',
                stiffness: 240,
                damping: 22,
                delay: 0.05 + idx * 0.07,
              }}
              whileHover={{ y: -8, scale: 1.018 }}
              whileTap={{ scale: 0.95, y: 2.5 }}
              onClick={() => {
                setActivePillar(pillar.id);
                playGuiSound('click', soundEnabled);
              }}
              className={`sadnes-card rounded-[26px] p-7 sm:p-8 flex flex-col justify-between cursor-pointer transition-all ${
                activePillar === pillar.id
                  ? 'border-blue-400/80 shadow-[0_20px_50px_rgba(37,99,235,0.25)] ring-1 ring-blue-400/40'
                  : ''
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="h-14 w-14 rounded-2xl bg-blue-500/15 border border-blue-400/30 flex items-center justify-center text-3xl text-blue-400 shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.4)]">
                    <i className={`ph-bold ${pillar.icon}`}></i>
                  </div>
                  <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
                    {isRu ? pillar.tagRu : pillar.tagEn}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-3">
                  {isRu ? pillar.titleRu : pillar.titleEn}
                </h3>

                <p className="text-sm text-[#adadad] leading-relaxed mb-6">
                  {isRu ? pillar.descRu : pillar.descEn}
                </p>
              </div>

              <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono">
                <span className="inline-flex items-center gap-1.5 text-blue-400 font-semibold">
                  <i className="ph-bold ph-check-circle"></i>
                  <span>{isRu ? pillar.proofBadgeRu : pillar.proofBadgeEn}</span>
                </span>
                <span className="text-[#64748b]">0{idx + 1}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ================= INTERACTIVE COMPARISON MATRIX ================= */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ type: 'spring', stiffness: 220, damping: 24 }}
          className="sadnes-card rounded-[30px] p-6 sm:p-10 border border-white/15 relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-blue-400 mb-1">
                <i className="ph-bold ph-scales text-sm"></i>
                <span>{isRu ? 'БЕСПРИСТРАСТНОЕ СРАВНЕНИЕ' : 'OBJECTIVE BENCHMARK'}</span>
              </div>
              <h3 className="text-2xl font-bold text-white">
                {isRu
                  ? 'Сравнение обходов проверок: faker VS takker VS xamelion VS derbin Alpha'
                  : 'Bypass Comparison: faker VS takker VS xamelion VS derbin Alpha'}
              </h3>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowComparison(!showComparison);
                playGuiSound('click', soundEnabled);
              }}
              className="liquid-btn-glass px-4 py-2 rounded-xl text-xs font-semibold text-white flex items-center gap-2 self-start sm:self-auto"
            >
              <i className={`ph-bold ${showComparison ? 'ph-caret-up' : 'ph-caret-down'}`}></i>
              <span>{showComparison ? (isRu ? 'Свернуть' : 'Collapse') : (isRu ? 'Развернуть' : 'Expand')}</span>
            </button>
          </div>

          {/* Honest FunTime Notice by Creators */}
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-blue-950/70 via-indigo-950/50 to-slate-900/60 border border-blue-500/30 flex items-start gap-3.5 shadow-inner">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/40 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
              <i className="ph-bold ph-shield-check text-xl text-blue-400"></i>
            </div>
            <div className="text-xs sm:text-sm text-[#cbd5e1] leading-relaxed">
              <div className="font-bold text-white flex items-center gap-2 mb-1">
                <span>{isRu ? 'Честное заявление создателей derbin (omar_torrez & nerfchik):' : 'Official Statement from derbin creators:'}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {isRu ? '100% Онлайн' : '100% Online'}
                </span>
              </div>
              <p>
                {isRu
                  ? 'Недавно на FunTime был кратковременный детект из-за нашей тупости (неправильно сконфигурировали дескриптор сетевого сокета). Но в течение 2 часов мы всё оперативно починили и выкатили патч — сейчас чекер Error ничего не находит, всё работает максимально стабильно!'
                  : 'Recently on FunTime there was a brief detection due to our oversight with socket descriptors, but within 2 hours we fixed everything and rolled out a hotfix — now the Error checker finds zero traces and everything is rock-solid!'}
              </p>
            </div>
          </div>

          <AnimatePresence>
            {showComparison && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-x-auto"
              >
                <table className="w-full text-left text-sm min-w-[800px]">
                  <thead>
                    <tr className="border-b border-white/10 text-xs text-[#94a3b8] font-mono uppercase tracking-wider">
                      <th className="py-3 px-3 font-semibold">{isRu ? 'Параметр' : 'Feature'}</th>
                      <th className="py-3 px-3 font-semibold text-rose-400/90 text-center">faker</th>
                      <th className="py-3 px-3 font-semibold text-rose-400/90 text-center">takker</th>
                      <th className="py-3 px-3 font-semibold text-rose-400/90 text-center">xamelion</th>
                      <th className="py-3 px-3 font-semibold text-blue-400 text-center bg-blue-500/10 rounded-t-xl border-t border-x border-blue-500/30">
                        derbin Alpha (WFP)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {COMPARISON_ROWS.map((row, i) => (
                      <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-3 font-medium text-white max-w-[200px]">
                          {isRu ? row.featureRu : row.featureEn}
                        </td>
                        <td className="py-3.5 px-3 text-rose-300/80 font-mono text-xs">
                          <div className="flex items-center gap-1.5 justify-center text-center">
                            <i className="ph-bold ph-x-circle text-rose-400 text-sm shrink-0"></i>
                            <span className="truncate">{isRu ? row.fakerRu : row.fakerEn}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-rose-300/80 font-mono text-xs">
                          <div className="flex items-center gap-1.5 justify-center text-center">
                            <i className="ph-bold ph-x-circle text-rose-400 text-sm shrink-0"></i>
                            <span className="truncate">{isRu ? row.takkerRu : row.takkerEn}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-rose-300/80 font-mono text-xs">
                          <div className="flex items-center gap-1.5 justify-center text-center">
                            <i className="ph-bold ph-x-circle text-rose-400 text-sm shrink-0"></i>
                            <span className="truncate">{isRu ? row.xamelionRu : row.xamelionEn}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-emerald-300 font-mono text-xs font-semibold bg-blue-500/5 border-x border-blue-500/20">
                          <div className="flex flex-col items-center justify-center gap-1 text-center">
                            <div className="inline-flex items-center gap-1.5 bg-blue-500/15 border border-blue-500/35 px-3 py-1 rounded-xl text-blue-200">
                              <i className="ph-bold ph-check-circle text-emerald-400 text-sm shrink-0"></i>
                              <span>{isRu ? row.derbinRu : row.derbinEn}</span>
                            </div>
                            {row.derbinNoteRu && (
                              <span className="text-[10px] text-amber-300 font-sans max-w-[220px] leading-tight mt-0.5">
                                {isRu ? row.derbinNoteRu : row.derbinNoteEn}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};
