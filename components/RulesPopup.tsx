"use client";

import { useState, useEffect } from "react";

export default function RulesPopup() {
  const [show, setShow] = useState(false);
  const [tab, setTab] = useState<"fa" | "en">("fa");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = sessionStorage.getItem("kb_rules_seen");
    if (!seen) {
      setShow(true);
      sessionStorage.setItem("kb_rules_seen", "1");
    }
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70" onClick={() => setShow(false)} />

      {/* Modal */}
      <div className="relative w-full max-w-md max-h-[85vh] overflow-y-auto rounded-2xl bg-[#1a0f2e] border border-purple-700/40 shadow-2xl">
        {/* Close button */}
        <button
          onClick={() => setShow(false)}
          className="absolute top-3 right-3 text-purple-300/60 hover:text-white text-xl z-10 p-1"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Header */}
        <div className="text-center pt-6 pb-4 border-b border-purple-700/30 px-6">
          <div className="text-3xl mb-2">🃏</div>
          <h2 className="text-white font-bold text-lg">Khal Bala · خال بالا</h2>
        </div>

        {/* Language tabs */}
        <div className="flex border-b border-purple-700/30">
          <button
            onClick={() => setTab("fa")}
            className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
              tab === "fa" ? "text-purple-400 border-b-2 border-purple-400" : "text-purple-300/50"
            }`}
          >
            فارسی 🇮🇷
          </button>
          <button
            onClick={() => setTab("en")}
            className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
              tab === "en" ? "text-purple-400 border-b-2 border-purple-400" : "text-purple-300/50"
            }`}
          >
            English 🇺🇸
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          {tab === "fa" ? <FarsiRules /> : <EnglishRules />}
        </div>

        {/* Dismiss button */}
        <div className="px-6 pb-6">
          <button
            onClick={() => setShow(false)}
            className="btn-primary w-full text-center"
          >
            {tab === "fa" ? "بزن بریم! 🃏" : "Let's Play! 🃏"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Standalone trigger button (used in game page header)
export function RulesButton() {
  function openRules() {
    sessionStorage.removeItem("kb_rules_seen");
    window.location.reload();
  }

  return (
    <button
      onClick={openRules}
      className="text-purple-400/70 hover:text-purple-300 text-xs font-semibold flex items-center gap-1 transition-colors"
    >
      📖 Rules
    </button>
  );
}

function FarsiRules() {
  return (
    <div dir="rtl" className="text-right space-y-4 text-sm text-purple-200/90">
      <p className="font-bold text-white">🎯 نحوه بازی</p>
      <p>نتیجه دقیق هر بازی مرحله حذفی را پیش‌بینی کنید — هر چه دقیق‌تر، امتیاز بیشتر!</p>

      <p className="font-bold text-white mt-4">⚡ امتیازدهی</p>
      <div className="space-y-1.5 text-purple-200/80">
        <div className="flex justify-between"><span>⭐ نتیجه دقیق</span><span className="gold font-bold">۵ امتیاز</span></div>
        <div className="flex justify-between"><span>✅ برنده + اختلاف گل درست</span><span className="gold font-bold">۳ امتیاز</span></div>
        <div className="flex justify-between"><span>👍 فقط برنده درست</span><span className="gold font-bold">۱ امتیاز</span></div>
        <div className="flex justify-between"><span>❌ اشتباه</span><span className="text-purple-400/50">۰ امتیاز</span></div>
      </div>

      <p className="font-bold text-white mt-4">🔥 ضرایب مرحله‌ای</p>
      <div className="space-y-1.5 text-purple-200/80">
        <div className="flex justify-between"><span>یک‌شانزدهم</span><span>×۱</span></div>
        <div className="flex justify-between"><span>یک‌چهارم</span><span>×۲</span></div>
        <div className="flex justify-between"><span>نیمه‌نهایی</span><span>×۳</span></div>
        <div className="flex justify-between"><span>فینال</span><span>×۴</span></div>
      </div>

      <p className="font-bold text-white mt-4">🏆 پیش‌بینی ویژه</p>
      <div className="space-y-1.5 text-purple-200/80">
        <div className="flex justify-between"><span>🏆 قهرمان جهان</span><span className="gold font-bold">+۱۰ امتیاز</span></div>
        <div className="flex justify-between"><span>⚽ آقای گل</span><span className="gold font-bold">+۸ امتیاز</span></div>
      </div>

      <p className="text-purple-400/50 text-xs mt-4">
        پیش‌بینی‌ها قبل از شروع هر بازی قفل می‌شوند. امتیاز منفی وجود ندارد!
      </p>
    </div>
  );
}

function EnglishRules() {
  return (
    <div className="space-y-4 text-sm text-purple-200/90">
      <p className="font-bold text-white">🎯 How to Play</p>
      <p>Predict the exact score of each knockout match — the more precise your prediction, the more points you earn!</p>

      <p className="font-bold text-white mt-4">⚡ Scoring</p>
      <div className="space-y-1.5 text-purple-200/80">
        <div className="flex justify-between"><span>⭐ Exact score</span><span className="gold font-bold">5 pts</span></div>
        <div className="flex justify-between"><span>✅ Right winner + goal difference</span><span className="gold font-bold">3 pts</span></div>
        <div className="flex justify-between"><span>👍 Right winner only</span><span className="gold font-bold">1 pt</span></div>
        <div className="flex justify-between"><span>❌ Wrong</span><span className="text-purple-400/50">0 pts</span></div>
      </div>

      <p className="font-bold text-white mt-4">🔥 Knockout Multipliers</p>
      <div className="space-y-1.5 text-purple-200/80">
        <div className="flex justify-between"><span>Round of 16</span><span>×1</span></div>
        <div className="flex justify-between"><span>Quarter-finals</span><span>×2</span></div>
        <div className="flex justify-between"><span>Semi-finals</span><span>×3</span></div>
        <div className="flex justify-between"><span>Final</span><span>×4</span></div>
      </div>

      <p className="font-bold text-white mt-4">🏆 Bonus Predictions</p>
      <div className="space-y-1.5 text-purple-200/80">
        <div className="flex justify-between"><span>🏆 World Cup Champion</span><span className="gold font-bold">+10 pts</span></div>
        <div className="flex justify-between"><span>⚽ Tournament Top Scorer</span><span className="gold font-bold">+8 pts</span></div>
      </div>

      <p className="text-purple-400/50 text-xs mt-4">
        Predictions lock at kickoff. No negative points — go bold!
      </p>
    </div>
  );
}
