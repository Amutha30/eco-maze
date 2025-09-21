import React from "react";

export default function GameOverModal({ score, onRestart }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>🎉 You reached the Green Zone!</h2>
        <p>Final Score: {score}</p>
        <button onClick={onRestart} className="play-button">
          Restart Game
        </button>
      </div>
    </div>
  );
}
