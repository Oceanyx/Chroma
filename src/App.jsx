// src/App.jsx
import React, { useState } from "react";
import SpaceCanvas from "./components/SpaceCanvas";
import PurposeScreen from "./components/PurposeScreen";

export default function App() {
  const [purposeData, setPurposeData] = useState(null);
  const [showPurposeScreen, setShowPurposeScreen] = useState(true);

  const handlePurposeComplete = (data) => {
    setPurposeData(data);
    setShowPurposeScreen(false);
  };

  const handlePurposeSkip = (data) => {
    setPurposeData(data);
    setShowPurposeScreen(false);
  };

  if (showPurposeScreen) {
    return (
      <PurposeScreen
        onComplete={handlePurposeComplete}
        onSkip={handlePurposeSkip}
      />
    );
  }

  return (
    <div className="app-root">
      <div className="canvas-shell">
        <SpaceCanvas purposeData={purposeData} />
      </div>
    </div>
  );
}
