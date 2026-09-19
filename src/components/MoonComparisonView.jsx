// src/components/MoonComparisonView.jsx
// Opened by clicking a tension/support/echo connector line, instead of the
// old behavior of immediately prompting to delete the relationship. Two
// read-only panes side by side so both reflections are visible at once —
// each links through to the real MoonSidePanel to actually edit either one.
import React, { useState, useEffect } from "react";
import { X, ArrowUpRight, Trash2 } from "lucide-react";
import { moonConfig, lenses as DEFAULT_LENSES } from "../seedData";
import { loadCustomLenses } from "../utils/customLenses";

const REL_META = {
	tension: {
		label: "In tension",
		icon: "⚡",
		color: "#EF4444",
		removeConfirm: "Remove this conflict? Both moons will be unanchored.",
	},
	support: {
		label: "Resonating",
		icon: "〜",
		color: "#10B981",
		removeConfirm: "Remove this resonance relationship?",
	},
	association: {
		label: "Echoing",
		icon: "◈",
		color: "#6366F1",
		removeConfirm: "Remove this echo?",
	},
};

function resolveLens(moon, allLenses) {
	const id = moon.lensUsed ?? moon.lensesUsed?.[0] ?? null;
	if (!id) return null;
	return allLenses.find((l) => l.id === id) || null;
}

function MiniChip({ color, children, title }) {
	return (
		<span
			title={title}
			style={{
				display: "inline-flex",
				padding: "3px 10px",
				borderRadius: 20,
				border: `1px solid ${color}50`,
				background: `${color}18`,
				color,
				fontSize: 11,
				fontWeight: 700,
				letterSpacing: "0.03em",
				whiteSpace: "nowrap",
			}}>
			{children}
		</span>
	);
}

function MoonPane({ moon, allLenses, onOpenMoon }) {
	const dim =
		moonConfig.dimension[moon.dimension] || moonConfig.dimension.framing;
	const lens = resolveLens(moon, allLenses);
	const showClaimType =
		moon.dimension === "subjective" || moon.dimension === "intersubjective";
	const showVantage =
		moon.dimension === "intersubjective" ||
		moon.dimension === "framing" ||
		moon.dimension === "symbolic";

	return (
		<div
			style={{
				flex: 1,
				minWidth: 0,
				background: "rgba(255,255,255,0.03)",
				border: `1px solid ${dim.color}30`,
				borderRadius: 12,
				padding: "16px 16px 14px",
				display: "flex",
				flexDirection: "column",
				gap: 10,
			}}>
			{/* Dimension badge */}
			<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
				<div
					style={{
						width: 9,
						height: 9,
						borderRadius: "50%",
						background: dim.color,
						boxShadow: `0 0 8px ${dim.color}90`,
						flexShrink: 0,
					}}
				/>
				<span style={{ fontSize: 13, fontWeight: 700, color: dim.color }}>
					{dim.name}
				</span>
			</div>

			{/* Chips: lens, claim type, vantage */}
			<div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
				{lens && (
					<MiniChip color={lens.color || dim.color}>
						{lens.emoji} {lens.label}
					</MiniChip>
				)}
				{showClaimType && (
					<MiniChip
						color={moon.claimType === "reading" ? "#6366F1" : "#10B981"}>
						{moon.claimType === "reading" ? "◈ Reading" : "○ Reporting"}
					</MiniChip>
				)}
				{showVantage && (
					<MiniChip color={moon.vantage === "theirs" ? "#F59E0B" : "#10B981"}>
						{moon.vantage === "theirs" ? "Theirs" : "Mine"}
					</MiniChip>
				)}
			</div>

			{/* Text */}
			<p
				style={{
					margin: 0,
					fontFamily: "Georgia, 'Times New Roman', serif",
					fontStyle: "italic",
					fontSize: 14.5,
					lineHeight: 1.65,
					color: "#E6EEF8",
					wordBreak: "break-word",
					overflowWrap: "break-word",
				}}>
				{moon.text}
			</p>

			<button
				onClick={() => onOpenMoon(moon.id)}
				style={{
					marginTop: "auto",
					alignSelf: "flex-start",
					display: "flex",
					alignItems: "center",
					gap: 4,
					padding: "6px 10px",
					background: "transparent",
					border: "1px solid rgba(255,255,255,0.12)",
					borderRadius: 8,
					color: "#94A3B8",
					fontSize: 12,
					fontWeight: 600,
					cursor: "pointer",
					outline: "none",
				}}
				onMouseEnter={(e) => {
					e.currentTarget.style.color = "#C8D6E8";
					e.currentTarget.style.borderColor = "rgba(255,255,255,0.24)";
				}}
				onMouseLeave={(e) => {
					e.currentTarget.style.color = "#94A3B8";
					e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
				}}>
				Open full panel <ArrowUpRight size={13} />
			</button>
		</div>
	);
}

