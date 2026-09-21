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
import { X, Pencil, Lock } from "lucide-react";
import { moonConfig, lenses as DEFAULT_LENSES, lensById } from "../seedData";
import { loadCustomLenses, saveCustomLenses } from "../utils/customLenses";

export const PANEL_WIDTH = "min(460px, 94vw)";

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
	framing: {
		bg: "linear-gradient(170deg, rgba(96,165,250,0.09) 0%, rgba(8,13,25,0.99) 32%)",
		borderColor: "rgba(96,165,250,0.28)",
		glow: "rgba(96,165,250,0.15)",
		accent: "#60A5FA",
	},
	// Legacy alias — renders old symbolic moons correctly during transition
	symbolic: {
		bg: "linear-gradient(170deg, rgba(96,165,250,0.09) 0%, rgba(8,13,25,0.99) 32%)",
		borderColor: "rgba(96,165,250,0.28)",
		glow: "rgba(96,165,250,0.15)",
		accent: "#60A5FA",
	},
	// Unfiled — deliberately neutral gray, not one of the four dimension
	// colors, so an unfiled moon never looks like it's already been sorted.
	unfiled: {
		bg: "linear-gradient(170deg, rgba(148,163,184,0.08) 0%, rgba(8,13,25,0.99) 32%)",
		borderColor: "rgba(148,163,184,0.25)",
		glow: "rgba(148,163,184,0.12)",
		accent: "#94A3B8",
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
// ── Two-option toggle (claim type / vantage / ownership) ────────────────────
// Both sides are always visibly colored and legible — previously the
// inactive side was flat gray-on-transparent, which is why these read as
// decorative rather than as real, meaningful choices most of the time
// (most reflections sit at the default option).
function TwoOptionToggle({
	leftLabel,
	leftValue,
	leftColor,
	leftTooltip,
	rightLabel,
	rightValue,
	rightColor,
	rightTooltip,
	value,
	onSelect,
}) {
	const isLeft = value !== rightValue;
	const segStyle = (active, color) => ({
		padding: "6px 12px",
		background: active ? `${color}2A` : "transparent",
		color: active ? color : "#9BAEC2",
		fontWeight: 700,
		fontSize: 12.5,
		border: "none",
		cursor: "pointer",
		outline: "none",
		whiteSpace: "nowrap",
	});
	return (
		<div
			style={{
				display: "inline-flex",
				borderRadius: 20,
				overflow: "hidden",
				border: "1px solid rgba(255,255,255,0.16)",
			}}>
			<Tooltip text={leftTooltip}>
				<button
					onClick={() => onSelect(leftValue)}
					style={{
						...segStyle(isLeft, leftColor),
						borderRight: "1px solid rgba(255,255,255,0.12)",
					}}>
					{leftLabel}
				</button>
			</Tooltip>
			<Tooltip text={rightTooltip}>
				<button onClick={() => onSelect(rightValue)} style={segStyle(!isLeft, rightColor)}>
					{rightLabel}
				</button>
			</Tooltip>
		</div>
	);
}

function StateChip({ active, activeColor, tooltip, onClick, children }) {
	const [hov, setHov] = useState(false);
	return (
		<Tooltip text={tooltip}>
			<button
				onClick={onClick}
				onMouseEnter={() => setHov(true)}
				onMouseLeave={() => setHov(false)}
				style={{
					padding: "6px 13px",
					borderRadius: 20,
					border: `1px solid ${active ? `${activeColor}60` : hov ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.14)"}`,
					background: active
						? `${activeColor}22`
						: hov
							? "rgba(255,255,255,0.07)"
							: "transparent",
					color: active ? activeColor : hov ? "#C8D6E8" : "#9BAEC2",
					fontSize: 12.5,
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

// ── Claim type chip (reporting / reading) ────────────────────────────────────
function ClaimTypeChip({ value, onToggle }) {
	return (
		<TwoOptionToggle
			value={value}
			leftLabel="○ Reporting"
			leftValue="reporting"
			leftColor="#10B981"
			leftTooltip="Your best reconstruction of what was present in that moment"
			rightLabel="◈ Reading"
			rightValue="reading"
			rightColor="#818CF8"
			rightTooltip="A framework or inference applied to make sense of what was present"
			onSelect={onToggle}
		/>
	);
}

// ── Vantage chip (whose perspective) ─────────────────────────────────────────
function VantageChip({ value, onToggle }) {
	return (
		<TwoOptionToggle
			value={value}
			leftLabel="⊙ Mine"
			leftValue="mine"
			leftColor="#10B981"
			leftTooltip="Your own perspective on this moment"
			rightLabel="⟳ Theirs"
			rightValue="theirs"
			rightColor="#FBBF24"
			rightTooltip="Reconstructing another person's inner state or perspective"
			onSelect={onToggle}
		/>
	);
}

// ── Ownership chip ────────────────────────────────────────────────────────────
function OwnershipChip({ value, onToggle }) {
	return (
		<TwoOptionToggle
			value={value}
			leftLabel="Asserted"
			leftValue="asserted"
			leftColor="#10B981"
			leftTooltip="This is your own direct experience, stated as it felt to you"
			rightLabel="Entertained"
			rightValue="entertained"
			rightColor="#FBBF24"
			rightTooltip="You're trying on this idea without fully endorsing it"
			onSelect={onToggle}
		/>
	);
}

// ── Relationship button ───────────────────────────────────────────────────────
// ── Relationship type UI metadata (shared by the action buttons and the
//    relationships list below) ─────────────────────────────────────────────
const REL_TYPE_UI = {
	tension: {
		icon: "⚡",
		label: "Conflicts With",
		accent: "#EF4444",
		prompt: "⚡ Click the conflicting moon",
	},
	support: {
		icon: "〜",
		label: "Resonates With",
		accent: "#10B981",
		prompt: "〜 Click the resonating moon",
	},
	association: {
		icon: "◈",
		label: "Echoes",
		accent: "#6366F1",
		prompt: "◈ Click the echoing moon",
	},
};

function RelActionButton({ type, onClick }) {
	const [hov, setHov] = useState(false);
	const { icon, label, accent } = REL_TYPE_UI[type];
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
				color: hov ? accent : "#94A3B8",
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
			<span style={{ fontSize: 18 }}>{icon}</span>
			<span>{label}</span>
		</button>
	);
}

// ── Relationship link ─────────────────────────────────────────────────────────
function RelLink({ rel, onRemove }) {
	const [hov, setHov] = useState(false);
	const { icon, accent } = REL_TYPE_UI[rel.type] || REL_TYPE_UI.association;
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
			<span style={{ fontSize: 14, flexShrink: 0 }}>{icon}</span>
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
// (storage moved to src/utils/customLenses.js, shared with MoonInputCard)
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

// ── Version dot timeline ──────────────────────────────────────────────────────
const MAX_VERSIONS = 5;

function VersionDots({ versions, accent }) {
	const [hoveredIdx, setHoveredIdx] = useState(null);
	const [selectedIdx, setSelectedIdx] = useState(null);
	const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

	const slots = Array.from({ length: MAX_VERSIONS });
	// versions are stored oldest-first; display newest-first
	const reversed = [...versions].reverse();

	const handleDotMouseEnter = (e, i) => {
		const r = e.currentTarget.getBoundingClientRect();
		setTooltipPos({ x: r.left + r.width / 2, y: r.top - 10 });
		setHoveredIdx(i);
	};

	const handleDotClick = (i) => {
		setSelectedIdx((prev) => (prev === i ? null : i));
	};

	return (
		<div
			style={{
				padding: "8px 20px 14px",
				flexShrink: 0,
				position: "relative",
				zIndex: 1,
			}}>
			{/* Label + dots row */}
			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: 10,
					marginBottom: selectedIdx !== null ? 12 : 0,
				}}>
				<span
					style={{
						fontSize: 10,
						fontWeight: 700,
						letterSpacing: "0.12em",
						textTransform: "uppercase",
						color: "#94A3B8",
						flexShrink: 0,
					}}>
					Version History
				</span>
				<div style={{ display: "flex", gap: 6, alignItems: "center" }}>
					{slots.map((_, i) => {
						const version = reversed[i];
						const filled = !!version;
						const isHovered = hoveredIdx === i;
						const isSelected = selectedIdx === i;
						return (
							<div
								key={i}
								onMouseEnter={(e) => filled && handleDotMouseEnter(e, i)}
								onMouseLeave={() => setHoveredIdx(null)}
								onClick={() => filled && handleDotClick(i)}
								style={{
									width: filled ? 14 : 11,
									height: filled ? 14 : 11,
									borderRadius: "50%",
									background: filled
										? isSelected || isHovered
											? accent
											: `${accent}80`
										: "rgba(255,255,255,0.08)",
									border: filled
										? `2px solid ${isSelected || isHovered ? accent : `${accent}50`}`
										: "1px solid rgba(255,255,255,0.12)",
									cursor: filled ? "pointer" : "default",
									transition: "all 0.15s",
									transform:
										isHovered || isSelected ? "scale(1.25)" : "scale(1)",
									boxShadow: isSelected ? `0 0 10px ${accent}70` : "none",
									flexShrink: 0,
								}}
							/>
						);
					})}
				</div>
				{versions.length >= MAX_VERSIONS && (
					<span
						style={{
							fontSize: 10,
							color: "#94A3B8",
							fontWeight: 600,
							letterSpacing: "0.06em",
						}}>
						FULL
					</span>
				)}
			</div>
			<p
				style={{
					fontSize: 10,
					color: "#5B6B80",
					margin: "4px 0 0",
				}}>
				Each dot is an earlier version — tap one to read it
			</p>

			{/* Expanded version card */}
			{selectedIdx !== null && reversed[selectedIdx] && (
				<div
					style={{
						padding: "12px 14px",
						background: "rgba(255,255,255,0.02)",
						border: "1px solid rgba(255,255,255,0.07)",
						borderLeft: `3px solid ${accent}30`,
						borderRadius: 8,
					}}>
					<div
						style={{
							fontSize: 11,
							color: "#94A3B8",
							fontWeight: 600,
							letterSpacing: "0.05em",
							marginBottom: 7,
						}}>
						{reversed[selectedIdx].savedAt
							? new Date(reversed[selectedIdx].savedAt).toLocaleString(
									undefined,
									{
										month: "short",
										day: "numeric",
										hour: "2-digit",
										minute: "2-digit",
									},
								)
							: "Earlier version"}
					</div>
					<div
						style={{
							fontSize: 14,
							lineHeight: 1.7,
							color: "#5A7090",
							fontFamily: "system-ui, -apple-system, sans-serif",
						}}>
						{reversed[selectedIdx].text}
					</div>
				</div>
			)}

			{/* Hover tooltip — rendered via fixed position to escape overflow */}
			{hoveredIdx !== null && reversed[hoveredIdx] && selectedIdx === null && (
				<div
					style={{
						position: "fixed",
						left: tooltipPos.x,
						top: tooltipPos.y,
						transform: "translate(-50%, -100%)",
						background: "rgba(8,12,24,0.97)",
						border: "1px solid rgba(148,163,184,0.15)",
						borderRadius: 7,
						padding: "8px 12px",
						fontSize: 11,
						color: "#94A3B8",
						zIndex: 9999,
						pointerEvents: "none",
						maxWidth: 200,
						boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
					}}>
					<div
						style={{
							fontWeight: 700,
							color: "#94A3B8",
							marginBottom: 4,
							letterSpacing: "0.05em",
						}}>
						{reversed[hoveredIdx].savedAt
							? new Date(reversed[hoveredIdx].savedAt).toLocaleString(
									undefined,
									{
										month: "short",
										day: "numeric",
										hour: "2-digit",
										minute: "2-digit",
									},
								)
							: "Earlier"}
					</div>
					<div style={{ fontStyle: "italic", lineHeight: 1.5 }}>
						{reversed[hoveredIdx].text.length > 70
							? reversed[hoveredIdx].text.substring(0, 70) + "…"
							: reversed[hoveredIdx].text}
					</div>
				</div>
			)}
		</div>
	);
}

// ── Main panel ────────────────────────────────────────────────────────────────
export default function MoonSidePanel({
	moon,
	allMoons,
	dimColor,
	unlockedDimensions = [],
	onFileMoon,
	temporalDistance, // from parent planet node — e.g. "days later"
	onClose,
	onAction,
	onStartRelationship,
}) {
	const [isEditing, setIsEditing] = useState(false);
	const [isHoveringText, setIsHoveringText] = useState(false);
	const [editText, setEditText] = useState(moon.text);
	// Single lens, matching MoonInputCard's creation flow. Falls back to the
	// first entry of the legacy lensesUsed array for moons created before
	// that flow existed. null = "Open" (no specific lens).
	const [editLens, setEditLens] = useState(
		moon.lensUsed ?? moon.lensesUsed?.[0] ?? null,
	);
	const [relationshipMode, setRelationshipMode] = useState(null);
	const [releaseHovered, setReleaseHovered] = useState(false);
	const [showHistory, setShowHistory] = useState(false);

	const [customLenses, setCustomLenses] = useState(loadCustomLenses);
	// Bug fix: this only read localStorage once, at first mount. If a lens
	// was added elsewhere (e.g. while creating a different moon) while this
	// panel was already open, it would never see it — looked like custom
	// lenses "randomly" not showing up. Resync every time a different moon
	// is opened.
	useEffect(() => {
		setCustomLenses(loadCustomLenses());
	}, [moon.id]);
	const [showNewLens, setShowNewLens] = useState(false);
	const [newLensLabel, setNewLensLabel] = useState("");
	const [newLensEmoji, setNewLensEmoji] = useState("🔍");
	const [newLensPrompt, setNewLensPrompt] = useState("");

	const allLenses = [...DEFAULT_LENSES, ...customLenses];
	const config = moonConfig.dimension[moon.dimension];
	const ds = DIM_STYLES[moon.dimension] || DIM_STYLES.unfiled;

	useEffect(() => {
		setEditText(moon.text);
		setEditLens(moon.lensUsed ?? moon.lensesUsed?.[0] ?? null);
		setIsEditing(false);
		setRelationshipMode(null);
		setShowNewLens(false);
		setShowHistory(false);
	}, [moon.id]);

	// Toggle off if you click the already-selected lens, same as creation.
	const selectLens = (id) =>
		setEditLens((prev) => (prev === id ? null : id));

	const handleSave = () => {
		if (!editText.trim()) return;
		onAction("save-edit", moon, {
			text: editText.trim(),
			lensUsed: editLens,
			lensesUsed: editLens ? [editLens] : [],
		});
		setIsEditing(false);
	};

	const handleSaveEvolved = () => {
		if (!editText.trim()) return;
		if ((moon.versions || []).length >= 5) return;
		onAction("save-evolved", moon, {
			text: editText.trim(),
			lensUsed: editLens,
			lensesUsed: editLens ? [editLens] : [],
		});
		setIsEditing(false);
	};

	const handleCancelEdit = () => {
		setEditText(moon.text);
		setEditLens(moon.lensUsed ?? moon.lensesUsed?.[0] ?? null);
		setIsEditing(false);
		setShowNewLens(false);
		setShowHistory(false);
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
			customPrompt: newLensPrompt.trim() || null,
		};
		const updated = [...customLenses, lens];
		setCustomLenses(updated);
		saveCustomLenses(updated);
		setEditLens(lens.id);
		setNewLensLabel("");
		setNewLensEmoji("🔍");
		setNewLensPrompt("");
		setShowNewLens(false);
		setShowHistory(false);
	};

	const handleDeleteCustomLens = (id) => {
		const updated = customLenses.filter((l) => l.id !== id);
		setCustomLenses(updated);
		saveCustomLenses(updated);
		setEditLens((prev) => (prev === id ? null : prev));
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
				position: "fixed",
				top: 60,
				right: 0,
				bottom: 0,
				display: "flex",
				flexDirection: "column",
				background: isEditing
					? `linear-gradient(170deg, ${ds.accent}14 0%, rgba(8,13,25,0.99) 26%)`
					: ds.bg,
				borderLeft: `1px solid ${isEditing ? ds.accent : ds.borderColor}`,
				boxShadow: isEditing
					? `inset 4px 0 0 0 ${ds.accent}, inset 0 0 0 1px ${ds.accent}40, -8px 0 32px rgba(0,0,0,0.35)`
					: `inset 3px 0 0 0 ${ds.accent}, -8px 0 32px rgba(0,0,0,0.35)`,
				transition: "background 0.25s ease, box-shadow 0.25s ease",
				overflowY: "auto",
				zIndex: 100,
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
							{config?.name || "Unfiled"}
						</span>
						{isEditing && (
							<span
								style={{
									display: "inline-flex",
									alignItems: "center",
									gap: 4,
									padding: "2px 9px",
									borderRadius: 20,
									background: ds.accent,
									color: "#0B1220",
									fontSize: 10,
									fontWeight: 800,
									letterSpacing: "0.08em",
									textTransform: "uppercase",
								}}>
								<Pencil size={9} strokeWidth={3} />
								Editing
							</span>
						)}
					</div>
					<button
						onClick={onClose}
						style={{
							background: "none",
							border: "1px solid rgba(255,255,255,0.1)",
							borderRadius: 6,
							color: "#94A3B8",
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
							e.currentTarget.style.color = "#94A3B8";
							e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
						}}>
						<X size={13} />
					</button>
				</div>

				{/* ── FILE THIS REFLECTION (unfiled moons only) ────────────────── */}
				{!moon.dimension && (
					<div
						style={{
							marginBottom: 16,
							padding: "12px 14px",
							background: "rgba(148,163,184,0.06)",
							border: "1px solid rgba(148,163,184,0.2)",
							borderRadius: 10,
						}}>
						<p
							style={{
								margin: "0 0 10px",
								fontSize: 12.5,
								color: "#9AAEC4",
								lineHeight: 1.5,
							}}>
							This hasn't been filed into a dimension yet. You can leave it
							here, or sort it now:
						</p>
						<div
							style={{
								display: "grid",
								gridTemplateColumns: "1fr 1fr",
								gap: 6,
							}}>
							{Object.entries(moonConfig.dimension).map(([key, dim]) => {
								const isUnlocked = unlockedDimensions.includes(key);
								return (
									<button
										key={key}
										disabled={!isUnlocked}
										onClick={() => isUnlocked && onFileMoon?.(moon.id, key)}
										title={
											isUnlocked
												? dim.description
												: "Not unlocked yet — keep reflecting to open this up"
										}
										style={{
											display: "flex",
											alignItems: "center",
											gap: 6,
											padding: "7px 10px",
											background: isUnlocked
												? `${dim.color}16`
												: "rgba(255,255,255,0.02)",
											border: `1px solid ${isUnlocked ? `${dim.color}45` : "rgba(255,255,255,0.08)"}`,
											borderRadius: 7,
											color: isUnlocked ? dim.color : "#4B5A6E",
											fontSize: 12,
											fontWeight: 700,
											cursor: isUnlocked ? "pointer" : "default",
											outline: "none",
										}}>
										{!isUnlocked && <Lock size={10} />}
										{dim.name}
									</button>
								);
							})}
						</div>
					</div>
				)}

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
					{(moon.dimension === "subjective" ||
						moon.dimension === "intersubjective") && (
						<ClaimTypeChip
							value={moon.claimType || "reporting"}
							onToggle={() =>
								onAction("claimType", moon, {
									claimType:
										(moon.claimType || "reporting") === "reporting"
											? "reading"
											: "reporting",
								})
							}
						/>
					)}
					<OwnershipChip
						value={moon.ownership || "asserted"}
						onToggle={() =>
							onAction("ownership", moon, {
								ownership: isEntertained ? "asserted" : "entertained",
							})
						}
					/>
					{(moon.dimension === "intersubjective" ||
						moon.dimension === "framing" ||
						moon.dimension === "symbolic") && (
						<VantageChip
							value={moon.vantage || "mine"}
							onToggle={() =>
								onAction("vantage", moon, {
									vantage:
										(moon.vantage || "mine") === "mine" ? "theirs" : "mine",
								})
							}
						/>
					)}
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
							setEditLens(moon.lensUsed ?? moon.lensesUsed?.[0] ?? null);
							setIsEditing(true);
						}}
						style={{
							fontSize: 17,
							lineHeight: 1.8,
							color: isEntertained ? "#C9A84C" : "#D4E1F0",
							fontFamily: "system-ui, -apple-system, sans-serif",
							cursor: "text",
							padding: "16px 18px",
							background: "rgba(255,255,255,0.03)",
							borderRadius: 10,
							border: isEntertained
								? `1px dashed ${ds.accent}50`
								: "1px solid rgba(255,255,255,0.07)",
							borderLeft: `3px ${isEntertained ? "dashed" : "solid"} ${ds.accent}70`,
							transition: "background 0.2s",
							animation: "chromaFadeIn 0.18s ease",
							position: "relative",
							minHeight: 64,
							wordBreak: "break-word",
							overflowWrap: "break-word",
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.background = "rgba(255,255,255,0.055)";
							setIsHoveringText(true);
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.background = "rgba(255,255,255,0.03)";
							setIsHoveringText(false);
						}}>
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
						{isHoveringText && (
							<Pencil
								size={13}
								style={{
									position: "absolute",
									bottom: 10,
									right: 10,
									color: "rgba(255,255,255,0.4)",
								}}
							/>
						)}
					</div>
				) : (
					<div style={{ animation: "chromaFadeIn 0.18s ease" }}>
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
								fontFamily: "system-ui, -apple-system, sans-serif",
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
										onClick={() => selectLens(lens.id)}
										style={{
											padding: "5px 11px",
											borderRadius: 20,
											border: `1px solid ${editLens === lens.id ? `${lens.color || dimColor}60` : "rgba(255,255,255,0.12)"}`,
											background: editLens === lens.id
												? `${lens.color || dimColor}22`
												: "transparent",
											color: editLens === lens.id
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
										color: "#94A3B8",
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
										(e.currentTarget.style.color = "#94A3B8")
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
												setShowHistory(false);
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
											color: "#94A3B8",
											fontSize: 12,
											cursor: "pointer",
											outline: "none",
											padding: 0,
										}}>
										✕
									</button>
								</div>
							)}
							{showNewLens && (
								<div style={{ marginTop: 6 }}>
									<input
										value={newLensPrompt}
										onChange={(e) => setNewLensPrompt(e.target.value)}
										onKeyDown={(e) => {
											if (e.key === "Enter") handleAddCustomLens();
											if (e.key === "Escape") {
												setShowNewLens(false);
												setShowHistory(false);
												setNewLensLabel("");
												setNewLensPrompt("");
											}
										}}
										placeholder="Prompt for this lens (optional) — what should it ask you to notice?"
										style={{
											width: "100%",
											padding: "6px 10px",
											background: "rgba(255,255,255,0.04)",
											border: `1px solid ${ds.accent}30`,
											borderRadius: 8,
											color: "#C8D6E8",
											fontSize: 12,
											outline: "none",
											boxSizing: "border-box",
										}}
									/>
								</div>
							)}
						</div>

						{/* Cancel + Update row */}
						<div style={{ display: "flex", gap: 8, marginBottom: 3 }}>
							<button
								onClick={handleCancelEdit}
								style={{
									flex: 1,
									padding: "10px",
									borderRadius: 8,
									border: "1px solid rgba(255,255,255,0.1)",
									background: "transparent",
									color: "#94A3B8",
									fontSize: 13,
									fontWeight: 700,
									cursor: "pointer",
									outline: "none",
									transition: "all 0.15s",
								}}
								onMouseEnter={(e) => (e.currentTarget.style.color = "#94A3B8")}
								onMouseLeave={(e) => (e.currentTarget.style.color = "#94A3B8")}>
								Cancel
							</button>
							<button
								onClick={handleSave}
								disabled={!editText.trim()}
								title="Fix a typo or rephrase without creating a new version"
								style={{
									flex: 2,
									padding: "10px",
									borderRadius: 8,
									border: `1px solid ${editText.trim() ? dimColor + "60" : "rgba(30,41,59,0.5)"}`,
									background: "transparent",
									color: editText.trim() ? dimColor : "#334155",
									fontSize: 13,
									fontWeight: 700,
									cursor: editText.trim() ? "pointer" : "not-allowed",
									outline: "none",
									opacity: editText.trim() ? 1 : 0.4,
									transition: "all 0.15s",
								}}>
								Update
							</button>
						</div>
						<p
							style={{
								fontSize: 10,
								color: "#5B6B80",
								margin: "0 0 6px",
								textAlign: "right",
							}}>
							Update = fix a typo, no history kept
						</p>

						{/* Mark as Evolved — intentional version */}
						{(() => {
							const versionsFull = (moon.versions || []).length >= 5;
							const canEvolve = editText.trim() && !versionsFull;
							return (
								<button
									onClick={handleSaveEvolved}
									disabled={!canEvolve}
									title={
										versionsFull
											? "Evolution log full — 5 versions maximum"
											: "Mark this as a genuine shift in perception — archives the current version"
									}
									style={{
										width: "100%",
										padding: "10px",
										borderRadius: 8,
										border: `1px solid ${canEvolve ? "rgba(167,139,250,0.35)" : "rgba(255,255,255,0.06)"}`,
										background: canEvolve
											? "rgba(167,139,250,0.08)"
											: "transparent",
										color: canEvolve ? "#A78BFA" : "#334155",
										fontSize: 12,
										fontWeight: 700,
										letterSpacing: "0.05em",
										cursor: canEvolve ? "pointer" : "not-allowed",
										outline: "none",
										opacity: canEvolve ? 1 : 0.4,
										transition: "all 0.15s",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										gap: 6,
									}}
									onMouseEnter={(e) => {
										if (canEvolve) {
											e.currentTarget.style.background =
												"rgba(167,139,250,0.14)";
											e.currentTarget.style.borderColor =
												"rgba(167,139,250,0.55)";
										}
									}}
									onMouseLeave={(e) => {
										if (canEvolve) {
											e.currentTarget.style.background =
												"rgba(167,139,250,0.08)";
											e.currentTarget.style.borderColor =
												"rgba(167,139,250,0.35)";
										}
									}}>
									<span style={{ fontSize: 13 }}>✦</span>
									{versionsFull
										? "Evolution Log Full (5/5)"
										: "Mark as Evolved"}
								</button>
							);
						})()}
						<p
							style={{
								fontSize: 10,
								color: "#5B6B80",
								margin: "6px 0 0",
								textAlign: "right",
							}}>
							Mark as Evolved = a deliberate change of mind, keeps the old
							version below
						</p>
					</div>
				)}
			</div>

			{/* ── LENS read-only ────────────────────────────────────────────── */}
			{!isEditing &&
				(() => {
					// Support both new lensUsed (single) and legacy lensesUsed (array)
					const usedIds = moon.lensUsed
						? [moon.lensUsed]
						: moon.lensesUsed || [];
					const allLensMap = Object.fromEntries(
						[...DEFAULT_LENSES, ...customLenses].map((l) => [l.id, l]),
					);
					const usedLenses = usedIds
						.map((id) => allLensMap[id])
						.filter(Boolean);
					if (usedLenses.length === 0) return null;
					return (
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
							{usedLenses.map((l) => (
								<span
									key={l.id}
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
							))}
						</div>
					);
				})()}

			{/* Timestamp + temporal distance */}
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
							color: "#94A3B8",
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
					{temporalDistance && (
						<span
							style={{
								marginLeft: 10,
								fontSize: 11,
								color: "#94A3B8",
								fontStyle: "italic",
							}}>
							· written {temporalDistance} after the event
						</span>
					)}
				</div>
			)}

			{/* ── EVOLUTION DOT TIMELINE ────────────────────────────────────── */}
			{!isEditing && moon.versions && moon.versions.length > 0 && (
				<VersionDots versions={moon.versions} accent={ds.accent} />
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
					{relationshipMode &&
						(() => {
							const meta = REL_TYPE_UI[relationshipMode];
							return (
								<div
									style={{
										padding: "10px 14px",
										borderRadius: 8,
										marginBottom: 10,
										border: `1px solid ${meta.accent}66`,
										background: `${meta.accent}14`,
										fontSize: 13,
										fontWeight: 600,
										color: meta.accent,
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
									}}>
									<span>{meta.prompt}</span>
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
							);
						})()}
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
								type="support"
								onClick={() => handleStartRel("support")}
							/>
							<RelActionButton
								type="association"
								onClick={() => handleStartRel("association")}
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
							color: releaseHovered ? "#EF4444" : "#94A3B8",
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
