"use client";

export default function BackButton() {
  async function handleBack() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.close();
    setTimeout(() => {
      window.location.href = "/";
    }, 300);
  }

  return (
    <button
      onClick={handleBack}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        padding: "6px 14px",
        borderRadius: "999px",
        border: "1px solid #E8B74A",
        background: "transparent",
        color: "#E8B74A",
        fontSize: "12px",
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      ← Back to App
    </button>
  );
}
