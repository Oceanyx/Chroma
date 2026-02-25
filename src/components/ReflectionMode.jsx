// src/components/ReflectionMode.jsx - V2.0
// Removed ObservationEditor and two-mode flow.
// Node text is editable inline from PlanetSidePanel (single click on canvas).
// ReflectionSpace is now the only thing rendered here.
import React, { useEffect } from "react";
import ReflectionSpace from "./ReflectionSpace";

export default function ReflectionMode({
	parentNode,
	nodes,
	onExit,
	onNodesUpdate,
}) {
	// Escape key exits reflection mode
	useEffect(() => {
		const handleEscape = (e) => {
			if (e.key === "Escape") onExit();
		};
		window.addEventListener("keydown", handleEscape);
		return () => window.removeEventListener("keydown", handleEscape);
	}, [onExit]);

	return (
		<div
			style={{
				position: "absolute",
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				background: "rgba(15, 23, 36, 0.85)",
				backdropFilter: "blur(12px)",
				zIndex: 1000,
				animation: "fadeIn 0.3s ease",
			}}>
			<ReflectionSpace
				parentNode={parentNode}
				nodes={nodes}
				// "Exit" button inside ReflectionSpace's top bar calls this
				onSwitchToObservation={onExit}
				onNodesUpdate={onNodesUpdate}
			/>

			<style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
		</div>
	);
}
