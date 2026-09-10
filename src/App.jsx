// src/App.jsx - V1.2
// Fix: purposeData is now persisted to db.settings, so a reload checks for
// an existing session instead of always re-showing onboarding.
// Added: "New Map" flow (handleNewMap) — the only intentional way to wipe
// the current map and return to onboarding; previously the only way to do
// this was clearing IndexedDB manually via devtools.
import React, { useState, useEffect } from "react";
import SpaceCanvas from "./components/SpaceCanvas";
import PurposeScreen from "./components/PurposeScreen";
import { db, getSetting, setSetting } from "./lib/db";

export default function App() {
	const [purposeData, setPurposeData] = useState(null);
	const [showPurposeScreen, setShowPurposeScreen] = useState(true);
	const [checkingSession, setCheckingSession] = useState(true);

	// On mount, check whether a session already exists so we don't force
	// the user back through onboarding on every reload.
	useEffect(() => {
		(async () => {
			const saved = await getSetting("purposeData");
			if (saved) {
				setPurposeData(saved);
				setShowPurposeScreen(false);
			}
			setCheckingSession(false);
		})();
	}, []);

	const persistPurpose = async (data) => {
		setPurposeData(data);
		await setSetting("purposeData", data ?? null);
	};

	const handlePurposeComplete = (data) => {
		persistPurpose(data);
		setShowPurposeScreen(false);
	};

	const handlePurposeSkip = (data) => {
		persistPurpose(data);
		setShowPurposeScreen(false);
	};

	// Explicit, intentional reset — the only path that should ever wipe data.
	const handleNewMap = async () => {
		if (
			!window.confirm(
				"Start a new map? This will permanently delete everything in the current one — nodes, reflections, connections, and constellations. Export first if you want to keep it.",
			)
		)
			return;
		await db.nodes.clear();
		await db.edges.clear();
		await db.constellations.clear();
		await setSetting("purposeData", null);
		setPurposeData(null);
		setShowPurposeScreen(true);
	};

	// Avoid a flash of the onboarding screen while we check for a saved session
	if (checkingSession) return null;

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
				<SpaceCanvas
					purposeData={purposeData}
					onPurposeUpdate={persistPurpose}
					onNewMap={handleNewMap}
				/>
			</div>
		</div>
	);
}
