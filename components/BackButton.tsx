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
      className="text-muted hover:text-gold text-sm font-semibold flex items-center gap-1 transition-colors"
    >
      ← Back
    </button>
  );
}
