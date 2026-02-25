// src/components/PlanetSidePanel.jsx - V1.2
// Better contrast: #3D5070 → #7A8FA6, #2D3F55 → #6B7F95, #1E293B → #4A6080
import React, { useState } from "react";
import { X, Eye, Zap, Target } from "lucide-react";
import { moonConfig } from "../seedData";
import { db, cascadeDeleteNode } from "../lib/db";

export const PLANET_PANEL_WIDTH = 380;

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

function DimCount({ dimension, count }) {
	const cfg = moonConfig.dimension[dimension];
	if (!cfg || count === 0) return null;
	return (
		<div
			style={{
				display: "flex",
				alignItems: "center",
				gap: 7,
				padding: "7px 11px",
				borderRadius: 7,
				background: `${cfg.color}10`,
				border: `1px solid ${cfg.color}28`,
			}}>
			<span
				style={{
					width: 8,
					height: 8,
					borderRadius: "50%",
					background: cfg.color,
					boxShadow: `0 0 5px ${cfg.color}`,
					flexShrink: 0,
					display: "inline-block",
				}}
			/>
			<span style={{ fontSize: 13, color: cfg.color, fontWeight: 700 }}>
				{count}
			</span>
			<span style={{ fontSize: 13, color: "#7A8FA6", fontWeight: 600 }}>
				{cfg.name}
			</span>
		</div>
	);
}

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
				color: "#C8D6E8",
			}}>
			{/* Ambient glow */}
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
					<Icon size={14} color={tc.color} />
					<span
						style={{
							fontSize: 13,
							fontWeight: 700,
							letterSpacing: "0.1em",
							textTransform: "uppercase",
							color: tc.color,
						}}>
						{tc.label}
					</span>
					{node.state && STATE_CONFIG[node.state] && (
						<span
							style={{
								padding: "3px 9px",
								borderRadius: 20,
								fontSize: 11,
								fontWeight: 700,
								letterSpacing: "0.05em",
								color: STATE_CONFIG[node.state].color,
								background: `${STATE_CONFIG[node.state].color}20`,
								border: `1px solid ${STATE_CONFIG[node.state].color}38`,
							}}>
							{STATE_CONFIG[node.state].label}
						</span>
					)}
				</div>
				<button
					onClick={onClose}
					style={{
						background: "none",
						border: "1px solid rgba(255,255,255,0.1)",
						borderRadius: 6,
						color: "#6B7F95",
						cursor: "pointer",
						width: 28,
						height: 28,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						outline: "none",
						transition: "all 0.15s",
					}}
					onMouseEnter={(e) => {
						e.currentTarget.style.color = "#C8D6E8";
						e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.color = "#6B7F95";
						e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
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
							fontSize: 16,
							lineHeight: 1.75,
							color: "#D4E1F0",
							fontFamily: "Georgia, 'Times New Roman', serif",
							fontStyle: "italic",
							cursor: "text",
							padding: "15px 16px",
							background: "rgba(255,255,255,0.03)",
							borderRadius: 10,
							border: "1px solid rgba(255,255,255,0.07)",
							borderLeft: `3px solid ${tc.color}60`,
							transition: "background 0.2s",
							position: "relative",
							minHeight: 56,
						}}
						onMouseEnter={(e) =>
							(e.currentTarget.style.background = "rgba(255,255,255,0.055)")
						}
						onMouseLeave={(e) =>
							(e.currentTarget.style.background = "rgba(255,255,255,0.03)")
						}>
						{node.text || (
							<span style={{ color: "#4A6080", fontStyle: "italic" }}>
								{tc.description}
							</span>
						)}
						<span
							style={{
								position: "absolute",
								bottom: 7,
								right: 9,
								fontSize: 10,
								color: "#4A6080",
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
								padding: "15px 16px",
								background: "rgba(8,13,25,0.85)",
								border: `2px solid ${tc.color}70`,
								borderRadius: 10,
								color: "#D4E1F0",
								fontSize: 16,
								fontFamily: "Georgia, 'Times New Roman', serif",
								fontStyle: "italic",
								lineHeight: 1.75,
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
										padding: "8px 0",
										borderRadius: 7,
										border: `1px solid ${editState === s ? STATE_CONFIG[s].color : "rgba(255,255,255,0.1)"}`,
										background:
											editState === s
												? `${STATE_CONFIG[s].color}22`
												: "transparent",
										color: editState === s ? STATE_CONFIG[s].color : "#7A8FA6",
										cursor: "pointer",
										fontSize: 12,
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
									padding: "10px",
									borderRadius: 8,
									border: "1px solid rgba(255,255,255,0.1)",
									background: "transparent",
									color: "#6B7F95",
									fontSize: 13,
									fontWeight: 700,
									cursor: "pointer",
									outline: "none",
									transition: "all 0.15s",
								}}
								onMouseEnter={(e) => (e.currentTarget.style.color = "#94A3B8")}
								onMouseLeave={(e) => (e.currentTarget.style.color = "#6B7F95")}>
								Cancel
							</button>
							<button
								onClick={handleSave}
								disabled={!editText.trim()}
								style={{
									flex: 2,
									padding: "10px",
									borderRadius: 8,
									border: "none",
									background: editText.trim() ? tc.color : "rgba(30,41,59,0.5)",
									color: "#fff",
									fontSize: 13,
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

			{/* Timestamp */}
			{!isEditing && node.timestamp && (
				<div
					style={{
						padding: "0 20px 14px",
						flexShrink: 0,
						zIndex: 1,
						position: "relative",
					}}>
					<span
						style={{
							fontSize: 12,
							color: "#6B7F95",
							fontWeight: 600,
							letterSpacing: "0.05em",
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

			{/* Divider */}
			{!isEditing && (
				<div
					style={{
						margin: "0 20px",
						height: 1,
						background: "rgba(255,255,255,0.07)",
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
							fontSize: 10,
							fontWeight: 700,
							letterSpacing: "0.14em",
							textTransform: "uppercase",
							color: "#7A8FA6",
							marginBottom: 10,
						}}>
						Reflections{totalMoons > 0 ? ` · ${totalMoons}` : ""}
					</span>
					{totalMoons === 0 ? (
						<p
							style={{
								margin: 0,
								fontSize: 13,
								color: "#4A6080",
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

			<div style={{ flex: 1 }} />

			{/* ── ACTIONS ────────────────────────────────────────────────────── */}
			{!isEditing && (
				<div
					style={{
						padding: "14px 20px",
						borderTop: "1px solid rgba(255,255,255,0.06)",
						display: "flex",
						flexDirection: "column",
						gap: 8,
						flexShrink: 0,
						zIndex: 1,
						position: "relative",
					}}>
					<button
						onMouseEnter={() => setOpenHovered(true)}
						onMouseLeave={() => setOpenHovered(false)}
						onClick={onOpenReflections}
						style={{
							width: "100%",
							padding: "13px 16px",
							borderRadius: 9,
							border: `1px solid ${openHovered ? `${tc.color}75` : `${tc.color}35`}`,
							background: openHovered ? `${tc.color}20` : `${tc.color}0C`,
							color: openHovered ? tc.color : `${tc.color}99`,
							cursor: "pointer",
							fontSize: 13,
							fontWeight: 700,
							letterSpacing: "0.06em",
							textTransform: "uppercase",
							transition: "all 0.18s",
							outline: "none",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							gap: 7,
						}}>
						<span style={{ fontSize: 15 }}>✦</span>
						Open Reflections
					</button>

					<button
						onMouseEnter={() => setDeleteHovered(true)}
						onMouseLeave={() => setDeleteHovered(false)}
						onClick={handleDelete}
						style={{
							width: "100%",
							padding: "10px 16px",
							borderRadius: 9,
							border: `1px solid ${deleteHovered ? "rgba(239,68,68,0.55)" : "rgba(255,255,255,0.08)"}`,
							background: deleteHovered
								? "rgba(239,68,68,0.10)"
								: "rgba(255,255,255,0.02)",
							color: deleteHovered ? "#EF4444" : "#6B7F95",
							cursor: "pointer",
							fontSize: 12,
							fontWeight: 700,
							letterSpacing: "0.06em",
							textTransform: "uppercase",
							transition: "all 0.18s",
							outline: "none",
						}}>
						Delete Node
					</button>
				</div>
			)}
		</div>
	);
}
