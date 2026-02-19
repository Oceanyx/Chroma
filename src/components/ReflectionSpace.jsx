// src/components/ReflectionSpace.jsx - V4.1 Comparison Mode + Readability Fixes
import React, { useState, useEffect } from "react";
import { ArrowLeft, X, ChevronDown, ChevronRight } from "lucide-react";
import Planet from "./Planet";
import Moon from "./Moon";
import MoonInputCard from "./MoonInputCard";
import DimensionUnlockNotification from "./DimensionUnlockNotification";
import SupportLine from "./SupportLine";
import TensionLine from "./TensionLine";
import {
	getOrbitalPaths,
	distributeMoonsEvenly,
	calculateAnimatedOrbit,
	calculateMoonPosition,
} from "../lib/orbitalPhysics";
import { moonConfig, planetConfig, lenses } from "../seedData";
import {
	db,
	getTotalReflectionCount,
	checkDimensionUnlock,
	getUnlockedDimensions,
} from "../lib/db";

// ============================================================================
// CONSTANTS
// ============================================================================
const DIMENSION_ANGLES = {
	subjective: Math.PI * 1.5,
	behavioral: 0,
	intersubjective: Math.PI * 0.5,
	symbolic: Math.PI,
};

const PANEL_WIDTH = 380;
const ORBIT_SCALE = 1; // Tighter orbits in ReflectionSpace

const MOON_EMOJIS = [
	"1️⃣",
	"2️⃣",
	"3️⃣",
	"4️⃣",
	"5️⃣",
	"6️⃣",
	"7️⃣",
	"8️⃣",
	"9️⃣",
	"🔟",
];

// ============================================================================
// HELPERS
// ============================================================================

function getMoonPosition(moon, parent, time) {
	if (moon.isLocked) {
		return calculateMoonPosition(
			parent,
			moon.orbitAngle || 0,
			moon.dimension,
			ORBIT_SCALE,
		);
	}
	return calculateAnimatedOrbit(
		moon,
		parent,
		time,
		false,
		moon.dimension,
		ORBIT_SCALE,
	);
}

function buildGhostMoons(childMoons, unlockedDimensions, parent) {
	const occupied = new Set(childMoons.map((m) => m.dimension));
	return unlockedDimensions
		.filter((d) => !occupied.has(d))
		.map((dimension) => ({
			id: `ghost-${dimension}`,
			type: "R",
			dimension,
			text: dimension,
			isGhost: true,
			position: calculateMoonPosition(
				parent,
				DIMENSION_ANGLES[dimension],
				dimension,
				ORBIT_SCALE,
			),
		}));
}

function getScaledOrbitalPaths(parent) {
	const paths = [];
	Object.entries(moonConfig.dimension).forEach(([dimension, config]) => {
		paths.push({
			dimension,
			centerX: parent.position.x + planetConfig.baseRadius,
			centerY: parent.position.y + planetConfig.baseRadius,
			radius: config.orbitRadius * ORBIT_SCALE,
			color: config.color,
		});
	});
	return paths;
}

