import React, { useEffect, useState, useRef } from "react";
import Scoreboard from "./Scoreboard";
import Controls from "./Controls";
import QuizBlock from "./QuizBlock";
import CleanupRoom from "./CleanupRoom";
import GameOverModal from "./GameOverModal";
import bgSound from "../assets/POL-morning-birds.wav";

/**
 * Maze representation:
 * 0 = path
 * 1 = wall
 * 21 = tree item
 * 22 = water item
 * 23 = recycling item
 * 3 = obstacle (penalty)
 * 4 = goal (Green Zone)
 * 5 = quiz-block
 * 6 = cleanup-block
 * 7 = powerup-block
 */

const defaultMaze = [
  [1,1,1,1,1,1,1,1,1,1],
  [1,0,0,21,0,0,3,0,5,1],
  [1,22,1,1,0,1,1,0,0,1],
  [1,6,0,0,0,0,0,23,0,1],
  [1,0,3,1,21,1,0,0,0,1],
  [1,0,0,1,0,7,0,0,3,1],
  [1,23,1,0,1,1,0,0,22,1],
  [1,0,0,0,0,0,0,1,0,1],
  [1,21,0,3,0,23,0,1,4,1],
  [1,1,1,1,1,1,1,1,1,1],
];

// Cleanup tasks pool
const cleanupPool = [
  { id: 1, name: "Plastic Bottle", type: "plastic" },
  { id: 2, name: "Banana Peel", type: "organic" },
  { id: 3, name: "Old Phone", type: "ewaste" },
  { id: 4, name: "Soda Can", type: "plastic" },
  { id: 5, name: "Apple Core", type: "organic" },
  { id: 6, name: "Laptop Charger", type: "ewaste" },
  { id: 7, name: "Broken Glass", type: "hazardous" },
  { id: 8, name: "Newspaper", type: "recycling" },
  { id: 9, name: "Plastic Bag", type: "plastic" },
  { id: 10, name: "Tea Leaves", type: "organic" },
  { id: 11, name: "Used Battery", type: "hazardous" },
  { id: 12, name: "Cardboard Box", type: "recycling" },
  { id: 13, name: "Vegetable Peels", type: "organic" },
  { id: 14, name: "Expired Medicine", type: "hazardous" },
  { id: 15, name: "Tin Can", type: "recycling" },
];

// Quiz pool
const quizPool = [
  { q: "Which is renewable energy?", options: ["Coal", "Solar", "Petrol", "Natural Gas"], correctIndex: 1 },
  { q: "True or False: Recycling reduces waste sent to landfills.", options: ["True", "False"], correctIndex: 0 },
  { q: "What is the 3R principle?", options: ["Recycle, Reuse, Reduce","Run, Read, Rest","Rise, Run, Rest","None"], correctIndex: 0 },
  { q: "Which gas causes global warming?", options: ["CO2","Oxygen","Nitrogen","Hydrogen"], correctIndex: 0 },
  { q: "Planting more trees helps in?", options: ["Increasing CO2","Increasing Oxygen","Decreasing Oxygen","None"], correctIndex: 1 },
  { q: "What is Earth’s main source of energy?", options: ["Coal","Sun","Wind","Nuclear"], correctIndex: 1 },
  { q: "Which practice saves water?", options: ["Keeping tap open","Rainwater harvesting","Over-irrigation","Washing cars daily"], correctIndex: 1 },
  { q: "Which of these is biodegradable?", options: ["Plastic bag","Banana peel","Aluminium can","Glass bottle"], correctIndex: 1 },
  { q: "Ozone layer protects us from?", options: ["CO2","Oxygen","UV Rays","Nitrogen"], correctIndex: 2 },
  { q: "Which energy is pollution-free?", options: ["Wind","Diesel","Petrol","Coal"], correctIndex: 0 },
];

