// src/components/PlanetSidePanel.jsx - V1.0
// Shows when a planet (O/A/I node) is selected on the main canvas.
// Lets users read/edit the node, see reflection counts, navigate into
// reflection mode, and delete the node.
import React, { useState } from "react";
import { X, Eye, Zap, Target } from "lucide-react";
import { moonConfig } from "../seedData";
import { db, cascadeDeleteNode } from "../lib/db";

export const PLANET_PANEL_WIDTH = 380;

// ── Type config ───────────────────────────────────────────────────────────────
const TYPE_CONFIG = {
	O: {
		label: "Observation",
		Icon: Eye,
		color: "#4D9FFF",
		bg: "rgba(77,159,255,0.07)",
		border: "rgba(77,159,255,0.22)",
		glow: "rgba(77,159,255,0.12)",
		description: "What did you notice or experience?",
	},
	A: {
		label: "Action",
		Icon: Zap,
		color: "#FB923C",
		bg: "rgba(251,146,60,0.07)",
		border: "rgba(251,146,60,0.22)",
		glow: "rgba(251,146,60,0.12)",
		description: "What did you do or decide?",
	},
	I: {
		label: "Intention",
		Icon: Target,
		color: "#FBBF24",
		bg: "rgba(251,191,36,0.07)",
		border: "rgba(251,191,36,0.22)",
		glow: "rgba(251,191,36,0.12)",
		description: "What are you committing to change?",
	},
};

const STATE_CONFIG = {
	past: { label: "Past", color: "#64748B" },
	present: { label: "Present", color: "#10B981" },
	future: { label: "Future", color: "#3B82F6" },
};

// ── Dimension dot row ─────────────────────────────────────────────────────────
function DimCount({ dimension, count }) {
	const cfg = moonConfig.dimension[dimension];
	if (!cfg || count === 0) return null;
	return (
		<div
			style={{
				display: "flex",
				alignItems: "center",
				gap: 7,
				padding: "6px 10px",
				borderRadius: 7,
				background: `${cfg.color}0D`,
				border: `1px solid ${cfg.color}25`,
			}}>
			<span
				style={{
					width: 7,
					height: 7,
					borderRadius: "50%",
					background: cfg.color,
					boxShadow: `0 0 5px ${cfg.color}`,
					flexShrink: 0,
					display: "inline-block",
				}}
			/>
			<span style={{ fontSize: 11, color: cfg.color, fontWeight: 700 }}>
				{count}
			</span>
			<span style={{ fontSize: 11, color: "#334155", fontWeight: 600 }}>
				{cfg.name}
			</span>
		</div>
	);
}

