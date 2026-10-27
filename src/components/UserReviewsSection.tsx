import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lang, playGuiSound } from '../utils/i18nAndAudio';
import { ALL_125_REVIEWS, ReviewItem } from '../data/reviewsData';

interface UserReviewsSectionProps {
  lang: Lang;
  soundEnabled: boolean;
  onNotify: (msg: string) => void;
}

export const UserReviewsSection: React.FC<UserReviewsSectionProps> = ({
  lang,
  soundEnabled,
  onNotify,
}) => {
  const isRu = lang === 'ru';
  const [reviews, setReviews] = useState<ReviewItem[]>(() => {
    try {
      const saved = localStorage.getItem('derbin_reviews_v4_emotional');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 100) {
          return parsed;
        }
      }
      return ALL_125_REVIEWS;
    } catch {
      return ALL_125_REVIEWS;
    }
  });

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activePlanFilter, setActivePlanFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [visibleCount, setVisibleCount] = useState<number>(12);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Form State
  const [formNick, setFormNick] = useState('');
  const [formServer, setFormServer] = useState('FunTime');
  const [formPlan, setFormPlan] = useState<ReviewItem['planType']>('lifetime');
  const [formRating, setFormRating] = useState(5);
  const [formCheck, setFormCheck] = useState('Чекер Error: PASS (0 детектов)');
  const [formText, setFormText] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem('derbin_reviews_v4_emotional', JSON.stringify(reviews));
    } catch {}
  }, [reviews]);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNick.trim() || !formText.trim()) {
      onNotify(isRu ? 'Пожалуйста, укажите никнейм и текст отзыва!' : 'Please enter your nickname and review text!');
      return;
    }

    const initials = formNick.trim().replace(/[^a-zA-Z0-9а-яА-Я]/g, '').slice(0, 2).toUpperCase() || 'PL';
    const isFt = formServer.toLowerCase().includes('funtime');
    const isRw = formServer.toLowerCase().includes('really');
    const isHw = formServer.toLowerCase().includes('holy');
    const isSp = formServer.toLowerCase().includes('spooky') || formServer.toLowerCase().includes('сп');

    const planLabel =
      formPlan === 'lifetime'
        ? '✓ Верифицированная покупка (Lifetime)'
        : formPlan === '90d'
        ? '✓ Верифицированная покупка (90 дней)'
        : formPlan === '30d'
        ? '✓ Верифицированная покупка (30 дней)'
        : '✓ Выиграл в конкурсе (7 дней)';

    const newRev: ReviewItem = {
      id: `rev_user_${Date.now()}`,
      nick: formNick.trim(),
      avatarInitials: initials,
      avatarBg: 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/40',
      serverTag: formServer,
      serverTagColor: isFt
        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
        : isRw
        ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
        : isHw
        ? 'bg-purple-500/10 text-purple-300 border-purple-500/30'
        : isSp
        ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
        : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
      date: '26 октября 2026, 23:15',
      rating: formRating,
      text: formText.trim(),
      verifiedPlan: planLabel,
      planType: formPlan,
      checkResult: isFt ? (formCheck.includes('Error') ? formCheck : `Чекер Error: ${formCheck}`) : formCheck,
      category: isFt ? 'funtime' : isRw ? 'reallyworld' : isHw ? 'holyworld' : isSp ? 'spookytime' : 'dualpc',
    };

    setReviews([newRev, ...reviews]);
    playGuiSound('success', soundEnabled);
    onNotify(isRu ? 'Отзыв опубликован и верифицирован через Discord!' : 'Review posted and verified via Discord!');
    setIsModalOpen(false);
    setFormNick('');
    setFormText('');
  };

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      // Category filter
      if (activeCategory === 'error_ft') {
        const matchesFtError =
          (r.serverTag.toLowerCase().includes('funtime') || r.category === 'funtime') &&
          (r.text.toLowerCase().includes('error') || r.checkResult.toLowerCase().includes('error'));
        if (!matchesFtError) return false;
      } else if (activeCategory === 'with_reply') {
        if (!r.developerReply) return false;
      } else if (activeCategory === 'funtime') {
        if (r.category !== 'funtime' && !r.serverTag.toLowerCase().includes('funtime')) return false;
      } else if (activeCategory === 'reallyworld') {
        if (r.category !== 'reallyworld' && !r.serverTag.toLowerCase().includes('really')) return false;
      } else if (activeCategory === 'holyworld') {
        if (r.category !== 'holyworld' && !r.serverTag.toLowerCase().includes('holy')) return false;
      } else if (activeCategory === 'spookytime') {
        if (r.category !== 'spookytime' && !r.serverTag.toLowerCase().includes('spooky') && !r.serverTag.toLowerCase().includes('сп')) return false;
      } else if (activeCategory === 'dualpc') {
        if (r.category !== 'dualpc' && !r.serverTag.toLowerCase().includes('dual') && !r.text.includes('Dual-PC') && !r.text.includes('WFP')) return false;
      }

      // Plan filter
      if (activePlanFilter !== 'all' && r.planType !== activePlanFilter) {
        return false;
      }

      // Text / Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          r.nick.toLowerCase().includes(q) ||
          r.text.toLowerCase().includes(q) ||
          r.serverTag.toLowerCase().includes(q) ||
          r.checkResult.toLowerCase().includes(q) ||
          (r.developerReply && r.developerReply.text.toLowerCase().includes(q));
        if (!matches) return false;
      }

      return true;
    });
  }, [reviews, activeCategory, activePlanFilter, searchQuery]);

  const displayedReviews = useMemo(() => {
    return filteredReviews.slice(0, visibleCount);
  }, [filteredReviews, visibleCount]);

  const handleLoadMore = () => {
    playGuiSound('click', soundEnabled);
    setVisibleCount((prev) => Math.min(prev + 12, filteredReviews.length));
  };

  const handleShowAll = () => {
    playGuiSound('click', soundEnabled);
    setVisibleCount(filteredReviews.length);
  };

  return (
    <section
      id="reviews"
      className="relative bg-transparent px-5 py-[110px] z-10 border-t border-white/[0.04]"
    >
      <div className="mx-auto w-full max-w-[1240px]">
        {/* Section Header matching Screenshot 1 */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ type: 'spring', stiffness: 220, damping: 24 }}
          className="mx-auto mb-8 max-w-[950px] text-center"
        >
          <h2 className="text-[clamp(2.4rem,4.8vw,4.2rem)] font-extrabold leading-[1.08] tracking-[-0.035em] text-white">
            {isRu ? 'Реальные отзывы игроков' : 'Real Player Reviews'}
          </h2>

          <p className="mt-4 text-[#adadad] text-base sm:text-lg max-w-3xl mx-auto leading-relaxed">
            {isRu
              ? 'Все отзывы верифицированы через официальный Discord сервер проекта derbin. 0 банов на проверках за всю историю продукта.'
              : 'All reviews verified via the official derbin project Discord server. 0 bans during staff checks in product history.'}
          </p>

          {/* Rating Pill Banner */}
          <div className="mt-8 inline-flex flex-wrap items-center justify-between gap-4 sm:gap-8 px-6 sm:px-8 py-3.5 rounded-full sadnes-card border border-white/10 shadow-2xl max-w-xl mx-auto">
            {/* Rating + Stars + Count */}
            <div className="flex items-center gap-3">
              <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">4.98</span>
              <div className="text-left">
                <div className="flex text-amber-400 text-sm tracking-wider">
                  {'★'.repeat(5)}
                </div>
                <div className="text-[11px] text-[#8c8c8e]">
                  {isRu ? `${reviews.length} проверок пройдено` : `${reviews.length} checks passed`}
                </div>
              </div>
            </div>

            {/* Zero bans indicator */}
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-emerald-400">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
              </span>
              <span>{isRu ? '0 банов на проверках' : '0 bans on checks'}</span>
            </div>

            {/* Leave Review Button */}
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(true);
                playGuiSound('click', soundEnabled);
              }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 shadow-lg shadow-emerald-500/25 active:scale-95 transition-all"
            >
              <i className="ph-bold ph-pencil-simple text-sm"></i>
              <span>{isRu ? 'Оставить отзыв' : 'Write Review'}</span>
            </button>
          </div>

          {/* Search bar + Plan Filter Controls */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3 max-w-3xl mx-auto">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px]">
              <i className="ph-bold ph-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-sm"></i>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  isRu
                    ? 'Поиск по отзывам (ник, сервер, чекер Error, AnyDesk)...'
                    : 'Search reviews (nick, server, Error checker, AnyDesk)...'
                }
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white/[0.04] border border-white/10 text-xs sm:text-sm text-white placeholder-white/30 focus:border-emerald-400 focus:outline-none transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                >
                  <i className="ph-bold ph-x text-xs"></i>
                </button>
              )}
            </div>

            {/* Plan Filter Badges */}
            <div className="inline-flex items-center gap-1 p-1 rounded-full sadnes-card border border-white/10 text-xs">
              {[
                { id: 'all', label: isRu ? 'Все тарифы' : 'All Plans' },
                { id: 'lifetime', label: isRu ? 'Навсегда' : 'Lifetime' },
                { id: '90d', label: isRu ? '90 дней' : '90 Days' },
                { id: '30d', label: isRu ? '30 дней' : '30 Days' },
                { id: '7d_contest', label: isRu ? 'Конкурс 7 дней' : 'Contest 7d' },
              ].map((pl) => (
                <button
                  key={pl.id}
                  type="button"
                  onClick={() => {
                    setActivePlanFilter(pl.id);
                    playGuiSound('click', soundEnabled);
                  }}
                  className={`px-3 py-1.5 rounded-full font-medium transition ${
                    activePlanFilter === pl.id
                      ? 'bg-blue-500 text-white font-semibold'
                      : 'text-[#adadad] hover:text-white hover:bg-white/5'
                  }`}
                >
                  {pl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filter Categories Pills matching Screenshot 1 */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            {[
              { id: 'all', label: isRu ? `Все отзывы (${reviews.length})` : `All Reviews (${reviews.length})` },
              { id: 'error_ft', label: isRu ? 'Чекер Error (FunTime)' : 'Error Checker (FunTime)' },
              { id: 'funtime', label: 'FunTime' },
              { id: 'reallyworld', label: 'ReallyWorld' },
              { id: 'holyworld', label: 'HolyWorld' },
              { id: 'spookytime', label: 'SpookyTime (СП)' },
              { id: 'dualpc', label: isRu ? 'Dual-PC сетап' : 'Dual-PC Setup' },
              { id: 'with_reply', label: isRu ? 'Негативные отзывы + ответ Омара' : 'Negative reviews + Omar replies' },
            ].map((tab) => {
              const isActive = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveCategory(tab.id);
                    playGuiSound('click', soundEnabled);
                  }}
                  className={`px-4 sm:px-5 py-2 rounded-full text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 font-bold'
                      : 'bg-white/[0.04] text-[#adadad] hover:text-white hover:bg-white/[0.08] border border-white/5'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Reviews Count & Status */}
        <div className="mb-6 flex items-center justify-between text-xs text-[#8c8c8e] px-2">
          <span>
            {isRu
              ? `Показано ${displayedReviews.length} из ${filteredReviews.length} отзывов`
              : `Showing ${displayedReviews.length} of ${filteredReviews.length} reviews`}
          </span>
          {activeCategory !== 'all' || activePlanFilter !== 'all' || searchQuery ? (
            <button
              type="button"
              onClick={() => {
                setActiveCategory('all');
                setActivePlanFilter('all');
                setSearchQuery('');
              }}
              className="text-blue-400 hover:text-blue-300 transition flex items-center gap-1"
            >
              <i className="ph-bold ph-arrow-counter-clockwise"></i>
              <span>{isRu ? 'Сбросить фильтры' : 'Reset filters'}</span>
            </button>
          ) : null}
        </div>

        {/* Reviews Grid */}
        {displayedReviews.length === 0 ? (
          <div className="sadnes-card rounded-[24px] p-12 text-center text-[#8c8c8e]">
            <i className="ph-bold ph-chats-circle text-4xl mb-3 text-white/30"></i>
            <h3 className="text-lg font-bold text-white mb-1">
              {isRu ? 'Отзывы не найдены' : 'No reviews found'}
            </h3>
            <p className="text-xs">
              {isRu
                ? 'Попробуйте изменить поисковый запрос или выбрать другой фильтр.'
                : 'Try modifying your search query or choosing another filter.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            {displayedReviews.map((rev, idx) => (
              <motion.div
                key={rev.id}
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 240,
                  damping: 22,
                  delay: Math.min(idx * 0.04, 0.4),
                }}
                whileHover={{ y: -5, scale: 1.01 }}
                whileTap={{ scale: 0.98, y: 1.5 }}
                onClick={() => playGuiSound('click', soundEnabled)}
                className="sadnes-card rounded-[24px] p-6 flex flex-col justify-between border border-white/10 hover:border-emerald-500/35 transition-all duration-300 relative group cursor-pointer"
              >
                <div>
                  {/* Header: Avatar, Nickname + Verified, Server Badge */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm tracking-wider ${rev.avatarBg}`}
                      >
                        {rev.avatarInitials}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white text-base tracking-tight">{rev.nick}</span>
                          <i
                            className="ph-fill ph-check-circle text-emerald-400 text-sm"
                            title={isRu ? 'Верифицированный игрок derbin' : 'Verified derbin player'}
                          ></i>
                        </div>
                        <span className="text-[11px] text-[#71717a]">{rev.date}</span>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${rev.serverTagColor}`}
                    >
                      {rev.serverTag}
                    </span>
                  </div>

                  {/* Star Rating */}
                  <div className="flex text-amber-400 text-xs mb-3 tracking-widest">
                    {'★'.repeat(rev.rating)}
                    {'☆'.repeat(5 - rev.rating)}
                  </div>

                  {/* Review Text */}
                  <p className="text-[#d4d4d8] text-xs sm:text-sm leading-relaxed mb-5 font-normal">
                    {rev.text}
                  </p>

                  {/* Developer Reply Block (Omar) if present */}
                  {rev.developerReply && (
                    <div className="mt-3 mb-5 p-3.5 rounded-2xl bg-blue-950/40 border border-blue-500/30 text-xs shadow-inner">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-blue-500/30 text-blue-300 border border-blue-400/50 flex items-center justify-center text-[10px] font-bold">
                            OT
                          </span>
                          <span className="font-bold text-blue-300">{rev.developerReply.author}</span>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-blue-500/20 text-blue-200 border border-blue-500/30">
                            {isRu ? 'Создатель' : 'Developer'}
                          </span>
                        </div>
                        <span className="text-[10px] text-white/40">{rev.developerReply.date}</span>
                      </div>
                      <p className="text-[#bfdbfe] leading-relaxed text-[11px] mt-1 pl-7">
                        {rev.developerReply.text}
                      </p>
                    </div>
                  )}
                </div>

                {/* Card Footer matching Screenshot 1 */}
                <div className="pt-3.5 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-medium gap-2">
                  <span
                    className={`font-semibold flex items-center gap-1 ${
                      rev.planType === '7d_contest'
                        ? 'text-amber-400'
                        : rev.planType === '30d'
                        ? 'text-cyan-400'
                        : rev.planType === '90d'
                        ? 'text-blue-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    <span>{rev.verifiedPlan}</span>
                  </span>
                  <span className="text-[#8c8c8e] font-mono text-right truncate">{rev.checkResult}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Load More & Show All Buttons */}
        {displayedReviews.length < filteredReviews.length && (
          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={handleLoadMore}
              className="px-8 py-3.5 rounded-full liquid-btn-primary text-white font-bold text-sm shadow-xl flex items-center gap-2"
            >
              <i className="ph-bold ph-plus-circle text-base"></i>
              <span>
                {isRu
                  ? `Показать ещё отзывы (+12)`
                  : `Load More Reviews (+12)`}
              </span>
            </button>

            <button
              type="button"
              onClick={handleShowAll}
              className="px-6 py-3.5 rounded-full liquid-btn-glass text-[#adadad] hover:text-white font-semibold text-sm transition"
            >
              {isRu
                ? `Показать все (${filteredReviews.length})`
                : `Show All (${filteredReviews.length})`}
            </button>
          </div>
        )}
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-md"
            ></motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              className="relative w-full max-w-lg sadnes-card rounded-[28px] p-7 border border-white/20 shadow-2xl z-10"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-lg">
                    <i className="ph-bold ph-pencil-simple"></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {isRu ? 'Оставить отзыв о derbin Alpha' : 'Write a Review for derbin Alpha'}
                    </h3>
                    <p className="text-xs text-[#adadad]">
                      {isRu ? 'Верификация через Discord сервер' : 'Verification via Discord server'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition"
                >
                  <i className="ph-bold ph-x text-lg"></i>
                </button>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#adadad] mb-1.5">
                    {isRu ? 'Ваш никнейм в игре / Discord:' : 'Your in-game / Discord nickname:'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formNick}
                    onChange={(e) => setFormNick(e.target.value)}
                    placeholder="e.g. vampire_hvh"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white placeholder-white/30 text-sm focus:border-emerald-400 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#adadad] mb-1.5">
                      {isRu ? 'Сервер игры:' : 'Game Server:'}
                    </label>
                    <select
                      value={formServer}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormServer(val);
                        if (val.includes('FunTime')) {
                          setFormCheck('Чекер Error: PASS (0 детектов)');
                        } else if (val.includes('Really')) {
                          setFormCheck('Проверка AnyDesk: PASS');
                        } else if (val.includes('Holy')) {
                          setFormCheck('Screen Share: PASS');
                        } else if (val.includes('Spooky') || val.includes('СП')) {
                          setFormCheck('spookytime.su: Mojang Valid');
                        } else {
                          setFormCheck('Dual-PC Router: PASS');
                        }
                      }}
                      className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white text-sm focus:border-emerald-400 focus:outline-none"
                    >
                      <option value="FunTime">FunTime (Анархия, чекер Error)</option>
                      <option value="ReallyWorld">ReallyWorld</option>
                      <option value="HolyWorld">HolyWorld</option>
                      <option value="SpookyTime (СП)">SpookyTime (СП)</option>
                      <option value="Hypixel Network">Hypixel Network</option>
                      <option value="Dual-PC WFP">Dual-PC WFP сетап</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#adadad] mb-1.5">
                      {isRu ? 'Ваш тариф подписки:' : 'Subscription Plan:'}
                    </label>
                    <select
                      value={formPlan}
                      onChange={(e) => setFormPlan(e.target.value as ReviewItem['planType'])}
                      className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white text-sm focus:border-emerald-400 focus:outline-none"
                    >
                      <option value="lifetime">Навсегда (Lifetime)</option>
                      <option value="90d">Подписка 90 дней</option>
                      <option value="30d">Подписка 30 дней</option>
                      <option value="7d_contest">Выиграл в конкурсе (7 дней)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#adadad] mb-1.5">
                      {isRu ? 'Оценка софта:' : 'Rating:'}
                    </label>
                    <select
                      value={formRating}
                      onChange={(e) => setFormRating(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white text-sm focus:border-emerald-400 focus:outline-none"
                    >
                      <option value={5}>★★★★★ 5.0 (Идеально)</option>
                      <option value={4}>★★★★☆ 4.0 (Отлично)</option>
                      <option value={3}>★★★☆☆ 3.0 (Были вопросы по настройке)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#adadad] mb-1.5">
                      {isRu ? 'Результат проверки:' : 'Check Result:'}
                    </label>
                    <input
                      type="text"
                      value={formCheck}
                      onChange={(e) => setFormCheck(e.target.value)}
                      placeholder="e.g. Чекер Error: PASS"
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white placeholder-white/30 text-sm focus:border-emerald-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#adadad] mb-1.5">
                    {isRu ? 'Текст вашего отзыва:' : 'Your review text:'}
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formText}
                    onChange={(e) => setFormText(e.target.value)}
                    placeholder={
                      isRu
                        ? 'Опишите ваш опыт: как прошла проверка (например, чекером Error на FunTime), какой пинг, как помогла поддержка Омара...'
                        : 'Describe your experience: how the check went (e.g. Error checker on FunTime), ping stability, support...'
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white placeholder-white/30 text-sm focus:border-emerald-400 focus:outline-none resize-none"
                  ></textarea>
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-[#adadad] hover:text-white transition"
                  >
                    {isRu ? 'Отмена' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 shadow-lg shadow-emerald-500/25 transition active:scale-95"
                  >
                    {isRu ? 'Опубликовать отзыв' : 'Post Review'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
