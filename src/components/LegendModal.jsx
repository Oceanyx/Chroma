// src/components/LegendModal.jsx
// Reference documentation, re-openable anytime — separate from AboutModal,
// which carries the "why" (philosophy). This carries the "how" (mechanics).
import React from "react";
import {
	X,
	MousePointer,
	Link2,
	Sparkles,
	Hand,
	Locate,
	RotateCcw,
} from "lucide-react";

const sectionTitle = {
	fontSize: 13,
	fontWeight: 700,
	color: "#94A3B8",
	textTransform: "uppercase",
	letterSpacing: "0.05em",
	marginBottom: 10,
	marginTop: 24,
};

const row = {
	display: "flex",
	gap: 12,
	alignItems: "flex-start",
	padding: "8px 0",
};

const rowLabel = {
	fontSize: 14,
	fontWeight: 600,
	color: "#E6EEF8",
	minWidth: 120,
	flexShrink: 0,
};

const rowDesc = {
	fontSize: 13,
	color: "#CBD5E1",
	lineHeight: 1.5,
};

export default function LegendModal({ onClose, onReplayWalkthrough }) {
	return (
		<div
			style={{
				position: "fixed",
				inset: 0,
				background: "rgba(0,0,0,0.8)",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				zIndex: 4000,
				backdropFilter: "blur(8px)",
			}}
			onMouseDown={(e) => {
				if (e.target === e.currentTarget) onClose();
			}}>
			<div
				style={{
					width: "620px",
					maxWidth: "90vw",
					maxHeight: "85vh",
					background: "linear-gradient(135deg, #161F30 0%, #1A1F35 100%)",
					borderRadius: "20px",
					border: "1px solid rgba(108, 99, 255, 0.35)",
					boxShadow: "0 20px 60px rgba(0, 0, 0, 0.6)",
					display: "flex",
					flexDirection: "column",
					color: "#E6EEF8",
					overflow: "hidden",
				}}>
				{/* Header */}
				<div
					style={{
						padding: "20px 24px",
						borderBottom: "1px solid rgba(255,255,255,0.1)",
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						background:
							"linear-gradient(135deg, rgba(108, 99, 255, 0.1) 0%, rgba(77, 159, 255, 0.05) 100%)",
						flexShrink: 0,
					}}>
					<h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
						How Chroma works
					</h2>
					<button
						onClick={onClose}
						style={{
							background: "transparent",
							border: "none",
							color: "#94A3B8",
							fontSize: 24,
							cursor: "pointer",
							padding: "0 8px",
						}}>
						<X size={22} />
					</button>
				</div>

				{/* Body */}
				<div
					className="chroma-legend-scroll"
					style={{ padding: "8px 24px 24px", overflowY: "auto" }}>
					<style>{`
						.chroma-legend-scroll::-webkit-scrollbar { width: 8px; }
						.chroma-legend-scroll::-webkit-scrollbar-track { background: transparent; }
						.chroma-legend-scroll::-webkit-scrollbar-thumb {
							background: rgba(108,99,255,0.35);
							border-radius: 8px;
						}
						.chroma-legend-scroll::-webkit-scrollbar-thumb:hover {
							background: rgba(108,99,255,0.55);
						}
						.chroma-legend-scroll {
							scrollbar-width: thin;
							scrollbar-color: rgba(108,99,255,0.35) transparent;
						}
					`}</style>
					<div style={sectionTitle}>Planets</div>
					<div style={row}>
						<span style={rowLabel}>Observation</span>
						<span style={rowDesc}>Something you noticed happen.</span>
					</div>
					<div style={row}>
						<span style={rowLabel}>Action</span>
						<span style={rowDesc}>Something you did or said.</span>
					</div>
					<div style={row}>
						<span style={rowLabel}>Intention</span>
						<span style={rowDesc}>
							Something you're planning, past, present, or future.
						</span>
					</div>

					<div style={sectionTitle}>Moons — reflecting on a planet</div>
					<div style={row}>
						<span style={rowLabel}>Subjective</span>
						<span style={rowDesc}>How it felt, from the inside.</span>
					</div>
					<div style={row}>
						<span style={rowLabel}>Intersubjective</span>
						<span style={rowDesc}>
							How it looked from outside, or to someone else.
						</span>
					</div>
					<div style={row}>
						<span style={rowLabel}>Behavioral</span>
						<span style={rowDesc}>
							What was actually done or said — unlocks after 5 reflections.
						</span>
					</div>
					<div style={row}>
						<span style={rowLabel}>Framing</span>
						<span style={rowDesc}>
							What pattern or lens this fits into — unlocks after 15.
						</span>
					</div>

					<div style={sectionTitle}>Relationships</div>
					<div style={row}>
						<span style={rowLabel}>Tension</span>
						<span style={rowDesc}>
							Two reflections that contradict each other. Anchors both moons in
							place.
						</span>
					</div>
					<div style={row}>
						<span style={rowLabel}>Support</span>
						<span style={rowDesc}>
							Two reflections that reinforce each other.
						</span>
					</div>
					<div style={row}>
						<span style={rowLabel}>Connections</span>
						<span style={rowDesc}>
							Links between planets — followed, caused, triggered, enabled,
							contradicts, or resolved.
						</span>
					</div>
					<div style={row}>
						<span style={rowLabel}>Constellations</span>
						<span style={rowDesc}>
							A named group of related planets — turning point, loop, avoidance,
							breakthrough, drift, or awakening.
						</span>
					</div>

					<div style={sectionTitle}>Tools</div>
					<div style={row}>
						<MousePointer size={16} style={{ marginTop: 2, flexShrink: 0 }} />
						<span style={rowDesc}>
							<strong>Select</strong> — click a planet to open it. Shift+click
							to add planets to a group.
						</span>
					</div>
					<div style={row}>
						<Link2 size={16} style={{ marginTop: 2, flexShrink: 0 }} />
						<span style={rowDesc}>
							<strong>Connect</strong> — click a planet, then click another to
							link them.
						</span>
					</div>
					<div style={row}>
						<Sparkles size={16} style={{ marginTop: 2, flexShrink: 0 }} />
						<span style={rowDesc}>
							<strong>Group</strong> — click planets to gather them, then Form
							Constellation.
						</span>
					</div>
					<div style={row}>
						<Hand size={16} style={{ marginTop: 2, flexShrink: 0 }} />
						<span style={rowDesc}>
							<strong>Pan</strong> — drag to move around, or hold Space anytime.
						</span>
					</div>
					<div style={row}>
						<Locate size={16} style={{ marginTop: 2, flexShrink: 0 }} />
						<span style={rowDesc}>
							<strong>Recenter</strong> — lost in the canvas? This frames
							everything back in view.
						</span>
					</div>

					<div style={sectionTitle}>Keys</div>
					<div style={row}>
						<span style={rowLabel}>Escape</span>
						<span style={rowDesc}>
							Cancel whatever's in progress, close popups.
						</span>
					</div>
					<div style={row}>
						<span style={rowLabel}>Space (hold)</span>
						<span style={rowDesc}>Temporarily pan from any tool.</span>
					</div>

					{onReplayWalkthrough && (
						<button
							onClick={onReplayWalkthrough}
							style={{
								marginTop: 24,
								padding: "10px 16px",
								background: "rgba(108,99,255,0.15)",
								border: "1px solid rgba(108,99,255,0.4)",
								borderRadius: 8,
								color: "#A78BFA",
								cursor: "pointer",
								fontSize: 13,
								fontWeight: 600,
								display: "flex",
								alignItems: "center",
								gap: 8,
							}}>
							<RotateCcw size={14} />
							Replay the walkthrough
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
