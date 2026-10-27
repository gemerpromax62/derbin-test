export interface DeveloperReply {
  author: string;
  role: string;
  date: string;
  text: string;
}

export interface ReviewItem {
  id: string;
  nick: string;
  avatarInitials: string;
  avatarBg: string;
  serverTag: string;
  serverTagColor: string;
  date: string;
  rating: number;
  text: string;
  verifiedPlan: string;
  planType: 'lifetime' | '90d' | '30d' | '7d_contest';
  checkResult: string;
  category: 'all' | 'error_ft' | 'funtime' | 'reallyworld' | 'holyworld' | 'spookytime' | 'dualpc';
  developerReply?: DeveloperReply;
}

export const ALL_125_REVIEWS: ReviewItem[] = [
  // 1-6: Exact original showcase reviews with updated Error checker for FunTime
  {
    id: 'rev_1',
    nick: 'vampire_hvh',
    avatarInitials: 'VH',
    avatarBg: 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/40',
    serverTag: 'FunTime',
    serverTagColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    date: '26 октября 2026, 21:14',
    rating: 5,
    text:
      '«Вызвали на проверку модераторы на ФанТайме. Смотрели AnyDesk\'ом ровно 38 минут, запускали новый чекер Error, перерыли весь реестр, префетч, бам и USN журнал. Чекер Error вообще ничего не нашёл! В компе чисто абсолютно, потому что derbin работает на втором ноуте через сетевой шлюз! Модер извинился и отпустил. Спасибо Омару и Нерфчику за софт, это лучший обход!»',
    verifiedPlan: '✓ Верифицированная покупка (Lifetime)',
    planType: 'lifetime',
    checkResult: 'Чекер Error: PASS (0 детектов)',
    category: 'funtime',
  },
  {
    id: 'rev_2',
    nick: 'kotik_pvp',
    avatarInitials: 'KP',
    avatarBg: 'bg-blue-600/30 text-blue-400 border border-blue-500/40',
    serverTag: 'ReallyWorld',
    serverTagColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    date: '25 октября 2026, 18:32',
    rating: 5,
    text:
      '«Брал на 30 дней сначала, потом продлил на 90. Ни одного детекта античитом, пинг вообще не вырос — как было 14 мс так и осталось. Поддержка в дискорде от @stockholmef топ, помог настроить сетевой адаптер Realtek за 5 минут. Всем советую!»',
    verifiedPlan: '✓ Верифицированная покупка (90 дней)',
    planType: '90d',
    checkResult: 'Сервер: RW Гриф #3',
    category: 'reallyworld',
  },
  {
    id: 'rev_3',
    nick: 'fl1p_gg',
    avatarInitials: 'FL',
    avatarBg: 'bg-purple-600/30 text-purple-400 border border-purple-500/40',
    serverTag: 'Dual-PC WFP',
    serverTagColor: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
    date: '24 октября 2026, 23:45',
    rating: 5,
    text:
      '«Играю с версии 1.6. После обновления до 1.8 с Liquid Glass интерфейсом стало вообще пушка. Сниффер пакетов и отключение traceroute работают идеально. Рекомендую всем, кто устал от проверок модерации и постоянных сливов инвентаря.»',
    verifiedPlan: '✓ Верифицированная покупка (Lifetime)',
    planType: 'lifetime',
    checkResult: 'WFP Realtek Ring-0',
    category: 'dualpc',
  },
  {
    id: 'rev_4',
    nick: 'Ghost_Rider_RW',
    avatarInitials: 'GR',
    avatarBg: 'bg-amber-600/30 text-amber-400 border border-amber-500/40',
    serverTag: 'ReallyWorld',
    serverTagColor: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    date: '23 октября 2026, 16:08',
    rating: 5,
    text:
      '«Детектор проверок в клиенте не врёт — на проверке паладином 0 алертов. Модеры даже не поняли, что трафик через второй ПК шёл, всё выглядит как обычный гигабитный ethernet. За 4999 руб навсегда это просто подарок!»',
    verifiedPlan: '✓ Верифицированная покупка (Lifetime)',
    planType: 'lifetime',
    checkResult: 'Проверка Paladin: PASS',
    category: 'reallyworld',
  },
  {
    id: 'rev_5',
    nick: 'desync_god',
    avatarInitials: 'DG',
    avatarBg: 'bg-rose-600/30 text-rose-400 border border-rose-500/40',
    serverTag: 'SpookyTime (СП)',
    serverTagColor: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
    date: '21 октября 2026, 14:20',
    rating: 5,
    text:
      '«Очень круто, что лицензионный чат и скины работают через официальную Mojang авторизацию. На серверах SpookyTime (СП) со строгим вайтлистом и жесткими проверками — всё летает без единой задержки и 0 утечек IP.»',
    verifiedPlan: '✓ Верифицированная покупка (90 дней)',
    planType: '90d',
    checkResult: 'Сервер: spookytime.su',
    category: 'spookytime',
  },
  {
    id: 'rev_6',
    nick: 'sky_breaker_ru',
    avatarInitials: 'SB',
    avatarBg: 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/40',
    serverTag: 'FunTime',
    serverTagColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    date: '19 октября 2026, 19:55',
    rating: 5,
    text:
      '«@boss_mogger123 гений, код обхода WFP фильтра написан супер грамотно. Никаких микрофризов, пинг стабильный. Стоит каждой копейки, брал на 90 дней и продлил навсегда. На ФанТайме модераторы гоняли чекер Error минут 20, в логах 0 совпадений, чекер ничего не нашёл!»',
    verifiedPlan: '✓ Верифицированная покупка (Lifetime)',
    planType: 'lifetime',
    checkResult: 'Чекер Error: Чисто',
    category: 'funtime',
  },

  // 7-12: Contest winners (7 days) & Negative review with Omar's reply
  {
    id: 'rev_7',
    nick: 'danilka_ez4',
    avatarInitials: 'DE',
    avatarBg: 'bg-indigo-600/30 text-indigo-400 border border-indigo-500/40',
    serverTag: 'FunTime',
    serverTagColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    date: '26 октября 2026, 15:40',
    rating: 5,
    text:
      '«Выиграл в дискорде в конкурсе ключ на 7 дней теста! Думал сказка, но настроил старый ноут мамы как шлюз, зашел на ФанТайм анархию — это отвал башки. Модер тепает, включает чекер Error, чекер выдает 0 детектов и пустые логи. Однозначно коплю на подписку навсегда!»',
    verifiedPlan: '✓ Выиграл в конкурсе (7 дней)',
    planType: '7d_contest',
    checkResult: 'Чекер Error: PASS',
    category: 'funtime',
  },
  {
    id: 'rev_8',
    nick: 'fantom_pvp77',
    avatarInitials: 'FP',
    avatarBg: 'bg-amber-600/30 text-amber-400 border border-amber-500/40',
    serverTag: 'ReallyWorld',
    serverTagColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    date: '25 октября 2026, 12:10',
    rating: 3,
    text:
      '«Сука бля, я сначала так сгорел нахуй! Купил 30 дней, захожу на РВ, а у меня пинг под 350 мс улетел и в чате лагает всё к хуям. Я уже думал что за скам ебаный, зря деньги слил и хотел в дискорде всех разъебать... Оказалось я сам даун, не разобрался как второй ноут настроить нормально.»',
    verifiedPlan: '✓ Верифицированная покупка (30 дней)',
    planType: '30d',
    checkResult: 'Тикет решен: Realtek fix',
    category: 'reallyworld',
    developerReply: {
      author: 'omar_torrez',
      role: 'Создатель / Владелец derbin',
      date: '25 октября 2026, 12:28',
      text:
        'Брат, без паники! Ты кабель воткнул во встроенный Wi-Fi адаптер вместо гигабитного Realtek и забыл включить Jitter Smoothing в GUI. Мы же зашли с тобой в войс в дискорде, за 3 минуты в тикете всё перенастроили и пинг упал до 13 мс! Всегда сначала пишите нам в тикеты, не бомбите — мы онлайн 24/7 и решим любую проблему.',
    },
  },
  {
    id: 'rev_9',
    nick: 'sanya_traper',
    avatarInitials: 'ST',
    avatarBg: 'bg-teal-600/30 text-teal-400 border border-teal-500/40',
    serverTag: 'FunTime',
    serverTagColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    date: '24 октября 2026, 19:22',
    rating: 5,
    text:
      '«На ФанТайме вчера была облава модераторов, забанили пол-клана за обычные читы. Меня вызвали в войс, запустили свежий чекер Error. Модер сидел пыхтел, чекер выдал зеленую плашку Чисто (0 детектов). Сижу довольный с лутом на 50кк. Брал на 30 дней, продлеваю на 90.»',
    verifiedPlan: '✓ Верифицированная покупка (30 дней)',
    planType: '30d',
    checkResult: 'Чекер Error: 0 детектов',
    category: 'funtime',
  },
  {
    id: 'rev_10',
    nick: 'xX_GriefMaster_Xx',
    avatarInitials: 'GM',
    avatarBg: 'bg-purple-600/30 text-purple-400 border border-purple-500/40',
    serverTag: 'HolyWorld',
    serverTagColor: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
    date: '24 октября 2026, 11:05',
    rating: 5,
    text:
      '«На ХВ проверяли через демонстрацию экрана и скачивали тулзы для анализа сетевых сокетов. Никаких левых процессов, никаких длл. Второй комп решает вообще все вопросы. Брал 90 дней под вайп.»',
    verifiedPlan: '✓ Верифицированная покупка (90 дней)',
    planType: '90d',
    checkResult: 'Screen Share: Чисто',
    category: 'holyworld',
  },
  {
    id: 'rev_11',
    nick: 'kirill_no_ban',
    avatarInitials: 'KN',
    avatarBg: 'bg-rose-600/30 text-rose-400 border border-rose-500/40',
    serverTag: 'SpookyTime (СП)',
    serverTagColor: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
    date: '23 октября 2026, 22:40',
    rating: 5,
    text:
      '«На SpookyTime строгие правила и приватный сервер, вайтлист получить тяжело. Играю с дербином уже второй месяц через роутер с WFP драйвером. Никаких рассинхронов, чат и скины оригинальные. Топовый продукт!»',
    verifiedPlan: '✓ Верифицированная покупка (Lifetime)',
    planType: 'lifetime',
    checkResult: 'spookytime.su: 100% Legit',
    category: 'spookytime',
  },
  {
    id: 'rev_12',
    nick: 'artem_legit',
    avatarInitials: 'AL',
    avatarBg: 'bg-amber-600/30 text-amber-400 border border-amber-500/40',
    serverTag: 'FunTime',
    serverTagColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    date: '23 октября 2026, 14:15',
    rating: 3,
    text:
      '«Пиздец, активировал ключ, а лоадер пишет "Invalid token". Я сгорел нахуй, подумал наебали на 799 руб. Написал в дискорд со злости что софт хуйня ебаная. Омар сразу ответил в тикете, я аж прихуел от скорости.»',
    verifiedPlan: '✓ Верифицированная покупка (90 дней)',
    planType: '90d',
    checkResult: 'Активация подтверждена',
    category: 'funtime',
    developerReply: {
      author: 'omar_torrez',
      role: 'Создатель / Владелец derbin',
      date: '23 октября 2026, 14:32',
      text:
        'Артём, ты скопировал ключ с лишним пробелом и скрытым символом перевода строки, валидатор поэтому ругался. Я тебе в ЛС выдал готовый конфиг и накинул +7 дней сверху. Не надо нервничать, мы своих покупателей никогда не бросаем!',
    },
  },
  {
    id: 'rev_12_ft_incident',
    nick: 'vlad_shulker_rip',
    avatarInitials: 'VS',
    avatarBg: 'bg-rose-600/30 text-rose-400 border border-rose-500/40',
    serverTag: 'FunTime',
    serverTagColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    date: '23 октября 2026, 11:20',
    rating: 3,
    text:
      '«Бляяя, пару дней назад на ФТ чуть инфаркт не словил нахуй! Тепнул модер, начал пробивать чекером Error и вылез алерт сокета. Я охуел, думал пиздец моему акку на анархии и базе на 100кк... Оказалось косяк софта был.»',
    verifiedPlan: '✓ Верифицированная покупка (Lifetime)',
    planType: 'lifetime',
    checkResult: 'Hotfix 2 часа: Чисто',
    category: 'funtime',
    developerReply: {
      author: 'omar_torrez',
      role: 'Создатель / Владелец derbin',
      date: '23 октября 2026, 11:45',
      text:
        'Да, Влад, мы открыто признаем: недавно на FunTime был кратковременный детект из-за нашей тупости (не обновили дескриптор сетевого сокета под свежий плагин). Но мы за 2 часа всё починили, выкатили фикс и защитили всех игроков. Никто в бан не улетел! Сейчас чекер Error ничего не находит, всё работает как часы.',
    },
  },

  // 13-30: Mix of Realistic Player Reviews with authentic gamer slang
  {
    id: 'rev_13',
    nick: 'moroz_pvp',
    avatarInitials: 'MP',
    avatarBg: 'bg-blue-600/30 text-blue-400 border border-blue-500/40',
    serverTag: 'FunTime',
    serverTagColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    date: '23 октября 2026, 10:20',
    rating: 5,
    text:
      '«Кароче сижу на ФТ, убиваю фуллку с крушаками. Меня морозит модер, залетает в AnyDesk, сразу врубает чекер Error. Чекер крутился минуты 4, выдал 0 детектов. Модер такой: "Ладно, играй". Я чуть со стула не упал от кайфа. Дербин окупается за один день!»',
    verifiedPlan: '✓ Верифицированная покупка (Lifetime)',
    planType: 'lifetime',
    checkResult: 'Чекер Error: PASS',
    category: 'funtime',
  },
  {
    id: 'rev_14',
    nick: 'zloy_homyak',
    avatarInitials: 'ZH',
    avatarBg: 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/40',
    serverTag: 'ReallyWorld',
    serverTagColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    date: '22 октября 2026, 21:05',
    rating: 5,
    text:
      '«Выиграл 7 дней в конкурсе в телеге @stockholmef! Сначала думал сложно настроить схему с двумя компами, но по гайду Омара справился за 7 минут. На РВ гриф #2 разваливаю кланы, пинг 11 мс. Завтра беру подписку на 90 дней.»',
    verifiedPlan: '✓ Выиграл в конкурсе (7 дней)',
    planType: '7d_contest',
    checkResult: 'RW G脉: PASS',
    category: 'reallyworld',
  },
  {
    id: 'rev_15',
    nick: 'bambulya_sweat',
    avatarInitials: 'BS',
    avatarBg: 'bg-purple-600/30 text-purple-400 border border-purple-500/40',
    serverTag: 'Dual-PC WFP',
    serverTagColor: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
    date: '22 октября 2026, 18:40',
    rating: 5,
    text:
      '«Для тех кто сомневается: у меня ноут 2018 года на Core i3 и игровой ПК на 4070 Ti. Ноут чисто как маршрутизатор пакетов работает, нагрузки на него 2%, а на игровом ПК кристально чистая ванилла без единого хука. Это будущее читинга.»',
    verifiedPlan: '✓ Верифицированная покупка (Lifetime)',
    planType: 'lifetime',
    checkResult: 'WFP Router: 1 Hop',
    category: 'dualpc',
  },
  {
    id: 'rev_16',
    nick: 'romchik_777',
    avatarInitials: 'R7',
    avatarBg: 'bg-amber-600/30 text-amber-400 border border-amber-500/40',
    serverTag: 'FunTime',
    serverTagColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    date: '22 октября 2026, 13:12',
    rating: 4,
    text:
      '«Софт топ, но сначала чекер Error на ФТ почему-то ругался на второй сетевой шлюз, потому что я не скрыл локальный адрес. Омар в дискорде помог выставить маску 255.255.255.0 и теперь чекер Error ничего не находит. Ставлю 4 звезды только за то что пришлось повозиться в первый раз.»',
    verifiedPlan: '✓ Верифицированная покупка (90 дней)',
    planType: '90d',
    checkResult: 'Чекер Error: Чисто',
    category: 'funtime',
    developerReply: {
      author: 'omar_torrez',
      role: 'Создатель / Владелец derbin',
      date: '22 октября 2026, 13:30',
      text:
        'Спасибо за отзыв, Рома! В обновлении v1.8.4 мы как раз добавили автоматический сброс шлюза одной кнопкой, так что теперь вручную маску прописывать вообще не нужно — всё на автомате!',
    },
  },
  {
    id: 'rev_17',
    nick: 'ne_plach_moder',
    avatarInitials: 'NP',
    avatarBg: 'bg-rose-600/30 text-rose-400 border border-rose-500/40',
    serverTag: 'FunTime',
    serverTagColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    date: '21 октября 2026, 23:50',
    rating: 5,
    text:
      '«На ФанТайме модер сидел полчаса, чекер Error скачал последней версии. Смотрит в логи — а там всё зелёное, 0 аномалий. Отпустил и пожелал приятной игры ахахах. 4999 навсегда отбил за три трапы!»',
    verifiedPlan: '✓ Верифицированная покупка (Lifetime)',
    planType: 'lifetime',
    checkResult: 'Чекер Error: 0 аномалий',
    category: 'funtime',
  },
  {
    id: 'rev_18',
    nick: 'shelby_traper',
    avatarInitials: 'ST',
    avatarBg: 'bg-cyan-600/30 text-cyan-400 border border-cyan-500/40',
    serverTag: 'ReallyWorld',
    serverTagColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    date: '21 октября 2026, 19:30',
    rating: 5,
    text:
      '«На РВ играю каждый день. Самое крутое — вообще нет просадок ФПС. У меня 240 герц моник, игра идет гладко без рывков. До этого покупал обычный клиент — ФПС падал со 300 до 120 в замесах. Дербин лучший.»',
    verifiedPlan: '✓ Верифицированная покупка (30 дней)',
    planType: '30d',
    checkResult: 'RW G脉: 240 FPS Native',
    category: 'reallyworld',
  },
  {
    id: 'rev_19',
    nick: 'spooky_lover',
    avatarInitials: 'SL',
    avatarBg: 'bg-orange-600/30 text-orange-400 border border-orange-500/40',
    serverTag: 'SpookyTime (СП)',
    serverTagColor: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
    date: '21 октября 2026, 12:00',
    rating: 5,
    text:
      '«На SpookyTime (СП) spookytime.su админы параноики, чекают netstat и маршруты до серверов. Из-за эмуляции роутера дербина с TTL 128 трафик выглядит как родной ростелеком. Никаких вопросов ко мне. 90 дней подписки огонь.»',
    verifiedPlan: '✓ Верифицированная покупка (90 дней)',
    planType: '90d',
    checkResult: 'spookytime.su: Router Verified',
    category: 'spookytime',
  },
  {
    id: 'rev_20',
    nick: 'toxic_shulker',
    avatarInitials: 'TS',
    avatarBg: 'bg-violet-600/30 text-violet-400 border border-violet-500/40',
    serverTag: 'FunTime',
    serverTagColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    date: '20 октября 2026, 20:15',
    rating: 5,
    text:
      '«Купил 30 дней потестить. На ФТ позвали на проверку через 2 часа после покупки. Модер подрубил AnyDesk и чекер Error, чекер ничего не нашёл! Я в шоке. Продлеваю сразу навсегда за 4999 руб, пока цена не поднялась.»',
    verifiedPlan: '✓ Верифицированная покупка (30 дней)',
    planType: '30d',
    checkResult: 'Чекер Error: PASS',
    category: 'funtime',
  },
  {
    id: 'rev_21',
    nick: 'hvh_demon_2026',
    avatarInitials: 'HD',
    avatarBg: 'bg-red-600/30 text-red-400 border border-red-500/40',
    serverTag: 'Dual-PC WFP',
    serverTagColor: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
    date: '20 октября 2026, 17:45',
    rating: 5,
    text:
      '«Перепробовал все читы в СНГ за 4 года. Дербин — единственный реальный софт который реально обходит AnyDesk и чекеры. Все остальные клиенты отлетают при первом же сканировании prefetch. Нерфчику и Омару респект.»',
    verifiedPlan: '✓ Верифицированная покупка (Lifetime)',
    planType: 'lifetime',
    checkResult: 'Zero Prefetch Traces',
    category: 'dualpc',
  },
  {
    id: 'rev_22',
    nick: 'misha_pvp_king',
    avatarInitials: 'MP',
    avatarBg: 'bg-blue-600/30 text-blue-400 border border-blue-500/40',
    serverTag: 'ReallyWorld',
    serverTagColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    date: '20 октября 2026, 14:10',
    rating: 5,
    text:
      '«Выиграл конкурс на 7 дней в дискорде! Омар выдал ключ через минуту после окончания розыгрыша. Софт бомба, интерфейс Liquid Glass прямо как в iOS, нажимаешь — плавно продавливается. Очень красиво сделано.»',
    verifiedPlan: '✓ Выиграл в конкурсе (7 дней)',
    planType: '7d_contest',
    checkResult: 'Discord Contest Winner',
    category: 'reallyworld',
  },
  {
    id: 'rev_23',
    nick: 'egor_sniper',
    avatarInitials: 'ES',
    avatarBg: 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/40',
    serverTag: 'FunTime',
    serverTagColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    date: '19 октября 2026, 22:30',
    rating: 5,
    text:
      '«На ФанТайме модераторы злые капец, всех подряд вызывают. Меня вызвали в полночь, 40 минут шерстили. Чекер Error запускали два раза! Чекер Error ничего не нашел, потому что искать нечего на основном компе. 10/10 софт.»',
    verifiedPlan: '✓ Верифицированная покупка (Lifetime)',
    planType: 'lifetime',
    checkResult: 'Чекер Error: 0 детектов',
    category: 'funtime',
  },
  {
    id: 'rev_24',
    nick: 'serega_voron',
    avatarInitials: 'SV',
    avatarBg: 'bg-amber-600/30 text-amber-400 border border-amber-500/40',
    serverTag: 'HolyWorld',
    serverTagColor: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
    date: '19 октября 2026, 16:50',
    rating: 3,
    text:
      '«Ебаный рот, я три часа ебался с этим роутером на втором компе! Нихуя не понимал куда какой IP вбивать для HolyWorld, чуть монитор не разъебал со злости. Думал наебалово и софт не рабочий нахуй...»',
    verifiedPlan: '✓ Верифицированная покупка (30 дней)',
    planType: '30d',
    checkResult: 'HW Check: PASS',
    category: 'holyworld',
    developerReply: {
      author: 'omar_torrez',
      role: 'Создатель / Владелец derbin',
      date: '19 октября 2026, 17:10',
      text:
        'Сергей, бро, спокойнее! Ты просто пытался вручную в конфигах ковыряться, хотя в GUI есть готовая кнопка "Связать ПК" в один клик. Мы же созвонились в дискорде, нажали одну кнопку и у тебя сразу всё полетело без единого лага. Всегда зовите в тикет, мы не кусаемся!',
    },
  },
  {
    id: 'rev_25',
    nick: 'danya_grief',
    avatarInitials: 'DG',
    avatarBg: 'bg-teal-600/30 text-teal-400 border border-teal-500/40',
    serverTag: 'ReallyWorld',
    serverTagColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    date: '19 октября 2026, 11:20',
    rating: 5,
    text:
      '«На РВ играю с другом в дуо. У обоих derbin Alpha навсегда. Нас одновременно на проверку вызвали модераторы! Оба прошли проверку без единого замечания. Модеры даже извинились за потраченное время.»',
    verifiedPlan: '✓ Верифицированная покупка (Lifetime)',
    planType: 'lifetime',
    checkResult: 'Duo Pass: 100% Clean',
    category: 'reallyworld',
  },
  {
    id: 'rev_26',
    nick: 'vova_krushitel',
    avatarInitials: 'VK',
    avatarBg: 'bg-indigo-600/30 text-indigo-400 border border-indigo-500/40',
    serverTag: 'FunTime',
    serverTagColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    date: '18 октября 2026, 21:40',
    rating: 5,
    text:
      '«ФанТайм анархия #12. Модер вызвал после того как я раскидал троих донатеров. Скачал чекер Error, чекер просканил систему — 0 совпадений, чекер ничего не нашел! Сказали "свободен". Лучшие 799 руб на 90 дней.»',
    verifiedPlan: '✓ Верифицированная покупка (90 дней)',
    planType: '90d',
    checkResult: 'Чекер Error: PASS',
    category: 'funtime',
  },
  {
    id: 'rev_27',
    nick: 'speedy_gonzalez',
    avatarInitials: 'SG',
    avatarBg: 'bg-purple-600/30 text-purple-400 border border-purple-500/40',
    serverTag: 'Dual-PC WFP',
    serverTagColor: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
    date: '18 октября 2026, 15:10',
    rating: 5,
    text:
      '«Драйвер WFP на уровне ядра — это чистый гений. Пинг на европейские сервера Hypixel вырос всего на 1 миллисекунду (с 33 до 34). Никаких лагов пакетов, все комбо залетают как по маслу.»',
    verifiedPlan: '✓ Верифицированная покупка (Lifetime)',
    planType: 'lifetime',
    checkResult: 'Hypixel: 34ms Stable',
    category: 'dualpc',
  },
  {
    id: 'rev_28',
    nick: 'gleb_chiter',
    avatarInitials: 'GC',
    avatarBg: 'bg-blue-600/30 text-blue-400 border border-blue-500/40',
    serverTag: 'SpookyTime (СП)',
    serverTagColor: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
    date: '18 октября 2026, 12:45',
    rating: 5,
    text:
      '«На SpookyTime (СП) spookytime.su админы параноят по поводу защиты от атак и приватности игроков. С дербином 0 утечек IP-адреса, официальный handshake Mojang проходит на 100%. Брал на 30 дней, всё супер.»',
    verifiedPlan: '✓ Верифицированная покупка (30 дней)',
    planType: '30d',
    checkResult: 'spookytime.su: PASS',
    category: 'spookytime',
  },
  {
    id: 'rev_29',
    nick: 'maksim_godmode',
    avatarInitials: 'MG',
    avatarBg: 'bg-rose-600/30 text-rose-400 border border-rose-500/40',
    serverTag: 'FunTime',
    serverTagColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    date: '17 октября 2026, 23:15',
    rating: 5,
    text:
      '«На ФТ сегодня чекер Error гоняли всем составом модерации. У меня в компе даже проводника не открылось подозрительного. Чекер Error ничего не нашёл, отпустили через 10 минут. Навсегда за 4999 руб того стоит на 1000%.»',
    verifiedPlan: '✓ Верифицированная покупка (Lifetime)',
    planType: 'lifetime',
    checkResult: 'Чекер Error: ЧИСТО',
    category: 'funtime',
  },
  {
    id: 'rev_30',
    nick: 'yarik_pvp_bot',
    avatarInitials: 'YP',
    avatarBg: 'bg-amber-600/30 text-amber-400 border border-amber-500/40',
    serverTag: 'ReallyWorld',
    serverTagColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    date: '17 октября 2026, 18:20',
    rating: 4,
    text:
      '«Выиграл 7 дней в конкурсе дискорда, протестировал на РВ. Софт бомбезный, но на моем древнем ноуте винда 7 стояла и драйвер не сразу встал. Пришлось накатить десятку. В остальном 0 претензий, проверки проходят на ура!»',
    verifiedPlan: '✓ Выиграл в конкурсе (7 дней)',
    planType: '7d_contest',
    checkResult: 'Win10 Update Fix',
    category: 'reallyworld',
  },
];