export default function Maze({ username }) {
  const [maze, setMaze] = useState(defaultMaze);
  const [player, setPlayer] = useState({ x: 1, y: 1 });
  const [score, setScore] = useState(0);
  const [steps, setSteps] = useState(0);
  const [gameWon, setGameWon] = useState(false);

  // Pools
  const [availableQuizzes, setAvailableQuizzes] = useState([]);
  const [usedCleanupIds, setUsedCleanupIds] = useState(new Set());

  // Challenge & powerups
  const [inChallenge, setInChallenge] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showCleanup, setShowCleanup] = useState(false);
  const [showPowerup, setShowPowerup] = useState(false);

  const [activeQuiz, setActiveQuiz] = useState(null);
  const [powerUps, setPowerUps] = useState({ plant: false, water: false, energy: false });
  const [speedBoost, setSpeedBoost] = useState(false);
  const [disabledUntil, setDisabledUntil] = useState(0);

  const [penaltyTime, setPenaltyTime] = useState(0);
  const [collectMessage, setCollectMessage] = useState(null);
  const stepCycle = useRef(["quiz", "cleanup", "powerup"]);

  // 🎵 AUDIO STATE
  const audioRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    setAvailableQuizzes([...quizPool].sort(() => Math.random() - 0.5));
  }, []);

  // 🎵 Setup background audio
  useEffect(() => {
    const audio = new Audio(bgSound);
    audio.loop = true;
    audio.volume = 0.4;
    audio.play().catch(err => console.log("Autoplay blocked:", err));
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.muted = false;
      setIsMuted(false);
    } else {
      audioRef.current.muted = true;
      setIsMuted(true);
    }
  };

  // Penalize timer
  useEffect(() => {
    if (penaltyTime > 0) {
      const interval = setInterval(() => {
        setPenaltyTime((t) => {
          if (t <= 1) { clearInterval(interval); return 0; }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [penaltyTime]);

  // Keyboard movement
  useEffect(() => {
    const handler = (e) => {
      if (inChallenge) return;
      if (Date.now() < disabledUntil) return;
      const key = e.key.toLowerCase();
      let dx = 0, dy = 0;
      if (key === "arrowup" || key === "w") dy = -1;
      else if (key === "arrowdown" || key === "s") dy = 1;
      else if (key === "arrowleft" || key === "a") dx = -1;
      else if (key === "arrowright" || key === "d") dx = 1;
      else return;
      e.preventDefault();
      move(dx, dy);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [player, inChallenge, disabledUntil, speedBoost, maze]);

  const cloneMaze = (m) => m.map((r) => r.slice());

  const move = (dx, dy) => {
    if (gameWon) return;
    const stepsToMove = speedBoost ? 2 : 1;
    let newX = player.x, newY = player.y, moved = false;

    for (let i = 0; i < stepsToMove; i++) {
      const tx = newX + dx, ty = newY + dy;
      const cell = maze[ty] && maze[ty][tx];
      if (cell === undefined || cell === 1) break;
      newX = tx; newY = ty; moved = true;
    }
    if (!moved) return;

    setPlayer({ x: newX, y: newY });
    const cellType = maze[newY][newX];
    const newMaze = cloneMaze(maze);

    if (cellType === 21) {
      setScore((s) => s + 10);
      setCollectMessage("🌳 You collected a tree! +10 points! Imagine the real-life impact you could make by planting one!");
      setTimeout(() => setCollectMessage(null), 4000);
      newMaze[newY][newX] = 0;
    }
    else if (cellType === 22) {
      setScore((s) => s + 15);
      setCollectMessage("💧 You saved water! +15 points! Every drop counts in real life too!");
      setTimeout(() => setCollectMessage(null), 4000);
      newMaze[newY][newX] = 0;
    }
    else if (cellType === 23) {
      setScore((s) => s + 20);
      setCollectMessage("♻ You recycled! +20 points! Real-world recycling spreads even more magic!");
      setTimeout(() => setCollectMessage(null), 4000);
      newMaze[newY][newX] = 0;
    }
    else if (cellType === 3) {
      if (powerUps.energy) setPowerUps((p) => ({ ...p, energy: false }));
      else { setScore((s) => s - 5); setDisabledUntil(Date.now() + 5000); setPenaltyTime(5); }
      newMaze[newY][newX] = 0;
    }
    else if (cellType === 4) setGameWon(true);
    else if (cellType === 5) { triggerChallenge("quiz"); newMaze[newY][newX] = 0; }
    else if (cellType === 6) { triggerChallenge("cleanup"); newMaze[newY][newX] = 0; }
    else if (cellType === 7) { triggerChallenge("powerup"); newMaze[newY][newX] = 0; }

    setMaze(newMaze);

    setSteps((prev) => {
      const next = prev + 1;
      if (next % 5 === 0) {
        const cycleIdx = Math.floor(next / 5 - 1) % stepCycle.current.length;
        triggerChallenge(stepCycle.current[cycleIdx]);
      }
      return next;
    });
  };

  const triggerChallenge = (ctype) => {
    if (ctype === "quiz" && availableQuizzes.length > 0) {
      setInChallenge(true);
      const [quiz, ...rest] = availableQuizzes;
      setActiveQuiz(quiz);
      setAvailableQuizzes(rest);
      setShowQuiz(true);
    } else if (ctype === "cleanup") {
      let remaining = cleanupPool.filter(t => !usedCleanupIds.has(t.id));
      if (remaining.length < 2) {
        setUsedCleanupIds(new Set());
        remaining = [...cleanupPool];
      }
      const shuffled = [...remaining].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, 2);
      setUsedCleanupIds(prev => {
        const next = new Set(prev);
        selected.forEach(t => next.add(t.id));
        return next;
      });
      setCurrentChallenge(selected);
      setShowCleanup(true);
      setInChallenge(true);
    } else if (ctype === "powerup") {
      setShowPowerup(true);
      setInChallenge(true);
    }
  };

  const onQuizComplete = (correct) => {
    setShowQuiz(false); setInChallenge(false); setCurrentChallenge(null); setActiveQuiz(null);
    if (correct) setScore((s) => s + 15);
    else { setScore((s) => s - 5); setDisabledUntil(Date.now() + 3000); setPenaltyTime(3); }
  };

  const onCleanupComplete = ({ successCount, failCount }) => {
    setShowCleanup(false); setInChallenge(false); setCurrentChallenge([]);
    setScore((s) => s + successCount * 8 - failCount * 3);
  };

  const onChoosePowerup = (type) => {
    setShowPowerup(false); setInChallenge(false); setCurrentChallenge(null);
    if (type === "plant") { 
      setPowerUps((p) => ({ ...p, plant: true })); setSpeedBoost(true); setScore((s) => s + 10);
      setTimeout(() => { setSpeedBoost(false); setPowerUps((p) => ({ ...p, plant: false })); }, 12000);
    } else if (type === "water") {
      setPowerUps((p) => ({ ...p, water: true })); setScore((s) => s + 8);
      const m = cloneMaze(maze); 
      for (let y = 1; y < m.length-1; y++) { 
        for (let x = 1; x < m[y].length-1; x++) { 
          if (m[y][x]===1){ m[y][x]=0;y=m.length;break; } 
        } 
      }
      setMaze(m);
    } else if (type === "energy") { 
      setPowerUps((p) => ({ ...p, energy: true })); setScore((s) => s + 12); 
    }
  };

  return (
  <div className="maze-container" 
       style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>

    {/* LEFT: Controls */}
    <div style={{ minWidth: 260 }}>
      <Controls />
    </div>

    {/* CENTER: Maze */}
    <div>
      <div className="maze-grid" role="application" aria-label="Eco Maze">
        {maze.map((row, rIdx) =>
          row.map((cell, cIdx) => {
            const isPlayer = player.x === cIdx && player.y === rIdx;
            let cls = "cell path", content = null;
            if (cell === 1) cls = "cell wall";
            else if (cell === 21) { cls = "cell item"; content = "🌳"; }
            else if (cell === 22) { cls = "cell item"; content = "💧"; }
            else if (cell === 23) { cls = "cell item"; content = "♻"; }
            else if (cell === 3) { cls = "cell obstacle"; content = "🗑️"; }
            else if (cell === 4) { cls = "cell goal"; content = "🏁"; }
            else if (cell === 5) { cls = "cell quiz-block"; content = "❓"; }
            else if (cell === 6) { cls = "cell cleanup-block"; content = "🧹"; }
            else if (cell === 7) { cls = "cell powerup-block"; content = "⚡"; }
            if (isPlayer) { cls = "cell player"; content = "🙂"; }
            return (
              <div key={`${rIdx}-${cIdx}`} className={cls}>
                <span>{content}</span>
              </div>
            );
          })
        )}
      </div>
    </div>

    {/* RIGHT: Game Info */}
    <div style={{ minWidth: 260 }}>
      <div className="panel">
        <h4>Game Info</h4>
        <p>Player: <strong>{username}</strong></p>
        <p>Steps: <strong>{steps}</strong></p>
        <p>Score: <strong>{score}</strong></p>
        <p>
          Active Power-ups:{" "}
          {Object.keys(powerUps).filter(k => powerUps[k]).join(", ") || "—"}
        </p>

        {/* 🎵 Mute / Unmute Button */}
        <button onClick={toggleMute} className="play-button" style={{ marginTop: "10px" }}>
          {isMuted ? "🔇 Unmute" : "🔊 Mute"}
        </button>
      </div>
    </div>

    {/* Overlays */}
    {penaltyTime > 0 && (
      <div className="penalty-overlay">⏳ Penalized! Wait {penaltyTime}s</div>
    )}

    {collectMessage && (
      <div className="collect-popup"><p>{collectMessage}</p></div>
    )}

    {showQuiz && activeQuiz && (
      <QuizBlock questionSet={[activeQuiz]} onComplete={onQuizComplete} />
    )}

    {showCleanup && currentChallenge.length > 0 && (
      <CleanupRoom items={currentChallenge} onComplete={onCleanupComplete} />
    )}

    {showPowerup && (
      <div className="quiz-popup">
        <h3>Power-up Reward</h3>
        <p>Choose one power-up:</p>
        <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
          <button onClick={() => onChoosePowerup("plant")} className="play-button">
            🌳 Plant a Tree (Speed boost)
          </button>
          <button onClick={() => onChoosePowerup("water")} className="play-button">
            💧 Water Saver (Shortcut)
          </button>
          <button onClick={() => onChoosePowerup("energy")} className="play-button">
            ⚡ Renewable Energy (Shield)
          </button>
        </div>
      </div>
    )}

    {gameWon && (
      <GameOverModal
        score={score}
        onRestart={() => {
          setMaze(defaultMaze.map(r => [...r]));
          setPlayer({ x: 1, y: 1 });
          setScore(0); setSteps(0); setGameWon(false);
          setPowerUps({ plant: false, water: false, energy: false });
          setSpeedBoost(false);
          setPenaltyTime(0); setDisabledUntil(0);
          setInChallenge(false); setCurrentChallenge([]);
          setShowQuiz(false); setShowCleanup(false); setShowPowerup(false);
          setActiveQuiz(null);
          setAvailableQuizzes([...quizPool].sort(() => Math.random() - 0.5));
          setUsedCleanupIds(new Set());
        }}
      />
    )}
  </div>
);
}
