// src/components/ReflectionSpace.jsx - V4.4 Fixed centering + Shift+click
import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import Planet from "./Planet";
import Moon from "./Moon";
import MoonInputCard from "./MoonInputCard";
import MoonSidePanel from "./MoonSidePanel";
import DimensionUnlockNotification from "./DimensionUnlockNotification";
import SupportLine from "./SupportLine";
import TensionLine from "./TensionLine";
import {
	getOrbitalPaths,
	distributeMoonsEvenly,
	calculateAnimatedOrbit,
	calculateMoonPosition,
} from "../lib/orbitalPhysics";
import { moonConfig, planetConfig } from "../seedData";
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

const PANEL_WIDTH = 500; // INCREASED from 380
const ORBIT_SCALE = 1.0; // FIXED from 0.8 to full size
const TOP_BAR_HEIGHT = 60;

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
// MAIN COMPONENT
// ============================================================================
export default function ReflectionSpace({
	parentNode,
	nodes,
	onSwitchToObservation,
	onNodesUpdate,
}) {
	const [selectedMoons, setSelectedMoons] = useState([]);
	const [creatingRelationship, setCreatingRelationship] = useState(null);
	const [relationshipSourceMoon, setRelationshipSourceMoon] = useState(null);
	const [comparingMode, setComparingMode] = useState(false);
	const [comparisonSourceMoon, setComparisonSourceMoon] = useState(null);
	const [hoveredMoonId, setHoveredMoonId] = useState(null);
	const [showInputCard, setShowInputCard] = useState(false);
	const [addingDimension, setAddingDimension] = useState(null);
	const [unlockNotification, setUnlockNotification] = useState(null);
	const [unlockedDimensions, setUnlockedDimensions] = useState([]);
	const [orbitTime, setOrbitTime] = useState(0);
	const [toast, setToast] = useState(null);

	// ── DERIVED - FIXED CENTERING ──
	const viewportCenterX = window.innerWidth / 2;
	const viewportCenterY = window.innerHeight / 2; // FIXED: Removed + 60 offset, true center
	const isComparing = selectedMoons.length === 2;

	// Planet ALWAYS stays at viewportCenterX, viewportCenterY
	const centeredPlanet = {
		...parentNode,
		position: {
			x: viewportCenterX - planetConfig.baseRadius,
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

	const moonNumbers = {};
	distributedMoons.forEach((moon, idx) => {
		moonNumbers[moon.id] = MOON_EMOJIS[idx] || `${idx + 1}`;
	});

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
				if (comparingMode) {
					setComparingMode(false);
					setComparisonSourceMoon(null);
					return;
				}
				setSelectedMoons([]);
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [creatingRelationship, comparingMode]);

	const showToast = (message, color = "#10B981") => {
		setToast({ message, color });
		setTimeout(() => setToast(null), 2500);
	};

	// ── MOON CLICK - WITH SHIFT+CLICK RESTORED ──
	const handleMoonClick = (moonNode, e) => {
		if (moonNode.isGhost) {
			if (creatingRelationship || comparingMode) {
				showToast("Pick an existing moon", "#EF4444");
				return;
			}
			setAddingDimension(moonNode.dimension);
			setShowInputCard(true);
			return;
		}

		// SHIFT+CLICK for comparison (RESTORED)
		if (e?.shiftKey && !creatingRelationship && !comparingMode) {
			if (selectedMoons.includes(moonNode.id)) {
				setSelectedMoons(selectedMoons.filter((id) => id !== moonNode.id));
			} else if (selectedMoons.length < 2) {
				setSelectedMoons([...selectedMoons, moonNode.id]);
			} else {
				// Replace second moon
				setSelectedMoons([selectedMoons[0], moonNode.id]);
			}
			return;
		}

		// Comparison mode - select second moon
		if (comparingMode && comparisonSourceMoon) {
			if (moonNode.id === comparisonSourceMoon.id) {
				showToast("Pick a different moon to compare", "#EF4444");
				return;
			}
			setSelectedMoons([comparisonSourceMoon.id, moonNode.id]);
			setComparingMode(false);
			setComparisonSourceMoon(null);
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
				showToast("Reflection refined 🔭", "#8B5CF6");
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
					"#60A5FA",
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

	const handleStartComparison = (moon) => {
		setComparingMode(true);
		setComparisonSourceMoon(moon);
		setSelectedMoons([]);
		showToast("📊 Click another moon to compare", "#6C63FF");
	};

	const handleStartRelationship = (type, moon) => {
		setCreatingRelationship(type);
		setRelationshipSourceMoon(moon);
		setSelectedMoons([]);
		showToast(
			type === "tension"
				? "🔴 Click the conflicting moon"
				: "🌊 Click the resonating moon",
			type === "tension" ? "#EF4444" : "#10B981",
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
			type === "tension" ? "🔴 Conflict mapped" : "🌊 Resonance mapped",
			type === "tension" ? "#EF4444" : "#10B981",
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
						color: "#A78BFA",
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
						e.currentTarget.style.color = "#A78BFA";
					}}>
					<ArrowLeft size={13} /> Edit Observation
				</button>
				<div
					style={{
						fontSize: "14px",
						fontWeight: 600,
						color: "#CBD5E1",
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
					<span style={{ fontSize: "12px", color: "#94A3B8" }}>
						Comparing Moons
					</span>
					<button
						onClick={() => handleQuickCompare("conflict")}
						style={{
							padding: "6px 12px",
							background: "#EF444415",
							border: "1px solid #EF444440",
							borderRadius: "6px",
							color: "#EF4444",
							cursor: "pointer",
							fontSize: "11px",
							fontWeight: 600,
							transition: "all 0.2s",
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.background = "#EF444425";
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.background = "#EF444415";
						}}>
						🔴 Mark Conflict
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
				{isComparing && liveSelectedMoons[0] && (
					<div style={{ width: `${PANEL_WIDTH}px`, flexShrink: 0 }}>
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
							onStartComparison={handleStartComparison}
							isComparison={true}
							showMoonNumber={true}
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
					{!showInputCard &&
						!creatingRelationship &&
						!comparingMode &&
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
									color: "#64748B",
									fontSize: "11px",
									fontWeight: 500,
									zIndex: 10,
									whiteSpace: "nowrap",
									pointerEvents: "none",
								}}>
								{childMoons.length === 0
									? "Click a glowing orbit ring to add your first reflection"
									: "Click a moon • Shift+Click to compare 2 moons"}
							</div>
						)}

					{comparingMode && (
						<div
							style={{
								position: "absolute",
								top: "14px",
								left: "50%",
								transform: "translateX(-50%)",
								padding: "11px 18px",
								background: "rgba(8,12,24,0.98)",
								border: "2px solid #6C63FF",
								borderRadius: "9px",
								color: "#E6EEF8",
								fontSize: "12px",
								fontWeight: 600,
								zIndex: 20,
								textAlign: "center",
								boxShadow: "0 4px 20px rgba(108,99,255,0.2)",
							}}>
							<div>📊 Click another moon to compare</div>
							<div
								style={{
									fontSize: "10px",
									color: "#64748B",
									fontWeight: 400,
									marginTop: "3px",
								}}>
								ESC to cancel
							</div>
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
								border: `2px solid ${creatingRelationship === "tension" ? "#EF4444" : "#10B981"}`,
								borderRadius: "9px",
								color: "#E6EEF8",
								fontSize: "12px",
								fontWeight: 600,
								zIndex: 20,
								textAlign: "center",
								boxShadow: `0 4px 20px ${creatingRelationship === "tension" ? "#EF444420" : "#10B98120"}`,
							}}>
							<div>
								{creatingRelationship === "tension"
									? "🔴 Click the conflicting moon"
									: "🌊 Click the resonating moon"}
							</div>
							<div
								style={{
									fontSize: "10px",
									color: "#64748B",
									fontWeight: 400,
									marginTop: "3px",
								}}>
								ESC to cancel
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
							{orbitalPaths
								.filter((p) => unlockedDimensions.includes(p.dimension))
								.map((path) => (
									<circle
										key={path.dimension}
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
								))}

							{relLines}

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
										creatingRelationship === "tension" ? "#EF4444" : "#10B981";
									return (
										<g key="relationship-source-glow">
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

							{comparingMode &&
								comparisonSourceMoon &&
								(() => {
									const src = distributedMoons.find(
										(m) => m.id === comparisonSourceMoon.id,
									);
									if (!src) return null;
									const pos = getMoonPosition(src, centeredPlanet, orbitTime);
									const r =
										moonConfig.dimension[comparisonSourceMoon.dimension].radius;
									return (
										<g key="comparison-source-glow">
											<circle
												cx={pos.x}
												cy={pos.y}
												r={r + 3}
												fill="#6C63FF15"
											/>
											<circle
												cx={pos.x}
												cy={pos.y}
												r={r + 8}
												fill="none"
												stroke="#6C63FF"
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

							<Planet
								node={centeredPlanet}
								moons={childMoons}
								isHovered={false}
								isSelected={false}
								isFocused={true}
							/>

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

							{!showInputCard &&
								distributedMoons.map((moon) => {
									const pos = getMoonPosition(moon, centeredPlanet, orbitTime);
									const liveMoon =
										liveMoons.find((m) => m.id === moon.id) || moon;
									const isSelected = selectedMoons.includes(moon.id);
									return (
										<g key={moon.id}>
											<Moon
												node={liveMoon}
												position={pos}
												isHovered={hoveredMoonId === moon.id || isSelected}
												isSelected={isSelected}
												moonNumber={moonNumbers[moon.id]}
												showMoonNumber={isComparing}
												onClick={(n, e) => handleMoonClick(n, e)}
												onMouseEnter={() => setHoveredMoonId(moon.id)}
												onMouseLeave={() => setHoveredMoonId(null)}
											/>
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

				{/* RIGHT PANEL - Single selection */}
				{selectedMoons.length === 1 && liveSelectedMoons[0] && (
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
							onClose={() => setSelectedMoons([])}
							onAction={handlePanelAction}
							onStartRelationship={handleStartRelationship}
							onStartComparison={handleStartComparison}
							showMoonNumber={false}
						/>
					</div>
				)}

				{/* RIGHT PANEL - Comparison mode */}
				{isComparing && liveSelectedMoons[1] && (
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
							onStartComparison={handleStartComparison}
							isComparison={true}
							showMoonNumber={true}
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
						color: "#334155",
						fontWeight: 700,
						textTransform: "uppercase",
						letterSpacing: "0.6px",
						whiteSpace: "nowrap",
					}}>
					Observation
				</span>
				<span
					style={{ fontSize: "12px", color: "#475569", fontStyle: "italic" }}>
					{parentNode.text?.substring(0, 120) || "No description"}
					{parentNode.text?.length > 120 ? "…" : ""}
				</span>
			</div>

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
