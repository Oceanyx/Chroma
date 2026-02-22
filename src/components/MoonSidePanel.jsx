// src/components/MoonSidePanel.jsx - V4.4 Option A: Functional + Subtle Differences
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { moonConfig, lenses } from "../seedData";

const PANEL_WIDTH = 500;

// Dimension-specific styling - SUBTLE differences
const DIMENSION_STYLES = {
	subjective: {
		background:
			"linear-gradient(180deg, rgba(139, 92, 246, 0.08) 0%, rgba(8, 13, 25, 0.98) 100%)",
		borderColor: "#A78BFA",
		borderStyle: "2px solid",
		headerGlow: "0 0 20px rgba(167, 139, 250, 0.15)",
		accentColor: "#A78BFA",
	},
	behavioral: {
		background:
			"linear-gradient(180deg, rgba(234, 88, 12, 0.08) 0%, rgba(8, 13, 25, 0.98) 100%)",
		borderColor: "#FB923C",
		borderStyle: "2px solid",
		headerGlow: "0 0 20px rgba(251, 146, 60, 0.15)",
		accentColor: "#FB923C",
	},
	intersubjective: {
		background:
			"linear-gradient(180deg, rgba(16, 185, 129, 0.08) 0%, rgba(8, 13, 25, 0.98) 100%)",
		borderColor: "#34D399",
		borderStyle: "2px solid",
		headerGlow: "0 0 20px rgba(52, 211, 153, 0.15)",
		accentColor: "#34D399",
	},
	symbolic: {
		background:
			"linear-gradient(180deg, rgba(59, 130, 246, 0.08) 0%, rgba(8, 13, 25, 0.98) 100%)",
		borderColor: "#60A5FA",
		borderStyle: "2px solid",
		headerGlow: "0 0 20px rgba(96, 165, 250, 0.15)",
		accentColor: "#60A5FA",
	},
};