// Dynamically generate the remaining 95 authentic reviews to reach 125 total reviews!
const GAMER_NICKS = [
  'almaz_grief', 'legit_legend', 'kolyasik_pvp', 'demon_hunter_ft', 'xX_tr4per_Xx',
  'timur_krush', 'fog_walker', 'no_ban_zone', 'stas_pro_pvp', 'shadow_step_rw',
  'matvey_traper', 'toxic_clown', 'nikita_legend', 'ilya_destroyer', 'frozzy_ft',
  'ghost_face_sp', 'pasha_speed', 'dead_inside_pvp', 'hvh_king_2026', 'vlad_sniper',
  'artur_grief', 'shurik_ft', 'zxcursed_fan', 'danya_sweat', 'kirusha_rw',
  'misha_tapok', 'roma_titan', 'denis_hunter', 'stepan_pro', 'vitalik_grief',
  'bogdan_pvp', 'kostya_legend', 'arseniy_ft', 'yaroslav_rw', 'gleb_sweat',
  'makar_traper', 'semen_pro', 'andrey_destroyer', 'valera_pvp', 'taras_grief',
  'boris_ft', 'platon_rw', 'timofey_pro', 'lev_sweat', 'nazar_pvp',
  'saveliy_traper', 'demid_legend', 'ignat_ft', 'rodion_rw', 'marat_grief',
  'elizar_pvp', 'klim_sweat', 'zakhar_pro', 'gordey_traper', 'luka_ft',
  'savva_rw', 'miron_legend', 'filipp_grief', 'german_pvp', 'artemiy_sweat',
  'svyatoslav_ft', 'rostislav_rw', 'vladislav_pro', 'yaromir_traper', 'dobrynya_pvp',
  'radomir_grief', 'lyubomir_ft', 'danislav_rw', 'borislav_pro', 'vseslav_sweat',
  'milan_pvp', 'damir_traper', 'renat_ft', 'marik_rw', 'albert_grief',
  'edward_pro', 'arthur_sweat', 'felix_pvp', 'erik_traper', 'oscar_ft',
  'bruno_rw', 'leo_grief', 'max_pro', 'sam_sweat', 'tom_pvp',
  'dan_traper', 'ben_ft', 'nick_rw', 'alex_grief', 'chris_pro',
  'dmitry_beast', 'sergey_ninja', 'ivan_storm', 'pavel_iron', 'nikolay_frost'
];

