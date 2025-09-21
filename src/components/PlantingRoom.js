import React, { useState } from "react";

export default function PlantingRoom({ onComplete }) {
  const spots = Array.from({ length: 6 }, (_, i) => i);
  const [planted, setPlanted] = useState([]);

  const plantTree = (id) => {
    if (planted.includes(id)) return;
    setPlanted([...planted, id]);
  };

  const finish = () => {
    onComplete(planted.length);
  };

  return (
    <div className="quiz-popup" role="dialog">
      <h3>🌱 Plant Trees</h3>
      <p>Click on empty spots to plant trees.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 80px)", gap: 12, marginTop: 12 }}>
        {spots.map((id) => (
          <div
            key={id}
            onClick={() => plantTree(id)}
            style={{
              width: 80,
              height: 80,
              borderRadius: 8,
              background: planted.includes(id) ? "#c6f6d5" : "#edf2f7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: 28,
            }}
          >
            {planted.includes(id) ? "🌳" : "➕"}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 16 }}>
        <button className="play-button" onClick={finish}>Done</button>
      </div>
    </div>
  );
}
