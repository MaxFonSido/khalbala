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
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <div style={{ position: "absolute", inset: 0 }} onClick={() => setShow(false)} />

      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "420px",
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          background: "#211A2A",
          border: "1px solid #332940",
          borderRadius: "1.25rem",
          boxShadow: "0 4px 30px rgba(0,0,0,0.6)",
          overflow: "hidden",
        }}
      >
        {/* ✕ close — top right */}
        <button
          onClick={() => setShow(false)}
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            background: "none",
            border: "none",
            color: "#8A8290",
            fontSize: "20px",
            cursor: "pointer",
            zIndex: 10,
            padding: "4px",
          }}
          aria-label="Close"
        >
          ✕
        </button>

        {/* Header — gold title with pulse animation */}
        <div style={{ textAlign: "center", padding: "20px 24px 12px", borderBottom: "1px solid #332940", flexShrink: 0 }}>
          <h2 className="gold-pulse" style={{ color: "#E8B74A", fontWeight: 700, fontSize: "18px", margin: 0 }}>
            Khal Bala · خال بالا
          </h2>
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

        {/* CTA */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid #332940", flexShrink: 0 }}>
          <button
            onClick={() => setShow(false)}
            style={{
              width: "100%",
              background: "#E8B74A",
              color: "#412402",
              fontWeight: 700,
              fontSize: "15px",
              border: "none",
              borderRadius: "12px",
              padding: "14px",
              cursor: "pointer",
            }}
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

/* ─── Farsi Rules ─── */
function FarsiRules() {
  return (
    <div dir="rtl" style={{ textAlign: "right", color: "#F2EDE4", fontSize: "14px" }}>

      {/* 🏆 Bonus — FIRST */}
      <p style={{ fontWeight: 700, color: "#E8B74A" }}>🏆 پیش‌بینی ویژه</p>
      <div style={{ marginTop: "8px", color: "#ddd" }}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
          <span>🏆 قهرمان جهان</span>
          <span style={{ color: "#E8B74A", fontWeight: 700 }}>+۱۱ امتیاز</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
          <span>⚽ آقای گل</span>
          <span style={{ color: "#E8B74A", fontWeight: 700 }}>+۸ امتیاز</span>
        </div>
      </div>

      {/* 🎯 How to Play */}
      <p style={{ fontWeight: 700, color: "#E8B74A", marginTop: "20px" }}>🎯 نحوه بازی</p>
      <p style={{ marginTop: "8px" }}>نتیجه دقیق هر بازی مرحله حذفی را پیش‌بینی کنید — هر چه دقیق‌تر، امتیاز بیشتر!</p>

      {/* ⚡ Scoring */}
      <p style={{ fontWeight: 700, color: "#E8B74A", marginTop: "20px" }}>⚡ امتیازدهی</p>
      <div style={{ marginTop: "8px", color: "#ddd" }}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
          <span>⭐ نتیجه دقیق</span>
          <span style={{ color: "#E8B74A", fontWeight: 700 }}>۵ امتیاز</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
          <span>✅ برنده + اختلاف گل درست</span>
          <span style={{ color: "#E8B74A", fontWeight: 700 }}>۳ امتیاز</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
          <span>👍 فقط برنده درست</span>
          <span style={{ color: "#E8B74A", fontWeight: 700 }}>۱ امتیاز</span>
        </div>
        {/* -1 row — red */}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
          <span>❌ اشتباه</span>
          <span style={{ color: "#FF4D4D", fontWeight: 700 }}>۱- امتیاز</span>
        </div>
      </div>

      {/* 🔥 Multipliers */}
      <p style={{ fontWeight: 700, color: "#E8B74A", marginTop: "20px" }}>🔥 ضرایب مرحله‌ای</p>
      <div style={{ marginTop: "8px", color: "#ddd" }}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}><span>یک‌شانزدهم</span><span>×۱</span></div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}><span>یک‌چهارم</span><span>×۲</span></div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}><span>نیمه‌نهایی</span><span>×۳</span></div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}><span>فینال</span><span>×۴</span></div>
      </div>

      <p style={{ color: "#8A8290", fontSize: "12px", marginTop: "20px" }}>
        پیش‌بینی‌ها قبل از شروع هر بازی قفل می‌شوند. پیش‌بینی اشتباه = ۱- امتیاز (ثابت، بدون ضریب)
      </p>
    </div>
  );
}

/* ─── English Rules ─── */
function EnglishRules() {
  return (
    <div style={{ color: "#F2EDE4", fontSize: "14px" }}>

      {/* 🏆 Bonus — FIRST */}
      <p style={{ fontWeight: 700, color: "#E8B74A" }}>🏆 Bonus Predictions</p>
      <div style={{ marginTop: "8px", color: "#ddd" }}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
          <span>🏆 World Cup Champion</span>
          <span style={{ color: "#E8B74A", fontWeight: 700 }}>+11 pts</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
          <span>⚽ Tournament Top Scorer</span>
          <span style={{ color: "#E8B74A", fontWeight: 700 }}>+8 pts</span>
        </div>
      </div>

      {/* 🎯 How to Play */}
      <p style={{ fontWeight: 700, color: "#E8B74A", marginTop: "20px" }}>🎯 How to Play</p>
      <p style={{ marginTop: "8px" }}>Predict the exact score of each knockout match — the more precise your prediction, the more points you earn!</p>

      {/* ⚡ Scoring */}
      <p style={{ fontWeight: 700, color: "#E8B74A", marginTop: "20px" }}>⚡ Scoring</p>
      <div style={{ marginTop: "8px", color: "#ddd" }}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
          <span>⭐ Exact score</span>
          <span style={{ color: "#E8B74A", fontWeight: 700 }}>5 pts</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
          <span>✅ Right winner + goal difference</span>
          <span style={{ color: "#E8B74A", fontWeight: 700 }}>3 pts</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
          <span>👍 Right winner only</span>
          <span style={{ color: "#E8B74A", fontWeight: 700 }}>1 pt</span>
        </div>
        {/* -1 row — red */}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
          <span>❌ Wrong</span>
          <span style={{ color: "#FF4D4D", fontWeight: 700 }}>-1 pt</span>
        </div>
      </div>

      {/* 🔥 Multipliers */}
      <p style={{ fontWeight: 700, color: "#E8B74A", marginTop: "20px" }}>🔥 Knockout Multipliers</p>
      <div style={{ marginTop: "8px", color: "#ddd" }}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}><span>Round of 16</span><span>×1</span></div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}><span>Quarter-finals</span><span>×2</span></div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}><span>Semi-finals</span><span>×3</span></div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}><span>Final</span><span>×4</span></div>
      </div>

      <p style={{ color: "#8A8290", fontSize: "12px", marginTop: "20px" }}>
        Predictions lock at kickoff. Wrong prediction = -1 pt (flat, no multiplier). Go bold!
      </p>
    </div>
  );
}