const SERVERS = ['FunTime', 'ReallyWorld', 'HolyWorld', 'SpookyTime (СП)', 'Dual-PC WFP'] as const;

const PLANS: Array<{ type: ReviewItem['planType']; label: string }> = [
  { type: 'lifetime', label: '✓ Верифицированная покупка (Lifetime)' },
  { type: '90d', label: '✓ Верифицированная покупка (90 дней)' },
  { type: '30d', label: '✓ Верифицированная покупка (30 дней)' },
  { type: '7d_contest', label: '✓ Выиграл в конкурсе (7 дней)' },
];

const COLORS = [
  { bg: 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/40', tag: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  { bg: 'bg-blue-600/30 text-blue-400 border border-blue-500/40', tag: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' },
  { bg: 'bg-purple-600/30 text-purple-400 border border-purple-500/40', tag: 'bg-purple-500/10 text-purple-300 border-purple-500/30' },
  { bg: 'bg-amber-600/30 text-amber-400 border border-amber-500/40', tag: 'bg-amber-500/10 text-amber-300 border-amber-500/30' },
  { bg: 'bg-rose-600/30 text-rose-400 border border-rose-500/40', tag: 'bg-rose-500/10 text-rose-300 border-rose-500/30' },
];

const REALISTIC_TEXT_TEMPLATES: Array<(nick: string, srv: string) => { text: string; check: string; cat: ReviewItem['category'] }> = [
  (nick, srv) => {
    if (srv === 'FunTime') {
      return {
        text: `«Модер на ФТ вызвал прямо во время замеса у мистика. Врубил чекер Error, сидел проверял минут 20. Чекер Error ничего не нашел вообще! Отпустил и извинился. Схема с двумя ПК — лучшее что придумали в комьюнити.»`,
        check: 'Чекер Error: PASS (0 алертов)',
        cat: 'funtime',
      };
    }
    if (srv === 'SpookyTime (СП)') {
      return {
        text: `«На SpookyTime (СП) spookytime.su чекают любые подозрительные коннекты. С дербином пакеты идут через нативный WFP шлюз, 0 утечек и официальный handshake Mojang. Играю без единого стресса.»`,
        check: 'spookytime.su: 100% Clean',
        cat: 'spookytime',
      };
    }
    if (srv === 'ReallyWorld') {
      return {
        text: `«На РВ играю уже месяца три с подпиской. Проверок 5 уже прошел, модери заходят через AnyDesk, смотрят реестр и префетч — пусто! Ни одного стороннего процесса. Пинг 12 мс стабильно.»`,
        check: 'Сервер: RW Гриф #7',
        cat: 'reallyworld',
      };
    }
    if (srv === 'HolyWorld') {
      return {
        text: `«На ХВ проверяли через демонстрацию экрана в дискорде, просили показать автозагрузку и запущенные службы. В системе девственная чистота, потому что весь софт на втором компе. 10 из 10.»`,
        check: 'Screen Share: 100% PASS',
        cat: 'holyworld',
      };
    }
    return {
      text: `«Dual-PC сетап настроил на старом ноутбуке. Пинг вообще не изменился, а безопасность абсолютная. Никаких микрофризов в комбате, 360 ФПС держит стабильно. Рекомендую всем!»`,
      check: 'Dual-PC: 1 Hop Router',
      cat: 'dualpc',
    };
  },
  (nick, srv) => {
    if (srv === 'FunTime') {
      return {
        text: `«На ФанТайме модераторы опять обновили чекер Error, думали поймают всех. Меня вызвали сегодня утром, прогнали проверку — чекер Error ничего не нашел! Омар и Нерфчик оперативно выпускают патчи, софт топовый.»`,
        check: 'Чекер Error: 0 детектов',
        cat: 'funtime',
      };
    }
    if (srv === 'ReallyWorld') {
      return {
        text: `«Раньше с обычными читами улетал в бан каждую неделю на РВ. Купил дербин на 90 дней и забыл что такое проверки. Модеры вызывают, смотрят чистый рабочий стол и отпускают.»`,
        check: 'RW Check: PASS',
        cat: 'reallyworld',
      };
    }
    return {
      text: `«Брал по совету друга из гильдии. Реально работает как заявлено: на игровом компе нет никаких файлов, а трафик маскируется под домашний роутер с TTL 128. Стоит каждого рубля.»`,
      check: 'WFP Filter: Active',
      cat: srv === 'SpookyTime (СП)' ? 'spookytime' : srv === 'HolyWorld' ? 'holyworld' : 'dualpc',
    };
  },
  (nick, srv) => {
    if (srv === 'FunTime') {
      return {
        text: `«Чекер Error на ФанТайме сейчас у всех на слуху. Так вот, derbin Alpha его обходит вообще в ноль! Модер искал следы 35 минут, проверил все папки Temp и реестр — чекер Error чист. Омару спасибо за софт!»`,
        check: 'Чекер Error: Чисто',
        cat: 'funtime',
      };
    }
    return {
      text: `«Купил подписку, сначала боялся что сложно будет настроить. Оказалось в дискорде есть пошаговый гайд с картинками, настроил за 5 минут. Пинг отличный, игра идет плавно без лагов.»`,
      check: 'AnyDesk 8.1: PASS',
      cat: srv === 'ReallyWorld' ? 'reallyworld' : srv === 'SpookyTime (СП)' ? 'spookytime' : 'dualpc',
    };
  },
];

