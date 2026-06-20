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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.75)" }}>
      {/* Backdrop tap to close */}
      <div className="absolute inset-0" onClick={() => setShow(false)} />

      {/* Modal */}
      <div
        className="relative w-full max-w-md bg-surface border border-surface-border shadow-card overflow-hidden"
        style={{ borderRadius: "1.25rem", maxHeight: "80vh", display: "flex", flexDirection: "column" }}
      >
        {/* Close button */}
        <button
          onClick={() => setShow(false)}
          className="absolute top-3 right-3 text-muted hover:text-ink-text text-xl z-10 p-1"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Header */}
        <div style={{ textAlign: "center", padding: "20px 24px 12px", borderBottom: "1px solid #332940", flexShrink: 0 }}>
          <h2 className="text-gold font-bold text-lg">Khal Bala · خال بالا</h2>
        </div>

        {/* Language tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid #332940", flexShrink: 0 }}>
          <button
            onClick={() => setTab("fa")}
            style={{
              flex: 1, padding: "10px", fontSize: "14px", fontWeight: 600, background: "none", border: "none", cursor: "pointer",
              color: tab === "fa" ? "#E8B74A" : "#8A8290",
              borderBottom: tab === "fa" ? "2px solid #E8B74A" : "2px solid transparent",
            }}
          >
            فارسی 🇮🇷
          </button>
          <button
            onClick={() => setTab("en")}
            style={{
              flex: 1, padding: "10px", fontSize: "14px", fontWeight: 600, background: "none", border: "none", cursor: "pointer",
              color: tab === "en" ? "#E8B74A" : "#8A8290",
              borderBottom: tab === "en" ? "2px solid #E8B74A" : "2px solid transparent",
            }}
          >
            English 🇺🇸
          </button>
        </div>

        {/* Scrollable content */}
        <div style={{ overflowY: "auto", flex: 1, padding: "20px 24px" }}>
          {tab === "fa" ? <FarsiRules /> : <EnglishRules />}
        </div>

        {/* Fixed footer button — ALWAYS visible */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid #332940", flexShrink: 0 }}>
          <button
            onClick={() => setShow(false)}
            className="btn-primary w-full text-center"
            style={{ borderRadius: "12px", padding: "14px" }}
          >
            {tab === "fa" ? "!بزن بریم" : "Let's Play!"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function RulesButton() {
  function openRules() {
    sessionStorage.removeItem("kb_rules_seen");
    window.location.reload();
  }

  return (
    <button
      onClick={openRules}
      className="text-muted hover:text-gold text-xs font-semibold flex items-center gap-1 transition-colors"
    >
      📖 Rules
    </button>
  );
}

function FarsiRules() {
  return (
    <div dir="rtl" className="text-right space-y-4 text-sm" style={{ color: "#F2EDE4" }}>
      <p style={{ fontWeight: 700, color: "#E8B74A" }}>🎯 نحوه بازی</p>
      <p>نتیجه دقیق هر بازی مرحله حذفی را پیش‌بینی کنید — هر چه دقیق‌تر، امتیاز بیشتر!</p>

      <p style={{ fontWeight: 700, color: "#E8B74A", marginTop: "16px" }}>⚡ امتیازدهی</p>
      <div className="space-y-1.5" style={{ color: "#ddd" }}>
        <div className="flex justify-between"><span>⭐ نتیجه دقیق</span><span style={{ color: "#E8B74A", fontWeight: 700 }}>۵ امتیاز</span></div>
        <div className="flex justify-between"><span>✅ برنده + اختلاف گل درست</span><span style={{ color: "#E8B74A", fontWeight: 700 }}>۳ امتیاز</span></div>
        <div className="flex justify-between"><span>👍 فقط برنده درست</span><span style={{ color: "#E8B74A", fontWeight: 700 }}>۱ امتیاز</span></div>
        <div className="flex justify-between"><span>❌ اشتباه</span><span style={{ color: "#8A8290" }}>۰ امتیاز</span></div>
      </div>

      <p style={{ fontWeight: 700, color: "#E8B74A", marginTop: "16px" }}>🔥 ضرایب مرحله‌ای</p>
      <div className="space-y-1.5" style={{ color: "#ddd" }}>
        <div className="flex justify-between"><span>یک‌شانزدهم</span><span>×۱</span></div>
        <div className="flex justify-between"><span>یک‌چهارم</span><span>×۲</span></div>
        <div className="flex justify-between"><span>نیمه‌نهایی</span><span>×۳</span></div>
        <div className="flex justify-between"><span>فینال</span><span>×۴</span></div>
      </div>

      <p style={{ fontWeight: 700, color: "#E8B74A", marginTop: "16px" }}>🏆 پیش‌بینی ویژه</p>
      <div className="space-y-1.5" style={{ color: "#ddd" }}>
        <div className="flex justify-between"><span>🏆 قهرمان جهان</span><span style={{ color: "#E8B74A", fontWeight: 700 }}>+۱۰ امتیاز</span></div>
        <div className="flex justify-between"><span>⚽ آقای گل</span><span style={{ color: "#E8B74A", fontWeight: 700 }}>+۸ امتیاز</span></div>
      </div>

      <p style={{ color: "#8A8290", fontSize: "12px", marginTop: "16px" }}>
        پیش‌بینی‌ها قبل از شروع هر بازی قفل می‌شوند. امتیاز منفی وجود ندارد!
      </p>
    </div>
  );
}

function EnglishRules() {
  return (
    <div className="space-y-4 text-sm" style={{ color: "#F2EDE4" }}>
      <p style={{ fontWeight: 700, color: "#E8B74A" }}>🎯 How to Play</p>
      <p>Predict the exact score of each knockout match — the more precise your prediction, the more points you earn!</p>

      <p style={{ fontWeight: 700, color: "#E8B74A", marginTop: "16px" }}>⚡ Scoring</p>
      <div className="space-y-1.5" style={{ color: "#ddd" }}>
        <div className="flex justify-between"><span>⭐ Exact score</span><span style={{ color: "#E8B74A", fontWeight: 700 }}>5 pts</span></div>
        <div className="flex justify-between"><span>✅ Right winner + goal difference</span><span style={{ color: "#E8B74A", fontWeight: 700 }}>3 pts</span></div>
        <div className="flex justify-between"><span>👍 Right winner only</span><span style={{ color: "#E8B74A", fontWeight: 700 }}>1 pt</span></div>
        <div className="flex justify-between"><span>❌ Wrong</span><span style={{ color: "#8A8290" }}>0 pts</span></div>
      </div>

      <p style={{ fontWeight: 700, color: "#E8B74A", marginTop: "16px" }}>🔥 Knockout Multipliers</p>
      <div className="space-y-1.5" style={{ color: "#ddd" }}>
        <div className="flex justify-between"><span>Round of 16</span><span>×1</span></div>
        <div className="flex justify-between"><span>Quarter-finals</span><span>×2</span></div>
        <div className="flex justify-between"><span>Semi-finals</span><span>×3</span></div>
        <div className="flex justify-between"><span>Final</span><span>×4</span></div>
      </div>

      <p style={{ fontWeight: 700, color: "#E8B74A", marginTop: "16px" }}>🏆 Bonus Predictions</p>
      <div className="space-y-1.5" style={{ color: "#ddd" }}>
        <div className="flex justify-between"><span>🏆 World Cup Champion</span><span style={{ color: "#E8B74A", fontWeight: 700 }}>+10 pts</span></div>
        <div className="flex justify-between"><span>⚽ Tournament Top Scorer</span><span style={{ color: "#E8B74A", fontWeight: 700 }}>+8 pts</span></div>
      </div>

      <p style={{ color: "#8A8290", fontSize: "12px", marginTop: "16px" }}>
        Predictions lock at kickoff. No negative points — go bold!
      </p>
    </div>
  );
}
