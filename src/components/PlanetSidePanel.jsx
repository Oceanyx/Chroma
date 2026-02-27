// src/components/PlanetSidePanel.jsx - V1.3
// Changes from V1.2:
//   - Constellation membership section: lists constellations this node belongs to
//   - "Leave" button per constellation (calls onLeaveConstellation)
//   - "Add to constellation" picker — dropdown of constellations not yet joined
//     (calls onJoinConstellation)
//   - Uses constellationIds[] array, not the old constellationId scalar
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

// States for O (observation) and A (action) nodes
const OA_STATE_CONFIG = {
	active: {
		label: "Active",
		description: "Still unresolved or shaping current behaviour",
		color: "#FBBF24",
	},
	integrated: {
		label: "Integrated",
		description: "You've made sufficient sense of this",
		color: "#10B981",
	},
	revisiting: {
		label: "Revisiting",
		description: "You thought you were done — but you're back",
		color: "#A78BFA",
	},
};

// States for I (intention) nodes — temporal position genuinely matters
const I_STATE_CONFIG = {
	past: {
		label: "Past",
		description: "This intention was held in the past",
		color: "#64748B",
	},
	present: {
		label: "Present",
		description: "Currently active intention",
		color: "#10B981",
	},
	future: {
		label: "Future",
		description: "Intended for the future",
		color: "#3B82F6",
	},
};

function getStateConfig(nodeType) {
	return nodeType === "I" ? I_STATE_CONFIG : OA_STATE_CONFIG;
}

function getDefaultState(nodeType) {
	return nodeType === "I" ? "present" : "active";
}

import { CONSTELLATION_ARCHETYPES } from "../utils/constellationConfig";