// ============================================================================
// SIDE PANEL
// ============================================================================
function MoonSidePanel({
	moon,
	moonNumber,
	allMoons,
	dimColor,
	onClose,
	onAction,
	onStartRelationship,
	isComparison = false,
}) {
	const [isEditing, setIsEditing] = useState(false);
	const [editText, setEditText] = useState(moon.text);
	const [editLenses, setEditLenses] = useState(moon.lensesUsed || []);
	const [relsSectionOpen, setRelsSectionOpen] = useState(true);
	const [lensesSectionOpen, setLensesSectionOpen] = useState(true);
	const config = moonConfig.dimension[moon.dimension];

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
				background: active ? `${activeColor}15` : "rgba(30,41,59,0.4)",
				border: `1px solid ${active ? activeColor : "rgba(255,255,255,0.07)"}`,
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
				e.currentTarget.style.borderColor = `${hoverColor}70`;
				e.currentTarget.style.background = `${hoverColor}12`;
			}}
			onMouseLeave={(e) => {
				e.currentTarget.style.borderColor = active
					? activeColor
					: "rgba(255,255,255,0.07)";
				e.currentTarget.style.background = active
					? `${activeColor}15`
					: "rgba(30,41,59,0.4)";
			}}>
			<span style={{ fontSize: "18px", lineHeight: 1, flexShrink: 0 }}>
				{emoji}
			</span>
			<div style={{ minWidth: 0 }}>
				<div
					style={{
						fontSize: "13px",
						fontWeight: 600,
						color: active ? activeColor : "#94A3B8",
					}}>
					{label}
				</div>
				<div
					style={{
						fontSize: "12px",
						color: "#475569",
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
				background: "rgba(8, 13, 25, 0.98)",
				borderLeft: isComparison ? "none" : `2px solid ${dimColor}40`,
				borderRight: isComparison ? `2px solid ${dimColor}40` : "none",
				display: "flex",
				flexDirection: "column",
				overflow: "hidden",
			}}>
			{/* Header */}
			<div
				style={{
					padding: "16px 18px 14px",
					borderBottom: `1px solid ${dimColor}20`,
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
							gap: "7px",
							padding: "4px 11px",
							background: `${dimColor}18`,
							border: `1px solid ${dimColor}45`,
							borderRadius: "20px",
							marginBottom: "7px",
						}}>
						<span style={{ fontSize: "14px" }}>{moonNumber}</span>
						<div
							style={{
								width: "6px",
								height: "6px",
								borderRadius: "50%",
								background: dimColor,
								boxShadow: `0 0 5px ${dimColor}`,
							}}
						/>
						<span
							style={{
								fontSize: "10px",
								fontWeight: 700,
								color: dimColor,
								textTransform: "uppercase",
								letterSpacing: "0.7px",
							}}>
							{config.name}
						</span>
					</div>
					<p
						style={{
							margin: 0,
							fontSize: "11px",
							color: "#334155",
							fontStyle: "italic",
							lineHeight: "1.4",
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
							color: "#334155",
							cursor: "pointer",
							padding: "2px",
							flexShrink: 0,
							transition: "color 0.2s",
						}}
						onMouseEnter={(e) => (e.currentTarget.style.color = "#94A3B8")}
						onMouseLeave={(e) => (e.currentTarget.style.color = "#334155")}>
						<X size={15} />
					</button>
				)}
			</div>

			{/* Scrollable body */}
			<div style={{ flex: 1, overflowY: "auto", padding: "16px 18px" }}>
				{/* Reflection text */}
				{!isEditing ? (
					<div
						style={{
							fontSize: "15px",
							color: "#E2E8F0",
							lineHeight: "1.6",
							padding: "13px 14px",
							background: "rgba(30,41,59,0.4)",
							borderRadius: "8px",
							border: "1px solid rgba(255,255,255,0.05)",
							marginBottom: "18px",
						}}>
						{moon.text}
					</div>
				) : (
					<div style={{ marginBottom: "18px" }}>
						<textarea
							value={editText}
							onChange={(e) => setEditText(e.target.value)}
							autoFocus
							rows={4}
							style={{
								width: "100%",
								padding: "12px 14px",
								background: "rgba(15,23,36,0.8)",
								border: `1px solid ${dimColor}50`,
								borderRadius: "8px",
								color: "#E6EEF8",
								fontSize: "14px",
								fontFamily: "inherit",
								resize: "vertical",
								outline: "none",
								lineHeight: "1.5",
								boxSizing: "border-box",
								marginBottom: "12px",
							}}
						/>
						<div
							style={{
								display: "flex",
								flexWrap: "wrap",
								gap: "6px",
								marginBottom: "12px",
							}}>
							{lenses.map((lens) => (
								<button
									key={lens.id}
									onClick={() => toggleLens(lens.id)}
									style={{
										padding: "5px 10px",
										background: editLenses.includes(lens.id)
											? lens.color
											: "rgba(30,41,59,0.6)",
										border: `1px solid ${editLenses.includes(lens.id) ? lens.color : "rgba(148,163,184,0.15)"}`,
										borderRadius: "5px",
										color: editLenses.includes(lens.id) ? "#fff" : "#64748B",
										cursor: "pointer",
										fontSize: "12px",
										display: "flex",
										alignItems: "center",
										gap: "4px",
										transition: "all 0.15s",
									}}>
									{lens.emoji} {lens.label}
								</button>
							))}
						</div>
						<div style={{ display: "flex", gap: "8px" }}>
							<button
								onClick={() => {
									setIsEditing(false);
									setEditText(moon.text);
									setEditLenses(moon.lensesUsed || []);
								}}
								style={{
									flex: 1,
									padding: "9px",
									background: "transparent",
									border: "1px solid rgba(148,163,184,0.15)",
									borderRadius: "7px",
									color: "#475569",
									cursor: "pointer",
									fontSize: "12px",
								}}>
								Cancel
							</button>
							<button
								onClick={handleSave}
								disabled={!editText.trim()}
								style={{
									flex: 2,
									padding: "9px",
									background: editText.trim() ? dimColor : "rgba(30,41,59,0.5)",
									border: "none",
									borderRadius: "7px",
									color: "#fff",
									cursor: editText.trim() ? "pointer" : "not-allowed",
									fontSize: "12px",
									fontWeight: 600,
									opacity: editText.trim() ? 1 : 0.4,
								}}>
								Save ✨
							</button>
						</div>
					</div>
				)}

				{/* Active lenses display */}
				{!isEditing && moon.lensesUsed && moon.lensesUsed.length > 0 && (
					<div style={{ marginBottom: "18px" }}>
						<button
							onClick={() => setLensesSectionOpen(!lensesSectionOpen)}
							style={{
								display: "flex",
								alignItems: "center",
								gap: "6px",
								background: "transparent",
								border: "none",
								cursor: "pointer",
								padding: "0 0 7px 0",
								marginBottom: lensesSectionOpen ? "8px" : "0",
								color: "#334155",
								fontSize: "10px",
								fontWeight: 700,
								textTransform: "uppercase",
								letterSpacing: "0.5px",
							}}>
							{lensesSectionOpen ? (
								<ChevronDown size={12} />
							) : (
								<ChevronRight size={12} />
							)}
							Viewed through
						</button>
						{lensesSectionOpen && (
							<div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
								{moon.lensesUsed.map((lensId) => {
									const l = lenses.find((x) => x.id === lensId);
									return (
										<span
											key={lensId}
											style={{
												padding: "4px 9px",
												background: `${dimColor}15`,
												border: `1px solid ${dimColor}30`,
												borderRadius: "5px",
												fontSize: "11px",
												color: dimColor,
												display: "flex",
												alignItems: "center",
												gap: "4px",
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
								margin: "0 0 9px",
								fontSize: "10px",
								color: "#334155",
								fontWeight: 700,
								textTransform: "uppercase",
								letterSpacing: "0.5px",
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
							"Stop orbiting — hold still to compare",
							moon.isLocked,
							"#4D9FFF",
							() => onAction("anchor", moon),
							"#4D9FFF",
						)}
					</>
				)}

				{/* Relationships section */}
				{!isEditing && (
					<>
						<button
							onClick={() => setRelsSectionOpen(!relsSectionOpen)}
							style={{
								display: "flex",
								alignItems: "center",
								gap: "6px",
								background: "transparent",
								border: "none",
								cursor: "pointer",
								padding: "0",
								margin: "18px 0 9px 0",
								color: "#334155",
								fontSize: "10px",
								fontWeight: 700,
								textTransform: "uppercase",
								letterSpacing: "0.5px",
							}}>
							{relsSectionOpen ? (
								<ChevronDown size={12} />
							) : (
								<ChevronRight size={12} />
							)}
							Relationships
						</button>
						{relsSectionOpen && (
							<>
								{row(
									"☄️",
									"Conflicts With",
									"This reflection fights with another moon",
									false,
									"#F97316",
									() => onStartRelationship("tension", moon),
									"#F97316",
								)}
								{row(
									"🌊",
									"Resonates With",
									"This reflection echoes another moon",
									false,
									"#10B981",
									() => onStartRelationship("support", moon),
									"#10B981",
								)}

								{relatedLinks.length > 0 && (
									<div style={{ marginTop: "10px" }}>
										<p
											style={{
												margin: "0 0 7px",
												fontSize: "10px",
												color: "#1E293B",
												fontWeight: 700,
												textTransform: "uppercase",
												letterSpacing: "0.5px",
											}}>
											Active links
										</p>
										{relatedLinks.map((rel) => (
											<div
												key={rel.targetMoonId}
												style={{
													display: "flex",
													alignItems: "center",
													gap: "8px",
													padding: "7px 10px",
													background:
														rel.type === "tension" ? "#F9731610" : "#10B98110",
													border: `1px solid ${rel.type === "tension" ? "#F9731625" : "#10B98125"}`,
													borderRadius: "6px",
													marginBottom: "5px",
												}}>
												<span style={{ fontSize: "13px" }}>
													{rel.type === "tension" ? "☄️" : "🌊"}
												</span>
												<span
													style={{
														fontSize: "12px",
														color: "#64748B",
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
								margin: "18px 0 9px",
								fontSize: "10px",
								color: "#334155",
								fontWeight: 700,
								textTransform: "uppercase",
								letterSpacing: "0.5px",
							}}>
							Edit
						</p>
						{row(
							"🔭",
							"Refine",
							"Edit text and interpretive lenses",
							false,
							"#6C63FF",
							() => setIsEditing(true),
							"#6C63FF",
						)}
					</>
				)}
			</div>

			{/* Release — pinned to bottom */}
			{!isEditing && !isComparison && (
				<div
					style={{
						padding: "12px 18px",
						borderTop: "1px solid rgba(255,255,255,0.04)",
						flexShrink: 0,
					}}>
					<button
						onClick={() => onAction("delete", moon)}
						style={{
							width: "100%",
							padding: "9px",
							background: "transparent",
							border: "1px solid rgba(239,68,68,0.15)",
							borderRadius: "7px",
							color: "#334155",
							cursor: "pointer",
							fontSize: "12px",
							fontWeight: 600,
							transition: "all 0.2s",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							gap: "6px",
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.borderColor = "#EF4444";
							e.currentTarget.style.color = "#EF4444";
							e.currentTarget.style.background = "#EF444410";
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.borderColor = "rgba(239,68,68,0.15)";
							e.currentTarget.style.color = "#334155";
							e.currentTarget.style.background = "transparent";
						}}>
						🌌 Release this reflection
					</button>
				</div>
			)}
		</div>
	);
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function ReflectionSpace({
	parentNode,
	nodes,
	onSwitchToObservation,
	onNodesUpdate,
}) {
	const [selectedMoons, setSelectedMoons] = useState([]); // 0, 1, or 2 moons
	const [creatingRelationship, setCreatingRelationship] = useState(null);
	const [relationshipSourceMoon, setRelationshipSourceMoon] = useState(null);
	const [hoveredMoonId, setHoveredMoonId] = useState(null);
	const [showInputCard, setShowInputCard] = useState(false);
	const [addingDimension, setAddingDimension] = useState(null);
	const [unlockNotification, setUnlockNotification] = useState(null);
	const [unlockedDimensions, setUnlockedDimensions] = useState([]);
	const [orbitTime, setOrbitTime] = useState(0);
	const [toast, setToast] = useState(null);

	// ── DERIVED ──
	const viewportCenterX = window.innerWidth / 2;
	const viewportCenterY = (window.innerHeight - 60) / 2 + 60;
	const isComparing = selectedMoons.length === 2;
	const panelOpen = selectedMoons.length > 0;

	// When comparing: shift center so both panels + planet visible
	// When 1 panel: shift slightly left
	const centerX = isComparing
		? viewportCenterX
		: panelOpen
			? viewportCenterX - PANEL_WIDTH / 2
			: viewportCenterX;

	const centeredPlanet = {
		...parentNode,
		position: {
			x: centerX - planetConfig.baseRadius,
			y: viewportCenterY - planetConfig.baseRadius,
		},
	};

	const childMoons = nodes.filter((n) => n.parentId === parentNode.id);
	const liveMoons = nodes.filter((n) => n.parentId === parentNode.id);
	const distributedMoons = distributeMoonsEvenly(childMoons, centeredPlanet);
	const orbitalPaths = getScaledOrbitalPaths(centeredPlanet);
	const ghostMoons = buildGhostMoons(
		childMoons,
		unlockedDimensions,
		centeredPlanet,
	);

	// Assign numbers to moons
	const moonNumbers = {};
	distributedMoons.forEach((moon, idx) => {
		moonNumbers[moon.id] = MOON_EMOJIS[idx] || `${idx + 1}`;
	});

	// Keep selectedMoons synced to live data
	const liveSelectedMoons = selectedMoons
		.map((id) => liveMoons.find((m) => m.id === id))
		.filter(Boolean);

	// ── EFFECTS ──
	useEffect(() => {
		let id;
		const animate = () => {
			setOrbitTime((p) => p + 1);
			id = requestAnimationFrame(animate);
		};
		id = requestAnimationFrame(animate);
		return () => cancelAnimationFrame(id);
	}, []);

	useEffect(() => {
		getUnlockedDimensions().then(setUnlockedDimensions);
	}, []);

	useEffect(() => {
		const onKey = (e) => {
			if (e.key === "Escape") {
				if (creatingRelationship) {
					setCreatingRelationship(null);
					setRelationshipSourceMoon(null);
					return;
				}
				setSelectedMoons([]);
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [creatingRelationship]);

	// ── TOAST ──
	const showToast = (message, color = "#10B981") => {
		setToast({ message, color });
		setTimeout(() => setToast(null), 2500);
	};

	// ── MOON CLICK ──
	const handleMoonClick = (moonNode, e) => {
		if (moonNode.isGhost) {
			if (creatingRelationship) {
				showToast("Pick an existing moon to link with", "#EF4444");
				return;
			}
			setAddingDimension(moonNode.dimension);
			setShowInputCard(true);
			return;
		}

		// Shift+Click for multi-select
		if (e?.shiftKey && !creatingRelationship) {
			if (selectedMoons.includes(moonNode.id)) {
				setSelectedMoons(selectedMoons.filter((id) => id !== moonNode.id));
			} else if (selectedMoons.length < 2) {
				setSelectedMoons([...selectedMoons, moonNode.id]);
			} else {
				// Already have 2 selected, replace the second one
				setSelectedMoons([selectedMoons[0], moonNode.id]);
			}
			return;
		}

		// Relationship creation
		if (creatingRelationship && relationshipSourceMoon) {
			handleCreateRelationship(
				relationshipSourceMoon,
				moonNode,
				creatingRelationship,
			);
			setCreatingRelationship(null);
			setRelationshipSourceMoon(null);
			return;
		}

		// Normal click - single select
		setSelectedMoons([moonNode.id]);
	};

	// ── PANEL ACTIONS ──
	const handlePanelAction = async (action, moon, extra) => {
		switch (action) {
			case "save-edit":
				await db.nodes.update(moon.id, {
					text: extra.text,
					lensesUsed: extra.lensesUsed,
				});
				await onNodesUpdate();
				showToast("Reflection refined 🔭", "#6C63FF");
				break;
			case "uncertain":
				const newConf = moon.confidence === "wobbly" ? "stable" : "wobbly";
				await db.nodes.update(moon.id, { confidence: newConf });
				await onNodesUpdate();
				showToast(
					newConf === "wobbly"
						? "Marked as uncertain 〰️"
						: "Confidence restored ✨",
					"#FBBF24",
				);
				break;
			case "anchor":
				if (!moon.isLocked) {
					const dist = distributedMoons.find((m) => m.id === moon.id);
					const angle = dist
						? (dist.orbitAngle || 0) +
							orbitTime * moonConfig.dimension[moon.dimension].orbitSpeed
						: moon.orbitAngle || 0;
					await db.nodes.update(moon.id, { isLocked: true, orbitAngle: angle });
				} else {
					await db.nodes.update(moon.id, { isLocked: false });
				}
				await onNodesUpdate();
				showToast(
					!moon.isLocked ? "Moon anchored ⚓" : "Moon released to orbit",
					"#4D9FFF",
				);
				break;
			case "delete":
				if (window.confirm("Release this reflection into the void?")) {
					await db.nodes.delete(moon.id);
					await onNodesUpdate();
					setSelectedMoons([]);
					showToast("Reflection released 🌌", "#64748B");
				}
				break;
		}
	};

	const handleStartRelationship = (type, moon) => {
		setCreatingRelationship(type);
		setRelationshipSourceMoon(moon);
		setSelectedMoons([]);
		showToast(
			type === "tension"
				? "☄️ Click the conflicting moon"
				: "🌊 Click the resonating moon",
			type === "tension" ? "#F97316" : "#10B981",
		);
	};

	const handleCreateRelationship = async (sourceMoon, targetMoon, type) => {
		if (sourceMoon.id === targetMoon.id) {
			showToast("A moon can't relate to itself!", "#EF4444");
			return;
		}
		const sourceRels = sourceMoon.relationships || [];
		if (sourceRels.find((r) => r.targetMoonId === targetMoon.id)) {
			showToast("Relationship already exists", "#EF4444");
			return;
		}

		const newRel = {
			targetMoonId: targetMoon.id,
			type,
			intensity: type === "tension" ? 2 : undefined,
		};
		const reverseRel = {
			targetMoonId: sourceMoon.id,
			type,
			intensity: type === "tension" ? 2 : undefined,
		};

		if (type === "tension") {
			await db.nodes.update(sourceMoon.id, {
				relationships: [...sourceRels, newRel],
				isLocked: true,
			});
			await db.nodes.update(targetMoon.id, {
				relationships: [...(targetMoon.relationships || []), reverseRel],
				isLocked: true,
			});
		} else {
			await db.nodes.update(sourceMoon.id, {
				relationships: [...sourceRels, newRel],
			});
			await db.nodes.update(targetMoon.id, {
				relationships: [...(targetMoon.relationships || []), reverseRel],
			});
		}
		await onNodesUpdate();
		showToast(
			type === "tension" ? "☄️ Conflict mapped" : "🌊 Resonance mapped",
			type === "tension" ? "#F97316" : "#10B981",
		);
		setSelectedMoons([sourceMoon.id]);
	};

	const handleSaveReflection = async (data) => {
		const previousCount = await getTotalReflectionCount();
		await db.nodes.add({
			type: "R",
			parentId: parentNode.id,
			dimension: addingDimension,
			text: data.text,
			lensesUsed: data.lensesUsed || [],
			orbitAngle: DIMENSION_ANGLES[addingDimension] || 0,
			confidence: "stable",
			intensity: "medium",
			temporality: "concurrent",
			versions: [],
			relationships: [],
		});
		const newCount = await getTotalReflectionCount();
		const unlocks = await checkDimensionUnlock(previousCount, newCount);
		if (unlocks.length > 0) {
			setUnlockNotification(unlocks[0]);
			setUnlockedDimensions(await getUnlockedDimensions());
		}
		await onNodesUpdate();
		setShowInputCard(false);
		setAddingDimension(null);
	};

	// Quick comparison actions
	const handleQuickCompare = async (action) => {
		const [moon1, moon2] = liveSelectedMoons;
		if (!moon1 || !moon2) return;

		switch (action) {
			case "conflict":
				await handleCreateRelationship(moon1, moon2, "tension");
				break;
			case "resonance":
				await handleCreateRelationship(moon1, moon2, "support");
				break;
			case "uncertain":
				await db.nodes.update(moon1.id, { confidence: "wobbly" });
				await db.nodes.update(moon2.id, { confidence: "wobbly" });
				await onNodesUpdate();
				showToast("Both moons marked uncertain 〰️", "#FBBF24");
				break;
		}
	};

	// ── RELATIONSHIP LINES ──
	const moonPositionMap = {};
	distributedMoons.forEach((m) => {
		moonPositionMap[m.id] = getMoonPosition(m, centeredPlanet, orbitTime);
	});

	const rendered = new Set();
	const relLines = [];
	childMoons.forEach((moon) => {
		(moon.relationships || []).forEach((rel) => {
			const key = [moon.id, rel.targetMoonId].sort().join("|");
			if (rendered.has(key)) return;
			rendered.add(key);
			const target = childMoons.find((m) => m.id === rel.targetMoonId);
			if (!target) return;
			const posA = moonPositionMap[moon.id];
			const posB = moonPositionMap[target.id];
			if (!posA || !posB) return;

			const deleteRel = (confirmMsg, extraUpdates = {}) => {
				if (!window.confirm(confirmMsg)) return;
				db.nodes.update(moon.id, {
					relationships: (moon.relationships || []).filter(
						(r) => r.targetMoonId !== target.id,
					),
					...extraUpdates,
				});
				db.nodes.update(target.id, {
					relationships: (target.relationships || []).filter(
						(r) => r.targetMoonId !== moon.id,
					),
					...extraUpdates,
				});
				onNodesUpdate();
				showToast("Relationship removed", "#64748B");
			};

			if (rel.type === "support") {
				relLines.push(
					<SupportLine
						key={key}
						moonA={moon}
						moonB={target}
						posA={posA}
						posB={posB}
						isHovered={false}
						onClick={() => deleteRel("Remove this resonance relationship?")}
					/>,
				);
			} else if (rel.type === "tension") {
				relLines.push(
					<TensionLine
						key={key}
						moonA={moon}
						moonB={target}
						posA={posA}
						posB={posB}
						intensity={rel.intensity || 2}
						isHovered={false}
						onClick={() =>
							deleteRel(
								"Remove this conflict? Both moons will be unanchored.",
								{ isLocked: false },
							)
						}
					/>,
				);
			}
		});
	});

	// ── RENDER ──
	return (
		<div
			style={{
				position: "absolute",
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				display: "flex",
				flexDirection: "column",
			}}>
			{/* TOP BAR */}
			<div
				style={{
					padding: "14px 24px",
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					background: "rgba(10, 15, 28, 0.97)",
					backdropFilter: "blur(10px)",
					borderBottom: "1px solid rgba(108,99,255,0.12)",
					zIndex: 10,
					flexShrink: 0,
				}}>
				<button
					onClick={onSwitchToObservation}
					style={{
						padding: "7px 13px",
						background: "rgba(108,99,255,0.12)",
						border: "1px solid rgba(108,99,255,0.3)",
						borderRadius: "7px",
						color: "#6C63FF",
						cursor: "pointer",
						fontSize: "12px",
						fontWeight: 600,
						display: "flex",
						alignItems: "center",
						gap: "6px",
						transition: "all 0.2s",
					}}
					onMouseEnter={(e) => {
						e.currentTarget.style.background = "#6C63FF";
						e.currentTarget.style.color = "#fff";
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.background = "rgba(108,99,255,0.12)";
						e.currentTarget.style.color = "#6C63FF";
					}}>
					<ArrowLeft size={13} /> Edit Observation
				</button>
				<div
					style={{
						fontSize: "14px",
						fontWeight: 600,
						color: "#94A3B8",
						maxWidth: "400px",
						overflow: "hidden",
						textOverflow: "ellipsis",
						whiteSpace: "nowrap",
					}}>
					{parentNode.text?.substring(0, 60) || "Untitled"}
					{parentNode.text?.length > 60 ? "…" : ""}
				</div>
				<div style={{ width: "120px" }} />
			</div>

			{/* COMPARISON BAR */}
			{isComparing && (
				<div
					style={{
						padding: "10px 24px",
						background: "rgba(10,15,28,0.95)",
						borderBottom: "1px solid rgba(108,99,255,0.15)",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						gap: "12px",
						zIndex: 10,
						flexShrink: 0,
					}}>
					<span style={{ fontSize: "12px", color: "#64748B" }}>
						Comparing Moons {moonNumbers[liveSelectedMoons[0].id]} &{" "}
						{moonNumbers[liveSelectedMoons[1].id]}
					</span>
					<button
						onClick={() => handleQuickCompare("conflict")}
						style={{
							padding: "6px 12px",
							background: "#F9731615",
							border: "1px solid #F9731640",
							borderRadius: "6px",
							color: "#F97316",
							cursor: "pointer",
							fontSize: "11px",
							fontWeight: 600,
							transition: "all 0.2s",
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.background = "#F9731625";
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.background = "#F9731615";
						}}>
						☄️ Mark Conflict
					</button>
					<button
						onClick={() => handleQuickCompare("resonance")}
						style={{
							padding: "6px 12px",
							background: "#10B98115",
							border: "1px solid #10B98140",
							borderRadius: "6px",
							color: "#10B981",
							cursor: "pointer",
							fontSize: "11px",
							fontWeight: 600,
							transition: "all 0.2s",
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.background = "#10B98125";
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.background = "#10B98115";
						}}>
						🌊 Mark Resonance
					</button>
					<button
						onClick={() => handleQuickCompare("uncertain")}
						style={{
							padding: "6px 12px",
							background: "#FBBF2415",
							border: "1px solid #FBBF2440",
							borderRadius: "6px",
							color: "#FBBF24",
							cursor: "pointer",
							fontSize: "11px",
							fontWeight: 600,
							transition: "all 0.2s",
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.background = "#FBBF2425";
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.background = "#FBBF2415";
						}}>
						〰️ Both Uncertain
					</button>
					<button
						onClick={() => setSelectedMoons([])}
						style={{
							padding: "6px 12px",
							background: "transparent",
							border: "1px solid rgba(148,163,184,0.2)",
							borderRadius: "6px",
							color: "#64748B",
							cursor: "pointer",
							fontSize: "11px",
							fontWeight: 600,
							transition: "all 0.2s",
							marginLeft: "8px",
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.borderColor = "#94A3B8";
							e.currentTarget.style.color = "#94A3B8";
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.borderColor = "rgba(148,163,184,0.2)";
							e.currentTarget.style.color = "#64748B";
						}}>
						Clear
					</button>
				</div>
			)}

			{/* CANVAS + PANELS ROW */}
			<div
				style={{
					flex: 1,
					display: "flex",
					overflow: "hidden",
					position: "relative",
				}}>
				{/* LEFT PANEL (comparison mode only) */}
				{isComparing && (
					<div
						style={{
							width: `${PANEL_WIDTH}px`,
							flexShrink: 0,
						}}>
						<MoonSidePanel
							moon={liveSelectedMoons[0]}
							moonNumber={moonNumbers[liveSelectedMoons[0].id]}
							allMoons={liveMoons}
							dimColor={
								moonConfig.dimension[liveSelectedMoons[0].dimension].color
							}
							onClose={() => {}}
							onAction={handlePanelAction}
							onStartRelationship={handleStartRelationship}
							isComparison={true}
						/>
					</div>
				)}

				{/* CANVAS */}
				<div
					style={{
						flex: 1,
						position: "relative",
						transition: "all 0.25s ease",
					}}>
					{/* Instruction / banner */}
					{!showInputCard &&
						!creatingRelationship &&
						selectedMoons.length === 0 && (
							<div
								style={{
									position: "absolute",
									top: "20px",
									left: "50%",
									transform: "translateX(-50%)",
									padding: "8px 16px",
									background: "rgba(10,15,28,0.95)",
									border: "1px solid rgba(108,99,255,0.2)",
									borderRadius: "7px",
									color: "#475569",
									fontSize: "11px",
									fontWeight: 500,
									zIndex: 10,
									whiteSpace: "nowrap",
									pointerEvents: "none",
								}}>
								{childMoons.length === 0
									? "Click a glowing orbit ring to add your first reflection"
									: "Click a moon · Shift+Click to compare 2 moons"}
							</div>
						)}

					{creatingRelationship && (
						<div
							style={{
								position: "absolute",
								top: "14px",
								left: "50%",
								transform: "translateX(-50%)",
								padding: "11px 18px",
								background: "rgba(8,12,24,0.98)",
								border: `2px solid ${creatingRelationship === "tension" ? "#F97316" : "#10B981"}`,
								borderRadius: "9px",
								color: "#E6EEF8",
								fontSize: "12px",
								fontWeight: 600,
								zIndex: 20,
								textAlign: "center",
								boxShadow: `0 4px 20px ${creatingRelationship === "tension" ? "#F9731620" : "#10B98120"}`,
							}}>
							<div>
								{creatingRelationship === "tension"
									? "☄️ Which moon conflicts with this?"
									: "🌊 Which moon resonates with this?"}
							</div>
							<div
								style={{
									fontSize: "10px",
									color: "#334155",
									fontWeight: 400,
									marginTop: "3px",
								}}>
								Click a moon · ESC to cancel
							</div>
						</div>
					)}

					{toast && (
						<div
							style={{
								position: "absolute",
								bottom: "60px",
								left: "50%",
								transform: "translateX(-50%)",
								padding: "8px 16px",
								background: "rgba(8,12,24,0.97)",
								border: `1px solid ${toast.color}`,
								borderRadius: "6px",
								color: toast.color,
								fontSize: "11px",
								fontWeight: 600,
								zIndex: 50,
								whiteSpace: "nowrap",
								pointerEvents: "none",
								animation: "fadeInUp 0.2s ease",
							}}>
							{toast.message}
						</div>
					)}

					<svg
						style={{
							position: "absolute",
							left: 0,
							top: 0,
							width: "100%",
							height: "100%",
							pointerEvents: "none",
						}}>
						<defs>
							<filter id="orbitGlow">
								<feGaussianBlur stdDeviation="2" result="blur" />
								<feMerge>
									<feMergeNode in="blur" />
									<feMergeNode in="SourceGraphic" />
								</feMerge>
							</filter>
						</defs>
						<g style={{ pointerEvents: "auto" }}>
							{/* Orbital rings */}
							{orbitalPaths
								.filter((p) => unlockedDimensions.includes(p.dimension))
								.map((path) => (
									<g key={path.dimension}>
										<circle
											cx={path.centerX}
											cy={path.centerY}
											r={path.radius}
											fill="none"
											stroke={path.color}
											strokeWidth={2}
											strokeOpacity={0.5}
											strokeDasharray="3,10"
											filter="url(#orbitGlow)"
										/>
									</g>
								))}

							{/* Relationship lines */}
							{relLines}

							{/* Source moon pulse ring */}
							{creatingRelationship &&
								relationshipSourceMoon &&
								(() => {
									const src = distributedMoons.find(
										(m) => m.id === relationshipSourceMoon.id,
									);
									if (!src) return null;
									const pos = getMoonPosition(src, centeredPlanet, orbitTime);
									const r =
										moonConfig.dimension[relationshipSourceMoon.dimension]
											.radius;
									const c =
										creatingRelationship === "tension" ? "#F97316" : "#10B981";
									return (
										<g>
											<circle cx={pos.x} cy={pos.y} r={r + 3} fill={`${c}12`} />
											<circle
												cx={pos.x}
												cy={pos.y}
												r={r + 8}
												fill="none"
												stroke={c}
												strokeWidth={2}>
												<animate
													attributeName="r"
													values={`${r + 5};${r + 14};${r + 5}`}
													dur="1.4s"
													repeatCount="indefinite"
												/>
												<animate
													attributeName="opacity"
													values="0.5;1;0.5"
													dur="1.4s"
													repeatCount="indefinite"
												/>
											</circle>
										</g>
									);
								})()}

							{/* Planet */}
							<Planet
								node={centeredPlanet}
								moons={childMoons}
								isHovered={false}
								isSelected={false}
								isFocused={true}
							/>

							{/* Ghost moons */}
							{!showInputCard &&
								ghostMoons.map((ghost) => (
									<Moon
										key={ghost.id}
										node={ghost}
										position={ghost.position}
										isGhost={true}
										ghostLabel={`Add ${moonConfig.dimension[ghost.dimension].name}`}
										isHovered={hoveredMoonId === ghost.id}
										onClick={(n, e) => handleMoonClick(n, e)}
										onMouseEnter={() => setHoveredMoonId(ghost.id)}
										onMouseLeave={() => setHoveredMoonId(null)}
									/>
								))}

							{/* Individual orbiting moons */}
							{!showInputCard &&
								distributedMoons.map((moon) => {
									const pos = getMoonPosition(moon, centeredPlanet, orbitTime);
									const liveMoon =
										liveMoons.find((m) => m.id === moon.id) || moon;
									const isSelected = selectedMoons.includes(moon.id);
									const moonNum = moonNumbers[moon.id];
									return (
										<g key={moon.id}>
											<Moon
												node={liveMoon}
												position={pos}
												isHovered={hoveredMoonId === moon.id || isSelected}
												isSelected={isSelected}
												moonNumber={moonNum}
												onClick={(n, e) => handleMoonClick(n, e)}
												onMouseEnter={() => setHoveredMoonId(moon.id)}
												onMouseLeave={() => setHoveredMoonId(null)}
											/>
											{/* Hover label */}
											{hoveredMoonId === moon.id && (
												<g>
													<rect
														x={pos.x - 60}
														y={
															pos.y -
															moonConfig.dimension[moon.dimension].radius -
															28
														}
														width="120"
														height="20"
														rx="4"
														fill="rgba(10,15,28,0.95)"
														stroke={moonConfig.dimension[moon.dimension].color}
														strokeWidth="1"
													/>
													<text
														x={pos.x}
														y={
															pos.y -
															moonConfig.dimension[moon.dimension].radius -
															15
														}
														textAnchor="middle"
														fontSize="11"
														fill="#CBD5E1"
														fontWeight="500"
														style={{ pointerEvents: "none" }}>
														{moon.text.substring(0, 18)}
														{moon.text.length > 18 ? "…" : ""}
													</text>
												</g>
											)}
										</g>
									);
								})}
						</g>
					</svg>
				</div>

				{/* RIGHT PANEL (single or comparison) */}
				<div
					style={{
						width: panelOpen && !isComparing ? `${PANEL_WIDTH}px` : "0px",
						transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)",
						overflow: "hidden",
						flexShrink: 0,
					}}>
					{liveSelectedMoons[0] && !isComparing && (
						<MoonSidePanel
							moon={liveSelectedMoons[0]}
							moonNumber={moonNumbers[liveSelectedMoons[0].id]}
							allMoons={liveMoons}
							dimColor={
								moonConfig.dimension[liveSelectedMoons[0].dimension].color
							}
							onClose={() => setSelectedMoons([])}
							onAction={handlePanelAction}
							onStartRelationship={handleStartRelationship}
						/>
					)}
				</div>

				{isComparing && (
					<div style={{ width: `${PANEL_WIDTH}px`, flexShrink: 0 }}>
						<MoonSidePanel
							moon={liveSelectedMoons[1]}
							moonNumber={moonNumbers[liveSelectedMoons[1].id]}
							allMoons={liveMoons}
							dimColor={
								moonConfig.dimension[liveSelectedMoons[1].dimension].color
							}
							onClose={() => {}}
							onAction={handlePanelAction}
							onStartRelationship={handleStartRelationship}
							isComparison={true}
						/>
					</div>
				)}
			</div>

			{/* BOTTOM BAR */}
			<div
				style={{
					padding: "10px 24px",
					background: "rgba(10,15,28,0.97)",
					backdropFilter: "blur(10px)",
					borderTop: "1px solid rgba(108,99,255,0.08)",
					display: "flex",
					alignItems: "center",
					gap: "12px",
					zIndex: 10,
					flexShrink: 0,
				}}>
				<span
					style={{
						fontSize: "9px",
						color: "#1E293B",
						fontWeight: 700,
						textTransform: "uppercase",
						letterSpacing: "0.6px",
						whiteSpace: "nowrap",
					}}>
					Observation
				</span>
				<span
					style={{ fontSize: "12px", color: "#334155", fontStyle: "italic" }}>
					{parentNode.text?.substring(0, 120) || "No description"}
					{parentNode.text?.length > 120 ? "…" : ""}
				</span>
			</div>

			{/* Input card */}
			{showInputCard && addingDimension && (
				<MoonInputCard
					dimension={addingDimension}
					onSave={handleSaveReflection}
					onCancel={() => {
						setShowInputCard(false);
						setAddingDimension(null);
					}}
				/>
			)}

			{unlockNotification && (
				<DimensionUnlockNotification
					dimension={unlockNotification.dimension}
					onDismiss={() => setUnlockNotification(null)}
				/>
			)}

			<style>{`
				@keyframes fadeInUp {
					from { opacity: 0; transform: translateX(-50%) translateY(5px); }
					to   { opacity: 1; transform: translateX(-50%) translateY(0); }
				}
			`}</style>
		</div>
	);
}
