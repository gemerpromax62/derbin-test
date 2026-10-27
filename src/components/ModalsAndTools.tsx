import React, { useState } from 'react';
import { X, Lock, Check, ArrowRight, Calculator, Sparkles, Image as ImageIcon, Download } from 'lucide-react';
import {
  SubscriptionPlan,
  evaluateCalculatorExpression,
  generateDerbinLicenseKey,
} from '../utils/derbinLogic';
import { playGuiSound } from '../utils/i18nAndAudio';

/* ================= 1. CHECKOUT MODAL ================= */
interface CheckoutModalProps {
  isOpen: boolean;
  planTitle: string;
  planPrice: string;
  planCode: SubscriptionPlan;
  defaultEmail: string;
  defaultNick: string;
  soundEnabled: boolean;
  onClose: () => void;
  onCompleteOrder: (plan: SubscriptionPlan, key: string, email: string, nick: string) => Promise<void>;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  planTitle,
  planPrice,
  planCode,
  defaultEmail,
  defaultNick,
  soundEnabled,
  onClose,
  onCompleteOrder,
}) => {
  const [payMethod, setPayMethod] = useState<'card' | 'crypto'>('card');
  const [email, setEmail] = useState(defaultEmail);
  const [nick, setNick] = useState(defaultNick);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim().includes('@')) {
      setErrorMsg('Пожалуйста, укажите корректный E-mail.');
      return;
    }
    if (nick.trim().length < 2) {
      setErrorMsg('Укажите ваш игровой никнейм (минимум 2 символа).');
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);
    playGuiSound('click', soundEnabled);

    await new Promise((r) => setTimeout(r, 350));
    const newKey = generateDerbinLicenseKey(planCode);
    await onCompleteOrder(planCode, newKey, email.trim(), nick.trim());
    setGeneratedKey(newKey);
    setIsSubmitting(false);
    playGuiSound('success', soundEnabled);
  };

  const handleClose = () => {
    setGeneratedKey(null);
    setErrorMsg(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-modal-title"
    >
      <div className="ios26-glass-slab w-full max-w-md p-6 sm:p-8 relative border border-white/25">
        <button
          type="button"
          onClick={handleClose}
          aria-label="Закрыть оформление заказа"
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="h-11 w-11 rounded-2xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 id="checkout-modal-title" className="text-lg font-bold text-white">
              Оформление заказа derbin
            </h3>
            <p className="text-xs text-[#b4b8c2]">{planTitle}</p>
          </div>
        </div>

        {!generatedKey ? (
          <>
            {/* Payment Method Selector (Card / Crypto) */}
            <div className="grid grid-cols-2 gap-1.5 p-1.5 rounded-2xl ios26-segmented-bar mb-5 text-xs font-semibold">
              {(
                [
                  { id: 'card', label: 'Карта / СБП' },
                  { id: 'crypto', label: 'USDT (Криптовалюта)' },
                ] as const
              ).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPayMethod(m.id)}
                  className={`py-2 rounded-xl transition ${
                    payMethod === m.id
                      ? 'ios26-segmented-pill-active text-white'
                      : 'text-[#9ca3af] hover:text-white'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-400/40 text-xs text-rose-200">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="checkout-email" className="block text-xs text-[#b4b8c2] mb-1.5">
                  Ваш E-mail (для ключа derbin и чека)
                </label>
                <input
                  id="checkout-email"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@mail.ru"
                  className="ios26-input w-full px-4 py-3 text-sm"
                />
              </div>

              <div>
                <label htmlFor="checkout-nick" className="block text-xs text-[#b4b8c2] mb-1.5">
                  Никнейм в игре / лаунчере
                </label>
                <input
                  id="checkout-nick"
                  required
                  type="text"
                  value={nick}
                  onChange={(e) => setNick(e.target.value)}
                  placeholder="Ваш игровой ник"
                  className="ios26-input w-full px-4 py-3 text-sm font-mono"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/10 text-sm">
                <span className="text-[#b4b8c2]">Итого к оплате:</span>
                <span className="text-lg font-extrabold text-white font-mono tabular-nums">{planPrice}</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl ios26-btn-primary text-white font-bold text-sm flex items-center justify-center gap-2"
              >
                <span>{isSubmitting ? 'Обработка транзакции...' : 'Перейти к оплате и получить ключ'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-4 space-y-4">
            <div className="w-14 h-14 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 flex items-center justify-center mx-auto">
              <Check className="w-7 h-7" />
            </div>
            <h4 className="text-lg font-bold text-white">Заказ успешно сформирован!</h4>
            <p className="text-xs text-[#b4b8c2] leading-relaxed">
              Ключ активации derbin привязан к вашему профилю и отправлен на <strong>{email}</strong>:
            </p>
            <div className="p-3.5 rounded-xl bg-black/60 border border-blue-400/40 font-mono text-sm font-bold text-blue-300 select-all">
              {generatedKey}
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2.5 rounded-xl ios26-btn-secondary text-xs font-bold text-white"
            >
              Готово
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ================= 2. CALCULATOR MODAL (SECRET 333 EASTER EGG TRIGGER) ================= */
interface CalculatorModalProps {
  isOpen: boolean;
  soundEnabled: boolean;
  onClose: () => void;
  onUnlockEasterEgg: () => void;
}

export const CalculatorModal: React.FC<CalculatorModalProps> = ({
  isOpen,
  soundEnabled,
  onClose,
  onUnlockEasterEgg,
}) => {
  const [expr, setExpr] = useState('');
  const [history, setHistory] = useState('');
  const [evaluated, setEvaluated] = useState(false);

  if (!isOpen) return null;

  const handleInput = (char: string) => {
    playGuiSound('click', soundEnabled);
    let next = expr;
    if (evaluated && !['+', '-', '*', '/', '%'].includes(char)) {
      next = '';
    }
    setEvaluated(false);
    if (next.length >= 24) return;
    next += char;
    setExpr(next);

    if (['333', '222', '111'].includes(next.trim())) {
      playGuiSound('success', soundEnabled);
      setTimeout(() => {
        onClose();
        onUnlockEasterEgg();
      }, 120);
    }
  };

  const handleEquals = () => {
    const res = evaluateCalculatorExpression(expr);
    setHistory(`${expr} =`);
    setExpr(res.result);
    setEvaluated(true);
    if (res.isEasterEgg) {
      playGuiSound('success', soundEnabled);
      setTimeout(() => {
        onClose();
        onUnlockEasterEgg();
      }, 120);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
      role="dialog"
      aria-modal="true"
      aria-label="Калькулятор"
    >
      <div className="ios26-glass-slab w-full max-w-[320px] p-5 relative border border-white/25">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <Calculator className="w-4 h-4 text-blue-400" />
            <span>Калькулятор</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть калькулятор"
            className="text-[#9ca3af] hover:text-white p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-black/65 border border-white/15 rounded-2xl p-3.5 mb-3.5 text-right">
          <div className="text-[11px] text-[#9ca3af] font-mono h-4 truncate">{history}</div>
          <div
            data-testid="calc-display"
            className="text-3xl font-mono font-bold text-white tracking-wider overflow-x-auto whitespace-nowrap tabular-nums"
          >
            {expr || '0'}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 text-sm font-mono font-bold">
          <button
            type="button"
            onClick={() => {
              setExpr('');
              setHistory('');
            }}
            className="py-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 transition"
          >
            C
          </button>
          <button
            type="button"
            onClick={() => setExpr((prev) => prev.slice(0, -1))}
            className="py-3 rounded-xl bg-white/10 hover:bg-white/15 text-[#d1d5db] transition"
          >
            ⌫
          </button>
          <button
            type="button"
            onClick={() => handleInput('%')}
            className="py-3 rounded-xl bg-white/10 hover:bg-white/15 text-blue-300 transition"
          >
            %
          </button>
          <button
            type="button"
            onClick={() => handleInput('/')}
            className="py-3 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 transition"
          >
            ÷
          </button>

          {['7', '8', '9'].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => handleInput(n)}
              className="py-3 rounded-xl bg-white/5 hover:bg-white/15 text-white transition"
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            onClick={() => handleInput('*')}
            className="py-3 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 transition"
          >
            ×
          </button>

          {['4', '5', '6'].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => handleInput(n)}
              className="py-3 rounded-xl bg-white/5 hover:bg-white/15 text-white transition"
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            onClick={() => handleInput('-')}
            className="py-3 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 transition"
          >
            −
          </button>

          {['1', '2', '3'].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => handleInput(n)}
              className="py-3 rounded-xl bg-white/5 hover:bg-white/15 text-white transition"
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            onClick={() => handleInput('+')}
            className="py-3 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 transition"
          >
            +
          </button>

          <button
            type="button"
            onClick={() => handleInput('0')}
            className="col-span-2 py-3 rounded-xl bg-white/5 hover:bg-white/15 text-white transition"
          >
            0
          </button>
          <button
            type="button"
            onClick={() => handleInput('.')}
            className="py-3 rounded-xl bg-white/5 hover:bg-white/15 text-white transition"
          >
            .
          </button>
          <button
            type="button"
            onClick={handleEquals}
            className="py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold transition"
          >
            =
          </button>
        </div>
      </div>
    </div>
  );
};

/* ================= 3. EASTER EGG MODAL ================= */
export const EasterEggModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl"
      role="dialog"
      aria-modal="true"
      aria-label="Секретная пасхалка"
    >
      <div className="ios26-glass-slab w-full max-w-lg p-6 text-center relative border-2 border-blue-400/60">
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть пасхалку"
          className="absolute top-4 right-4 text-[#9ca3af] hover:text-white p-2 rounded-full hover:bg-white/10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mb-4 inline-flex items-center gap-2 text-blue-300 text-xs font-bold">
          <Sparkles className="w-4 h-4" />
          <span>Секретная пасхалка (код 333) активирована!</span>
        </div>

        <div className="rounded-2xl overflow-hidden border border-white/15 bg-black/60 p-3">
          <img
            src="/assets/aistudio/Screenshot_2026-10-26-19-41-41-217_com.google.android.googlequicksearchbox_34ff3d8b.jpg"
            alt="Secret iOS 26 Liquid Glass Artifact"
            referrerPolicy="no-referrer"
            className="w-full max-h-[52vh] object-contain rounded-xl mx-auto"
          />
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-[#b4b8c2]">
          <span className="text-blue-400 font-mono">Easter Egg Unlocked · DRB-333-VIP</span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold transition"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};

/* ================= 4. LIGHTBOX MODAL ================= */
export const LightboxModal: React.FC<{
  src: string | null;
  title: string;
  onClose: () => void;
}> = ({ src, title, onClose }) => {
  if (!src) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="ios26-glass-slab max-w-4xl w-full p-5 sm:p-6 border border-white/25">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <ImageIcon className="w-4 h-4 text-blue-400" />
            <span>{title}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть просмотр изображения"
            className="text-[#9ca3af] hover:text-white p-1.5 rounded-lg hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/80 flex items-center justify-center max-h-[72vh] p-2">
          <img
            src={src}
            alt={title}
            referrerPolicy="no-referrer"
            className="w-full h-auto max-h-[68vh] object-contain rounded-xl"
          />
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-[#9ca3af]">
          <span className="text-blue-400 font-mono">Full HD Resolution Available</span>
          <div className="flex items-center gap-2">
            <a
              href={src}
              download={src.split('/').pop() || 'derbin_image'}
              className="px-4 py-1.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold flex items-center gap-1.5 transition shadow-md shadow-blue-500/20"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Скачать в Full HD</span>
            </a>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition"
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
