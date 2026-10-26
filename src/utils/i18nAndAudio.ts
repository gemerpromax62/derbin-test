export type Lang = 'ru' | 'en';

export const translations: Record<Lang, Record<string, string>> = {
  ru: {
    'nav.home': 'Главная',
    'nav.advantages': 'Преимущества',
    'nav.preview': 'Обход',
    'nav.owners': 'Создатели',
    'nav.pricing': 'Тарифы',
    'nav.stats': 'Статистика',
    'nav.get': 'Купить',
    'nav.account': 'Аккаунт',
    'hero.badge': 'Актуальная защита и обход проверок активны',
    'hero.alpha': 'Alpha Build — возможны баги',
    'hero.title1': 'Снова получил блокировку?',
    'hero.title2': 'Надоели баны по 4.3?',
    'hero.sub1': 'Тогда тебе к нам — ',
    'hero.sub2': ' поможет обойти любую проверку.',
    'hero.ctaPrimary': 'Оформить доступ',
    'hero.ctaSecondary': 'Как это работает',
    'hero.ctaAccount': 'Регистрация / Кабинет',
    'hero.scroll': 'СКРОЛЛ ВНИЗ',
    'adv.eyebrow': 'Наши преимущества',
    'adv.heading': 'Полная безопасность, чистые логи и 0 банов по 4.3',
    'adv.c1.title': 'Иммунитет к 4.3',
    'adv.c1.desc':
      'Работа через схему двух ПК и MITM Proxy для скрытой передачи управления. Полная защита DHCP — чистейший undetect без системных следов.',
    'adv.c2.title': 'Стабильный FPS',
    'adv.c2.desc':
      'Максимальная оптимизация под любые устройства без лагов и просадок кадров — софт не может лагать в принципе. Частые регулярные обновления.',
    'adv.c3.title': '0 банов и любые проверки',
    'adv.c3.desc':
      'Недорогой клиент для любых проверок на FT, HV, SP. За первый год ни одного бана по 4.3 или нахождению! При рисках моментально всё закрываем, выпускаем хуки и патчи.',
    'tag.1': 'Полный undetect (DHCP)',
    'tag.2': 'Любые проверки: FT, HV, SP',
    'tag.3': 'MITM Proxy & схема 2 ПК',
    'tag.4': '0 банов за 1-й год продукта',
    'tag.5': 'Быстрые обновления, хуки и патчи',
    'prev.eyebrow': 'Интерактивный GUI софта',
    'prev.heading': 'Панель управления derbin v1.8',
    'prev.desc':
      'Полная интерактивная копия GUI из derbin-1.8-all.jar: переключайте вкладки, управляйте маршрутизацией 2-х ПК, настраивайте DHCP и тестируйте функционал прямо в браузере!',
    'owners.eyebrow': 'Команда проекта',
    'owners.heading': 'Создатели и разработчики derbin',
    'owners.desc':
      'Люди, которые лично разрабатывают архитектуру защиты, тестируют модули и отвечают за стабильность клиентов.',
    'owner.role1': 'Владелец / Основатель',
    'owner.bio1':
      'Руководитель проекта derbin. Разработка ядра защиты, управление развитием софта и координация обновлений.',
    'owner.role2': 'Создатель / Lead Developer',
    'owner.bio2':
      'Главный разработчик логики обхода античитов, алгоритмов оптимизации рендеринга и работы с памятью.',
    'price.eyebrow': 'Тарифные планы derbin',
    'price.heading': 'Выберите подходящий тариф',
    'price.desc':
      'Мгновенная выдача лицензионного ключа сразу после оплаты. Поддержка от omar_torrez и nerfchik.',
    'plan1.badge': 'Стартовый доступ',
    'plan1.title': 'Подписка 30 дней',
    'plan2.hit': 'ХИТ ВЫБОРА',
    'plan2.badge': 'Рекомендуемый',
    'plan2.title': 'Подписка 90 дней',
    'plan3.badge': 'Безлимит',
    'plan3.title': 'Навсегда (Lifetime)',
    'plan.buy': 'Купить подписку',
    'stats.eyebrow': 'Статистика',
    'stats.heading': 'Статистика в реальном времени',
    'stats.total': 'Пользователей всего',
    'stats.last': 'Последнее обновление',
    'stats.online': 'Сейчас в сети',
    'footer.privacy': 'Политика',
    'footer.terms': 'Согласие',
    'footer.offer': 'Оферта',
    'footer.rules': 'Правила',
  },
  en: {
    'nav.home': 'Home',
    'nav.advantages': 'Advantages',
    'nav.preview': 'Bypass UI',
    'nav.owners': 'Creators',
    'nav.pricing': 'Pricing',
    'nav.stats': 'Statistics',
    'nav.get': 'Purchase',
    'nav.account': 'Account',
    'hero.badge': 'Security patch & bypass modules active',
    'hero.alpha': 'Alpha Build — may contain bugs',
    'hero.title1': 'Banned once again?',
    'hero.title2': 'Tired of 4.3 rule bans?',
    'hero.sub1': 'Join us — ',
    'hero.sub2': ' will help you bypass any screen-check.',
    'hero.ctaPrimary': 'Get Access',
    'hero.ctaSecondary': 'How It Works',
    'hero.ctaAccount': 'Register / Account',
    'hero.scroll': 'SCROLL DOWN',
    'adv.eyebrow': 'Our Advantages',
    'adv.heading': 'Complete Security, Pristine Logs & Zero 4.3 Bans',
    'adv.c1.title': 'Immunity to 4.3',
    'adv.c1.desc':
      'Dual-PC setup with MITM Proxy for disguised input transfer. Full DHCP evasion — absolute undetect.',
    'adv.c2.title': 'Rock-Solid FPS',
    'adv.c2.desc':
      'Flawless optimization across any machine with zero stutter or lag. Regular frequent updates for total stability.',
    'adv.c3.title': 'Zero Bans & Pass Any Check',
    'adv.c3.desc':
      'Affordable bypass client for FT, HV, SP. 0 bans for 4.3 or detection across our 1st year! Instant hooks and patches at any risk.',
    'tag.1': '100% Undetect (DHCP)',
    'tag.2': 'Passes Checks: FT, HV, SP',
    'tag.3': 'MITM Proxy & Dual-PC Control',
    'tag.4': '0 Bans In 1st Product Year',
    'tag.5': 'Instant Hooks & Fast Hotfixes',
    'prev.eyebrow': 'Interactive Software GUI',
    'prev.heading': 'derbin v1.8 Control Panel',
    'prev.desc':
      'Interactive replica of derbin-1.8-all.jar: switch tabs, manage Dual-PC routing, configure DHCP and test features right in your browser!',
    'owners.eyebrow': 'Core Team',
    'owners.heading': 'Creators & Developers of derbin',
    'owners.desc':
      'The team designing security mechanics, verifying stability, and keeping the software undetected.',
    'owner.role1': 'Owner / Founder',
    'owner.bio1':
      'Project leader of derbin. Security architecture, strategic updates, and release pipelines.',
    'owner.role2': 'Creator / Lead Developer',
    'owner.bio2':
      'Lead engineer of bypass techniques, memory evasion, and runtime optimization algorithms.',
    'price.eyebrow': 'derbin Subscription Plans',
    'price.heading': 'Choose Your License',
    'price.desc':
      'Instant key dispatch right after checkout. Direct support from omar_torrez and nerfchik.',
    'plan1.badge': 'Starter Pass',
    'plan1.title': '30 Days Pass',
    'plan2.hit': 'BEST VALUE',
    'plan2.badge': 'Recommended',
    'plan2.title': '90 Days Pass',
    'plan3.badge': 'Unlimited',
    'plan3.title': 'Lifetime License',
    'plan.buy': 'Purchase License',
    'stats.eyebrow': 'Metrics',
    'stats.heading': 'Real-Time Network Statistics',
    'stats.total': 'Total Active Users',
    'stats.last': 'Last Patch Deployed',
    'stats.online': 'Players Online Now',
    'footer.privacy': 'Privacy',
    'footer.terms': 'Terms',
    'footer.offer': 'Public Offer',
    'footer.rules': 'Rules',
  },
};

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function playGuiSound(type: 'click' | 'tab' | 'success' | 'scan', enabled = true): void {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    if (type === 'click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    } else if (type === 'tab') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(660, now + 0.06);
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.06);
    } else if (type === 'success') {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now);
      osc1.frequency.setValueAtTime(659.25, now + 0.08);
      osc2.frequency.setValueAtTime(1046.5, now + 0.08);
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc1.start(now);
      osc2.start(now + 0.08);
      osc1.stop(now + 0.25);
      osc2.stop(now + 0.25);
    } else if (type === 'scan') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    }
  } catch {
    // Ignore audio context errors in headless environments
  }
}
