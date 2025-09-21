import React, { useState } from "react";

export default function WelcomePage({ onStart }) {
  const [showInput, setShowInput] = useState(false);
  const [name, setName] = useState("");

  return (
    <div className="welcome-container">
      <div className="welcome-card">
        <h1 className="welcome-title">🌍 ECO MAZE</h1>
        <p className="welcome-sub">Help the planet. Learn while you play.</p>

        {!showInput ? (
          <button
            className="play-button"
            onClick={() => setShowInput(true)}
            aria-label="Play Eco Maze"
          >
            ▶ Play
          </button>
        ) : (
          <div style={{ marginTop: 18 }}>
            <input
              className="name-input"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button
              className="play-button"
              onClick={() => name.trim() && onStart(name.trim())}
            >
              Start
            </button>
          </div>
        )}
        <p style={{ marginTop: 12, color: "#2f855a" }}>
          Controls: Arrow keys or WASD
        </p>
      </div>
    </div>
  );
}
