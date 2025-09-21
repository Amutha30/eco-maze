import React from "react";

export default function InstructionsModal({ onClose }) {
  return (
    <div className="quiz-popup" role="dialog">
      <h2>📜 Instructions</h2>
      <ul style={{ textAlign: "left", marginTop: 12 }}>
        <li>Use Arrow keys or WASD to move.</li>
        <li>Collect 🌳, ♻️, 💧 items for points.</li>
        <li>Avoid obstacles (🗑️) — they penalize you.</li>
        <li>Every 5 steps: Quiz → Cleanup → Power-up → Planting.</li>
        <li>Reach 🏁 Green Zone to win!</li>
      </ul>
      <div style={{ marginTop: 16, textAlign: "center" }}>
        <button className="play-button" onClick={onClose}>
          Start Game
        </button>
      </div>
    </div>
  );
}
