// src/components/MoonSidePanel.jsx - V5.0 Redesigned
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { moonConfig, lenses as ALL_LENSES } from "../seedData";

export const PANEL_WIDTH = 460;

const DIM_STYLES = {
	subjective: {
		bg: "linear-gradient(170deg, rgba(167,139,250,0.08) 0%, rgba(8,13,25,0.99) 30%)",
		borderColor: "rgba(167,139,250,0.25)",
		glow: "rgba(167,139,250,0.14)",
		accent: "#A78BFA",
	},
	behavioral: {
		bg: "linear-gradient(170deg, rgba(251,146,60,0.08) 0%, rgba(8,13,25,0.99) 30%)",
		borderColor: "rgba(251,146,60,0.25)",
		glow: "rgba(251,146,60,0.14)",
		accent: "#FB923C",
	},
	intersubjective: {
		bg: "linear-gradient(170deg, rgba(52,211,153,0.08) 0%, rgba(8,13,25,0.99) 30%)",
		borderColor: "rgba(52,211,153,0.25)",
		glow: "rgba(52,211,153,0.14)",
		accent: "#34D399",
	},
	symbolic: {
		bg: "linear-gradient(170deg, rgba(96,165,250,0.08) 0%, rgba(8,13,25,0.99) 30%)",
		borderColor: "rgba(96,165,250,0.25)",
		glow: "rgba(96,165,250,0.14)",
		accent: "#60A5FA",
	},
};

// ── Small state chip (uncertain / anchor) ────────────────────────────────────
function StateChip({ active, activeColor, onClick, children }) {
	const [hovered, setHovered] = useState(false);
	return (
		<button
			onClick={onClick}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			style={{
				padding: "4px 10px",
				borderRadius: 20,
				border: `1px solid ${
					active ? `${activeColor}55` : "rgba(255,255,255,0.09)"
				}`,
				background: active
					? `${activeColor}18`
					: hovered
						? "rgba(255,255,255,0.05)"
						: "transparent",
				color: active ? activeColor : hovered ? "#94A3B8" : "#475569",
				fontSize: 10,
				fontWeight: 700,
				letterSpacing: "0.05em",
				cursor: "pointer",
				whiteSpace: "nowrap",
				transition: "all 0.15s ease",
				outline: "none",
				userSelect: "none",
			}}>
			{children}
		</button>
	);
}

// ── Relationship action button (tension / resonance) ─────────────────────────
function RelActionButton({ type, onClick }) {
	const [hovered, setHovered] = useState(false);
	const isTension = type === "tension";
	const accent = isTension ? "#EF4444" : "#10B981";
	const icon = isTension ? "⚡" : "〜";
	const label = isTension ? "Conflicts With" : "Resonates With";

	return (
		<button
			onClick={onClick}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			style={{
				flex: 1,
				padding: "12px 8px",
				background: hovered ? `${accent}18` : "rgba(255,255,255,0.025)",
				border: `1px solid ${hovered ? `${accent}55` : "rgba(255,255,255,0.07)"}`,
				borderRadius: 10,
				color: hovered ? accent : "#4A5568",
				cursor: "pointer",
				fontSize: 11,
				fontWeight: 700,
				letterSpacing: "0.04em",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				gap: 5,
				transition: "all 0.18s ease",
				outline: "none",
			}}>
			<span style={{ fontSize: 17 }}>{icon}</span>
			<span>{label}</span>
		</button>
	);
}

