import React, { useState } from "react";

/**
 * Props:
 *  - questionSet: [{q, options:[], correctIndex}] (one or more MCQs)
 *  - onComplete(correct:boolean)
 */

export default function QuizBlock({ questionSet = [], onComplete }) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const q = questionSet[idx];

  const choose = (i) => setSelected(i);

  const submit = () => {
    const correct = selected === q.correctIndex;
    if (correct) {
      // proceed to next question or finish
      if (idx < questionSet.length - 1) {
        setIdx(idx + 1);
        setSelected(null);
      } else {
        onComplete(true);
      }
    } else {
      onComplete(false);
    }
  };

  return (
    <div className="quiz-popup" role="dialog" aria-modal="true">
      <h3>Eco Quiz Challenge</h3>
      <p style={{ marginTop: 8, fontWeight: 600 }}>{q.q}</p>
      <div style={{ marginTop: 12 }}>
        {q.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => choose(i)}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              margin: "8px 0",
              padding: "10px 12px",
              borderRadius: 8,
              border:
                selected === i ? "2px solid #2f855a" : "1px solid rgba(0,0,0,0.12)",
              background: selected === i ? "#e6ffed" : "white",
            }}
          >
            {opt}
          </button>
        ))}
      </div>
      <div style={{ marginTop: 12, display: "flex", justifyContent: "center", gap: 12 }}>
        <button
          className="play-button"
          onClick={submit}
          disabled={selected === null}
        >
          Submit
        </button>
      </div>
    </div>
  );
}
