// src/components/MoonSidePanel.jsx
import React, { useState, useEffect } from "react";
import { X, ChevronDown, ChevronRight } from "lucide-react";
import { moonConfig, lenses } from "../seedData";

const PANEL_WIDTH = 400;

// Dimension-specific styling
const DIMENSION_STYLES = {
	subjective: {
		background:
			"linear-gradient(135deg, rgba(139, 92, 246, 0.03) 0%, rgba(196, 181, 253, 0.03) 100%)",
		borderColor: "#A78BFA",
		headerDecoration: "〰️",
		questions: [
			"What am I feeling right now?",
			"What sensations are present in my body?",
			"What thoughts are arising?",
		],
	},
	behavioral: {
		background:
			"linear-gradient(135deg, rgba(234, 88, 12, 0.03) 0%, rgba(251, 146, 60, 0.03) 100%)",
		borderColor: "#FB923C",
		headerDecoration: "▦",
		questions: [
			"What did I do?",
			"What actions did I take?",
			"What behaviors emerged?",
		],
	},
	intersubjective: {
		background:
			"linear-gradient(135deg, rgba(16, 185, 129, 0.03) 0%, rgba(110, 231, 183, 0.03) 100%)",
		borderColor: "#34D399",
		headerDecoration: "◉",
		questions: [
			"How did others respond?",
			"What was said or done between us?",
			"What dynamics emerged?",
		],
	},
	symbolic: {
		background:
			"linear-gradient(135deg, rgba(59, 130, 246, 0.03) 0%, rgba(147, 197, 253, 0.03) 100%)",
		borderColor: "#60A5FA",
		headerDecoration: "✦",
		questions: [
			"What does this mean?",
			"What pattern am I seeing?",
			"What story is this part of?",
		],
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
	const [relsSectionOpen, setRelsSectionOpen] = useState(true);
	const [lensesSectionOpen, setLensesSectionOpen] = useState(true);
	const [questionsSectionOpen, setQuestionsSectionOpen] = useState(false);
	const config = moonConfig.dimension[moon.dimension];
	const dimStyle = DIMENSION_STYLES[moon.dimension];

	useEffect(() => {
		setEditText(moon.text);
		setEditLenses(moon.lensesUsed || []);
		setIsEditing(false);
	}, [moon.id, moon.text, moon.lensesUsed]);

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

	const row = (
		emoji,
		label,
		sublabel,
		active,
		activeColor,
		onClick,
		hoverColor,
	) => (
		<button
			onClick={onClick}
			style={{
				width: "100%",
				padding: "12px 14px",
				background: active ? `${activeColor}15` : "rgba(30,41,59,0.35)",
				border: `1px solid ${active ? activeColor : "rgba(255,255,255,0.08)"}`,
				borderRadius: "8px",
				cursor: "pointer",
				textAlign: "left",
				transition: "all 0.2s",
				display: "flex",
				alignItems: "center",
				gap: "12px",
				marginBottom: "7px",
			}}
			onMouseEnter={(e) => {
				e.currentTarget.style.borderColor = `${hoverColor}80`;
				e.currentTarget.style.background = `${hoverColor}15`;
			}}
			onMouseLeave={(e) => {
				e.currentTarget.style.borderColor = active
					? activeColor
					: "rgba(255,255,255,0.08)";
				e.currentTarget.style.background = active
					? `${activeColor}15`
					: "rgba(30,41,59,0.35)";
			}}>
			<span style={{ fontSize: "18px", lineHeight: 1, flexShrink: 0 }}>
				{emoji}
			</span>
			<div style={{ minWidth: 0 }}>
				<div
					style={{
						fontSize: "14px",
						fontWeight: 600,
						color: active ? activeColor : "#CBD5E1",
					}}>
					{label}
				</div>
				<div
					style={{
						fontSize: "12px",
						color: "#64748B",
						marginTop: "2px",
						lineHeight: "1.4",
					}}>
					{sublabel}
				</div>
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
					: `2px solid ${dimStyle.borderColor}60`,
				borderRight: isComparison
					? `2px solid ${dimStyle.borderColor}60`
					: "none",
				display: "flex",
				flexDirection: "column",
				overflow: "hidden",
				position: "relative",
			}}>
			{/* Dimension-specific decorative element */}
			<div
				style={{
					position: "absolute",
					top: "20px",
					right: "20px",
					fontSize: "80px",
					opacity: 0.03,
					pointerEvents: "none",
					userSelect: "none",
				}}>
				{dimStyle.headerDecoration}
			</div>

			{/* Header */}
			<div
				style={{
					padding: "18px 20px 16px",
					borderBottom: `1px solid ${dimStyle.borderColor}30`,
					display: "flex",
					alignItems: "flex-start",
					justifyContent: "space-between",
					gap: "10px",
					flexShrink: 0,
				}}>
				<div style={{ minWidth: 0 }}>
					<div
						style={{
							display: "inline-flex",
							alignItems: "center",
							gap: "8px",
							padding: "5px 13px",
							background: `${dimColor}15`,
							border: `1px solid ${dimStyle.borderColor}50`,
							borderRadius: "20px",
							marginBottom: "8px",
						}}>
						{showMoonNumber && (
							<span style={{ fontSize: "14px" }}>{moonNumber}</span>
						)}
						<div
							style={{
								width: "7px",
								height: "7px",
								borderRadius: "50%",
								background: dimColor,
								boxShadow: `0 0 6px ${dimColor}`,
							}}
						/>
						<span
							style={{
								fontSize: "11px",
								fontWeight: 700,
								color: dimColor,
								textTransform: "uppercase",
								letterSpacing: "0.8px",
							}}>
							{config.name}
						</span>
					</div>
					<p
						style={{
							margin: 0,
							fontSize: "12px",
							color: "#475569",
							fontStyle: "italic",
							lineHeight: "1.5",
						}}>
						{config.description}
					</p>
				</div>
				{!isComparison && (
					<button
						onClick={onClose}
						style={{
							background: "transparent",
							border: "none",
							color: "#475569",
							cursor: "pointer",
							padding: "2px",
							flexShrink: 0,
							transition: "color 0.2s",
						}}
						onMouseEnter={(e) => (e.currentTarget.style.color = "#CBD5E1")}
						onMouseLeave={(e) => (e.currentTarget.style.color = "#475569")}>
						<X size={16} />
					</button>
				)}
			</div>

			{/* Scrollable body */}
			<div style={{ flex: 1, overflowY: "auto", padding: "18px 20px" }}>
				{/* Reflection text */}
				{!isEditing ? (
					<div
						style={{
							fontSize: "15px",
							color: "#E6EEF8",
							lineHeight: "1.65",
							padding: "14px 16px",
							background: "rgba(30,41,59,0.4)",
							borderRadius: "9px",
							border: "1px solid rgba(255,255,255,0.06)",
							marginBottom: "20px",
						}}>
						{moon.text}
					</div>
				) : (
					<div style={{ marginBottom: "20px" }}>
						<textarea
							value={editText}
							onChange={(e) => setEditText(e.target.value)}
							autoFocus
							rows={4}
							style={{
								width: "100%",
								padding: "14px 16px",
								background: "rgba(15,23,36,0.8)",
								border: `1px solid ${dimStyle.borderColor}60`,
								borderRadius: "9px",
								color: "#E6EEF8",
								fontSize: "14px",
								fontFamily: "inherit",
								resize: "vertical",
								outline: "none",
								lineHeight: "1.6",
								boxSizing: "border-box",
								marginBottom: "14px",
							}}
						/>
						<div
							style={{
								display: "flex",
								flexWrap: "wrap",
								gap: "7px",
								marginBottom: "14px",
							}}>
							{lenses.map((lens) => (
								<button
									key={lens.id}
									onClick={() => toggleLens(lens.id)}
									style={{
										padding: "6px 11px",
										background: editLenses.includes(lens.id)
											? lens.color
											: "rgba(30,41,59,0.6)",
										border: `1px solid ${editLenses.includes(lens.id) ? lens.color : "rgba(148,163,184,0.15)"}`,
										borderRadius: "6px",
										color: editLenses.includes(lens.id) ? "#fff" : "#64748B",
										cursor: "pointer",
										fontSize: "12px",
										display: "flex",
										alignItems: "center",
										gap: "5px",
										transition: "all 0.15s",
									}}>
									{lens.emoji} {lens.label}
								</button>
							))}
						</div>
						<div style={{ display: "flex", gap: "9px" }}>
							<button
								onClick={() => {
									setIsEditing(false);
									setEditText(moon.text);
									setEditLenses(moon.lensesUsed || []);
								}}
								style={{
									flex: 1,
									padding: "10px",
									background: "transparent",
									border: "1px solid rgba(148,163,184,0.15)",
									borderRadius: "8px",
									color: "#64748B",
									cursor: "pointer",
									fontSize: "13px",
								}}>
								Cancel
							</button>
							<button
								onClick={handleSave}
								disabled={!editText.trim()}
								style={{
									flex: 2,
									padding: "10px",
									background: editText.trim() ? dimColor : "rgba(30,41,59,0.5)",
									border: "none",
									borderRadius: "8px",
									color: "#fff",
									cursor: editText.trim() ? "pointer" : "not-allowed",
									fontSize: "13px",
									fontWeight: 600,
									opacity: editText.trim() ? 1 : 0.4,
								}}>
								Save ✨
							</button>
						</div>
					</div>
				)}

				{/* Guiding Questions */}
				{!isEditing && (
					<div style={{ marginBottom: "20px" }}>
						<button
							onClick={() => setQuestionsSectionOpen(!questionsSectionOpen)}
							style={{
								display: "flex",
								alignItems: "center",
								gap: "7px",
								background: "transparent",
								border: "none",
								cursor: "pointer",
								padding: "0 0 8px 0",
								marginBottom: questionsSectionOpen ? "10px" : "0",
								color: "#475569",
								fontSize: "10px",
								fontWeight: 700,
								textTransform: "uppercase",
								letterSpacing: "0.6px",
							}}>
							{questionsSectionOpen ? (
								<ChevronDown size={13} />
							) : (
								<ChevronRight size={13} />
							)}
							Reflection Prompts
						</button>
						{questionsSectionOpen && (
							<div
								style={{
									padding: "12px 14px",
									background: `${dimColor}08`,
									border: `1px solid ${dimStyle.borderColor}25`,
									borderRadius: "8px",
								}}>
								{dimStyle.questions.map((q, idx) => (
									<div
										key={idx}
										style={{
											fontSize: "12px",
											color: "#94A3B8",
											marginBottom:
												idx < dimStyle.questions.length - 1 ? "8px" : "0",
											lineHeight: "1.5",
										}}>
										• {q}
									</div>
								))}
							</div>
						)}
					</div>
				)}

				{/* Active lenses display */}
				{!isEditing && moon.lensesUsed && moon.lensesUsed.length > 0 && (
					<div style={{ marginBottom: "20px" }}>
						<button
							onClick={() => setLensesSectionOpen(!lensesSectionOpen)}
							style={{
								display: "flex",
								alignItems: "center",
								gap: "7px",
								background: "transparent",
								border: "none",
								cursor: "pointer",
								padding: "0 0 8px 0",
								marginBottom: lensesSectionOpen ? "9px" : "0",
								color: "#475569",
								fontSize: "10px",
								fontWeight: 700,
								textTransform: "uppercase",
								letterSpacing: "0.6px",
							}}>
							{lensesSectionOpen ? (
								<ChevronDown size={13} />
							) : (
								<ChevronRight size={13} />
							)}
							Viewed through
						</button>
						{lensesSectionOpen && (
							<div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
								{moon.lensesUsed.map((lensId) => {
									const l = lenses.find((x) => x.id === lensId);
									return (
										<span
											key={lensId}
											style={{
												padding: "5px 10px",
												background: `${dimColor}15`,
												border: `1px solid ${dimStyle.borderColor}35`,
												borderRadius: "6px",
												fontSize: "12px",
												color: dimColor,
												display: "flex",
												alignItems: "center",
												gap: "5px",
											}}>
											{l?.emoji} {lensId}
										</span>
									);
								})}
							</div>
						)}
					</div>
				)}

				{/* State section */}
				{!isEditing && (
					<>
						<p
							style={{
								margin: "0 0 10px",
								fontSize: "10px",
								color: "#475569",
								fontWeight: 700,
								textTransform: "uppercase",
								letterSpacing: "0.6px",
							}}>
							State
						</p>
						{row(
							"〰️",
							moon.confidence === "wobbly"
								? "Uncertain (on)"
								: "Mark Uncertain",
							"I wrote this but I'm not sure it's true",
							moon.confidence === "wobbly",
							"#FBBF24",
							() => onAction("uncertain", moon),
							"#FBBF24",
						)}
						{row(
							"⚓",
							moon.isLocked ? "Anchored (on)" : "Anchor",
							"Stop orbiting — hold still",
							moon.isLocked,
							"#60A5FA",
							() => onAction("anchor", moon),
							"#60A5FA",
						)}
					</>
				)}

				{/* Compare button */}
				{!isEditing && !isComparison && (
					<div style={{ marginTop: "20px", marginBottom: "20px" }}>
						<p
							style={{
								margin: "0 0 10px",
								fontSize: "10px",
								color: "#475569",
								fontWeight: 700,
								textTransform: "uppercase",
								letterSpacing: "0.6px",
							}}>
							Compare
						</p>
						<button
							onClick={() => onStartComparison(moon)}
							style={{
								width: "100%",
								padding: "12px 14px",
								background: "rgba(108, 99, 255, 0.12)",
								border: "1px solid rgba(108, 99, 255, 0.3)",
								borderRadius: "8px",
								cursor: "pointer",
								textAlign: "left",
								transition: "all 0.2s",
								display: "flex",
								alignItems: "center",
								gap: "12px",
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.borderColor = "#6C63FF80";
								e.currentTarget.style.background = "rgba(108, 99, 255, 0.2)";
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.borderColor = "rgba(108, 99, 255, 0.3)";
								e.currentTarget.style.background = "rgba(108, 99, 255, 0.12)";
							}}>
							<span style={{ fontSize: "18px", lineHeight: 1, flexShrink: 0 }}>
								📊
							</span>
							<div style={{ minWidth: 0 }}>
								<div
									style={{
										fontSize: "14px",
										fontWeight: 600,
										color: "#A78BFA",
									}}>
									Compare with Another
								</div>
								<div
									style={{
										fontSize: "12px",
										color: "#64748B",
										marginTop: "2px",
										lineHeight: "1.4",
									}}>
									Open side-by-side panels
								</div>
							</div>
						</button>
					</div>
				)}

				{/* Relationships section */}
				{!isEditing && (
					<>
						<button
							onClick={() => setRelsSectionOpen(!relsSectionOpen)}
							style={{
								display: "flex",
								alignItems: "center",
								gap: "7px",
								background: "transparent",
								border: "none",
								cursor: "pointer",
								padding: "0",
								margin: "0 0 10px 0",
								color: "#475569",
								fontSize: "10px",
								fontWeight: 700,
								textTransform: "uppercase",
								letterSpacing: "0.6px",
							}}>
							{relsSectionOpen ? (
								<ChevronDown size={13} />
							) : (
								<ChevronRight size={13} />
							)}
							Relationships
						</button>
						{relsSectionOpen && (
							<>
								{row(
									"🔴",
									"Conflicts With",
									"This reflection fights with another",
									false,
									"#EF4444",
									() => onStartRelationship("tension", moon),
									"#EF4444",
								)}
								{row(
									"🌊",
									"Resonates With",
									"This reflection echoes another",
									false,
									"#10B981",
									() => onStartRelationship("support", moon),
									"#10B981",
								)}

								{relatedLinks.length > 0 && (
									<div style={{ marginTop: "12px" }}>
										<p
											style={{
												margin: "0 0 8px",
												fontSize: "10px",
												color: "#334155",
												fontWeight: 700,
												textTransform: "uppercase",
												letterSpacing: "0.6px",
											}}>
											Active links
										</p>
										{relatedLinks.map((rel) => (
											<div
												key={rel.targetMoonId}
												style={{
													display: "flex",
													alignItems: "center",
													gap: "9px",
													padding: "8px 11px",
													background:
														rel.type === "tension" ? "#EF444410" : "#10B98110",
													border: `1px solid ${rel.type === "tension" ? "#EF444430" : "#10B98130"}`,
													borderRadius: "7px",
													marginBottom: "6px",
												}}>
												<span style={{ fontSize: "14px" }}>
													{rel.type === "tension" ? "🔴" : "🌊"}
												</span>
												<span
													style={{
														fontSize: "12px",
														color: "#94A3B8",
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
							</>
						)}
					</>
				)}

				{/* Refine section */}
				{!isEditing && (
					<>
						<p
							style={{
								margin: "20px 0 10px",
								fontSize: "10px",
								color: "#475569",
								fontWeight: 700,
								textTransform: "uppercase",
								letterSpacing: "0.6px",
							}}>
							Edit
						</p>
						{row(
							"🔭",
							"Refine",
							"Edit text and interpretive lenses",
							false,
							"#8B5CF6",
							() => setIsEditing(true),
							"#8B5CF6",
						)}
					</>
				)}
			</div>

			{/* Release — pinned to bottom */}
			{!isEditing && !isComparison && (
				<div
					style={{
						padding: "14px 20px",
						borderTop: "1px solid rgba(255,255,255,0.05)",
						flexShrink: 0,
					}}>
					<button
						onClick={() => onAction("delete", moon)}
						style={{
							width: "100%",
							padding: "10px",
							background: "transparent",
							border: "1px solid rgba(239,68,68,0.2)",
							borderRadius: "8px",
							color: "#475569",
							cursor: "pointer",
							fontSize: "13px",
							fontWeight: 600,
							transition: "all 0.2s",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							gap: "7px",
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.borderColor = "#EF4444";
							e.currentTarget.style.color = "#EF4444";
							e.currentTarget.style.background = "#EF444412";
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.borderColor = "rgba(239,68,68,0.2)";
							e.currentTarget.style.color = "#475569";
							e.currentTarget.style.background = "transparent";
						}}>
						🌌 Release this reflection
					</button>
				</div>
			)}
		</div>
	);
}
