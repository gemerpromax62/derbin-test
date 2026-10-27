import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import {
  auth,
  onAuthStateChanged,
  signInWithGoogle,
  signOutUser,
  subscribeToUserProfile,
  subscribeToUserConfigs,
  updateUserProfileDetails,
  updateUserSubscription,
  saveCloudProxyConfig,
  deleteCloudProxyConfig,
  User,
} from './firebase';
import {
  UserProfileData,
  ProxyConfigData,
  GlassPresetId,
  SubscriptionPlan,
  Currency,
  getPlanPrice,
  CURRENCY_CONFIG,
} from './utils/derbinLogic';
import { Lang, translations, playGuiSound } from './utils/i18nAndAudio';
import { WhyDerbinAlphaSection } from './components/WhyDerbinAlphaSection';
import { ServerStatusMonitoringSection } from './components/ServerStatusMonitoringSection';
import { UserReviewsSection } from './components/UserReviewsSection';
import { AccountModal } from './components/AccountModal';
import {
  CheckoutModal,
  CalculatorModal,
  EasterEggModal,
  LightboxModal,
} from './components/ModalsAndTools';

const DEFAULT_LOCAL_PROFILE: UserProfileData = {
  uid: 'local_preview_user',
  displayName: 'omar_torrez',
  minecraftNick: 'omar_torrez',
  subscriptionPlan: '90d',
  licenseKey: 'DRB-90D-8F4A92C1',
  hwidStatus: 'bound',
  glassPreset: 'prismatic_ios26',
};

const DEFAULT_LOCAL_CONFIGS: ProxyConfigData[] = [
  {
    id: 'preset_rw',
    uid: 'local_preview_user',
    name: 'ReallyWorld 0.1ms',
    serverAddress: 'mc.reallyworld.ru',
    accountName: 'omar_torrez',
    dhcpSubnet: '192.168.178.1',
    pingSpoofMs: 0,
    jitterSmoothPct: 88,
    tracerouteBypass: true,
    routerMode: true,
  },
  {
    id: 'preset_ft',
    uid: 'local_preview_user',
    name: 'FunTime Stealth WFP',
    serverAddress: 'funtime.su',
    accountName: 'nerfchik',
    dhcpSubnet: '192.168.144.1',
    pingSpoofMs: 12,
    jitterSmoothPct: 92,
    tracerouteBypass: true,
    routerMode: true,
  },
];

const StarIcon = ({ className = 'h-[18px] w-[18px] text-[var(--brand-accent)]' }: { className?: string }) => (
  <svg viewBox="0 0 18 18" className={className} fill="currentColor">
    <path d="M8.75348 17.6952C7.72056 14.0706 3.94416 10.3084 0.305928 9.27938C-0.101976 9.14829 -0.101976 8.8599 0.305928 8.72226C3.95074 7.68666 7.72056 3.931 8.76005 0.299863C8.8719 -0.0999545 9.14164 -0.0999545 9.25349 0.299863C10.2864 3.931 14.0628 7.68666 17.6945 8.72226C18.1024 8.85335 18.1024 9.14829 17.6945 9.27938C14.0562 10.3084 10.2798 14.0706 9.24691 17.6952C9.13506 18.1016 8.86532 18.1016 8.75348 17.6952Z" />
  </svg>
);

