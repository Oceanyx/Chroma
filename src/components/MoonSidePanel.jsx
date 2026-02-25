// src/components/MoonSidePanel.jsx - V7.0
// Changes from V6:
//   - Header redesigned: dimension name on its own row, chips in a separate row below
//   - All faded labels boosted: #253044 → #7A8FA6, #2D3F55 → #6B7F95, etc.
//   - StateChip inactive text brighter: #4A5E75 → #7A8FA6
//   - "edit" overlay text visible: #1E2D3D → #4A6080
//   - Section labels ("Relationships", "Viewed through") now #7A8FA6
//   - Timestamp brighter: #2D3F55 → #6B7F95
//   - Close button default state brighter: #334155 → #6B7F95
//   - Custom lens creation and editing logic unchanged
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { moonConfig, lenses as DEFAULT_LENSES } from "../seedData";

export const PANEL_WIDTH = 460;

const DIM_STYLES = {
	subjective: {
		bg: "linear-gradient(170deg, rgba(167,139,250,0.09) 0%, rgba(8,13,25,0.99) 32%)",
		borderColor: "rgba(167,139,250,0.28)",
		glow: "rgba(167,139,250,0.15)",
		accent: "#A78BFA",
	},
	behavioral: {
		bg: "linear-gradient(170deg, rgba(251,146,60,0.09) 0%, rgba(8,13,25,0.99) 32%)",
		borderColor: "rgba(251,146,60,0.28)",
		glow: "rgba(251,146,60,0.15)",
		accent: "#FB923C",
	},
	intersubjective: {
		bg: "linear-gradient(170deg, rgba(52,211,153,0.09) 0%, rgba(8,13,25,0.99) 32%)",
		borderColor: "rgba(52,211,153,0.28)",
		glow: "rgba(52,211,153,0.15)",
		accent: "#34D399",
	},
	symbolic: {
		bg: "linear-gradient(170deg, rgba(96,165,250,0.09) 0%, rgba(8,13,25,0.99) 32%)",
		borderColor: "rgba(96,165,250,0.28)",
		glow: "rgba(96,165,250,0.15)",
		accent: "#60A5FA",
	},
};

// ── Tooltip ───────────────────────────────────────────────────────────────────
function Tooltip({ text, children }) {
	const [visible, setVisible] = useState(false);
	const [pos, setPos] = useState({ x: 0, y: 0 });
	return (
		<div
			style={{ position: "relative", display: "inline-flex" }}
			onMouseEnter={(e) => {
				const r = e.currentTarget.getBoundingClientRect();
				setPos({ x: r.left + r.width / 2, y: r.bottom + 6 });
				setVisible(true);
			}}
			onMouseLeave={() => setVisible(false)}>
			{children}
			{visible && (
				<div
					style={{
						position: "fixed",
						left: pos.x,
						top: pos.y,
						transform: "translateX(-50%)",
						background: "rgba(8,12,24,0.97)",
						border: "1px solid rgba(148,163,184,0.2)",
						borderRadius: 7,
						padding: "7px 12px",
						fontSize: 12,
						color: "#94A3B8",
						zIndex: 9999,
						pointerEvents: "none",
						boxShadow: "0 4px 14px rgba(0,0,0,0.45)",
						maxWidth: 230,
						whiteSpace: "normal",
						textAlign: "center",
						lineHeight: 1.5,
					}}>
					{text}
				</div>
			)}
		</div>
	);
}

// ── State chip ────────────────────────────────────────────────────────────────
function StateChip({ active, activeColor, tooltip, onClick, children }) {
	const [hov, setHov] = useState(false);
	return (
		<Tooltip text={tooltip}>
			<button
				onClick={onClick}
				onMouseEnter={() => setHov(true)}
				onMouseLeave={() => setHov(false)}
				style={{
					padding: "5px 13px",
					borderRadius: 20,
					border: `1px solid ${active ? `${activeColor}60` : hov ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.1)"}`,
					background: active
						? `${activeColor}22`
						: hov
							? "rgba(255,255,255,0.07)"
							: "transparent",
					color: active ? activeColor : hov ? "#C8D6E8" : "#7A8FA6",
					fontSize: 12,
					fontWeight: 700,
					letterSpacing: "0.04em",
					cursor: "pointer",
					whiteSpace: "nowrap",
					transition: "all 0.15s",
					outline: "none",
					userSelect: "none",
				}}>
				{children}
			</button>
		</Tooltip>
	);
}