// ── Single relationship link row ──────────────────────────────────────────────
function RelLink({ rel, onRemove }) {
	const [hovered, setHovered] = useState(false);
	const isTension = rel.type === "tension";
	const accent = isTension ? "#EF4444" : "#10B981";

	return (
		<div
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			style={{
				display: "flex",
				alignItems: "center",
				gap: 10,
				padding: "8px 12px",
				background: hovered ? `${accent}10` : "rgba(255,255,255,0.025)",
				border: `1px solid ${hovered ? `${accent}40` : "rgba(255,255,255,0.06)"}`,
				borderRadius: 8,
				transition: "all 0.15s ease",
				cursor: "default",
			}}>
			<span style={{ fontSize: 12, flexShrink: 0 }}>
				{isTension ? "⚡" : "〜"}
			</span>
			<span
				style={{
					fontSize: 12,
					color: "#64748B",
					flex: 1,
					overflow: "hidden",
					textOverflow: "ellipsis",
					whiteSpace: "nowrap",
					fontStyle: "italic",
				}}>
				{rel.targetMoon?.text?.substring(0, 44)}
				{rel.targetMoon?.text?.length > 44 ? "…" : ""}
			</span>
			{hovered && (
				<button
					onClick={onRemove}
					style={{
						background: "none",
						border: "none",
						color: "#EF4444",
						cursor: "pointer",
						fontSize: 10,
						fontWeight: 700,
						letterSpacing: "0.05em",
						padding: "2px 4px",
						opacity: 0.8,
						outline: "none",
						flexShrink: 0,
					}}>
					REMOVE
				</button>
			)}
		</div>
	);
}

