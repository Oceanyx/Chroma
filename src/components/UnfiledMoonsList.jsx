// src/components/UnfiledMoonsList.jsx
// Floating panel on the left side of Reflection Space, listing moons that
// were written without picking a dimension. Deliberately not a flex sibling
// of the canvas — it overlays on top instead, so it doesn't shift the ring
// diagram's centering math. Clicking a card opens it in the normal
// MoonSidePanel, exactly like clicking a moon on the diagram already does.
import React from "react";
import { Plus, Inbox } from "lucide-react";

function timeAgo(timestamp) {
	const diffMs = Date.now() - timestamp;
	const mins = Math.floor(diffMs / 60000);
	if (mins < 1) return "just now";
	if (mins < 60) return `${mins}m ago`;
	const hours = Math.floor(mins / 60);
	if (hours < 24) return `${hours}h ago`;
	const days = Math.floor(hours / 24);
	if (days < 30) return `${days}d ago`;
	return new Date(timestamp).toLocaleDateString(undefined, {
		month: "short",
		day: "numeric",
	});
}

export default function UnfiledMoonsList({
	moons,
	selectedMoonId,
	onSelectMoon,
	onStartNew,
}) {
	return (
		<div
			style={{
				position: "absolute",
				top: 16,
				left: 16,
				maxHeight: "calc(100% - 80px)",
				width: "min(300px, 82vw)",
				zIndex: 30,
				display: "flex",
				flexDirection: "column",
				background: "rgba(10,15,28,0.9)",
				backdropFilter: "blur(10px)",
				border: "1px solid rgba(148,163,184,0.18)",
				borderRadius: 10,
				overflow: "hidden",
				pointerEvents: "auto",
			}}>
			<div
				style={{
					padding: "10px 12px",
					borderBottom: "1px solid rgba(255,255,255,0.08)",
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					flexShrink: 0,
				}}>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: 6,
						fontSize: 11,
						fontWeight: 700,
						letterSpacing: "0.05em",
						textTransform: "uppercase",
						color: "#94A3B8",
					}}>
					<Inbox size={13} />
					Unfiled{moons.length > 0 ? ` (${moons.length})` : ""}
				</div>
				<button
					onClick={onStartNew}
					title="Write a reflection without picking a dimension yet"
					style={{
						display: "flex",
						alignItems: "center",
						gap: 4,
						padding: "3px 8px",
						background: "rgba(148,163,184,0.12)",
						border: "1px solid rgba(148,163,184,0.3)",
						borderRadius: 6,
						color: "#CBD5E1",
						fontSize: 11,
						fontWeight: 600,
						cursor: "pointer",
						outline: "none",
					}}
					onMouseEnter={(e) => {
						e.currentTarget.style.background = "rgba(148,163,184,0.22)";
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.background = "rgba(148,163,184,0.12)";
					}}>
					<Plus size={12} /> Write
				</button>
			</div>

			{moons.length === 0 ? (
				<div
					style={{
						padding: "16px 12px",
						fontSize: 12,
						color: "#64748B",
						lineHeight: 1.5,
					}}>
					Nothing unfiled. Write here when you don't want to pick a
					dimension yet — sort it later, or leave it be.
				</div>
			) : (
				<div
					style={{
						overflowY: "auto",
						padding: 8,
						display: "flex",
						flexDirection: "column",
						gap: 6,
					}}>
					{moons
						.slice()
						.sort((a, b) => b.timestamp - a.timestamp)
						.map((moon) => {
							const isSelected = selectedMoonId === moon.id;
							return (
								<button
									key={moon.id}
									onClick={() => onSelectMoon(moon.id)}
									style={{
										textAlign: "left",
										padding: "9px 10px",
										background: isSelected
											? "rgba(148,163,184,0.18)"
											: "rgba(255,255,255,0.03)",
										border: `1px solid ${isSelected ? "rgba(148,163,184,0.4)" : "rgba(255,255,255,0.07)"}`,
										borderRadius: 8,
										cursor: "pointer",
										outline: "none",
										display: "flex",
										flexDirection: "column",
										gap: 4,
									}}
									onMouseEnter={(e) => {
										if (!isSelected)
											e.currentTarget.style.background =
												"rgba(255,255,255,0.06)";
									}}
									onMouseLeave={(e) => {
										if (!isSelected)
											e.currentTarget.style.background =
												"rgba(255,255,255,0.03)";
									}}>
									<div
										style={{
											fontSize: 13.5,
											color: "#F1F5F9",
											lineHeight: 1.45,
											display: "-webkit-box",
											WebkitLineClamp: 3,
											WebkitBoxOrient: "vertical",
											overflow: "hidden",
										}}>
										{moon.text}
									</div>
									<div style={{ fontSize: 10.5, color: "#94A3B8" }}>
										{timeAgo(moon.timestamp)}
									</div>
								</button>
							);
						})}
				</div>
			)}
		</div>
	);
}
