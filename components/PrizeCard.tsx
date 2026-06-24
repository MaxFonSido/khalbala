"use client";

type Props = {
  tournamentEnded: boolean;
  isWinner: boolean;
  winnerName: string | null;
  winnerEmoji: string | null;
};

// Hardcoded prize card details
const CARD_NUMBER = "4537 4631 3152 1761";
const CARD_CVV = "630";
const CARD_EXPIRY = "12/26";
const CARD_AMOUNT = "$10";

export default function PrizeCard({ tournamentEnded, isWinner, winnerName, winnerEmoji }: Props) {
  if (!tournamentEnded) {
    return (
      <div className="mt-6">
        <div className="text-xs font-bold text-gold uppercase tracking-widest mb-3">🎁 Prize</div>
        <div
          style={{
            width: "100%",
            maxWidth: 340,
            height: 200,
            borderRadius: 18,
            background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
            border: "1px solid #2a2a4a",
            position: "relative",
            overflow: "hidden",
            margin: "0 auto",
            animation: "kb-wobble 3s ease-in-out infinite",
            boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(100,100,255,0.1)",
          }}
        >
          <style>{`
            @keyframes kb-wobble {
              0%,100% { transform: rotate(-1deg) scale(1); }
              25% { transform: rotate(1.5deg) scale(1.02); }
              50% { transform: rotate(-0.5deg) scale(1.01); }
              75% { transform: rotate(1deg) scale(1.02); }
            }
            @keyframes kb-shimmer {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(200%); }
            }
            @keyframes kb-pulse {
              0%,100% { transform: scale(1); filter: drop-shadow(0 0 12px rgba(255,215,0,0.6)); }
              50% { transform: scale(1.1); filter: drop-shadow(0 0 20px rgba(255,215,0,0.9)); }
            }
          `}</style>
          {/* Shimmer */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.08) 50%, transparent 60%)",
            animation: "kb-shimmer 2.5s ease-in-out infinite",
          }} />
          {/* Content */}
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 10,
          }}>
            <div style={{ fontSize: 38, animation: "kb-pulse 2s ease-in-out infinite" }}>🏆</div>
            <div style={{ color: "#fbbf24", fontSize: 12, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" }}>
              Winner's Prize
            </div>
            <div style={{ color: "rgba(255,255,255,0.15)", fontSize: 17, letterSpacing: "0.2em", filter: "blur(4px)", fontFamily: "monospace" }}>
              •••• •••• •••• ••••
            </div>
            <div style={{ color: "#4a5568", fontSize: 11 }}>Revealed after the Final · July 19</div>
          </div>
        </div>
        <p className="text-xs text-muted text-center mt-3">
          A real prize awaits the Khal Bala champion 🎉
        </p>
      </div>
    );
  }

  // Tournament ended
  return (
    <div className="mt-6">
      <div className="text-xs font-bold text-gold uppercase tracking-widest mb-3">🎁 Prize</div>

      {/* Winner announcement — everyone sees this */}
      <div className="card-solid p-4 mb-4 text-center">
        <div className="text-2xl mb-1">👑</div>
        <div className="text-xs text-muted uppercase tracking-widest mb-1">Khal Bala Champion</div>
        <div className="text-gold font-extrabold text-lg">
          {winnerEmoji && <span className="mr-1">{winnerEmoji}</span>}
          {winnerName ?? "—"}
        </div>
        {isWinner && (
          <div className="mt-2 text-xs text-green-400 font-bold">🎉 That's you! Your prize is below.</div>
        )}
      </div>

      {/* Revealed card — winner only */}
      {isWinner ? (
        <div style={{
          width: "100%", maxWidth: 340, height: 200,
          borderRadius: 18, position: "relative", overflow: "hidden",
          margin: "0 auto",
          boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 60px rgba(255,215,0,0.25)",
          animation: "kb-float 3s ease-in-out infinite",
        }}>
          <style>{`
            @keyframes kb-float {
              0%,100% { transform: translateY(0px); }
              50% { transform: translateY(-6px); }
            }
            @keyframes kb-gold-glow {
              0%,100% { box-shadow: 0 0 15px rgba(251,191,36,0.3); }
              50% { box-shadow: 0 0 35px rgba(251,191,36,0.7); }
            }
            @keyframes kb-fall {
              0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
              100% { transform: translateY(210px) rotate(360deg); opacity: 0; }
            }
          `}</style>
          {/* Background */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(135deg, #2a2a2a 0%, #4a4a4a 40%, #3a3a3a 60%, #1a1a1a 100%)",
          }} />
          {/* Shimmer */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.12) 50%, transparent 70%)",
            animation: "kb-shimmer 3s ease-in-out infinite",
          }} />
          {/* Gold border */}
          <div style={{
            position: "absolute", inset: 0, borderRadius: 18,
            border: "2px solid #fbbf24",
            animation: "kb-gold-glow 2s ease-in-out infinite",
          }} />
          {/* Confetti dots */}
          <ConfettiDots />
          {/* Card content */}
          <div style={{
            position: "relative", zIndex: 2,
            padding: "18px 22px", height: "100%",
            display: "flex", flexDirection: "column", justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <span style={{ fontSize: 20 }}>⚽</span>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: "#fbbf24", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em" }}>WINNER REWARD</div>
                <div style={{ color: "#94a3b8", fontSize: 9, marginTop: 2 }}>World Cup 2026 · Khal Bala</div>
                <div style={{ color: "#fbbf24", fontSize: 15, fontWeight: 900, marginTop: 3 }}>{CARD_AMOUNT}</div>
              </div>
            </div>
            <div style={{ color: "#fff", fontSize: 18, fontFamily: "monospace", letterSpacing: "0.18em", fontWeight: 600, textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>
              {CARD_NUMBER}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div>
                <div style={{ color: "#64748b", fontSize: 7, letterSpacing: "0.1em", textTransform: "uppercase", lineHeight: 1.4 }}>VALID<br />THRU</div>
                <div style={{ color: "#e2e8f0", fontSize: 13, fontFamily: "monospace" }}>{CARD_EXPIRY}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: "#64748b", fontSize: 7, letterSpacing: "0.1em", textTransform: "uppercase" }}>CVV</div>
                <div style={{ color: "#e2e8f0", fontSize: 13, fontFamily: "monospace" }}>{CARD_CVV}</div>
              </div>
              <div style={{ color: "#fff", fontSize: 20, fontWeight: 900, fontStyle: "italic", fontFamily: "Arial Black, sans-serif" }}>VISA</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card-solid p-5 text-center">
          <div className="text-3xl mb-2">🔒</div>
          <div className="text-sm text-muted">The prize has been awarded to the champion.</div>
        </div>
      )}
    </div>
  );
}

function ConfettiDots() {
  const colors = ["#fbbf24", "#f59e0b", "#10b981", "#3b82f6", "#ef4444", "#8b5cf6"];
  const dots = Array.from({ length: 16 }, (_, i) => ({
    left: `${(i * 6.25) % 100}%`,
    color: colors[i % colors.length],
    duration: 2 + (i % 3),
    delay: (i * 0.3) % 3,
    size: 3 + (i % 3),
  }));

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {dots.map((d, i) => (
        <div key={i} style={{
          position: "absolute",
          left: d.left,
          width: d.size, height: d.size,
          borderRadius: "50%",
          background: d.color,
          animation: `kb-fall ${d.duration}s ${d.delay}s linear infinite`,
        }} />
      ))}
    </div>
  );
}