// ── Main panel ────────────────────────────────────────────────────────────────
export default function MoonSidePanel({
	moon,
	allMoons,
	dimColor,
	onClose,
	onAction,
	onStartRelationship,
}) {
	const [isEditing, setIsEditing] = useState(false);
	const [editText, setEditText] = useState(moon.text);
	const [editLenses, setEditLenses] = useState(moon.lensesUsed || []);
	const [relationshipMode, setRelationshipMode] = useState(null); // 'tension' | 'resonance' | null
	const [releaseHovered, setReleaseHovered] = useState(false);

	const config = moonConfig.dimension[moon.dimension];
	const dimStyle = DIM_STYLES[moon.dimension] || DIM_STYLES.subjective;

	// Reset edit state when moon changes
	useEffect(() => {
		setEditText(moon.text);
		setEditLenses(moon.lensesUsed || []);
		setIsEditing(false);
		setRelationshipMode(null);
	}, [moon.id]);

	const toggleLens = (id) =>
		setEditLenses((prev) =>
			prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id],
		);

	const handleSave = () => {
		if (editText.trim()) {
			onAction("save-edit", moon, {
				text: editText.trim(),
				lensesUsed: editLenses,
			});
			setIsEditing(false);
		}
	};

	const handleCancelEdit = () => {
		setIsEditing(false);
		setEditText(moon.text);
		setEditLenses(moon.lensesUsed || []);
	};

	const handleStartRel = (type) => {
		setRelationshipMode(type);
		onStartRelationship(type, moon);
	};

	const relatedLinks = (moon.relationships || [])
		.map((rel) => {
			const target = allMoons.find((m) => m.id === rel.targetMoonId);
			return target ? { ...rel, targetMoon: target } : null;
		})
		.filter(Boolean);

	return (
		<div
			style={{
				width: `${PANEL_WIDTH}px`,
				height: "100%",
				display: "flex",
				flexDirection: "column",
				background: dimStyle.bg,
				borderLeft: `1px solid ${dimStyle.borderColor}`,
				boxShadow: `inset 3px 0 0 0 ${dimColor}, -8px 0 32px rgba(0,0,0,0.35)`,
				position: "relative",
				overflow: "hidden",
				flexShrink: 0,
			}}>
			{/* Ambient corner glow */}
			<div
				style={{
					position: "absolute",
					top: -80,
					left: -80,
					width: 240,
					height: 240,
					borderRadius: "50%",
					background: `radial-gradient(circle, ${dimStyle.glow} 0%, transparent 70%)`,
					pointerEvents: "none",
					zIndex: 0,
				}}
			/>

			{/* ── HEADER ───────────────────────────────────────────────────────── */}
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
				{/* Dimension label */}
				<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
					<span
						style={{
							display: "inline-block",
							width: 7,
							height: 7,
							borderRadius: "50%",
							background: dimColor,
							boxShadow: `0 0 6px ${dimColor}`,
							flexShrink: 0,
						}}
					/>
					<span
						style={{
							fontSize: 10,
							fontWeight: 700,
							letterSpacing: "0.12em",
							textTransform: "uppercase",
							color: dimColor,
							opacity: 0.85,
						}}>
						{config.name}
					</span>
				</div>

				{/* Right: state chips + close */}
				<div style={{ display: "flex", alignItems: "center", gap: 6 }}>
					<StateChip
						active={moon.confidence === "wobbly"}
						activeColor="#FBBF24"
						onClick={() => onAction("uncertain", moon)}>
						〰 Uncertain
					</StateChip>
					<StateChip
						active={moon.isLocked}
						activeColor="#60A5FA"
						onClick={() => onAction("anchor", moon)}>
						⚓ Anchor
					</StateChip>
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
							marginLeft: 2,
							transition: "all 0.15s",
							outline: "none",
							flexShrink: 0,
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
			</div>

			{/* ── REFLECTION TEXT ───────────────────────────────────────────────── */}
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
							setEditText(moon.text);
							setIsEditing(true);
						}}
						title="Click to edit"
						style={{
							fontSize: 16,
							lineHeight: 1.75,
							color: "#C8D6E8",
							fontStyle: "italic",
							fontFamily: "Georgia, 'Times New Roman', serif",
							letterSpacing: "0.01em",
							cursor: "text",
							padding: "16px 18px",
							background: "rgba(255,255,255,0.025)",
							borderRadius: 10,
							border: "1px solid rgba(255,255,255,0.05)",
							borderLeft: `3px solid ${dimColor}55`,
							transition: "background 0.2s, border-color 0.2s",
							position: "relative",
							minHeight: 60,
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.background = "rgba(255,255,255,0.04)";
							e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.background = "rgba(255,255,255,0.025)";
							e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)";
						}}>
						{moon.text}
						<span
							style={{
								position: "absolute",
								bottom: 8,
								right: 10,
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
								padding: "16px 18px",
								background: "rgba(8,13,25,0.8)",
								border: `2px solid ${dimColor}70`,
								borderRadius: 10,
								color: "#C8D6E8",
								fontSize: 16,
								fontFamily: "Georgia, 'Times New Roman', serif",
								fontStyle: "italic",
								lineHeight: 1.75,
								resize: "none",
								outline: "none",
								boxSizing: "border-box",
								letterSpacing: "0.01em",
							}}
						/>

						{/* Lens toggles while editing */}
						<div
							style={{
								display: "flex",
								flexWrap: "wrap",
								gap: 6,
								margin: "10px 0 10px",
							}}>
							{ALL_LENSES.map((lens) => (
								<button
									key={lens.id}
									onClick={() => toggleLens(lens.id)}
									style={{
										padding: "4px 10px",
										borderRadius: 20,
										border: `1px solid ${
											editLenses.includes(lens.id)
												? `${lens.color}60`
												: "rgba(255,255,255,0.1)"
										}`,
										background: editLenses.includes(lens.id)
											? `${lens.color}20`
											: "transparent",
										color: editLenses.includes(lens.id)
											? lens.color
											: "#475569",
										fontSize: 10,
										fontWeight: 700,
										cursor: "pointer",
										display: "flex",
										alignItems: "center",
										gap: 4,
										outline: "none",
										transition: "all 0.15s",
									}}>
									{lens.emoji} {lens.label}
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
									border: "1px solid rgba(255,255,255,0.08)",
									background: "transparent",
									color: "#475569",
									fontSize: 12,
									fontWeight: 700,
									cursor: "pointer",
									outline: "none",
									transition: "all 0.15s",
								}}
								onMouseEnter={(e) => {
									e.currentTarget.style.color = "#94A3B8";
									e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.color = "#475569";
									e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
								}}>
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
									background: editText.trim() ? dimColor : "rgba(30,41,59,0.5)",
									color: "#fff",
									fontSize: 12,
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

			{/* ── LENSES (read-only, only when not editing) ─────────────────────── */}
			{!isEditing && moon.lensesUsed && moon.lensesUsed.length > 0 && (
				<div
					style={{
						padding: "0 20px 14px",
						display: "flex",
						flexWrap: "wrap",
						gap: 6,
						flexShrink: 0,
						position: "relative",
						zIndex: 1,
					}}>
					{moon.lensesUsed.map((lensId) => {
						const l = ALL_LENSES.find((x) => x.id === lensId);
						if (!l) return null;
						return (
							<span
								key={lensId}
								style={{
									padding: "3px 9px",
									borderRadius: 20,
									fontSize: 10,
									fontWeight: 700,
									color: l.color,
									background: `${l.color}12`,
									border: `1px solid ${l.color}28`,
									display: "flex",
									alignItems: "center",
									gap: 4,
									letterSpacing: "0.04em",
								}}>
								{l.emoji} {l.label}
							</span>
						);
					})}
				</div>
			)}

			{/* ── DIVIDER ───────────────────────────────────────────────────────── */}
			{!isEditing && (
				<div
					style={{
						margin: "0 20px",
						height: 1,
						background: "rgba(255,255,255,0.055)",
						flexShrink: 0,
						zIndex: 1,
					}}
				/>
			)}

			{/* ── RELATIONSHIPS ─────────────────────────────────────────────────── */}
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
							marginBottom: 12,
						}}>
						Relationships
					</span>

					{/* Mode banner when selecting a target */}
					{relationshipMode && (
						<div
							style={{
								padding: "10px 14px",
								borderRadius: 8,
								border: `1px solid ${
									relationshipMode === "tension"
										? "rgba(239,68,68,0.4)"
										: "rgba(16,185,129,0.4)"
								}`,
								background:
									relationshipMode === "tension"
										? "rgba(239,68,68,0.08)"
										: "rgba(16,185,129,0.08)",
								fontSize: 11,
								fontWeight: 600,
								color: relationshipMode === "tension" ? "#FCA5A5" : "#6EE7B7",
								marginBottom: 10,
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
							}}>
							<span>
								{relationshipMode === "tension"
									? "⚡ Click the conflicting moon"
									: "〜 Click the resonating moon"}
							</span>
							<button
								onClick={() => setRelationshipMode(null)}
								style={{
									background: "none",
									border: "none",
									color: "inherit",
									cursor: "pointer",
									fontSize: 10,
									fontWeight: 700,
									letterSpacing: "0.05em",
									opacity: 0.7,
									outline: "none",
								}}>
								CANCEL
							</button>
						</div>
					)}

					{/* Action buttons */}
					{!relationshipMode && (
						<div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
							<RelActionButton
								type="tension"
								onClick={() => handleStartRel("tension")}
							/>
							<RelActionButton
								type="resonance"
								onClick={() => handleStartRel("support")}
							/>
						</div>
					)}

					{/* Active relationship links */}
					{relatedLinks.length > 0 && (
						<div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
							{relatedLinks.map((rel) => (
								<RelLink
									key={rel.targetMoonId}
									rel={rel}
									onRemove={() => {
										// Surface this to parent via onAction
										onAction("remove-relationship", moon, {
											targetMoonId: rel.targetMoonId,
										});
									}}
								/>
							))}
						</div>
					)}
				</div>
			)}

			{/* ── SPACER ────────────────────────────────────────────────────────── */}
			<div style={{ flex: 1 }} />

			{/* ── FOOTER: Release into Void ─────────────────────────────────────── */}
			{!isEditing && (
				<div
					style={{
						padding: "14px 20px",
						borderTop: "1px solid rgba(255,255,255,0.05)",
						flexShrink: 0,
						zIndex: 1,
						position: "relative",
					}}>
					<button
						onMouseEnter={() => setReleaseHovered(true)}
						onMouseLeave={() => setReleaseHovered(false)}
						onClick={() => onAction("delete", moon)}
						style={{
							width: "100%",
							padding: "11px 16px",
							borderRadius: 9,
							border: `1px solid ${
								releaseHovered
									? "rgba(239,68,68,0.5)"
									: "rgba(255,255,255,0.07)"
							}`,
							background: releaseHovered
								? "rgba(239,68,68,0.08)"
								: "rgba(255,255,255,0.02)",
							color: releaseHovered ? "#EF4444" : "#2D3F55",
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
						<span style={{ fontSize: 13, opacity: releaseHovered ? 1 : 0.5 }}>
							✦
						</span>
						Release into Void
					</button>
				</div>
			)}
		</div>
	);
}
