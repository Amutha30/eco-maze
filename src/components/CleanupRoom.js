import React, { useState } from "react";

/**
 * Cleanup mini-game
 * - Show trash items (plastic | organic | ewaste | hazardous | recycling)
 * - Player clicks item, then bin
 * - Success increments points; wrong adds penalty
 *
 * Props:
 *  - items: [{id, name, type}]
 *  - onComplete({successCount, failCount})
 */

const sampleItems = [
  { id: 1, name: "Plastic Bottle", type: "plastic" },
  { id: 2, name: "Banana Peel", type: "organic" },
  { id: 3, name: "Old Phone", type: "ewaste" },
  { id: 4, name: "Paint Can", type: "hazardous" },
  { id: 5, name: "Cardboard Box", type: "recycling" },
];

export default function CleanupRoom({ items = sampleItems, onComplete }) {
  const [remaining, setRemaining] = useState(items);
  const [selected, setSelected] = useState(null);
  const [scoreLocal, setScoreLocal] = useState({ success: 0, fail: 0 });

  // ✅ Added hazardous + recycling bins
  const bins = [
    { id: "plastic", label: "Plastic 🥤" },
    { id: "organic", label: "Organic 🍌" },
    { id: "ewaste", label: "E-waste 💻" },
    { id: "hazardous", label: "Hazardous ☠️" },
    { id: "recycling", label: "Recycling ♻️" },
  ];

  const chooseItem = (it) => setSelected(it);

  const dropToBin = (binId) => {
    if (!selected) return;
    if (selected.type === binId) {
      // ✅ Correct
      setScoreLocal((s) => ({ ...s, success: s.success + 1 }));
      setRemaining((r) => r.filter((x) => x.id !== selected.id));
    } else {
      // ❌ Wrong
      setScoreLocal((s) => ({ ...s, fail: s.fail + 1 }));
    }
    setSelected(null);
  };

  const finish = () => {
    onComplete({ successCount: scoreLocal.success, failCount: scoreLocal.fail });
  };

  return (
    <div className="quiz-popup" role="dialog">
      <h3>Cleanup Challenge</h3>
      <p>Sort the trash into the correct bins. Click an item, then the bin.</p>

      <div style={{ display: "flex", gap: 24, marginTop: 12 }}>
        {/* Items List */}
        <div style={{ minWidth: 220 }}>
          <div style={{ marginBottom: 8, fontWeight: 700 }}>Items</div>
          <div style={{ display: "grid", gap: 8 }}>
            {remaining.length === 0 && <div>No more items left!</div>}
            {remaining.map((it) => (
              <div
                key={it.id}
                onClick={() => chooseItem(it)}
                style={{
                  padding: 8,
                  borderRadius: 8,
                  border:
                    selected && selected.id === it.id
                      ? "2px solid #2f855a"
                      : "1px solid rgba(0,0,0,0.12)",
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                {it.name}
              </div>
            ))}
          </div>
        </div>

        {/* Bins */}
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: 8, fontWeight: 700 }}>Bins</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {bins.map((b) => (
              <div
                key={b.id}
                onClick={() => dropToBin(b.id)}
                style={{
                  flex: "1 1 45%",
                  padding: 18,
                  borderRadius: 10,
                  background:
                    b.id === "plastic"
                      ? "#f0f9ff"
                      : b.id === "organic"
                      ? "#f0fff4"
                      : b.id === "ewaste"
                      ? "#fff7ed"
                      : b.id === "hazardous"
                      ? "#fff0f0"
                      : "#f9f9f9",
                  border: "1px dashed rgba(0,0,0,0.12)",
                  cursor: "pointer",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 18, fontWeight: 700 }}>{b.label}</div>
                <div style={{ marginTop: 6, fontSize: 12, color: "#555" }}>
                  Click to drop selected item here
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Score + Finish */}
      <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div>
          <strong>Correct:</strong> {scoreLocal.success} &nbsp; | &nbsp;
          <strong>Wrong:</strong> {scoreLocal.fail}
        </div>
        <div>
          <button className="play-button" onClick={finish}>
            Finish
          </button>
        </div>
      </div>
    </div>
  );
}
