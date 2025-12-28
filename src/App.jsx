// src/App.jsx
import React, { useState } from "react";
import PerceptionCanvas from "./components/PerceptionCanvas";
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

  return <PerceptionCanvas purposeData={purposeData} />;
}
