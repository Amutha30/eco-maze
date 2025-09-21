import React from "react";

export default function Scoreboard({ username, score, steps, powerUps }) {
  return (
    <div className="scoreboard">
      <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
        <div>
          <div className="score-label">Player</div>
          <div className="score-value">{username}</div>
        </div>
        <div>
          <div className="score-label">Score</div>
          <div className="score-value">{score}</div>
        </div>
        <div>
          <div className="score-label">Steps</div>
          <div className="score-value">{steps}</div>
        </div>
        <div>
          <div className="score-label">Power-ups</div>
          <div className="score-value">
            {powerUps.plant ? "🌳 " : ""}
            {powerUps.water ? "💧 " : ""}
            {powerUps.energy ? "⚡" : ""}
            {!powerUps.plant && !powerUps.water && !powerUps.energy && "—"}
          </div>
        </div>
      </div>
    </div>
  );
}