export default function App() {
  const [lang, setLang] = useState<Lang>('ru');
  const [currency, setCurrency] = useState<Currency>('RUB');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Original Preloader State ("derbin" letter animation)
  const [preloaderStep, setPreloaderStep] = useState<number>(0);
  const [preloaderFadeOut, setPreloaderFadeOut] = useState(false);
  const [preloaderHidden, setPreloaderHidden] = useState(false);

  // Ambient Canvas Ref
  const ambientCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Firebase Auth & Profile State
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfileData>(() => {
    try {
      const saved = localStorage.getItem('derbin_ios26_profile');
      return saved ? JSON.parse(saved) : DEFAULT_LOCAL_PROFILE;
    } catch {
      return DEFAULT_LOCAL_PROFILE;
    }
  });
  const [cloudConfigs, setCloudConfigs] = useState<ProxyConfigData[]>(() => {
    try {
      const saved = localStorage.getItem('derbin_ios26_configs');
      return saved ? JSON.parse(saved) : DEFAULT_LOCAL_CONFIGS;
    } catch {
      return DEFAULT_LOCAL_CONFIGS;
    }
  });

  // Modals State
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [checkoutState, setCheckoutState] = useState<{
    open: boolean;
    title: string;
    price: string;
    code: SubscriptionPlan;
  }>({
    open: false,
    title: 'Подписка 90 дней',
    price: '799 ₽',
    code: '90d',
  });
  const [calcModalOpen, setCalcModalOpen] = useState(false);
  const [easterEggOpen, setEasterEggOpen] = useState(false);
  const [lightboxState, setLightboxState] = useState<{ src: string | null; title: string }>({
    src: null,
    title: '',
  });
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const t = (key: string) => translations[lang][key] || key;

  const showNotice = (msg: string) => {
    setToastMsg(msg);
  };

  useEffect(() => {
    if (!toastMsg) return;
    const timer = setTimeout(() => setToastMsg(null), 3500);
    return () => clearTimeout(timer);
  }, [toastMsg]);

  // Preloader Letter Animation ("derbin")
  useEffect(() => {
    const timers: number[] = [];
    const chars = 'derbin'.split('');
    chars.forEach((_, idx) => {
      timers.push(
        window.setTimeout(() => {
          setPreloaderStep(idx + 1);
        }, 70 * idx)
      );
    });
    timers.push(
      window.setTimeout(() => {
        setPreloaderFadeOut(true);
      }, chars.length * 70 + 380)
    );
    timers.push(
      window.setTimeout(() => {
        setPreloaderHidden(true);
      }, chars.length * 70 + 950)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  // Ambient Particle Canvas (exact replica from original HTML)
  useEffect(() => {
    const cvs = ambientCanvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    if (!ctx) return;

    let cw = (cvs.width = window.innerWidth);
    let ch = (cvs.height = window.innerHeight);

    const handleResize = () => {
      if (!cvs) return;
      cw = cvs.width = window.innerWidth;
      ch = cvs.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * cw,
      y: Math.random() * ch,
      r: Math.random() * 2 + 1,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      alpha: Math.random() * 0.4 + 0.1,
    }));

    let rafId = 0;
    const renderParticles = () => {
      ctx.clearRect(0, 0, cw, ch);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = cw;
        if (p.x > cw) p.x = 0;
        if (p.y < 0) p.y = ch;
        if (p.y > ch) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(96, 165, 250, ${p.alpha})`;
        ctx.fill();
      });
      rafId = requestAnimationFrame(renderParticles);
    };

    rafId = requestAnimationFrame(renderParticles);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Apply Glass Preset to root
  useEffect(() => {
    document.documentElement.setAttribute('data-glass-preset', profile.glassPreset);
    try {
      localStorage.setItem('derbin_ios26_profile', JSON.stringify(profile));
    } catch {
      // ignore storage quota errors
    }
  }, [profile]);

  useEffect(() => {
    try {
      localStorage.setItem('derbin_ios26_configs', JSON.stringify(cloudConfigs));
    } catch {
      // ignore
    }
  }, [cloudConfigs]);

  // Firebase Auth & Firestore Real-Time Listeners
  useEffect(() => {
    let unsubProfile: (() => void) | null = null;
    let unsubConfigs: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (unsubProfile) {
        unsubProfile();
        unsubProfile = null;
      }
      if (unsubConfigs) {
        unsubConfigs();
        unsubConfigs = null;
      }

      if (user) {
        unsubProfile = subscribeToUserProfile(user.uid, (remoteProfile) => {
          if (remoteProfile) {
            setProfile(remoteProfile);
          }
        });
        unsubConfigs = subscribeToUserConfigs(user.uid, (remoteConfigs) => {
          if (remoteConfigs.length > 0) {
            setCloudConfigs(remoteConfigs);
          }
        });
      }
    });

    return () => {
      unsubAuth();
      if (unsubProfile) unsubProfile();
      if (unsubConfigs) unsubConfigs();
    };
  }, []);

  const handleSelectPreset = async (preset: GlassPresetId) => {
    setProfile((prev) => ({ ...prev, glassPreset: preset }));
    showNotice(`Палитра оформления изменена`);
    if (firebaseUser) {
      await updateUserProfileDetails(firebaseUser.uid, {
        displayName: profile.displayName,
        minecraftNick: profile.minecraftNick,
        glassPreset: preset,
        hwidStatus: profile.hwidStatus,
      });
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const user = await signInWithGoogle();
      showNotice(
        `Добро пожаловать, ${user.displayName || user.email}! Профиль синхронизирован с Firebase.`
      );
    } catch {
      showNotice(
        'Вход через всплывающее окно Google отменен или заблокирован браузером. Вы можете использовать регистрацию профиля ниже.'
      );
    }
  };

  const handleSignOut = async () => {
    await signOutUser();
    showNotice('Вы вышли из облачной сессии Firebase.');
  };

  const handleSaveProfile = async (updated: {
    displayName: string;
    minecraftNick: string;
    glassPreset: GlassPresetId;
    email?: string;
  }) => {
    setProfile((prev) => ({
      ...prev,
      displayName: updated.displayName,
      minecraftNick: updated.minecraftNick,
      glassPreset: updated.glassPreset,
    }));

    if (firebaseUser) {
      await updateUserProfileDetails(firebaseUser.uid, {
        displayName: updated.displayName,
        minecraftNick: updated.minecraftNick,
        glassPreset: updated.glassPreset,
        hwidStatus: profile.hwidStatus,
      });
      showNotice(`Профиль ${updated.displayName} сохранён в базе данных Firebase Firestore!`);
    } else {
      showNotice(
        `Профиль ${updated.displayName} (${updated.minecraftNick}) успешно зарегистрирован и сохранён!`
      );
    }
  };

  const handleActivateLicense = async (plan: SubscriptionPlan, key: string) => {
    setProfile((prev) => ({
      ...prev,
      subscriptionPlan: plan,
      licenseKey: key,
      hwidStatus: 'bound',
    }));
    if (firebaseUser) {
      await updateUserSubscription(firebaseUser.uid, plan, key, 'bound');
    }
    showNotice(`Лицензия ${key} (${plan.toUpperCase()}) успешно активирована в вашем аккаунте!`);
  };

  const handleResetHwid = async () => {
    const nextStatus = profile.hwidStatus === 'bound' ? 'reset_ready' : 'bound';
    setProfile((prev) => ({ ...prev, hwidStatus: nextStatus }));
    if (firebaseUser) {
      await updateUserProfileDetails(firebaseUser.uid, {
        displayName: profile.displayName,
        minecraftNick: profile.minecraftNick,
        glassPreset: profile.glassPreset,
        hwidStatus: nextStatus,
      });
    }
    showNotice(`Статус HWID обновлён: ${nextStatus.toUpperCase()}`);
  };

  const handleSaveCloudConfig = async (
    cfg: Omit<ProxyConfigData, 'id' | 'uid' | 'createdAt' | 'updatedAt'>
  ) => {
    const configId = `cfg_${Date.now()}`;
    const newEntry: ProxyConfigData = {
      ...cfg,
      id: configId,
      uid: firebaseUser?.uid || profile.uid,
    };
    setCloudConfigs((prev) => [newEntry, ...prev]);

    if (firebaseUser) {
      await saveCloudProxyConfig(firebaseUser.uid, configId, cfg);
      showNotice(`Пресет "${cfg.name}" сохранён в коллекции Firebase Firestore!`);
    } else {
      showNotice(`Пресет "${cfg.name}" сохранён в ваш профиль!`);
    }
  };

  const handleDeleteCloudConfig = async (id: string) => {
    setCloudConfigs((prev) => prev.filter((c) => c.id !== id));
    if (firebaseUser) {
      await deleteCloudProxyConfig(firebaseUser.uid, id);
    }
    showNotice('Пресет удалён из профиля.');
  };

  const toggleLanguage = () => {
    playGuiSound('click', soundEnabled);
    setLang((prev) => (prev === 'ru' ? 'en' : 'ru'));
  };

  const selectCurrency = (cur: Currency) => {
    playGuiSound('click', soundEnabled);
    setCurrency(cur);
    showNotice(`Валюта изменена на ${CURRENCY_CONFIG[cur].label}`);
  };

  // Pre-calculated prices based on selected currency
  const price30d = getPlanPrice('30d', currency);
  const price90d = getPlanPrice('90d', currency);
  const priceLifetime = getPlanPrice('lifetime', currency);

  // Framer Motion Scroll Parallax Transforms
  const { scrollY } = useScroll();
  const heroGlowY = useTransform(scrollY, [0, 1400], [0, 240]);
  const heroGlowScale = useTransform(scrollY, [0, 1400], [1, 1.25]);
  const blob1Y = useTransform(scrollY, [0, 3500], [0, -420]);
  const blob1Rotate = useTransform(scrollY, [0, 3500], [0, 110]);
  const blob2Y = useTransform(scrollY, [0, 3500], [0, 440]);
  const blob2Rotate = useTransform(scrollY, [0, 3500], [0, -130]);
  const blob3Y = useTransform(scrollY, [0, 3500], [140, -320]);
  const heroParallaxY = useTransform(scrollY, [0, 800], [0, 60]);

  return (
    <div className="min-h-full flex flex-col justify-between relative overflow-x-hidden">
      {/* ================= PRELOADER ================= */}
      {!preloaderHidden && (
        <div
          id="preloader"
          className={`fixed inset-0 z-[100] grid place-items-center bg-[#101012] transition-opacity duration-700 ${
            preloaderFadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
          }`}
        >
          <div className="relative flex items-center justify-center">
            <div
              id="preloader-letters"
              className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#ededeb] flex gap-1"
            >
              {'derbin'.split('').map((char, idx) => (
                <span
                  key={idx}
                  className={`char-anim ${preloaderStep > idx ? 'active' : ''}`}
                >
                  {char}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Background Glow & Particle Canvas with Motion Parallax */}
      <motion.div
        style={{ y: heroGlowY, scale: heroGlowScale }}
        className="hero-glow pointer-events-none"
      />
      <motion.div
        style={{ y: blob1Y, rotate: blob1Rotate }}
        className="liquid-blob-1 pointer-events-none"
      />
      <motion.div
        style={{ y: blob2Y, rotate: blob2Rotate }}
        className="liquid-blob-2 pointer-events-none"
      />
      {/* Additional ambient parallax liquid prism */}
      <motion.div
        style={{ y: blob3Y }}
        className="pointer-events-none fixed top-[38%] left-[8%] w-[420px] h-[420px] rounded-full bg-blue-600/[0.12] blur-[110px] z-0"
      />
      <canvas
        ref={ambientCanvasRef}
        id="ambient-canvas"
        className="pointer-events-none fixed inset-0 w-full h-full opacity-40 z-0"
      ></canvas>

      {/* ================= NAVBAR ================= */}
      <header className="sticky top-0 z-40 px-4 pt-3 sm:pt-4" id="navbar">
        <nav className="liquid-glass-nav mx-auto flex h-16 max-w-6xl items-center justify-between rounded-full px-4 sm:px-6 shadow-2xl backdrop-blur-2xl lg:px-8">
          {/* Brand Logo */}
          <a href="#hero" className="inline-flex items-center gap-2.5 group shrink-0">
            <img
              src="/logo.svg"
              alt="derbin logo"
              className="h-7 w-7 object-contain transition-transform duration-500 group-hover:scale-110 drop-shadow-[0_0_10px_rgba(37,99,235,0.4)]"
            />
            <span
              className="text-[20px] font-bold leading-none tracking-tight text-white lg:text-[24px]"
              id="nav-brand"
            >
              derbin
            </span>
            <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30">
              alpha
            </span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1 font-medium text-sm text-[#d4d4d6]">
            <a
              href="#hero"
              className="rounded-full px-3 py-1.5 transition-colors hover:bg-white/10 hover:text-white whitespace-nowrap"
            >
              {t('nav.home')}
            </a>
            <a
              href="#advantages"
              className="rounded-full px-3 py-1.5 transition-colors hover:bg-white/10 hover:text-white whitespace-nowrap"
            >
              {t('nav.advantages')}
            </a>
            <a
              href="#why-derbin"
              className="rounded-full px-3 py-1.5 transition-colors hover:bg-blue-500/20 hover:text-blue-300 whitespace-nowrap font-semibold"
            >
              {t('nav.why')}
            </a>
            <a
              href="#status"
              className="rounded-full px-3 py-1.5 transition-colors hover:bg-blue-500/20 hover:text-blue-300 whitespace-nowrap font-semibold"
            >
              {t('nav.status')}
            </a>
            <a
              href="#reviews"
              className="rounded-full px-3 py-1.5 transition-colors hover:bg-blue-500/20 hover:text-blue-300 whitespace-nowrap font-semibold"
            >
              {t('nav.reviews')}
            </a>
            <a
              href="#owners"
              className="rounded-full px-3 py-1.5 transition-colors hover:bg-white/10 hover:text-white whitespace-nowrap"
            >
              {t('nav.owners')}
            </a>
            <a
              href="#pricing"
              className="rounded-full px-3 py-1.5 transition-colors hover:bg-white/10 hover:text-white whitespace-nowrap"
            >
              {t('nav.pricing')}
            </a>
            <a
              href="#stats"
              className="rounded-full px-3 py-1.5 transition-colors hover:bg-white/10 hover:text-white whitespace-nowrap"
            >
              {t('nav.stats')}
            </a>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Currency Quick-Selector in Navbar */}
            <div className="hidden md:inline-flex items-center p-0.5 rounded-full liquid-btn-glass text-[11px] font-semibold">
              {(['RUB', 'USD', 'EUR', 'UAH'] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => selectCurrency(c)}
                  className={`px-2 py-1 rounded-full transition-all ${
                    currency === c
                      ? 'bg-[var(--brand-primary)] text-white shadow-sm font-bold'
                      : 'text-[#adadad] hover:text-white'
                  }`}
                  title={CURRENCY_CONFIG[c].label}
                >
                  {CURRENCY_CONFIG[c].symbol}
                </button>
              ))}
            </div>

            {/* Discord Community Link */}
            <a
              href="https://discord.gg/ehWheFqAu"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full liquid-btn-glass px-3 py-1.5 text-xs font-semibold text-[#ededeb] transition hover:border-blue-500/50 hover:text-blue-400"
            >
              <i className="ph-bold ph-discord-logo text-blue-400 text-sm"></i>
              <span>Discord</span>
            </a>

            {/* Language Switch */}
            <button
              id="lang-btn"
              type="button"
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 rounded-full liquid-btn-glass px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#ededeb] transition hover:border-white/30"
            >
              <span className="h-2 w-2 rounded-full bg-[var(--brand-accent)] animate-pulse"></span>
              <span id="lang-label">{lang.toUpperCase()}</span>
            </button>

            {/* Firebase Account / Registration Button */}
            <button
              type="button"
              onClick={() => {
                playGuiSound('click', soundEnabled);
                setAccountModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-full liquid-btn-glass px-3 py-1.5 text-xs font-semibold text-white transition hover:border-blue-500/50"
              title="Личный кабинет и регистрация"
            >
              <i className="ph-bold ph-user-circle text-blue-400 text-sm"></i>
              <span className="hidden md:inline">{profile.minecraftNick}</span>
            </button>

            {/* CTA Buy Button in header */}
            <a
              href="#pricing"
              className="hidden sm:inline-flex items-center justify-center rounded-full liquid-btn-primary px-4 sm:px-5 py-2 text-xs font-semibold text-white shadow-lg transition-all"
            >
              {t('nav.get')}
            </a>

            {/* Mobile Drawer Trigger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="inline-flex lg:hidden rounded-full p-2 text-white/80 hover:bg-white/10 transition"
              aria-label="Меню"
            >
              <i className="ph-bold ph-list text-xl"></i>
            </button>
          </div>
        </nav>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div
            id="mobile-menu"
            className="lg:hidden mx-auto mt-2 max-w-5xl rounded-3xl sadnes-card p-6 backdrop-blur-2xl shadow-2xl transition-all"
          >
            <div className="flex flex-col gap-4 text-base font-medium text-white">
              {/* Mobile Currency Switcher */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs text-[#adadad]">Валюта:</span>
                <div className="flex gap-1">
                  {(['RUB', 'USD', 'EUR', 'UAH'] as const).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => selectCurrency(c)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition ${
                        currency === c
                          ? 'bg-[var(--brand-primary)] text-white shadow-sm'
                          : 'bg-white/5 text-[#adadad] hover:text-white'
                      }`}
                    >
                      {CURRENCY_CONFIG[c].label}
                    </button>
                  ))}
                </div>
              </div>

              <a
                href="#hero"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-blue-400 transition"
              >
                {t('nav.home')}
              </a>
              <a
                href="#advantages"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-blue-400 transition"
              >
                {t('nav.advantages')}
              </a>
              <a
                href="#why-derbin"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-blue-400 transition font-semibold"
              >
                {t('nav.why')}
              </a>
              <a
                href="#status"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-blue-400 transition font-semibold"
              >
                {t('nav.status')}
              </a>
              <a
                href="#reviews"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-blue-400 transition font-semibold"
              >
                {t('nav.reviews')}
              </a>
              <a
                href="#owners"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-blue-400 transition"
              >
                {t('nav.owners')}
              </a>
              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-blue-400 transition"
              >
                {t('nav.pricing')}
              </a>
              <a
                href="#stats"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-blue-400 transition"
              >
                {t('nav.stats')}
              </a>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setAccountModalOpen(true);
                }}
                className="text-left hover:text-blue-400 transition flex items-center gap-2"
              >
                <i className="ph-bold ph-user-circle text-blue-400"></i>
                <span>
                  {t('nav.account')}: {profile.minecraftNick}
                </span>
              </button>
              <a
                href="https://discord.gg/ehWheFqAu"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-400 transition flex items-center gap-2"
              >
                <i className="ph-bold ph-discord-logo text-blue-400"></i> Discord сервер
              </a>
              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-2 text-center rounded-2xl liquid-btn-primary py-3 text-sm font-semibold text-white"
              >
                {t('nav.get')}
              </a>
            </div>
          </div>
        )}
      </header>

      {/* ================= HERO ================= */}
      <main
        id="hero"
        className="relative min-h-[85vh] flex flex-col justify-center items-center px-4 text-center z-10 pt-10 sm:pt-16 pb-20"
      >
        <motion.div
          style={{ y: heroParallaxY }}
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 24 }}
          className="max-w-4xl mx-auto"
        >
          {/* Top Badges with Exact Real Date and Time */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            <motion.div
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.94, y: 1.5 }}
              className="inline-flex items-center gap-2 rounded-full liquid-btn-glass px-4 py-1.5 text-xs text-[#adadad] backdrop-blur-xl cursor-default"
            >
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
              <span className="font-mono text-white/90">
                {lang === 'ru'
                  ? 'Последний патч: 26.10.2026 в 16:48 (MSK) • 0 детектов'
                  : 'Latest hotfix: Oct 26, 2026 16:48 (MSK) • 0 detects'}
              </span>
            </motion.div>
            <motion.div
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.94, y: 1.5 }}
              className="inline-flex items-center gap-1.5 rounded-full liquid-btn-glass border-amber-500/30 bg-amber-500/10 px-3.5 py-1.5 text-xs font-semibold text-amber-400 backdrop-blur-xl cursor-default"
            >
              <i className="ph-bold ph-warning-circle text-sm text-amber-400"></i>
              <span>{t('hero.alpha')}</span>
            </motion.div>
          </div>

          {/* Headline */}
          <h1
            className="text-balance text-[clamp(34px,5.5vw,82px)] font-bold leading-[1.08] tracking-[-0.04em] text-white"
            style={{ textWrap: 'balance' }}
          >
            <span>{t('hero.title1')}</span>
            <br />
            <span className="text-[var(--brand-primary)]">{t('hero.title2')}</span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl text-[#adadad] font-normal leading-relaxed">
            <span>{t('hero.sub1')}</span>
            <strong className="text-white font-semibold" id="hero-brand">
              derbin
            </strong>
            <span>{t('hero.sub2')}</span>
          </p>

          {/* Buttons with Liquid Spring Physics */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <motion.a
              href="#pricing"
              whileHover={{ y: -3, scale: 1.035 }}
              whileTap={{ scale: 0.92, y: 2.5 }}
              transition={{ type: 'spring', stiffness: 420, damping: 18 }}
              className="liquid-btn-primary inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-semibold text-white shadow-xl"
            >
              <span>{t('hero.ctaPrimary')}</span>
              <i className="ph-bold ph-arrow-right"></i>
            </motion.a>
            <motion.a
              href="#advantages"
              whileHover={{ y: -3, scale: 1.035 }}
              whileTap={{ scale: 0.92, y: 2.5 }}
              transition={{ type: 'spring', stiffness: 420, damping: 18 }}
              className="liquid-btn-glass inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-semibold text-[#f1f1ef]"
            >
              <i className="ph-bold ph-shield-check text-[var(--brand-accent)]"></i>
              <span>{t('hero.ctaSecondary')}</span>
            </motion.a>
            <motion.button
              type="button"
              whileHover={{ y: -3, scale: 1.035 }}
              whileTap={{ scale: 0.92, y: 2.5 }}
              transition={{ type: 'spring', stiffness: 420, damping: 18 }}
              onClick={() => {
                playGuiSound('click', soundEnabled);
                setAccountModalOpen(true);
              }}
              className="liquid-btn-glass inline-flex items-center gap-2 rounded-full px-7 py-4 text-sm font-semibold text-[#f1f1ef]"
            >
              <i className="ph-bold ph-user-plus text-[var(--brand-accent)]"></i>
              <span>{t('hero.ctaAccount')}</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Scroll down hint */}
        <div className="mt-16 sm:mt-24">
          <a
            href="#advantages"
            className="group flex flex-col items-center gap-2 text-xs font-mono text-[#79787b] hover:text-white transition"
          >
            <span>{t('hero.scroll')}</span>
            <div className="h-6 w-5 overflow-hidden relative">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 text-[var(--brand-accent)] scrollhint-chevron"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
          </a>
        </div>
      </main>

      {/* ================= ADVANTAGES (WITH FRAMER MOTION FADE-IN UP & LIQUID SQUISH) ================= */}
      <section
        id="advantages"
        className="relative bg-transparent px-5 pt-[80px] pb-[120px] z-10 border-t border-white/[0.04]"
      >
        <div className="mx-auto w-full max-w-[1200px]">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ type: 'spring', stiffness: 220, damping: 24 }}
            className="mx-auto mb-20 max-w-[850px] text-center"
          >
            <div className="mb-4 flex items-center justify-center gap-2">
              <StarIcon />
              <h4 className="text-base font-medium text-[var(--brand-accent)]">{t('adv.eyebrow')}</h4>
            </div>
            <h2 className="text-[clamp(2.2rem,4.5vw,3.6rem)] font-semibold leading-[1.1] tracking-[-0.03em] text-[#f1f1ef]">
              {t('adv.heading')}
            </h2>
          </motion.div>

          {/* 3 Big Advantage Cards Grid with Framer Motion Fade-In Up + Liquid Press Squish */}
          <div className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: 'ph-shield-check',
                title: t('adv.c1.title'),
                desc: t('adv.c1.desc'),
              },
              {
                icon: 'ph-lightning',
                title: t('adv.c2.title'),
                desc: t('adv.c2.desc'),
              },
              {
                icon: 'ph-shield-star',
                title: t('adv.c3.title'),
                desc: t('adv.c3.desc'),
              },
            ].map((card, idx) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 40, scale: 0.96 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  type: 'spring',
                  stiffness: 240,
                  damping: 22,
                  mass: 0.85,
                  delay: idx * 0.12,
                }}
                whileHover={{ y: -7, scale: 1.015 }}
                whileTap={{ scale: 0.955, y: 3 }}
                onClick={() => playGuiSound('click', soundEnabled)}
                className="sadnes-card rounded-[26px] p-8 sm:p-10 text-center flex flex-col items-center cursor-pointer"
              >
                <div className="mb-6 h-24 w-24 rounded-2xl bg-gradient-to-b from-[var(--brand-primary)]/25 to-transparent border border-white/15 shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.5)] flex items-center justify-center text-4xl text-[var(--brand-accent)]">
                  <i className={`ph-bold ${card.icon}`}></i>
                </div>
                <h3 className="mb-4 text-2xl font-semibold text-[#f1f1ef]">{card.title}</h3>
                <p className="max-w-[320px] text-sm text-[#adadad] leading-relaxed">{card.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* 5 Tag Badges with Framer Motion Fade-In Up + Liquid Squish */}
          <div className="mx-auto max-w-[950px] text-center flex flex-wrap justify-center gap-3">
            {['tag.1', 'tag.2', 'tag.3', 'tag.4', 'tag.5'].map((tagKey, idx) => (
              <motion.div
                key={tagKey}
                initial={{ opacity: 0, y: 24, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  type: 'spring',
                  stiffness: 260,
                  damping: 20,
                  delay: 0.15 + idx * 0.07,
                }}
                whileHover={{ y: -4, scale: 1.035 }}
                whileTap={{ scale: 0.92, y: 2 }}
                onClick={() => playGuiSound('click', soundEnabled)}
                className="liquid-tag group inline-flex items-center gap-3 rounded-2xl px-5 py-3 cursor-pointer"
              >
                <StarIcon className="star-icon h-[18px] w-[18px] text-[var(--brand-accent)]" />
                <span className="text-[14px] font-medium text-[#f1f1ef]">{t(tagKey)}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= WHY DERBIN ALPHA IS AWESOME ================= */}
      <WhyDerbinAlphaSection lang={lang} soundEnabled={soundEnabled} />

      {/* ================= LIVE SERVER BYPASS STATUS MONITORING ================= */}
      <ServerStatusMonitoringSection
        lang={lang}
        soundEnabled={soundEnabled}
        onNotify={showNotice}
      />

      {/* ================= USER REVIEWS & VERIFIED CHECKS ================= */}
      <UserReviewsSection
        lang={lang}
        soundEnabled={soundEnabled}
        onNotify={showNotice}
      />

      {/* ================= OWNERS / CREATORS ================= */}
      <section
        id="owners"
        className="relative bg-transparent px-5 py-[100px] z-10 border-t border-white/[0.04]"
      >
        <div className="mx-auto w-full max-w-[1100px]">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ type: 'spring', stiffness: 220, damping: 24 }}
            className="mx-auto mb-16 max-w-[850px] text-center"
          >
            <div className="mb-4 flex items-center justify-center gap-2">
              <StarIcon />
              <h4 className="text-base font-medium text-[var(--brand-accent)]">{t('owners.eyebrow')}</h4>
            </div>
            <h2 className="text-[clamp(2.2rem,4.5vw,3.6rem)] font-semibold leading-[1.1] tracking-[-0.03em] text-[#f1f1ef]">
              {t('owners.heading')}
            </h2>
            <p className="mt-4 text-[#adadad] text-sm max-w-lg mx-auto">{t('owners.desc')}</p>
          </motion.div>

          {/* Owners Grid (omar_torrez and nerfchik) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Owner 1: omar_torrez */}
            <motion.div
              initial={{ opacity: 0, y: 36, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ type: 'spring', stiffness: 240, damping: 22, delay: 0.05 }}
              whileHover={{ y: -6, scale: 1.012 }}
              whileTap={{ scale: 0.96, y: 2.5 }}
              className="sadnes-card rounded-[26px] p-8 flex flex-col items-center text-center relative overflow-hidden group"
            >
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-[var(--brand-primary)]/10 rounded-full blur-2xl pointer-events-none group-hover:bg-[var(--brand-primary)]/20 transition"></div>

              {/* Avatar Frame */}
              <div className="relative mb-5">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-[var(--brand-primary)] to-[#222226] p-[2px] shadow-xl shadow-[var(--brand-primary)]/20">
                  <div className="w-full h-full rounded-[14px] bg-[#161618]/80 backdrop-blur-md flex items-center justify-center text-3xl font-bold text-white tracking-wider font-mono">
                    OT
                  </div>
                </div>
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500 border-2 border-[#161618]"></span>
                </span>
              </div>

              {/* Name & Role */}
              <h3 className="text-2xl font-bold text-white tracking-tight">omar_torrez</h3>
              <span className="mt-1 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--brand-primary)]/20 text-[var(--brand-accent)] border border-[var(--brand-primary)]/30">
                <i className="ph-bold ph-crown"></i>
                <span>{t('owner.role1')}</span>
              </span>

              <p className="mt-4 text-xs text-[#adadad] max-w-xs leading-relaxed">{t('owner.bio1')}</p>

              {/* Contact buttons */}
              <div className="mt-6 flex items-center gap-3">
                <a
                  href="https://t.me/stockholmef"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="liquid-btn-glass px-4 py-2 rounded-xl text-xs font-medium text-white transition flex items-center gap-1.5"
                >
                  <i className="ph-bold ph-telegram-logo text-[var(--brand-accent)] text-sm"></i>
                  <span>Telegram</span>
                </a>
                <a
                  href="https://discord.gg/ehWheFqAu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="liquid-btn-glass px-4 py-2 rounded-xl text-xs font-medium text-white transition flex items-center gap-1.5"
                >
                  <i className="ph-bold ph-discord-logo text-[var(--brand-accent)] text-sm"></i>
                  <span>Discord</span>
                </a>
              </div>
            </motion.div>

            {/* Owner 2: nerfchik */}
            <motion.div
              initial={{ opacity: 0, y: 36, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ type: 'spring', stiffness: 240, damping: 22, delay: 0.16 }}
              whileHover={{ y: -6, scale: 1.012 }}
              whileTap={{ scale: 0.96, y: 2.5 }}
              className="sadnes-card rounded-[26px] p-8 flex flex-col items-center text-center relative overflow-hidden group"
            >
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-[var(--brand-primary)]/10 rounded-full blur-2xl pointer-events-none group-hover:bg-[var(--brand-primary)]/20 transition"></div>

              {/* Avatar Frame */}
              <div className="relative mb-5">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-[var(--brand-primary)] to-[#222226] p-[2px] shadow-xl shadow-[var(--brand-primary)]/20">
                  <div className="w-full h-full rounded-[14px] bg-[#161618]/80 backdrop-blur-md flex items-center justify-center text-3xl font-bold text-white tracking-wider font-mono">
                    NC
                  </div>
                </div>
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500 border-2 border-[#161618]"></span>
                </span>
              </div>

              {/* Name & Role */}
              <h3 className="text-2xl font-bold text-white tracking-tight">nerfchik</h3>
              <span className="mt-1 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--brand-primary)]/20 text-[var(--brand-accent)] border border-[var(--brand-primary)]/30">
                <i className="ph-bold ph-code"></i>
                <span>{t('owner.role2')}</span>
              </span>

              <p className="mt-4 text-xs text-[#adadad] max-w-xs leading-relaxed">{t('owner.bio2')}</p>

              {/* Contact buttons */}
              <div className="mt-6 flex items-center gap-3">
                <a
                  href="https://t.me/boss_mogger123"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="liquid-btn-glass px-4 py-2 rounded-xl text-xs font-medium text-white transition flex items-center gap-1.5"
                >
                  <i className="ph-bold ph-telegram-logo text-[var(--brand-accent)] text-sm"></i>
                  <span>Telegram</span>
                </a>
                <a
                  href="https://discord.gg/ehWheFqAu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="liquid-btn-glass px-4 py-2 rounded-xl text-xs font-medium text-white transition flex items-center gap-1.5"
                >
                  <i className="ph-bold ph-discord-logo text-[var(--brand-accent)] text-sm"></i>
                  <span>Discord</span>
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================= PRICING (WITH DYNAMIC CURRENCY SELECTION & CONVERSION) ================= */}
      <section
        id="pricing"
        className="relative bg-transparent px-5 py-[120px] z-10 border-t border-white/[0.04]"
      >
        <div className="mx-auto w-full max-w-[1200px]">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ type: 'spring', stiffness: 220, damping: 24 }}
            className="mx-auto mb-12 max-w-[850px] text-center"
          >
            <div className="mb-4 flex items-center justify-center gap-2">
              <StarIcon />
              <h4 className="text-base font-medium text-[var(--brand-accent)]">{t('price.eyebrow')}</h4>
            </div>
            <h2 className="text-[clamp(2.2rem,4.5vw,3.6rem)] font-semibold leading-[1.1] tracking-[-0.03em] text-[#f1f1ef]">
              {t('price.heading')}
            </h2>
            <p className="mt-4 text-[#adadad] text-sm">{t('price.desc')}</p>
          </motion.div>

          {/* DEDICATED CURRENCY SELECTOR (СВЕРХУ ОТДЕЛЬНО ВЫБРАТЬ ВАЛЮТУ) */}
          <div className="mb-12 flex flex-col items-center justify-center gap-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#adadad] flex items-center gap-1.5">
              <i className="ph-bold ph-currency-circle-dollar text-blue-400 text-sm"></i>
              <span>Выберите валюту оплаты:</span>
            </span>
            <div className="inline-flex flex-wrap items-center justify-center gap-1.5 p-1.5 rounded-2xl liquid-glass-nav border border-white/20">
              {(
                [
                  { code: 'RUB', label: '₽ Рубли (RUB)' },
                  { code: 'USD', label: '$ Доллары (USD)' },
                  { code: 'EUR', label: '€ Евро (EUR)' },
                  { code: 'UAH', label: '₴ Гривны (UAH)' },
                ] as const
              ).map((curItem) => (
                <button
                  key={curItem.code}
                  type="button"
                  onClick={() => selectCurrency(curItem.code)}
                  className={`px-4 sm:px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                    currency === curItem.code
                      ? 'liquid-btn-primary text-white shadow-md'
                      : 'text-[#adadad] hover:text-white hover:bg-white/5'
                  }`}
                >
                  {curItem.label}
                </button>
              ))}
            </div>
          </div>

          {/* Pricing Cards (3 plans with dynamic currency price and 4999 RUB lifetime) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {/* Plan 1 */}
            <motion.div
              initial={{ opacity: 0, y: 42, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.18 }}
              transition={{ type: 'spring', stiffness: 240, damping: 22, delay: 0.04 }}
              whileHover={{ y: -7, scale: 1.015 }}
              whileTap={{ scale: 0.965, y: 2.5 }}
              className="sadnes-card rounded-[26px] p-8 flex flex-col justify-between"
            >
              <div>
                <div className="text-xs uppercase tracking-wider font-semibold text-[#adadad] mb-2">
                  {t('plan1.badge')}
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{t('plan1.title')}</h3>
                <div className="text-4xl font-extrabold text-white mb-6 font-mono">
                  {price30d.priceFormatted}{' '}
                  <span className="text-sm font-normal text-[#adadad]">
                    {lang === 'ru' ? price30d.periodFormatted : price30d.periodEn}
                  </span>
                </div>

                <ul className="space-y-3.5 text-sm text-[#adadad] border-t border-white/[0.08] pt-6 mb-8">
                  <li className="flex items-center gap-2.5 text-white">
                    <i className="ph-bold ph-check text-[var(--brand-accent)]"></i> Полный доступ к клиенту derbin
                  </li>
                  <li className="flex items-center gap-2.5 text-white">
                    <i className="ph-bold ph-check text-[var(--brand-accent)]"></i> Защита от проверок (чекер Error / AnyDesk)
                  </li>
                  <li className="flex items-center gap-2.5 text-white">
                    <i className="ph-bold ph-check text-[var(--brand-accent)]"></i> Автоматические обновления
                  </li>
                  <li className="flex items-center gap-2.5 text-[#6c6c72]">
                    <i className="ph-bold ph-x"></i> Приоритетная поддержка в Discord
                  </li>
                </ul>
              </div>

              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.92, y: 2 }}
                onClick={() =>
                  setCheckoutState({
                    open: true,
                    title: `Подписка 30 дней (${price30d.priceFormatted})`,
                    price: price30d.priceFormatted,
                    code: '30d',
                  })
                }
                className="w-full py-3.5 rounded-full liquid-btn-glass text-white font-semibold text-sm"
              >
                {t('plan.buy')}
              </motion.button>
            </motion.div>

            {/* Plan 2 (Highlighted) */}
            <motion.div
              initial={{ opacity: 0, y: 42, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.18 }}
              transition={{ type: 'spring', stiffness: 240, damping: 22, delay: 0.16 }}
              whileHover={{ y: -8, scale: 1.018 }}
              whileTap={{ scale: 0.965, y: 2.5 }}
              className="sadnes-card !overflow-visible rounded-[26px] p-8 flex flex-col justify-between border-2 border-blue-400/75 shadow-2xl shadow-blue-500/25 relative"
            >
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10 px-4 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-gradient-to-r from-blue-400 to-blue-600 border border-white/50 text-white shadow-[inset_0_1.5px_1.5px_rgba(255,255,255,0.85),0_8px_20px_rgba(37,99,235,0.5)] whitespace-nowrap">
                {t('plan2.hit')}
              </div>

              <div>
                <div className="text-xs uppercase tracking-wider font-semibold text-[var(--brand-accent)] mb-2 mt-2">
                  {t('plan2.badge')}
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{t('plan2.title')}</h3>
                <div className="text-4xl font-extrabold text-white mb-6 font-mono">
                  {price90d.priceFormatted}{' '}
                  <span className="text-sm font-normal text-[#adadad]">
                    {lang === 'ru' ? price90d.periodFormatted : price90d.periodEn}
                  </span>
                </div>

                <ul className="space-y-3.5 text-sm text-[#adadad] border-t border-white/[0.08] pt-6 mb-8">
                  <li className="flex items-center gap-2.5 text-white">
                    <i className="ph-bold ph-check text-[var(--brand-accent)]"></i> Расширенный модуль скрытия процессов
                  </li>
                  <li className="flex items-center gap-2.5 text-white">
                    <i className="ph-bold ph-check text-[var(--brand-accent)]"></i> Приоритетный тикет-канал поддержки
                  </li>
                  <li className="flex items-center gap-2.5 text-white">
                    <i className="ph-bold ph-check text-[var(--brand-accent)]"></i> 1 бесплатный сброс HWID
                  </li>
                  <li className="flex items-center gap-2.5 text-white">
                    <i className="ph-bold ph-check text-[var(--brand-accent)]"></i> Конфигурации под топовые сервера
                  </li>
                </ul>
              </div>

              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.92, y: 2 }}
                onClick={() =>
                  setCheckoutState({
                    open: true,
                    title: `Подписка 90 дней (${price90d.priceFormatted})`,
                    price: price90d.priceFormatted,
                    code: '90d',
                  })
                }
                className="w-full py-4 rounded-full liquid-btn-primary text-white font-semibold text-sm shadow-lg"
              >
                {t('plan.buy')}
              </motion.button>
            </motion.div>

            {/* Plan 3 (Lifetime - 4999 RUB) */}
            <motion.div
              initial={{ opacity: 0, y: 42, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.18 }}
              transition={{ type: 'spring', stiffness: 240, damping: 22, delay: 0.28 }}
              whileHover={{ y: -7, scale: 1.015 }}
              whileTap={{ scale: 0.965, y: 2.5 }}
              className="sadnes-card rounded-[26px] p-8 flex flex-col justify-between"
            >
              <div>
                <div className="text-xs uppercase tracking-wider font-semibold text-[#adadad] mb-2">
                  {t('plan3.badge')}
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{t('plan3.title')}</h3>
                <div className="text-4xl font-extrabold text-white mb-6 font-mono">
                  {priceLifetime.priceFormatted}{' '}
                  <span className="text-sm font-normal text-[#adadad]">
                    {lang === 'ru' ? priceLifetime.periodFormatted : priceLifetime.periodEn}
                  </span>
                </div>

                <ul className="space-y-3.5 text-sm text-[#adadad] border-t border-white/[0.08] pt-6 mb-8">
                  <li className="flex items-center gap-2.5 text-white">
                    <i className="ph-bold ph-check text-[var(--brand-accent)]"></i> Пожизненная лицензия derbin
                  </li>
                  <li className="flex items-center gap-2.5 text-white">
                    <i className="ph-bold ph-check text-[var(--brand-accent)]"></i> Доступ к закрытой Beta от nerfchik
                  </li>
                  <li className="flex items-center gap-2.5 text-white">
                    <i className="ph-bold ph-check text-[var(--brand-accent)]"></i> Неограниченные сбросы HWID
                  </li>
                  <li className="flex items-center gap-2.5 text-white">
                    <i className="ph-bold ph-check text-[var(--brand-accent)]"></i> Личная связь с создателями
                  </li>
                </ul>
              </div>

              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.92, y: 2 }}
                onClick={() =>
                  setCheckoutState({
                    open: true,
                    title: `Навсегда (Lifetime) (${priceLifetime.priceFormatted})`,
                    price: priceLifetime.priceFormatted,
                    code: 'lifetime',
                  })
                }
                className="w-full py-3.5 rounded-full liquid-btn-glass text-white font-semibold text-sm"
              >
                {t('plan.buy')}
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================= STATS ================= */}
      <section id="stats" className="relative bg-transparent px-5 pb-[120px] z-10">
        <div className="mx-auto w-full max-w-[1100px]">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ type: 'spring', stiffness: 220, damping: 24 }}
            className="mx-auto mb-16 max-w-[850px] text-center"
          >
            <div className="mb-4 flex items-center justify-center gap-2">
              <StarIcon />
              <h4 className="text-base font-medium text-[var(--brand-accent)]">{t('stats.eyebrow')}</h4>
            </div>
            <h2 className="text-[clamp(2.2rem,4.5vw,3.6rem)] font-semibold leading-[1.1] tracking-[-0.03em] text-[#f1f1ef]">
              {t('stats.heading')}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ type: 'spring', stiffness: 240, damping: 22, delay: 0.05 }}
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.95, y: 2 }}
              className="sadnes-card p-8 flex flex-col items-center cursor-pointer"
            >
              <span className="text-[clamp(2.8rem,5vw,4.2rem)] font-bold text-white tracking-tight">10</span>
              <span className="mt-2 text-base font-semibold bg-gradient-to-b from-white to-[var(--brand-accent)] bg-clip-text text-transparent">
                {t('stats.total')}
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ type: 'spring', stiffness: 240, damping: 22, delay: 0.15 }}
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.95, y: 2 }}
              className="sadnes-card p-6 sm:p-8 flex flex-col items-center cursor-pointer"
            >
              <div className="flex flex-col items-center">
                <span className="text-[clamp(1.5rem,2.8vw,2.4rem)] font-bold text-white tracking-tight font-mono">
                  26.10.2026
                </span>
                <span className="text-sm font-mono text-blue-400 font-semibold mt-0.5">
                  16:48 (MSK)
                </span>
              </div>
              <span className="mt-2 text-base font-semibold bg-gradient-to-b from-white to-[var(--brand-accent)] bg-clip-text text-transparent">
                {t('stats.last')}
              </span>
              <span className="mt-1 text-[11px] font-mono text-emerald-400 font-medium">
                v1.8.4 Alpha Hotfix (Active)
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ type: 'spring', stiffness: 240, damping: 22, delay: 0.25 }}
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.95, y: 2 }}
              className="sadnes-card p-8 flex flex-col items-center cursor-pointer"
            >
              <span className="text-[clamp(2.8rem,5vw,4.2rem)] font-bold text-white tracking-tight flex items-center justify-center gap-3">
                <span className="h-3 w-3 rounded-full bg-blue-500 animate-pulse"></span>
                <span>2</span>
              </span>
              <span className="mt-2 text-base font-semibold bg-gradient-to-b from-white to-[var(--brand-accent)] bg-clip-text text-transparent">
                {t('stats.online')}
              </span>
            </motion.div>
          </div>

          {/* Detailed Verification Banner for Latest Update */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ type: 'spring', stiffness: 220, damping: 24 }}
            className="mt-10 sadnes-card rounded-2xl p-5 sm:p-6 border border-blue-500/30 bg-blue-950/20 max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-400 text-2xl shrink-0 shadow-[0_0_15px_rgba(37,99,235,0.3)]">
                <i className="ph-bold ph-shield-check"></i>
              </div>
              <div className="text-left text-xs leading-relaxed">
                <div className="font-bold text-white flex flex-wrap items-center gap-2 text-sm">
                  <span>Релиз обновления: 26 октября 2026 года в 16:48 (MSK)</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-semibold border border-emerald-500/30">
                    Undetected
                  </span>
                </div>
                <div className="text-[#94a3b8] mt-1 font-mono text-[11px]">
                  Патч v1.8.4 Alpha: Полная адаптация WFP-фильтра под AnyDesk 8.1, новая чистая DHCP подсеть 192.168.178.x и фикс детекта Echo.
                </div>
              </div>
            </div>
            <a
              href="#pricing"
              className="liquid-btn-primary px-5 py-2.5 rounded-xl text-xs font-semibold text-white whitespace-nowrap shrink-0 shadow-lg"
            >
              Получить v1.8.4
            </a>
          </motion.div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-white/[0.06] bg-black/40 backdrop-blur-xl px-5 py-12 z-10">
        <div className="mx-auto flex w-full max-w-[1140px] flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-2.5 text-2xl font-bold text-[#f1f1ef]">
            <img
              src="/logo.svg"
              alt="derbin logo"
              className="h-7 w-7 object-contain drop-shadow-[0_0_10px_rgba(37,99,235,0.4)]"
            />
            <span id="footer-brand">derbin</span>
          </div>

          <span className="text-xs text-[#79787b]">
            Created by: <span className="text-[var(--brand-accent)]">omar_torrez</span> &amp;{' '}
            <span className="text-[var(--brand-accent)]">nerfchik</span>
          </span>

          <nav className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-[#79787b]">
            <a
              href="https://discord.gg/ehWheFqAu"
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-blue-400 flex items-center gap-1"
            >
              <i className="ph-bold ph-discord-logo text-blue-400"></i>
              <span>Discord</span>
            </a>
            <span className="text-white/10">•</span>
            <a
              href="#privacy"
              onClick={(e) => {
                e.preventDefault();
                showNotice('Политика: ваши данные зашифрованы и не передаются третьим лицам.');
              }}
              className="transition hover:text-white"
            >
              {t('footer.privacy')}
            </a>
            <span className="text-white/10">•</span>
            <a
              href="#terms"
              onClick={(e) => {
                e.preventDefault();
                showNotice('Согласие: софт предоставляется для тестирования защищенности игровых сред.');
              }}
              className="transition hover:text-white"
            >
              {t('footer.terms')}
            </a>
            <span className="text-white/10">•</span>
            <a
              href="#offer"
              onClick={(e) => {
                e.preventDefault();
                showNotice('Оферта: моментальная доставка цифрового ключа активации.');
              }}
              className="transition hover:text-white"
            >
              {t('footer.offer')}
            </a>
            <span className="text-white/10">•</span>
            <a
              href="#rules"
              onClick={(e) => {
                e.preventDefault();
                showNotice('Правила: запрещены декомпиляция и попытки взлома лаунчера.');
              }}
              className="transition hover:text-white"
            >
              {t('footer.rules')}
            </a>
          </nav>

          <div className="flex items-center justify-center gap-1.5 text-xs text-[#5b5b61]">
            <span>
              © 2026 <span id="copyright-brand">derbin</span>. All rights reserved.
            </span>
            {/* Inconspicuous calculator trigger button (code 333) */}
            <button
              type="button"
              onClick={() => setCalcModalOpen(true)}
              className="text-[#303632] hover:text-blue-400 transition-colors p-1 rounded opacity-50 hover:opacity-100"
              title="Калькулятор"
              aria-label="Tool"
            >
              <i className="ph-bold ph-calculator text-[12px]"></i>
            </button>
          </div>
        </div>
      </footer>

      {/* ================= MODALS & TOAST ================= */}
      <AccountModal
        isOpen={accountModalOpen}
        onClose={() => setAccountModalOpen(false)}
        firebaseUser={firebaseUser}
        profile={profile}
        isCloudSynced={Boolean(firebaseUser)}
        soundEnabled={soundEnabled}
        onGoogleSignIn={handleGoogleSignIn}
        onSignOut={handleSignOut}
        onSaveProfile={handleSaveProfile}
        onActivateLicense={handleActivateLicense}
        onResetHwid={handleResetHwid}
        onNotify={showNotice}
      />

      <CheckoutModal
        isOpen={checkoutState.open}
        onClose={() => setCheckoutState((prev) => ({ ...prev, open: false }))}
        planTitle={checkoutState.title}
        planPrice={checkoutState.price}
        planCode={checkoutState.code}
        defaultEmail={firebaseUser?.email || 'player@derbin.gg'}
        defaultNick={profile.minecraftNick}
        soundEnabled={soundEnabled}
        onCompleteOrder={async (plan, key, _email, nick) => {
          setProfile((prev) => ({ ...prev, minecraftNick: nick }));
          await handleActivateLicense(plan, key);
        }}
      />

      <CalculatorModal
        isOpen={calcModalOpen}
        onClose={() => setCalcModalOpen(false)}
        onUnlockEasterEgg={() => setEasterEggOpen(true)}
        soundEnabled={soundEnabled}
      />

      <EasterEggModal isOpen={easterEggOpen} onClose={() => setEasterEggOpen(false)} />

      <LightboxModal
        src={lightboxState.src}
        title={lightboxState.title}
        onClose={() => setLightboxState({ src: null, title: '' })}
      />

      {/* Toast Notification */}
      {toastMsg && (
        <div
          id="notice-toast"
          className="fixed bottom-6 right-6 z-50 rounded-2xl border border-white/20 bg-[#0c1427]/85 px-5 py-3.5 text-xs text-white shadow-2xl backdrop-blur-2xl transition-opacity duration-300"
        >
          <span id="toast-text">{toastMsg}</span>
        </div>
      )}
    </div>
  );
}