// ── Ownership chip ────────────────────────────────────────────────────────────
function OwnershipChip({ value, onToggle }) {
	const isEntertained = value === "entertained";
	const [hov, setHov] = useState(false);
	return (
		<Tooltip
			text={
				isEntertained
					? "You're trying on this idea without fully endorsing it"
					: "This is your own direct experience, stated as it felt to you"
			}>
			<button
				onClick={onToggle}
				onMouseEnter={() => setHov(true)}
				onMouseLeave={() => setHov(false)}
				style={{
					padding: "5px 13px",
					borderRadius: 20,
					border: `1px solid ${isEntertained ? "rgba(251,191,36,0.55)" : hov ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.1)"}`,
					background: isEntertained
						? "rgba(251,191,36,0.15)"
						: hov
							? "rgba(255,255,255,0.07)"
							: "transparent",
					color: isEntertained ? "#FBBF24" : hov ? "#C8D6E8" : "#7A8FA6",
					fontSize: 12,
					fontWeight: 700,
					letterSpacing: "0.04em",
					cursor: "pointer",
					transition: "all 0.15s",
					outline: "none",
				}}>
				{isEntertained ? "✦ Entertained" : "Asserted"}
			</button>
		</Tooltip>
	);
}

// ── Relationship button ───────────────────────────────────────────────────────
function RelActionButton({ type, onClick }) {
	const [hov, setHov] = useState(false);
	const isTension = type === "tension";
	const accent = isTension ? "#EF4444" : "#10B981";
	return (
		<button
			onClick={onClick}
			onMouseEnter={() => setHov(true)}
			onMouseLeave={() => setHov(false)}
			style={{
				flex: 1,
				padding: "13px 8px",
				background: hov ? `${accent}20` : "rgba(255,255,255,0.03)",
				border: `1px solid ${hov ? `${accent}60` : "rgba(255,255,255,0.09)"}`,
				borderRadius: 10,
				color: hov ? accent : "#6B7F95",
				cursor: "pointer",
				fontSize: 12,
				fontWeight: 700,
				letterSpacing: "0.04em",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				gap: 5,
				transition: "all 0.18s",
				outline: "none",
			}}>
			<span style={{ fontSize: 18 }}>{isTension ? "⚡" : "〜"}</span>
			<span>{isTension ? "Conflicts With" : "Resonates With"}</span>
		</button>
	);
}

// ── Relationship link ─────────────────────────────────────────────────────────
function RelLink({ rel, onRemove }) {
	const [hov, setHov] = useState(false);
	const isTension = rel.type === "tension";
	const accent = isTension ? "#EF4444" : "#10B981";
	return (
		<div
			onMouseEnter={() => setHov(true)}
			onMouseLeave={() => setHov(false)}
			style={{
				display: "flex",
				alignItems: "center",
				gap: 10,
				padding: "10px 13px",
				background: hov ? `${accent}12` : "rgba(255,255,255,0.03)",
				border: `1px solid ${hov ? `${accent}45` : "rgba(255,255,255,0.07)"}`,
				borderRadius: 8,
				transition: "all 0.15s",
				cursor: "default",
			}}>
			<span style={{ fontSize: 14, flexShrink: 0 }}>
				{isTension ? "⚡" : "〜"}
			</span>
			<span
				style={{
					fontSize: 13,
					color: "#8B9BAD",
					flex: 1,
					overflow: "hidden",
					textOverflow: "ellipsis",
					whiteSpace: "nowrap",
					fontStyle: "italic",
				}}>
				{rel.targetMoon?.text?.substring(0, 44)}
				{rel.targetMoon?.text?.length > 44 ? "…" : ""}
			</span>
			{hov && (
				<button
					onClick={onRemove}
					style={{
						background: "none",
						border: "none",
						color: "#EF4444",
						cursor: "pointer",
						fontSize: 11,
						fontWeight: 700,
						letterSpacing: "0.05em",
						padding: "2px 4px",
						outline: "none",
						flexShrink: 0,
					}}>
					REMOVE
				</button>
			)}
		</div>
	);
}

