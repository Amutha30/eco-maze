// Controls.js
import React from "react";

export default function Controls() {
  return (
    <div className="panel" style={{ minWidth: 260 }}>
      <h4>How to play</h4>
      <ul>
        <li>Use Arrow keys or WASD to move.</li>
        <li>Collect 🌳, ♻️, 💧 items for points.</li>
        <li>Avoid obstacles (plastic patch / spills) — they penalize you.</li>
        <li>Every 5 steps triggers a challenge: Quiz → Cleanup → Power-up.</li>
        <li>Reach the Green Zone 🏁 to win. Good luck!</li>
      </ul>
    </div>
  );
}
