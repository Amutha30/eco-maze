import React, { useState } from "react";
import WelcomePage from "./components/WelcomePage";
import Maze from "./components/Maze";
import InstructionsModal from "./components/InstructionsModal";

function App() {
  const [username, setUsername] = useState("");
  const [started, setStarted] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  const startGame = (name) => {
    setUsername(name);
    setShowInstructions(true); // show instructions after name entered
  };

  const handleInstructionsClose = () => {
    setShowInstructions(false); // hide instructions
    setStarted(true); // then start maze
  };

  return (
    <div className="app-root">
      {!started && !showInstructions && <WelcomePage onStart={startGame} />}

      {showInstructions && (
        <InstructionsModal onClose={handleInstructionsClose} />
      )}

      {started && <Maze username={username} />}
    </div>
  );
}

export default App;