// ── Custom lens helpers ───────────────────────────────────────────────────────
const CUSTOM_KEY = "chroma_custom_lenses";
const LENS_EMOJIS = [
	"🔍",
	"🌱",
	"💡",
	"🎭",
	"🔬",
	"🕊️",
	"🌊",
	"🔥",
	"⚡",
	"🌙",
	"🌀",
	"🗝️",
	"🪞",
	"🧭",
	"🌺",
];
function loadCustomLenses() {
	try {
		return JSON.parse(localStorage.getItem(CUSTOM_KEY) || "[]");
	} catch {
		return [];
	}
}
function saveCustomLenses(l) {
	localStorage.setItem(CUSTOM_KEY, JSON.stringify(l));
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
	const [relationshipMode, setRelationshipMode] = useState(null);
	const [releaseHovered, setReleaseHovered] = useState(false);

	const [customLenses, setCustomLenses] = useState(loadCustomLenses);
	const [showNewLens, setShowNewLens] = useState(false);
	const [newLensLabel, setNewLensLabel] = useState("");
	const [newLensEmoji, setNewLensEmoji] = useState("🔍");

	const allLenses = [...DEFAULT_LENSES, ...customLenses];
	const config = moonConfig.dimension[moon.dimension];
	const ds = DIM_STYLES[moon.dimension] || DIM_STYLES.subjective;

	useEffect(() => {
		setEditText(moon.text);
		setEditLenses(moon.lensesUsed || []);
		setIsEditing(false);
		setRelationshipMode(null);
		setShowNewLens(false);
	}, [moon.id]);

	const toggleLens = (id) =>
		setEditLenses((prev) =>
			prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id],
		);

	const handleSave = () => {
		if (!editText.trim()) return;
		onAction("save-edit", moon, {
			text: editText.trim(),
			lensesUsed: editLenses,
		});
		setIsEditing(false);
	};

	const handleCancelEdit = () => {
		setEditText(moon.text);
		setEditLenses(moon.lensesUsed || []);
		setIsEditing(false);
		setShowNewLens(false);
	};

	const handleStartRel = (type) => {
		setRelationshipMode(type);
		onStartRelationship(type, moon);
	};

	const handleAddCustomLens = () => {
		if (!newLensLabel.trim()) return;
		const lens = {
			id: `custom_${Date.now()}`,
			label: newLensLabel.trim(),
			emoji: newLensEmoji,
			color: dimColor,
			custom: true,
		};
		const updated = [...customLenses, lens];
		setCustomLenses(updated);
		saveCustomLenses(updated);
		setEditLenses((prev) => [...prev, lens.id]);
		setNewLensLabel("");
		setNewLensEmoji("🔍");
		setShowNewLens(false);
	};

	const handleDeleteCustomLens = (id) => {
		const updated = customLenses.filter((l) => l.id !== id);
		setCustomLenses(updated);
		saveCustomLenses(updated);
		setEditLenses((prev) => prev.filter((l) => l !== id));
	};

	const relatedLinks = (moon.relationships || [])
		.map((rel) => ({
			...rel,
			targetMoon: allMoons.find((m) => m.id === rel.targetMoonId),
		}))
		.filter((rel) => rel.targetMoon);

	const isEntertained = moon.ownership === "entertained";

	return (
		<div
			style={{
				width: PANEL_WIDTH,
				height: "100%",
				display: "flex",
				flexDirection: "column",
				background: ds.bg,
				borderLeft: `1px solid ${ds.borderColor}`,
				boxShadow: `inset 3px 0 0 0 ${ds.accent}, -8px 0 32px rgba(0,0,0,0.35)`,
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
					background: `radial-gradient(circle, ${ds.glow} 0%, transparent 70%)`,
					pointerEvents: "none",
					zIndex: 0,
				}}
			/>

			{/* ── HEADER ─────────────────────────────────────────────────────── */}
			<div
				style={{
					padding: "18px 20px 0",
					flexShrink: 0,
					position: "relative",
					zIndex: 1,
				}}>
				{/* Row 1: Dimension name + close button */}
				<div
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						marginBottom: 12,
					}}>
					<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
						<span
							style={{
								width: 9,
								height: 9,
								borderRadius: "50%",
								background: ds.accent,
								boxShadow: `0 0 8px ${ds.accent}`,
								flexShrink: 0,
								display: "inline-block",
							}}
						/>
						<span
							style={{
								fontSize: 14,
								fontWeight: 700,
								letterSpacing: "0.1em",
								textTransform: "uppercase",
								color: ds.accent,
							}}>
							{config.name}
						</span>
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
							flexShrink: 0,
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

				{/* Row 2: Status chips — own row with breathing room */}
				<div
					style={{
						display: "flex",
						gap: 6,
						flexWrap: "wrap",
						paddingBottom: 14,
						borderBottom: "1px solid rgba(255,255,255,0.07)",
						marginBottom: 0,
					}}>
					<OwnershipChip
						value={moon.ownership || "asserted"}
						onToggle={() =>
							onAction("ownership", moon, {
								ownership: isEntertained ? "asserted" : "entertained",
							})
						}
					/>
					<StateChip
						active={moon.confidence === "wobbly"}
						activeColor="#FBBF24"
						tooltip="This reflection feels unstable or provisional — you're not sure it's accurate yet"
						onClick={() => onAction("uncertain", moon)}>
						〰 Uncertain
					</StateChip>
					<StateChip
						active={moon.isLocked}
						activeColor="#60A5FA"
						tooltip="Pin this moon in orbit — marks a reflection you keep returning to"
						onClick={() => onAction("anchor", moon)}>
						⚓ Recurring
					</StateChip>
				</div>
			</div>

			{/* ── REFLECTION TEXT ────────────────────────────────────────────── */}
			<div
				style={{
					padding: "16px 20px",
					flexShrink: 0,
					position: "relative",
					zIndex: 1,
				}}>
				{!isEditing ? (
					<div
						onClick={() => {
							setEditText(moon.text);
							setEditLenses(moon.lensesUsed || []);
							setIsEditing(true);
						}}
						style={{
							fontSize: 17,
							lineHeight: 1.8,
							color: isEntertained ? "#C9A84C" : "#D4E1F0",
							fontFamily: "Georgia, 'Times New Roman', serif",
							fontStyle: "italic",
							cursor: "text",
							padding: "16px 18px",
							background: "rgba(255,255,255,0.03)",
							borderRadius: 10,
							border: isEntertained
								? `1px dashed ${ds.accent}50`
								: "1px solid rgba(255,255,255,0.07)",
							borderLeft: `3px ${isEntertained ? "dashed" : "solid"} ${ds.accent}70`,
							transition: "background 0.2s",
							position: "relative",
							minHeight: 64,
						}}
						onMouseEnter={(e) =>
							(e.currentTarget.style.background = "rgba(255,255,255,0.055)")
						}
						onMouseLeave={(e) =>
							(e.currentTarget.style.background = "rgba(255,255,255,0.03)")
						}>
						{isEntertained && (
							<span
								style={{
									display: "block",
									fontSize: 10,
									fontWeight: 700,
									letterSpacing: "0.1em",
									color: "#FBBF2490",
									marginBottom: 6,
									fontStyle: "normal",
									fontFamily: "system-ui, sans-serif",
								}}>
								ENTERTAINING
							</span>
						)}
						{moon.text}
						<span
							style={{
								position: "absolute",
								bottom: 8,
								right: 10,
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
								border: `2px solid ${ds.accent}70`,
								borderRadius: 10,
								color: "#D4E1F0",
								fontSize: 17,
								fontFamily: "Georgia, 'Times New Roman', serif",
								fontStyle: "italic",
								lineHeight: 1.8,
								resize: "none",
								outline: "none",
								boxSizing: "border-box",
								marginBottom: 10,
							}}
						/>

						{/* Lens pills */}
						<div
							style={{
								display: "flex",
								flexWrap: "wrap",
								gap: 6,
								marginBottom: 10,
							}}>
							{allLenses.map((lens) => (
								<div
									key={lens.id}
									style={{ position: "relative", display: "inline-flex" }}>
									<button
										onClick={() => toggleLens(lens.id)}
										style={{
											padding: "5px 11px",
											borderRadius: 20,
											border: `1px solid ${editLenses.includes(lens.id) ? `${lens.color || dimColor}60` : "rgba(255,255,255,0.12)"}`,
											background: editLenses.includes(lens.id)
												? `${lens.color || dimColor}22`
												: "transparent",
											color: editLenses.includes(lens.id)
												? lens.color || dimColor
												: "#7A8FA6",
											fontSize: 13,
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
									{lens.custom && (
										<button
											onClick={() => handleDeleteCustomLens(lens.id)}
											title="Delete this lens"
											style={{
												position: "absolute",
												top: -5,
												right: -5,
												width: 15,
												height: 15,
												background: "rgba(239,68,68,0.85)",
												border: "none",
												borderRadius: "50%",
												color: "#fff",
												fontSize: 10,
												cursor: "pointer",
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
												outline: "none",
												padding: 0,
											}}>
											×
										</button>
									)}
								</div>
							))}

							{/* New lens */}
							{!showNewLens ? (
								<button
									onClick={() => setShowNewLens(true)}
									style={{
										padding: "5px 11px",
										borderRadius: 20,
										border: "1px dashed rgba(255,255,255,0.18)",
										background: "transparent",
										color: "#6B7F95",
										fontSize: 12,
										fontWeight: 700,
										cursor: "pointer",
										outline: "none",
										transition: "all 0.15s",
										display: "flex",
										alignItems: "center",
										gap: 4,
									}}
									onMouseEnter={(e) =>
										(e.currentTarget.style.color = "#94A3B8")
									}
									onMouseLeave={(e) =>
										(e.currentTarget.style.color = "#6B7F95")
									}>
									+ New lens
								</button>
							) : (
								<div
									style={{
										display: "flex",
										alignItems: "center",
										gap: 6,
										padding: "6px 10px",
										width: "100%",
										background: "rgba(255,255,255,0.04)",
										border: `1px solid ${ds.accent}40`,
										borderRadius: 20,
									}}>
									<button
										onClick={() => {
											const idx = LENS_EMOJIS.indexOf(newLensEmoji);
											setNewLensEmoji(
												LENS_EMOJIS[(idx + 1) % LENS_EMOJIS.length],
											);
										}}
										title="Cycle emoji"
										style={{
											background: "none",
											border: "none",
											fontSize: 15,
											cursor: "pointer",
											padding: 0,
											outline: "none",
										}}>
										{newLensEmoji}
									</button>
									<input
										autoFocus
										value={newLensLabel}
										onChange={(e) => setNewLensLabel(e.target.value)}
										onKeyDown={(e) => {
											if (e.key === "Enter") handleAddCustomLens();
											if (e.key === "Escape") {
												setShowNewLens(false);
												setNewLensLabel("");
											}
										}}
										placeholder="Lens name…"
										style={{
											flex: 1,
											background: "none",
											border: "none",
											color: "#C8D6E8",
											fontSize: 13,
											fontWeight: 600,
											outline: "none",
										}}
									/>
									<button
										onClick={handleAddCustomLens}
										disabled={!newLensLabel.trim()}
										style={{
											background: newLensLabel.trim()
												? dimColor
												: "transparent",
											border: "none",
											borderRadius: 10,
											color: "#fff",
											fontSize: 12,
											fontWeight: 700,
											padding: "3px 9px",
											cursor: newLensLabel.trim() ? "pointer" : "default",
											outline: "none",
											opacity: newLensLabel.trim() ? 1 : 0.3,
										}}>
										Add
									</button>
									<button
										onClick={() => {
											setShowNewLens(false);
											setNewLensLabel("");
										}}
										style={{
											background: "none",
											border: "none",
											color: "#6B7F95",
											fontSize: 12,
											cursor: "pointer",
											outline: "none",
											padding: 0,
										}}>
										✕
									</button>
								</div>
							)}
						</div>

						<div style={{ display: "flex", gap: 8 }}>
							<button
								onClick={handleCancelEdit}
								style={{
									flex: 1,
									padding: "11px",
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
									padding: "11px",
									borderRadius: 8,
									border: "none",
									background: editText.trim() ? dimColor : "rgba(30,41,59,0.5)",
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

			{/* ── LENSES read-only ───────────────────────────────────────────── */}
			{!isEditing && moon.lensesUsed && moon.lensesUsed.length > 0 && (
				<div
					style={{
						padding: "0 20px 16px",
						display: "flex",
						flexWrap: "wrap",
						gap: 6,
						flexShrink: 0,
						zIndex: 1,
						position: "relative",
					}}>
					<span
						style={{
							fontSize: 10,
							fontWeight: 700,
							letterSpacing: "0.12em",
							textTransform: "uppercase",
							color: "#7A8FA6",
							width: "100%",
							marginBottom: 4,
						}}>
						Viewed through
					</span>
					{moon.lensesUsed.map((lensId) => {
						const l = allLenses.find((x) => x.id === lensId);
						if (!l) return null;
						return (
							<span
								key={lensId}
								style={{
									padding: "5px 12px",
									borderRadius: 20,
									fontSize: 13,
									fontWeight: 700,
									color: l.color || dimColor,
									background: `${l.color || dimColor}14`,
									border: `1px solid ${l.color || dimColor}30`,
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

			{/* Timestamp */}
			{!isEditing && moon.timestamp && (
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
						{new Date(moon.timestamp).toLocaleString(undefined, {
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

			{/* ── RELATIONSHIPS ──────────────────────────────────────────────── */}
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
							marginBottom: 12,
						}}>
						Relationships
					</span>
					{relationshipMode && (
						<div
							style={{
								padding: "10px 14px",
								borderRadius: 8,
								marginBottom: 10,
								border: `1px solid ${relationshipMode === "tension" ? "rgba(239,68,68,0.4)" : "rgba(16,185,129,0.4)"}`,
								background:
									relationshipMode === "tension"
										? "rgba(239,68,68,0.08)"
										: "rgba(16,185,129,0.08)",
								fontSize: 13,
								fontWeight: 600,
								color: relationshipMode === "tension" ? "#FCA5A5" : "#6EE7B7",
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
									fontSize: 11,
									fontWeight: 700,
									letterSpacing: "0.05em",
									opacity: 0.7,
									outline: "none",
								}}>
								CANCEL
							</button>
						</div>
					)}
					{!relationshipMode && (
						<div
							style={{
								display: "flex",
								gap: 8,
								marginBottom: relatedLinks.length > 0 ? 10 : 0,
							}}>
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
					{relatedLinks.length > 0 && (
						<div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
							{relatedLinks.map((rel) => (
								<RelLink
									key={rel.targetMoonId}
									rel={rel}
									onRemove={() =>
										onAction("remove-relationship", moon, {
											targetMoonId: rel.targetMoonId,
										})
									}
								/>
							))}
						</div>
					)}
				</div>
			)}

			<div style={{ flex: 1 }} />

			{/* ── RELEASE ────────────────────────────────────────────────────── */}
			{!isEditing && (
				<div
					style={{
						padding: "14px 20px",
						borderTop: "1px solid rgba(255,255,255,0.06)",
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
							padding: "12px 16px",
							borderRadius: 9,
							border: `1px solid ${releaseHovered ? "rgba(239,68,68,0.55)" : "rgba(255,255,255,0.09)"}`,
							background: releaseHovered
								? "rgba(239,68,68,0.10)"
								: "rgba(255,255,255,0.025)",
							color: releaseHovered ? "#EF4444" : "#6B7F95",
							cursor: "pointer",
							fontSize: 12,
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
						<span style={{ fontSize: 13, opacity: releaseHovered ? 1 : 0.6 }}>
							✦
						</span>
						Release into Void
					</button>
				</div>
			)}
		</div>
	);
}