// Helper: get archetype emoji from shared config
function getArchetypeEmoji(archetype) {
	return CONSTELLATION_ARCHETYPES[archetype]?.emoji || "";
}

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
	constellations, // all constellation records from SpaceCanvas
	onClose,
	onOpenReflections,
	onNodesUpdate,
	onLeaveConstellation, // (nodeId, constellationId) => void
	onJoinConstellation, // (nodeId, constellationId) => void
}) {
	const [isEditing, setIsEditing] = useState(false);
	const [editText, setEditText] = useState(node.text || "");
	const [editState, setEditState] = useState(
		node.state || getDefaultState(node.type),
	);
	const [editContext, setEditContext] = useState(node.context || "");
	const [editFocalQuestion, setEditFocalQuestion] = useState(
		node.focalQuestion || "",
	);
	const [showContext, setShowContext] = useState(!!node.context);
	const [showFocalQuestion, setShowFocalQuestion] = useState(
		!!node.focalQuestion,
	);
	const [showTemporalPrompt, setShowTemporalPrompt] = useState(
		// Show once if not yet set and planet has no temporal distance
		node.temporalDistance == null && (node.constellationIds || []).length === 0,
	);
	const [deleteHovered, setDeleteHovered] = useState(false);
	const [openHovered, setOpenHovered] = useState(false);
	const [showJoinPicker, setShowJoinPicker] = useState(false);

	const stateConfig = getStateConfig(node.type);
	const stateOptions = Object.keys(stateConfig);

	const tc = TYPE_CONFIG[node.type] || TYPE_CONFIG.O;
	const { Icon } = tc;

	// Constellation membership
	const memberIds = new Set(node.constellationIds || []);
	const memberConstellations = (constellations || []).filter((c) =>
		memberIds.has(c.id),
	);
	const joinableConstellations = (constellations || []).filter(
		(c) => !memberIds.has(c.id),
	);

	const dimCounts = {
		subjective: 0,
		behavioral: 0,
		intersubjective: 0,
		framing: 0,
	};
	(moons || []).forEach((m) => {
		const dim = m.dimension === "symbolic" ? "framing" : m.dimension;
		if (dimCounts[dim] !== undefined) dimCounts[dim]++;
	});
	const totalMoons = (moons || []).length;

	const handleSave = async () => {
		if (editText.trim()) {
			await db.nodes.update(node.id, {
				text: editText.trim(),
				state: editState,
				context: editContext.trim(),
				focalQuestion: editFocalQuestion.trim(),
			});
			await onNodesUpdate();
			setIsEditing(false);
		}
	};

	const handleCancelEdit = () => {
		setEditText(node.text || "");
		setEditState(node.state || getDefaultState(node.type));
		setEditContext(node.context || "");
		setEditFocalQuestion(node.focalQuestion || "");
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
				overflowY: "auto",
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
					{node.state && stateConfig[node.state] && (
						<span
							style={{
								padding: "3px 9px",
								borderRadius: 20,
								fontSize: 11,
								fontWeight: 700,
								letterSpacing: "0.05em",
								color: stateConfig[node.state].color,
								background: `${stateConfig[node.state].color}20`,
								border: `1px solid ${stateConfig[node.state].color}38`,
								title: stateConfig[node.state].description,
							}}>
							{stateConfig[node.state].label}
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
						<div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
							{stateOptions.map((s) => (
								<button
									key={s}
									onClick={() => setEditState(s)}
									title={stateConfig[s]?.description}
									style={{
										flex: 1,
										padding: "8px 0",
										borderRadius: 7,
										border: `1px solid ${editState === s ? stateConfig[s]?.color || tc.color : "rgba(255,255,255,0.1)"}`,
										background:
											editState === s
												? `${stateConfig[s]?.color || tc.color}22`
												: "transparent",
										color:
											editState === s
												? stateConfig[s]?.color || tc.color
												: "#7A8FA6",
										cursor: "pointer",
										fontSize: 12,
										fontWeight: 700,
										outline: "none",
										transition: "all 0.15s",
									}}>
									{stateConfig[s]?.label || s}
								</button>
							))}
						</div>

						{/* Context field */}
						<div style={{ marginBottom: 10 }}>
							<button
								onClick={() => setShowContext((v) => !v)}
								style={{
									background: "none",
									border: "none",
									color: "#6B7F95",
									fontSize: 11,
									fontWeight: 700,
									cursor: "pointer",
									letterSpacing: "0.08em",
									textTransform: "uppercase",
									padding: "0 0 5px",
									outline: "none",
								}}>
								{showContext ? "▾" : "▸"} Background conditions
							</button>
							{showContext && (
								<textarea
									value={editContext}
									onChange={(e) => setEditContext(e.target.value)}
									placeholder="What systemic forces, history, or constraints shaped what was possible here?"
									rows={3}
									style={{
										width: "100%",
										padding: "10px 12px",
										background: "rgba(8,13,25,0.7)",
										border: `1px solid ${tc.color}30`,
										borderRadius: 8,
										color: "#C8D6E8",
										fontSize: 13,
										fontFamily: "system-ui, sans-serif",
										resize: "vertical",
										outline: "none",
										boxSizing: "border-box",
										lineHeight: 1.5,
										marginTop: 4,
									}}
								/>
							)}
						</div>

						{/* Focal question field */}
						<div style={{ marginBottom: 10 }}>
							<button
								onClick={() => setShowFocalQuestion((v) => !v)}
								style={{
									background: "none",
									border: "none",
									color: "#6B7F95",
									fontSize: 11,
									fontWeight: 700,
									cursor: "pointer",
									letterSpacing: "0.08em",
									textTransform: "uppercase",
									padding: "0 0 5px",
									outline: "none",
								}}>
								{showFocalQuestion ? "▾" : "▸"} Focal question
							</button>
							{showFocalQuestion && (
								<input
									value={editFocalQuestion}
									onChange={(e) => setEditFocalQuestion(e.target.value)}
									placeholder="What are you actually trying to understand about this?"
									maxLength={140}
									style={{
										width: "100%",
										padding: "9px 12px",
										background: "rgba(8,13,25,0.7)",
										border: `1px solid ${tc.color}30`,
										borderRadius: 8,
										color: "#C8D6E8",
										fontSize: 13,
										fontFamily: "system-ui, sans-serif",
										outline: "none",
										boxSizing: "border-box",
										marginTop: 4,
									}}
								/>
							)}
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

			{/* Temporal distance one-time prompt */}
			{!isEditing && showTemporalPrompt && node.temporalDistance == null && (
				<div
					style={{
						padding: "0 20px 14px",
						flexShrink: 0,
						zIndex: 1,
						position: "relative",
					}}>
					<p
						style={{
							margin: "0 0 7px",
							fontSize: 11,
							color: "rgba(255,255,255,0.3)",
							fontStyle: "italic",
						}}>
						Before you reflect — how long ago did this happen?
					</p>
					<div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
						{[
							"within an hour",
							"same day",
							"days later",
							"weeks later",
							"longer",
						].map((opt) => (
							<button
								key={opt}
								onClick={async () => {
									await db.nodes.update(node.id, { temporalDistance: opt });
									await onNodesUpdate?.();
									setShowTemporalPrompt(false);
								}}
								style={{
									padding: "5px 10px",
									background: "rgba(255,255,255,0.04)",
									border: "1px solid rgba(255,255,255,0.12)",
									borderRadius: 20,
									color: "#7A8FA6",
									fontSize: 11,
									fontWeight: 600,
									cursor: "pointer",
									outline: "none",
								}}
								onMouseEnter={(e) => {
									e.currentTarget.style.color = "#C8D6E8";
									e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.color = "#7A8FA6";
									e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
								}}>
								{opt}
							</button>
						))}
						<button
							onClick={() => setShowTemporalPrompt(false)}
							style={{
								padding: "5px 10px",
								background: "none",
								border: "none",
								color: "#475569",
								fontSize: 11,
								cursor: "pointer",
								outline: "none",
							}}>
							skip
						</button>
					</div>
				</div>
			)}

			{/* Context + focal question read-only */}
			{!isEditing && (node.context || node.focalQuestion) && (
				<div
					style={{
						padding: "0 20px 14px",
						flexShrink: 0,
						zIndex: 1,
						position: "relative",
					}}>
					{node.focalQuestion && (
						<div style={{ marginBottom: node.context ? 8 : 0 }}>
							<span
								style={{
									fontSize: 10,
									fontWeight: 700,
									letterSpacing: "0.1em",
									textTransform: "uppercase",
									color: "#7A8FA6",
								}}>
								Exploring
							</span>
							<p
								style={{
									margin: "4px 0 0",
									fontSize: 13,
									color: "rgba(255,255,255,0.65)",
									fontStyle: "italic",
									lineHeight: 1.5,
								}}>
								{node.focalQuestion}
							</p>
						</div>
					)}
					{node.context && (
						<div>
							<span
								style={{
									fontSize: 10,
									fontWeight: 700,
									letterSpacing: "0.1em",
									textTransform: "uppercase",
									color: "#7A8FA6",
								}}>
								Context
							</span>
							<p
								style={{
									margin: "4px 0 0",
									fontSize: 12,
									color: "rgba(255,255,255,0.4)",
									lineHeight: 1.5,
								}}>
								{node.context}
							</p>
						</div>
					)}
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

			{/* ── CONSTELLATION MEMBERSHIP ───────────────────────────────────── */}
			{!isEditing && (
				<div
					style={{
						padding: "14px 20px",
						flexShrink: 0,
						position: "relative",
						zIndex: 1,
					}}>
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							marginBottom: 8,
						}}>
						<span
							style={{
								fontSize: 10,
								fontWeight: 700,
								letterSpacing: "0.14em",
								textTransform: "uppercase",
								color: "#7A8FA6",
							}}>
							Constellations
							{memberConstellations.length > 0
								? ` · ${memberConstellations.length}`
								: ""}
						</span>
						{joinableConstellations.length > 0 && (
							<button
								onClick={() => setShowJoinPicker((v) => !v)}
								style={{
									background: showJoinPicker ? "rgba(108,99,255,0.2)" : "none",
									border: "1px solid rgba(108,99,255,0.3)",
									borderRadius: 5,
									color: "#A78BFA",
									cursor: "pointer",
									fontSize: 11,
									fontWeight: 700,
									padding: "3px 9px",
									outline: "none",
								}}>
								+ Add
							</button>
						)}
					</div>

					{/* Join picker dropdown */}
					{showJoinPicker && joinableConstellations.length > 0 && (
						<div
							style={{
								marginBottom: 8,
								background: "rgba(10,15,28,0.95)",
								border: "1px solid rgba(108,99,255,0.25)",
								borderRadius: 8,
								overflow: "hidden",
							}}>
							{joinableConstellations.map((c) => {
								const emoji = getArchetypeEmoji(c.archetype) || "";
								return (
									<button
										key={c.id}
										onClick={() => {
											onJoinConstellation?.(node.id, c.id);
											setShowJoinPicker(false);
										}}
										style={{
											display: "flex",
											alignItems: "center",
											gap: 8,
											width: "100%",
											padding: "8px 12px",
											background: "none",
											border: "none",
											borderBottom: "1px solid rgba(255,255,255,0.05)",
											color: "rgba(255,255,255,0.8)",
											fontSize: 12,
											cursor: "pointer",
											textAlign: "left",
											fontFamily: "system-ui, sans-serif",
										}}
										onMouseEnter={(e) =>
											(e.currentTarget.style.background =
												"rgba(108,99,255,0.12)")
										}
										onMouseLeave={(e) =>
											(e.currentTarget.style.background = "none")
										}>
										<span
											style={{
												width: 8,
												height: 8,
												borderRadius: "50%",
												background: "rgba(108,99,255,0.7)",
												flexShrink: 0,
											}}
										/>
										{emoji && <span>{emoji}</span>}
										<span
											style={{
												flex: 1,
												overflow: "hidden",
												textOverflow: "ellipsis",
												whiteSpace: "nowrap",
											}}>
											{c.label}
										</span>
										<span
											style={{
												fontSize: 10,
												color: "rgba(255,255,255,0.25)",
												flexShrink: 0,
											}}>
											{c.nodeIds.length} nodes
										</span>
									</button>
								);
							})}
						</div>
					)}

					{/* Current memberships */}
					{memberConstellations.length === 0 ? (
						<p
							style={{
								margin: 0,
								fontSize: 13,
								color: "#4A6080",
								fontStyle: "italic",
							}}>
							Not part of any constellation.
						</p>
					) : (
						<div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
							{memberConstellations.map((c) => {
								const emoji = getArchetypeEmoji(c.archetype) || "";
								return (
									<div
										key={c.id}
										style={{
											display: "flex",
											alignItems: "center",
											gap: 8,
											padding: "7px 10px",
											background: "rgba(108,99,255,0.07)",
											border: "1px solid rgba(108,99,255,0.18)",
											borderRadius: 7,
										}}>
										<span
											style={{
												width: 8,
												height: 8,
												borderRadius: "50%",
												background: "rgba(108,99,255,0.8)",
												flexShrink: 0,
											}}
										/>
										{emoji && <span style={{ fontSize: 13 }}>{emoji}</span>}
										<span
											style={{
												flex: 1,
												fontSize: 13,
												color: "#C4B5FD",
												fontWeight: 500,
												overflow: "hidden",
												textOverflow: "ellipsis",
												whiteSpace: "nowrap",
											}}>
											{c.label}
										</span>
										{c.collapsed && (
											<span
												style={{
													fontSize: 10,
													color: "rgba(255,255,255,0.3)",
													flexShrink: 0,
												}}>
												nebula
											</span>
										)}
										<button
											onClick={() => onLeaveConstellation?.(node.id, c.id)}
											title={`Leave "${c.label}"`}
											style={{
												background: "none",
												border: "none",
												color: "rgba(239,68,68,0.45)",
												cursor: "pointer",
												fontSize: 13,
												padding: "0 2px",
												lineHeight: 1,
												flexShrink: 0,
											}}
											onMouseEnter={(e) =>
												(e.currentTarget.style.color = "rgba(239,68,68,0.9)")
											}
											onMouseLeave={(e) =>
												(e.currentTarget.style.color = "rgba(239,68,68,0.45)")
											}>
											✕
										</button>
									</div>
								);
							})}
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