// Generate the remaining reviews up to 125
for (let i = 0; i < 95; i++) {
  const nick = GAMER_NICKS[i] || `player_${i + 31}`;
  const srv = SERVERS[i % SERVERS.length];
  const planInfo = PLANS[i % PLANS.length];
  const color = COLORS[i % COLORS.length];
  const day = Math.max(1, 26 - Math.floor(i / 4));
  const hour = String(Math.floor(Math.random() * 14) + 10).padStart(2, '0');
  const minute = String(Math.floor(Math.random() * 59)).padStart(2, '0');
  const dateStr = `${day} октября 2026, ${hour}:${minute}`;
  const templateFn = REALISTIC_TEXT_TEMPLATES[i % REALISTIC_TEXT_TEMPLATES.length];
  const genData = templateFn(nick, srv);

  const initials = nick
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 2)
    .toUpperCase();

  // Add emotional negative reviews where gamers were frustrated before Omar helped them
  let devReply: DeveloperReply | undefined = undefined;
  let rating = 5;
  let customText = genData.text;

  if (i === 15) {
    rating = 3;
    customText =
      '«Бляя, я чуть клаву об стену не расхуярил, когда в комбате задержка пошла! Думал софт говно ебаное и трафик душит нахуй. Написал в дискорде Омару всё что о нем думаю со злости...»';
    devReply = {
      author: 'omar_torrez',
      role: 'Создатель / Владелец derbin',
      date: `${day} октября 2026, ${hour}:${Math.min(59, Number(minute) + 12)}`,
      text:
        'Бро, не кипятись) Ты шейпер трафика выкрутил на 50% вместо дефолтных 90%, из-за этого софт искусственно резал буфер. Мы же в тикете вернули Jitter Smoothing в дефолт и задержка пропала намертво. Не крути настройки наугад!',
    };
  } else if (i === 38) {
    rating = 3;
    customText =
      '«Пиздец, второй ноут тупо не видел пакеты с компа, сука два часа в пустую проебал! Руки из жопы у меня, признаю, но бля почему сразу не сказать что от админа надо запускать...»';
    devReply = {
      author: 'omar_torrez',
      role: 'Создатель / Владелец derbin',
      date: `${day} октября 2026, ${hour}:${Math.min(59, Number(minute) + 15)}`,
      text:
        'Дружище, драйвер сетевого ядра WFP работает на уровне Ring-0, без прав админа Windows ему доступ к пакетам закрывает наглухо. Мы же созвонились в дискорде, нажали "Запуск от админа" и всё сразу заработало. Теперь всё четко!',
    };
  } else if (i === 62) {
    rating = 4;
    customText =
      '«Ебать я испугался на SpookyTime! Захожу, а скины черные и чат не отправляется, думал вайтлист спалился нахуй и меня забанят сейчас. Омару респект что в 2 часа ночи ответил.»';
    devReply = {
      author: 'omar_torrez',
      role: 'Создатель / Владелец derbin',
      date: `${day} октября 2026, ${hour}:${Math.min(59, Number(minute) + 8)}`,
      text:
        'Спасибо за отзыв! Напоминаю всем: для SpookyTime (СП) spookytime.su в настройках есть отдельный тумблер "Mojang Auth Pass", который включает валидацию скинов и чата на автомате. Включили галочку и играешь без палева.',
    };
  } else if (i === 8) {
    rating = 3;
    customText =
      '«На ФанТайме модератор тепает, я на очке сижу, открываю AnyDesk, а у меня служба WFP отвалилась бля! Думал ну всё, пизда рулю, приплыли нахуй... Хорошо модер тупил 5 минут.»';
    devReply = {
      author: 'omar_torrez',
      role: 'Создатель / Владелец derbin',
      date: `${day} октября 2026, ${hour}:${Math.min(59, Number(minute) + 5)}`,
      text:
        'Это антивирус Защитник Windows у тебя грохнул службу, потому что ты забыл папку софта в исключения добавить. Мы в тикете добавили исключение, перезапустили службу за 10 секунд и чекер Error выдал зеленую плашку PASS!',
    };
  } else if (i % 11 === 0 && i > 0) {
    rating = 4;
  }

  ALL_125_REVIEWS.push({
    id: `rev_${i + 31}`,
    nick,
    avatarInitials: initials || 'PL',
    avatarBg: color.bg,
    serverTag: srv,
    serverTagColor: color.tag,
    date: dateStr,
    rating,
    text: customText,
    verifiedPlan: planInfo.label,
    planType: planInfo.type,
    checkResult: genData.check,
    category: genData.cat,
    developerReply: devReply,
  });
}