export default function MoonComparisonView({
	moonA,
	moonB,
	relType,
	onClose,
	onRemove,
	onOpenMoon,
}) {
	const [customLenses, setCustomLenses] = useState([]);
	useEffect(() => {
		setCustomLenses(loadCustomLenses());
	}, []);
	const allLenses = [...DEFAULT_LENSES, ...customLenses];
	const meta = REL_META[relType] || REL_META.association;

	useEffect(() => {
		const onKey = (e) => e.key === "Escape" && onClose();
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [onClose]);

	return (
		<div
			onClick={onClose}
			style={{
				position: "fixed",
				inset: 0,
				background: "rgba(5,8,16,0.7)",
				backdropFilter: "blur(6px)",
				zIndex: 500,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				padding: 20,
			}}>
			<div
				onClick={(e) => e.stopPropagation()}
				style={{
					width: "100%",
					maxWidth: 720,
					background:
						"linear-gradient(135deg, rgba(30,41,59,0.98) 0%, rgba(15,23,36,0.98) 100%)",
					border: `1px solid ${meta.color}40`,
					borderRadius: 16,
					boxShadow: `0 24px 70px rgba(0,0,0,0.6), 0 0 40px ${meta.color}20`,
					padding: "18px 20px 20px",
				}}>
				{/* Header */}
				<div
					style={{
						display: "flex",
						alignItems: "center",
						marginBottom: 14,
					}}>
					<span style={{ fontSize: 15, fontWeight: 700, color: meta.color }}>
						{meta.icon} {meta.label}
					</span>
					<button
						onClick={onClose}
						style={{
							marginLeft: "auto",
							background: "transparent",
							border: "none",
							color: "#6B7F95",
							cursor: "pointer",
							padding: 4,
							display: "flex",
							outline: "none",
						}}
						onMouseEnter={(e) => (e.currentTarget.style.color = "#C8D6E8")}
						onMouseLeave={(e) => (e.currentTarget.style.color = "#6B7F95")}>
						<X size={18} />
					</button>
				</div>

				{/* Two panes */}
				<div
					style={{
						display: "flex",
						gap: 14,
						flexWrap: "wrap",
					}}>
					<MoonPane
						moon={moonA}
						allLenses={allLenses}
						onOpenMoon={onOpenMoon}
					/>
					<MoonPane
						moon={moonB}
						allLenses={allLenses}
						onOpenMoon={onOpenMoon}
					/>
				</div>

				{/* Remove relationship */}
				<div
					style={{
						marginTop: 16,
						paddingTop: 14,
						borderTop: "1px solid rgba(255,255,255,0.07)",
						display: "flex",
						justifyContent: "center",
					}}>
					<button
						onClick={() => {
							if (!window.confirm(meta.removeConfirm)) return;
							onRemove();
							onClose();
						}}
						style={{
							display: "flex",
							alignItems: "center",
							gap: 6,
							padding: "8px 14px",
							background: "transparent",
							border: "1px solid rgba(239,68,68,0.3)",
							borderRadius: 8,
							color: "#F87171",
							fontSize: 12,
							fontWeight: 600,
							cursor: "pointer",
							outline: "none",
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.background = "rgba(239,68,68,0.1)";
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.background = "transparent";
						}}>
						<Trash2 size={13} /> Remove relationship
					</button>
				</div>
			</div>
		</div>
	);
}