// ── Main panel ────────────────────────────────────────────────────────────────
export default function PlanetSidePanel({
	node,
	moons,
	onClose,
	onOpenReflections,
	onNodesUpdate,
}) {
	const [isEditing, setIsEditing] = useState(false);
	const [editText, setEditText] = useState(node.text || "");
	const [editState, setEditState] = useState(node.state || "present");
	const [deleteHovered, setDeleteHovered] = useState(false);
	const [openHovered, setOpenHovered] = useState(false);

	const tc = TYPE_CONFIG[node.type] || TYPE_CONFIG.O;
	const { Icon } = tc;

	// Moon breakdown by dimension
	const dimCounts = {
		subjective: 0,
		behavioral: 0,
		intersubjective: 0,
		symbolic: 0,
	};
	(moons || []).forEach((m) => {
		if (dimCounts[m.dimension] !== undefined) dimCounts[m.dimension]++;
	});
	const totalMoons = (moons || []).length;

	const handleSave = async () => {
		if (editText.trim()) {
			await db.nodes.update(node.id, {
				text: editText.trim(),
				state: editState,
			});
			await onNodesUpdate();
			setIsEditing(false);
		}
	};

	const handleCancelEdit = () => {
		setEditText(node.text || "");
		setEditState(node.state || "present");
		setIsEditing(false);
	};

	const handleDelete = async () => {
		const msg =
			totalMoons > 0
				? `This will also delete ${totalMoons} reflection${totalMoons > 1 ? "s" : ""} orbiting this planet. Continue?`
				: "Delete this node?";
		if (!window.confirm(msg)) return;
		await cascadeDeleteNode(node.id);
		await onNodesUpdate();
		onClose();
	};

	const stateOptions =
		node.type === "O" ? ["past", "present"] : ["past", "present", "future"];

	return (
		<div
			style={{
				width: PLANET_PANEL_WIDTH,
				height: "100%",
				display: "flex",
				flexDirection: "column",
				background: `linear-gradient(165deg, ${tc.bg} 0%, rgba(8,13,25,0.99) 28%)`,
				borderLeft: `1px solid ${tc.border}`,
				boxShadow: `inset 3px 0 0 0 ${tc.color}, -8px 0 32px rgba(0,0,0,0.35)`,
				position: "relative",
				overflow: "hidden",
				flexShrink: 0,
				color: "#E2E8F0",
			}}>
			{/* Ambient corner glow */}
			<div
				style={{
					position: "absolute",
					top: -70,
					left: -70,
					width: 220,
					height: 220,
					borderRadius: "50%",
					background: `radial-gradient(circle, ${tc.glow} 0%, transparent 70%)`,
					pointerEvents: "none",
					zIndex: 0,
				}}
			/>

			{/* ── HEADER ─────────────────────────────────────────────────────── */}
			<div
				style={{
					padding: "18px 20px 14px",
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					flexShrink: 0,
					position: "relative",
					zIndex: 1,
				}}>
				<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
					<Icon size={13} color={tc.color} />
					<span
						style={{
							fontSize: 10,
							fontWeight: 700,
							letterSpacing: "0.12em",
							textTransform: "uppercase",
							color: tc.color,
							opacity: 0.9,
						}}>
						{tc.label}
					</span>
					{/* State badge */}
					{node.state && STATE_CONFIG[node.state] && (
						<span
							style={{
								padding: "2px 8px",
								borderRadius: 20,
								fontSize: 9,
								fontWeight: 700,
								letterSpacing: "0.06em",
								color: STATE_CONFIG[node.state].color,
								background: `${STATE_CONFIG[node.state].color}18`,
								border: `1px solid ${STATE_CONFIG[node.state].color}35`,
							}}>
							{STATE_CONFIG[node.state].label.toUpperCase()}
						</span>
					)}
				</div>

				<button
					onClick={onClose}
					style={{
						background: "none",
						border: "1px solid rgba(255,255,255,0.08)",
						borderRadius: 6,
						color: "#334155",
						cursor: "pointer",
						width: 26,
						height: 26,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						outline: "none",
						transition: "all 0.15s",
					}}
					onMouseEnter={(e) => {
						e.currentTarget.style.color = "#94A3B8";
						e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)";
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.color = "#334155";
						e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
					}}>
					<X size={13} />
				</button>
			</div>

			{/* ── NODE TEXT ──────────────────────────────────────────────────── */}
			<div
				style={{
					padding: "0 20px 16px",
					flexShrink: 0,
					position: "relative",
					zIndex: 1,
				}}>
				{!isEditing ? (
					<div
						onClick={() => {
							setEditText(node.text || "");
							setEditState(node.state || "present");
							setIsEditing(true);
						}}
						title="Click to edit"
						style={{
							fontSize: 15,
							lineHeight: 1.7,
							color: "#C8D6E8",
							fontFamily: "Georgia, 'Times New Roman', serif",
							fontStyle: "italic",
							cursor: "text",
							padding: "14px 16px",
							background: "rgba(255,255,255,0.025)",
							borderRadius: 10,
							border: "1px solid rgba(255,255,255,0.05)",
							borderLeft: `3px solid ${tc.color}55`,
							transition: "background 0.2s",
							position: "relative",
							minHeight: 52,
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.background = "rgba(255,255,255,0.04)";
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.background = "rgba(255,255,255,0.025)";
						}}>
						{node.text || (
							<span style={{ color: "#334155", fontStyle: "italic" }}>
								{tc.description}
							</span>
						)}
						<span
							style={{
								position: "absolute",
								bottom: 7,
								right: 9,
								fontSize: 9,
								color: "#1E293B",
								fontStyle: "normal",
								fontFamily: "system-ui, sans-serif",
								letterSpacing: "0.08em",
								textTransform: "uppercase",
								fontWeight: 700,
							}}>
							edit
						</span>
					</div>
				) : (
					<div>
						<textarea
							value={editText}
							onChange={(e) => setEditText(e.target.value)}
							autoFocus
							rows={4}
							style={{
								width: "100%",
								padding: "14px 16px",
								background: "rgba(8,13,25,0.85)",
								border: `2px solid ${tc.color}70`,
								borderRadius: 10,
								color: "#C8D6E8",
								fontSize: 15,
								fontFamily: "Georgia, 'Times New Roman', serif",
								fontStyle: "italic",
								lineHeight: 1.7,
								resize: "none",
								outline: "none",
								boxSizing: "border-box",
								marginBottom: 10,
							}}
						/>

						{/* State picker */}
						<div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
							{stateOptions.map((s) => (
								<button
									key={s}
									onClick={() => setEditState(s)}
									style={{
										flex: 1,
										padding: "7px 0",
										borderRadius: 7,
										border: `1px solid ${
											editState === s
												? STATE_CONFIG[s].color
												: "rgba(255,255,255,0.08)"
										}`,
										background:
											editState === s
												? `${STATE_CONFIG[s].color}20`
												: "transparent",
										color: editState === s ? STATE_CONFIG[s].color : "#334155",
										cursor: "pointer",
										fontSize: 11,
										fontWeight: 700,
										outline: "none",
										transition: "all 0.15s",
									}}>
									{STATE_CONFIG[s].label}
								</button>
							))}
						</div>

						<div style={{ display: "flex", gap: 8 }}>
							<button
								onClick={handleCancelEdit}
								style={{
									flex: 1,
									padding: "9px",
									borderRadius: 8,
									border: "1px solid rgba(255,255,255,0.08)",
									background: "transparent",
									color: "#475569",
									fontSize: 11,
									fontWeight: 700,
									cursor: "pointer",
									outline: "none",
									transition: "all 0.15s",
								}}
								onMouseEnter={(e) => {
									e.currentTarget.style.color = "#94A3B8";
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.color = "#475569";
								}}>
								Cancel
							</button>
							<button
								onClick={handleSave}
								disabled={!editText.trim()}
								style={{
									flex: 2,
									padding: "9px",
									borderRadius: 8,
									border: "none",
									background: editText.trim() ? tc.color : "rgba(30,41,59,0.5)",
									color: "#fff",
									fontSize: 11,
									fontWeight: 700,
									cursor: editText.trim() ? "pointer" : "not-allowed",
									outline: "none",
									opacity: editText.trim() ? 1 : 0.4,
									transition: "all 0.15s",
								}}>
								Save ✦
							</button>
						</div>
					</div>
				)}
			</div>

			{/* ── TIMESTAMP ──────────────────────────────────────────────────── */}
			{!isEditing && node.timestamp && (
				<div
					style={{
						padding: "0 20px 14px",
						flexShrink: 0,
						position: "relative",
						zIndex: 1,
					}}>
					<span
						style={{
							fontSize: 10,
							color: "#1E2D3D",
							fontWeight: 600,
							letterSpacing: "0.06em",
						}}>
						{new Date(node.timestamp).toLocaleString(undefined, {
							month: "short",
							day: "numeric",
							hour: "2-digit",
							minute: "2-digit",
						})}
					</span>
				</div>
			)}

			{/* ── DIVIDER ────────────────────────────────────────────────────── */}
			{!isEditing && (
				<div
					style={{
						margin: "0 20px",
						height: 1,
						background: "rgba(255,255,255,0.055)",
						flexShrink: 0,
					}}
				/>
			)}

			{/* ── REFLECTION SUMMARY ─────────────────────────────────────────── */}
			{!isEditing && (
				<div
					style={{
						padding: "16px 20px",
						flexShrink: 0,
						position: "relative",
						zIndex: 1,
					}}>
					<span
						style={{
							display: "block",
							fontSize: 9,
							fontWeight: 700,
							letterSpacing: "0.14em",
							textTransform: "uppercase",
							color: "#253044",
							marginBottom: 10,
						}}>
						Reflections{totalMoons > 0 ? ` · ${totalMoons}` : ""}
					</span>

					{totalMoons === 0 ? (
						<p
							style={{
								margin: 0,
								fontSize: 12,
								color: "#1E2D3D",
								fontStyle: "italic",
							}}>
							No reflections yet. Open this planet to begin.
						</p>
					) : (
						<div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
							{Object.entries(dimCounts).map(([dim, count]) => (
								<DimCount key={dim} dimension={dim} count={count} />
							))}
						</div>
					)}
				</div>
			)}

			{/* ── SPACER ─────────────────────────────────────────────────────── */}
			<div style={{ flex: 1 }} />

			{/* ── ACTIONS ────────────────────────────────────────────────────── */}
			{!isEditing && (
				<div
					style={{
						padding: "14px 20px",
						borderTop: "1px solid rgba(255,255,255,0.05)",
						display: "flex",
						flexDirection: "column",
						gap: 8,
						flexShrink: 0,
						zIndex: 1,
						position: "relative",
					}}>
					{/* Open Reflections */}
					<button
						onMouseEnter={() => setOpenHovered(true)}
						onMouseLeave={() => setOpenHovered(false)}
						onClick={onOpenReflections}
						style={{
							width: "100%",
							padding: "12px 16px",
							borderRadius: 9,
							border: `1px solid ${openHovered ? `${tc.color}70` : `${tc.color}30`}`,
							background: openHovered ? `${tc.color}18` : `${tc.color}0A`,
							color: openHovered ? tc.color : `${tc.color}99`,
							cursor: "pointer",
							fontSize: 11,
							fontWeight: 700,
							letterSpacing: "0.06em",
							textTransform: "uppercase",
							transition: "all 0.18s ease",
							outline: "none",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							gap: 7,
						}}>
						<span style={{ fontSize: 14 }}>✦</span>
						Open Reflections
					</button>

					{/* Delete */}
					<button
						onMouseEnter={() => setDeleteHovered(true)}
						onMouseLeave={() => setDeleteHovered(false)}
						onClick={handleDelete}
						style={{
							width: "100%",
							padding: "10px 16px",
							borderRadius: 9,
							border: `1px solid ${
								deleteHovered ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.06)"
							}`,
							background: deleteHovered
								? "rgba(239,68,68,0.08)"
								: "rgba(255,255,255,0.015)",
							color: deleteHovered ? "#EF4444" : "#253044",
							cursor: "pointer",
							fontSize: 11,
							fontWeight: 700,
							letterSpacing: "0.06em",
							textTransform: "uppercase",
							transition: "all 0.18s ease",
							outline: "none",
						}}>
						Delete Node
					</button>
				</div>
			)}
		</div>
	);
}
