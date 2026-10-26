import React, { useState, useEffect } from 'react';
import {
  X,
  UserCheck,
  KeyRound,
  Shield,
  LogOut,
  RefreshCw,
  CheckCircle2,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  UserProfileData,
  GlassPresetId,
  SubscriptionPlan,
  generateDerbinLicenseKey,
} from '../utils/derbinLogic';
import { User } from '../firebase';
import { playGuiSound } from '../utils/i18nAndAudio';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  firebaseUser: User | null;
  profile: UserProfileData;
  isCloudSynced: boolean;
  soundEnabled: boolean;
  onGoogleSignIn: () => Promise<void>;
  onSignOut: () => Promise<void>;
  onSaveProfile: (updated: {
    displayName: string;
    minecraftNick: string;
    glassPreset: GlassPresetId;
    email?: string;
  }) => Promise<void>;
  onActivateLicense: (plan: SubscriptionPlan, key: string) => Promise<void>;
  onResetHwid: () => Promise<void>;
  onNotify: (msg: string) => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  firebaseUser,
  profile,
  isCloudSynced,
  soundEnabled,
  onGoogleSignIn,
  onSignOut,
  onSaveProfile,
  onActivateLicense,
  onResetHwid,
  onNotify,
}) => {
  const [tab, setTab] = useState<'profile' | 'register' | 'license' | 'firebase-guide'>('register');
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [minecraftNick, setMinecraftNick] = useState(profile.minecraftNick);
  const [emailInput, setEmailInput] = useState(firebaseUser?.email || 'player@derbin.gg');
  const [glassPreset, setGlassPreset] = useState<GlassPresetId>(profile.glassPreset);
  const [licenseInput, setLicenseInput] = useState(profile.licenseKey);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(profile.subscriptionPlan);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setDisplayName(profile.displayName);
    setMinecraftNick(profile.minecraftNick);
    setGlassPreset(profile.glassPreset);
    setLicenseInput(profile.licenseKey);
    setSelectedPlan(profile.subscriptionPlan);
    if (firebaseUser?.email) {
      setEmailInput(firebaseUser.email);
    }
  }, [profile, firebaseUser]);

  if (!isOpen) return null;

  const handleRegisterOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDisplay = displayName.trim();
    const cleanNick = minecraftNick.trim().replace(/[^a-zA-Z0-9_]/g, '');

    if (cleanDisplay.length < 2) {
      setFormError('Имя профиля должно содержать минимум 2 символа.');
      return;
    }
    if (cleanNick.length < 2 || cleanNick.length > 32) {
      setFormError('Никнейм Minecraft должен содержать от 2 до 32 латинских символов/цифр.');
      return;
    }
    if (!emailInput.includes('@')) {
      setFormError('Введите корректный E-mail адрес.');
      return;
    }

    setFormError(null);
    setIsSaving(true);
    try {
      await onSaveProfile({
        displayName: cleanDisplay,
        minecraftNick: cleanNick,
        glassPreset,
        email: emailInput.trim(),
      });
      playGuiSound('success', soundEnabled);
      setTab('profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleActivateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = licenseInput.trim();
    if (cleanKey.length < 4) {
      setFormError('Введите действительный ключ активации (минимум 4 символа).');
      return;
    }
    setFormError(null);
    setIsSaving(true);
    try {
      await onActivateLicense(selectedPlan, cleanKey);
      playGuiSound('success', soundEnabled);
    } finally {
      setIsSaving(false);
    }
  };

  const planLabels: Record<SubscriptionPlan, string> = {
    free: 'Starter Free Trial',
    '30d': 'Подписка 30 дней (349 ₽)',
    '90d': 'Подписка 90 дней (799 ₽)',
    lifetime: 'Навсегда · Lifetime (1 599 ₽)',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="account-modal-title"
    >
      <div className="ios26-glass-slab w-full max-w-2xl p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto border border-white/25">
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть окно аккаунта"
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-6 pr-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-sky-500 flex items-center justify-center text-black font-extrabold text-lg shadow-lg">
            {profile.minecraftNick.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 id="account-modal-title" className="text-xl font-bold text-white">
              Управление учётной записью derbin · Firebase Cloud
            </h3>
            <p className="text-xs text-[#b4b8c2] mt-0.5">
              {isCloudSynced && firebaseUser
                ? `Синхронизировано с Firebase Auth (${firebaseUser.email || firebaseUser.uid.slice(0, 8)})`
                : `Активный профиль: ${profile.displayName} (${profile.minecraftNick}) · Готов к облачной синхронизации`}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-1.5 p-1.5 rounded-2xl ios26-segmented-bar mb-6">
          {[
            { id: 'register', label: 'Регистрация / Профиль' },
            { id: 'profile', label: 'Обзор аккаунта' },
            { id: 'license', label: 'Лицензия & HWID' },
            { id: 'firebase-guide', label: 'Firebase Auth Инфо' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                playGuiSound('tab', soundEnabled);
                setFormError(null);
                setTab(item.id as typeof tab);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                tab === item.id
                  ? 'ios26-segmented-pill-active text-white'
                  : 'text-[#9ca3af] hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Firebase Google OAuth Banner */}
        <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/15 mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs">
            <div className="font-bold text-white flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>
                {firebaseUser
                  ? 'Облачный аккаунт Google подключен к Firestore'
                  : 'Вход в 1 клик через Google (Firebase Authentication)'}
              </span>
            </div>
            <div className="text-[#9ca3af] mt-0.5">
              {firebaseUser
                ? `UID: ${firebaseUser.uid} · Защита правил Firestore активна`
                : 'Авторизуйтесь через Google для сохранения профиля в базе данных Firebase Firestore'}
            </div>
          </div>

          {firebaseUser ? (
            <button
              type="button"
              onClick={onSignOut}
              className="ios26-btn-secondary px-4 py-2 rounded-xl text-xs font-semibold text-rose-300 flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Выйти из Firebase</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onGoogleSignIn}
              className="ios26-btn-primary px-4 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              <UserCheck className="w-4 h-4" />
              <span>Войти через Google (Firebase)</span>
            </button>
          )}
        </div>

        {formError && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-500/15 border border-rose-400/40 text-xs text-rose-200 font-medium">
            {formError}
          </div>
        )}

        {/* TAB 1: REGISTER / EDIT PROFILE */}
        {tab === 'register' && (
          <form onSubmit={handleRegisterOrUpdate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="reg-display-name" className="block text-xs font-medium text-[#b4b8c2] mb-1.5">
                  Отображаемое имя пользователя
                </label>
                <input
                  id="reg-display-name"
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Например: Omar Torrez"
                  className="ios26-input w-full px-3.5 py-2.5 text-sm"
                />
              </div>

              <div>
                <label htmlFor="reg-mc-nick" className="block text-xs font-medium text-[#b4b8c2] mb-1.5">
                  Игровой никнейм Minecraft (Dual-PC)
                </label>
                <input
                  id="reg-mc-nick"
                  type="text"
                  required
                  value={minecraftNick}
                  onChange={(e) => setMinecraftNick(e.target.value)}
                  placeholder="omar_torrez"
                  className="ios26-input w-full px-3.5 py-2.5 text-sm font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="reg-email" className="block text-xs font-medium text-[#b4b8c2] mb-1.5">
                  E-mail (изолированное хранилище PII)
                </label>
                <input
                  id="reg-email"
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="you@example.com"
                  className="ios26-input w-full px-3.5 py-2.5 text-sm"
                />
              </div>

              <div>
                <label htmlFor="reg-glass-preset" className="block text-xs font-medium text-[#b4b8c2] mb-1.5">
                  Цветовая палитра интерфейса
                </label>
                <select
                  id="reg-glass-preset"
                  value={glassPreset}
                  onChange={(e) => setGlassPreset(e.target.value as GlassPresetId)}
                  className="ios26-input w-full px-3.5 py-2.5 text-sm cursor-pointer"
                >
                  <option value="prismatic_ios26">Emerald Crystal (По умолчанию)</option>
                  <option value="amber_gold">Amber Gold (Тёплое золото)</option>
                  <option value="emerald_liquid">Derbin Emerald (Классический неон)</option>
                  <option value="obsidian_frost">Obsidian Frost (Холодный кварц)</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-[#9ca3af]">
                Данные валидируются по схеме <code className="text-emerald-400">firebase-blueprint.json</code>
              </span>
              <button
                type="submit"
                disabled={isSaving}
                className="ios26-btn-primary px-6 py-3 rounded-2xl text-xs font-bold text-white flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {isSaving ? 'Сохранение...' : 'Сохранить и зарегистрировать профиль'}
                </span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: PROFILE OVERVIEW */}
        {tab === 'profile' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                <div className="text-[#9ca3af]">Имя профиля</div>
                <div className="text-base font-bold text-white">{profile.displayName}</div>
                <div className="text-[#9ca3af] pt-1">Привязанный никнейм Minecraft</div>
                <div className="text-sm font-mono text-emerald-400">{profile.minecraftNick}</div>
              </div>

              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                <div className="text-[#9ca3af]">Активный тарифный план</div>
                <div className="text-base font-bold text-amber-300">
                  {planLabels[profile.subscriptionPlan]}
                </div>
                <div className="text-[#9ca3af] pt-1">Лицензионный ключ</div>
                <div className="text-xs font-mono text-white break-all">{profile.licenseKey}</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <div className="font-bold text-white">Статус аппаратной привязки HWID</div>
                <div className="text-[#9ca3af] mt-0.5">
                  Текущий статус:{' '}
                  <strong className="text-emerald-400 uppercase font-mono">{profile.hwidStatus}</strong> · Dual-PC
                  Gateway Ready
                </div>
              </div>
              <button
                type="button"
                onClick={onResetHwid}
                className="ios26-btn-secondary px-4 py-2 rounded-xl text-xs font-semibold text-white flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                <span>Сбросить HWID</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: LICENSE & HWID */}
        {tab === 'license' && (
          <form onSubmit={handleActivateKey} className="space-y-4">
            <div>
              <label htmlFor="lic-plan-select" className="block text-xs font-medium text-[#b4b8c2] mb-1.5">
                Выберите тариф для активации / генерации ключа
              </label>
              <div className="flex gap-2">
                <select
                  id="lic-plan-select"
                  value={selectedPlan}
                  onChange={(e) => {
                    const p = e.target.value as SubscriptionPlan;
                    setSelectedPlan(p);
                    setLicenseInput(generateDerbinLicenseKey(p));
                  }}
                  className="ios26-input w-full px-3.5 py-2.5 text-xs cursor-pointer"
                >
                  <option value="30d">Подписка 30 дней — 349 ₽</option>
                  <option value="90d">Подписка 90 дней — 799 ₽ (ХИТ)</option>
                  <option value="lifetime">Навсегда (Lifetime) — 1 599 ₽</option>
                  <option value="free">Starter Free Trial</option>
                </select>
                <button
                  type="button"
                  onClick={() => {
                    const gen = generateDerbinLicenseKey(selectedPlan);
                    setLicenseInput(gen);
                    onNotify(`Сгенерирован ключ: ${gen}`);
                  }}
                  className="ios26-btn-secondary px-4 py-2.5 rounded-xl text-xs font-semibold text-amber-300 whitespace-nowrap shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5 inline mr-1" />
                  Сгенерировать
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="lic-key-input" className="block text-xs font-medium text-[#b4b8c2] mb-1.5">
                Лицензионный ключ derbin
              </label>
              <input
                id="lic-key-input"
                type="text"
                value={licenseInput}
                onChange={(e) => setLicenseInput(e.target.value)}
                className="ios26-input w-full px-3.5 py-2.5 text-sm font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="ios26-btn-primary w-full py-3 rounded-2xl text-xs font-bold text-white flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>Активировать лицензионный ключ в профиле</span>
            </button>
          </form>
        )}

        {/* TAB 4: FIREBASE CONSOLE AUTH GUIDE */}
        {tab === 'firebase-guide' && (
          <div className="p-4 rounded-2xl bg-black/45 border border-white/10 space-y-3 text-xs text-[#d1d5db] leading-relaxed">
            <div className="font-bold text-white flex items-center gap-2 text-sm">
              <Info className="w-4 h-4 text-emerald-400" />
              <span>Архитектура Firebase Authentication &amp; Firestore</span>
            </div>
            <p>
              База данных <strong>Cloud Firestore</strong> и провайдер <strong>Google Sign-In</strong> автоматически
              развёрнуты в проекте <code className="text-emerald-400">eternal-terminus-6n2tx</code> с защищёнными
              правилами нулевого доверия (<code className="text-amber-300">firestore.rules</code>).
            </p>
            <p>
              Если вы хотите дополнительно включить вход по <strong>Email / Паролю</strong> в консоли Firebase:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-[#b4b8c2]">
              <li>Откройте консоль Firebase вашего проекта (раздел <strong>Authentication → Sign-in method</strong>).</li>
              <li>Нажмите <strong>Add new provider</strong> и выберите <strong>Email/Password</strong>.</li>
              <li>Переключите тумблер <strong>Enable</strong> и нажмите <strong>Save</strong>.</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};