export default function MoonSidePanel({
	moon,
	moonNumber,
	allMoons,
	dimColor,
	onClose,
	onAction,
	onStartRelationship,
	onStartComparison,
	isComparison = false,
	showMoonNumber = false,
}) {
	const [isEditing, setIsEditing] = useState(false);
	const [editText, setEditText] = useState(moon.text);
	const [editLenses, setEditLenses] = useState(moon.lensesUsed || []);
	const config = moonConfig.dimension[moon.dimension];
	const dimStyle = DIMENSION_STYLES[moon.dimension];

	useEffect(() => {
		setEditText(moon.text);
		setEditLenses(moon.lensesUsed || []);
		setIsEditing(false);
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

	const relatedLinks = (moon.relationships || [])
		.map((rel) => {
			const target = allMoons.find((m) => m.id === rel.targetMoonId);
			return target ? { ...rel, targetMoon: target } : null;
		})
		.filter(Boolean);

	const actionButton = (
		emoji,
		label,
		sublabel,
		active,
		activeColor,
		onClick,
	) => (
		<button
			onClick={onClick}
			style={{
				width: "100%",
				padding: "14px 18px",
				background: active ? `${activeColor}15` : "rgba(30,41,59,0.4)",
				border: `1px solid ${active ? activeColor : "rgba(255,255,255,0.1)"}`,
				borderRadius: "10px",
				cursor: "pointer",
				textAlign: "left",
				transition: "all 0.2s",
				display: "flex",
				alignItems: "center",
				gap: "14px",
			}}
			onMouseEnter={(e) => {
				e.currentTarget.style.borderColor = activeColor;
				e.currentTarget.style.background = `${activeColor}20`;
			}}
			onMouseLeave={(e) => {
				e.currentTarget.style.borderColor = active
					? activeColor
					: "rgba(255,255,255,0.1)";
				e.currentTarget.style.background = active
					? `${activeColor}15`
					: "rgba(30,41,59,0.4)";
			}}>
			<span style={{ fontSize: "22px", lineHeight: 1, flexShrink: 0 }}>
				{emoji}
			</span>
			<div style={{ minWidth: 0 }}>
				<div
					style={{
						fontSize: "15px",
						fontWeight: 600,
						color: active ? activeColor : "#E2E8F0",
					}}>
					{label}
				</div>
				{sublabel && (
					<div
						style={{
							fontSize: "13px",
							color: "#94A3B8",
							marginTop: "3px",
							lineHeight: "1.4",
						}}>
						{sublabel}
					</div>
				)}
			</div>
		</button>
	);

	return (
		<div
			style={{
				width: `${PANEL_WIDTH}px`,
				height: "100%",
				background: dimStyle.background,
				borderLeft: isComparison
					? "none"
					: dimStyle.borderStyle.replace("2px", "3px") +
						" " +
						dimStyle.borderColor,
				borderRight: isComparison
					? dimStyle.borderStyle.replace("2px", "3px") +
						" " +
						dimStyle.borderColor
					: "none",
				display: "flex",
				flexDirection: "column",
				overflow: "hidden",
			}}>
			{/* Header */}
			<div
				style={{
					padding: "28px 32px 24px",
					borderBottom: `1px solid ${dimStyle.borderColor}40`,
					boxShadow: dimStyle.headerGlow,
					flexShrink: 0,
				}}>
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "flex-start",
						marginBottom: "12px",
					}}>
					<div
						style={{
							display: "inline-flex",
							alignItems: "center",
							gap: "10px",
							padding: "8px 16px",
							background: `${dimColor}18`,
							border: `2px solid ${dimStyle.borderColor}`,
							borderRadius: "24px",
						}}>
						{showMoonNumber && (
							<span style={{ fontSize: "16px", fontWeight: 600 }}>
								{moonNumber}
							</span>
						)}
						<div
							style={{
								width: "8px",
								height: "8px",
								borderRadius: "50%",
								background: dimColor,
								boxShadow: `0 0 8px ${dimColor}`,
							}}
						/>
						<span
							style={{
								fontSize: "13px",
								fontWeight: 700,
								color: dimColor,
								textTransform: "uppercase",
								letterSpacing: "1px",
							}}>
							{config.name}
						</span>
					</div>
					{!isComparison && (
						<button
							onClick={onClose}
							style={{
								background: "transparent",
								border: "none",
								color: "#64748B",
								cursor: "pointer",
								padding: "4px",
								transition: "color 0.2s",
							}}
							onMouseEnter={(e) => (e.currentTarget.style.color = "#E2E8F0")}
							onMouseLeave={(e) => (e.currentTarget.style.color = "#64748B")}>
							<X size={18} />
						</button>
					)}
				</div>
				<p
					style={{
						margin: 0,
						fontSize: "14px",
						color: "#94A3B8",
						lineHeight: "1.6",
					}}>
					{config.description}
				</p>
			</div>

			{/* Body - NO SCROLLING */}
			<div
				style={{
					flex: 1,
					padding: "32px",
					display: "flex",
					flexDirection: "column",
					gap: "24px",
				}}>
				{/* Reflection text - CLICK TO EDIT */}
				{!isEditing ? (
					<div
						onClick={() => setIsEditing(true)}
						style={{
							fontSize: "18px",
							color: "#F1F5F9",
							lineHeight: "1.7",
							padding: "20px 24px",
							background: "rgba(30,41,59,0.5)",
							borderRadius: "12px",
							border: `2px solid transparent`,
							cursor: "text",
							transition: "all 0.2s",
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.borderColor = `${dimColor}40`;
							e.currentTarget.style.background = "rgba(30,41,59,0.6)";
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.borderColor = "transparent";
							e.currentTarget.style.background = "rgba(30,41,59,0.5)";
						}}>
						{moon.text}
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
								padding: "20px 24px",
								background: "rgba(15,23,36,0.9)",
								border: `2px solid ${dimStyle.borderColor}`,
								borderRadius: "12px",
								color: "#F1F5F9",
								fontSize: "18px",
								fontFamily: "inherit",
								resize: "vertical",
								outline: "none",
								lineHeight: "1.7",
								boxSizing: "border-box",
								marginBottom: "16px",
							}}
						/>
						<div
							style={{
								display: "flex",
								flexWrap: "wrap",
								gap: "8px",
								marginBottom: "16px",
							}}>
							{lenses.map((lens) => (
								<button
									key={lens.id}
									onClick={() => toggleLens(lens.id)}
									style={{
										padding: "8px 14px",
										background: editLenses.includes(lens.id)
											? lens.color
											: "rgba(30,41,59,0.6)",
										border: `2px solid ${editLenses.includes(lens.id) ? lens.color : "rgba(148,163,184,0.2)"}`,
										borderRadius: "8px",
										color: editLenses.includes(lens.id) ? "#fff" : "#94A3B8",
										cursor: "pointer",
										fontSize: "13px",
										fontWeight: 600,
										display: "flex",
										alignItems: "center",
										gap: "6px",
										transition: "all 0.15s",
									}}>
									{lens.emoji} {lens.label}
								</button>
							))}
						</div>
						<div style={{ display: "flex", gap: "12px" }}>
							<button
								onClick={() => {
									setIsEditing(false);
									setEditText(moon.text);
									setEditLenses(moon.lensesUsed || []);
								}}
								style={{
									flex: 1,
									padding: "12px",
									background: "transparent",
									border: "2px solid rgba(148,163,184,0.2)",
									borderRadius: "10px",
									color: "#94A3B8",
									cursor: "pointer",
									fontSize: "14px",
									fontWeight: 600,
								}}>
								Cancel
							</button>
							<button
								onClick={handleSave}
								disabled={!editText.trim()}
								style={{
									flex: 2,
									padding: "12px",
									background: editText.trim() ? dimColor : "rgba(30,41,59,0.5)",
									border: "none",
									borderRadius: "10px",
									color: "#fff",
									cursor: editText.trim() ? "pointer" : "not-allowed",
									fontSize: "14px",
									fontWeight: 600,
									opacity: editText.trim() ? 1 : 0.4,
								}}>
								Save ✨
							</button>
						</div>
					</div>
				)}

				{/* Active lenses - ALWAYS VISIBLE */}
				{!isEditing && moon.lensesUsed && moon.lensesUsed.length > 0 && (
					<div>
						<p
							style={{
								margin: "0 0 12px",
								fontSize: "13px",
								color: "#94A3B8",
								fontWeight: 600,
							}}>
							Viewed through
						</p>
						<div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
							{moon.lensesUsed.map((lensId) => {
								const l = lenses.find((x) => x.id === lensId);
								return (
									<span
										key={lensId}
										style={{
											padding: "8px 14px",
											background: `${dimColor}18`,
											border: `1px solid ${dimStyle.borderColor}50`,
											borderRadius: "8px",
											fontSize: "13px",
											color: dimColor,
											fontWeight: 600,
											display: "flex",
											alignItems: "center",
											gap: "6px",
										}}>
										{l?.emoji} {lensId}
									</span>
								);
							})}
						</div>
					</div>
				)}

				{/* State buttons */}
				{!isEditing && (
					<div
						style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
						{actionButton(
							"〰️",
							moon.confidence === "wobbly"
								? "Uncertain (on)"
								: "Mark Uncertain",
							null,
							moon.confidence === "wobbly",
							"#FBBF24",
							() => onAction("uncertain", moon),
						)}
						{actionButton(
							"⚓",
							moon.isLocked ? "Anchored (on)" : "Anchor",
							null,
							moon.isLocked,
							"#60A5FA",
							() => onAction("anchor", moon),
						)}
					</div>
				)}

				{/* Compare button */}
				{!isEditing && !isComparison && onStartComparison && (
					<button
						onClick={() => onStartComparison(moon)}
						style={{
							width: "100%",
							padding: "14px 18px",
							background: "rgba(108, 99, 255, 0.15)",
							border: "2px solid rgba(108, 99, 255, 0.4)",
							borderRadius: "10px",
							cursor: "pointer",
							textAlign: "left",
							transition: "all 0.2s",
							display: "flex",
							alignItems: "center",
							gap: "14px",
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.borderColor = "#6C63FF";
							e.currentTarget.style.background = "rgba(108, 99, 255, 0.25)";
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.borderColor = "rgba(108, 99, 255, 0.4)";
							e.currentTarget.style.background = "rgba(108, 99, 255, 0.15)";
						}}>
						<span style={{ fontSize: "22px", lineHeight: 1, flexShrink: 0 }}>
							📊
						</span>
						<div>
							<div
								style={{
									fontSize: "15px",
									fontWeight: 600,
									color: "#C4B5FD",
								}}>
								Compare with Another
							</div>
						</div>
					</button>
				)}

				{/* Relationships - ALWAYS VISIBLE */}
				{!isEditing && (
					<div
						style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
						{actionButton("🔴", "Conflicts With", null, false, "#EF4444", () =>
							onStartRelationship("tension", moon),
						)}
						{actionButton("🌊", "Resonates With", null, false, "#10B981", () =>
							onStartRelationship("support", moon),
						)}

						{relatedLinks.length > 0 && (
							<div style={{ marginTop: "8px" }}>
								<p
									style={{
										margin: "0 0 10px",
										fontSize: "13px",
										color: "#64748B",
										fontWeight: 600,
									}}>
									Active links
								</p>
								{relatedLinks.map((rel) => (
									<div
										key={rel.targetMoonId}
										style={{
											display: "flex",
											alignItems: "center",
											gap: "10px",
											padding: "10px 14px",
											background:
												rel.type === "tension" ? "#EF444415" : "#10B98115",
											border: `1px solid ${rel.type === "tension" ? "#EF444440" : "#10B98140"}`,
											borderRadius: "8px",
											marginBottom: "8px",
										}}>
										<span style={{ fontSize: "16px" }}>
											{rel.type === "tension" ? "🔴" : "🌊"}
										</span>
										<span
											style={{
												fontSize: "13px",
												color: "#CBD5E1",
												overflow: "hidden",
												textOverflow: "ellipsis",
												whiteSpace: "nowrap",
											}}>
											{rel.targetMoon.text.substring(0, 40)}
											{rel.targetMoon.text.length > 40 ? "…" : ""}
										</span>
									</div>
								))}
							</div>
						)}
					</div>
				)}
			</div>

			{/* Release button - pinned to bottom */}
			{!isEditing && !isComparison && (
				<div
					style={{
						padding: "24px 32px",
						borderTop: "1px solid rgba(255,255,255,0.08)",
						flexShrink: 0,
					}}>
					<button
						onClick={() => onAction("delete", moon)}
						style={{
							width: "100%",
							padding: "12px",
							background: "transparent",
							border: "2px solid rgba(239,68,68,0.25)",
							borderRadius: "10px",
							color: "#64748B",
							cursor: "pointer",
							fontSize: "14px",
							fontWeight: 600,
							transition: "all 0.2s",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							gap: "8px",
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.borderColor = "#EF4444";
							e.currentTarget.style.color = "#EF4444";
							e.currentTarget.style.background = "#EF444415";
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.borderColor = "rgba(239,68,68,0.25)";
							e.currentTarget.style.color = "#64748B";
							e.currentTarget.style.background = "transparent";
						}}>
						🌌 Release this reflection
					</button>
				</div>
			)}
		</div>
	);
}
