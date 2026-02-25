// src/components/ReflectionSpace.jsx - V5.1
// Fixes: moon creation now includes timestamp/ownership/isLocked,
//        orbit scale kept at 0.62 matching seedData intent
import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft } from "lucide-react";
import Planet from "./Planet";
import Moon from "./Moon";
import MoonInputCard from "./MoonInputCard";
import MoonSidePanel, { PANEL_WIDTH } from "./MoonSidePanel";
import DimensionUnlockNotification from "./DimensionUnlockNotification";
import SupportLine from "./SupportLine";
import TensionLine from "./TensionLine";
import {
	calculateAnimatedOrbit,
	calculateMoonPosition,
	distributeMoonsEvenly,
} from "../lib/orbitalPhysics";
import { moonConfig, planetConfig } from "../seedData";
import {
	db,
	getTotalReflectionCount,
	checkDimensionUnlock,
	getUnlockedDimensions,
} from "../lib/db";

// ── Constants ────────────────────────────────────────────────────────────────
const TOP_BAR_HEIGHT = 60;
const BOTTOM_BAR_HEIGHT = 44;
const ORBIT_SCALE = 0.62;

const DIMENSION_START_ANGLES = {
	subjective: Math.PI * 1.5,
	behavioral: 0,
	intersubjective: Math.PI * 0.5,
	symbolic: Math.PI,
};

// ── Helpers ──────────────────────────────────────────────────────────────────
function getMoonPosition(moon, parent, orbitTime) {
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
		orbitTime,
		false,
		moon.dimension,
		ORBIT_SCALE,
	);
}

function getScaledOrbitalPaths(parent) {
	return Object.entries(moonConfig.dimension).map(([dimension, config]) => ({
		dimension,
		centerX: parent.position.x + planetConfig.baseRadius,
		centerY: parent.position.y + planetConfig.baseRadius,
		radius: config.orbitRadius * ORBIT_SCALE,
		color: config.color,
	}));
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ReflectionSpace({
	parentNode,
	nodes,
	onSwitchToObservation,
	onNodesUpdate,
}) {
	const [selectedMoonId, setSelectedMoonId] = useState(null);
	const [creatingRelationship, setCreatingRelationship] = useState(null);
	const [relationshipSourceMoon, setRelationshipSourceMoon] = useState(null);
	const [hoveredMoonId, setHoveredMoonId] = useState(null);
	const [hoveredRingDimension, setHoveredRingDimension] = useState(null);
	const [showInputCard, setShowInputCard] = useState(false);
	const [addingDimension, setAddingDimension] = useState(null);
	const [unlockNotification, setUnlockNotification] = useState(null);
	const [unlockedDimensions, setUnlockedDimensions] = useState([]);
	const [orbitTime, setOrbitTime] = useState(0);
	const lastTimestampRef = useRef(null);
	const [toast, setToast] = useState(null);

	// ── Centering ──────────────────────────────────────────────────────────────
	const panelOpen = selectedMoonId !== null;
	const panelWidth = panelOpen ? PANEL_WIDTH : 0;
	const viewportCenterX = (window.innerWidth - panelWidth) / 2;
	const viewportCenterY =
		(window.innerHeight - TOP_BAR_HEIGHT - BOTTOM_BAR_HEIGHT) / 2;

	const centeredPlanet = {
		...parentNode,
		position: {
			x: viewportCenterX - planetConfig.baseRadius,
			y: viewportCenterY - planetConfig.baseRadius,
		},
	};

	const childMoons = nodes.filter((n) => n.parentId === parentNode.id);
	const distributedMoons = distributeMoonsEvenly(childMoons, centeredPlanet);
	const orbitalPaths = getScaledOrbitalPaths(centeredPlanet);
	const selectedMoon = childMoons.find((m) => m.id === selectedMoonId) || null;

	// ── Orbit animation ────────────────────────────────────────────────────────
	useEffect(() => {
		let id;
		const animate = (timestamp) => {
			if (lastTimestampRef.current !== null) {
				const delta = timestamp - lastTimestampRef.current;
				const clamped = Math.min(delta, 100);
				setOrbitTime((prev) => prev + clamped / 16.667);
			}
			lastTimestampRef.current = timestamp;
			id = requestAnimationFrame(animate);
		};
		id = requestAnimationFrame(animate);
		return () => {
			cancelAnimationFrame(id);
			lastTimestampRef.current = null;
		};
	}, []);

	// ── Load unlocked dimensions ───────────────────────────────────────────────
	useEffect(() => {
		getUnlockedDimensions().then(setUnlockedDimensions);
	}, []);

	// ── Keyboard ───────────────────────────────────────────────────────────────
	useEffect(() => {
		const onKey = (e) => {
			if (e.key === "Escape") {
				if (creatingRelationship) {
					setCreatingRelationship(null);
					setRelationshipSourceMoon(null);
					return;
				}
				setSelectedMoonId(null);
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [creatingRelationship]);

	// ── Toast ──────────────────────────────────────────────────────────────────
	const showToast = (message, color = "#10B981") => {
		setToast({ message, color });
		setTimeout(() => setToast(null), 2500);
	};

	// ── Ring click ─────────────────────────────────────────────────────────────
	const handleRingClick = (dimension) => {
		if (creatingRelationship || showInputCard) return;
		setAddingDimension(dimension);
		setShowInputCard(true);
	};

	// ── Moon click ─────────────────────────────────────────────────────────────
	const handleMoonClick = (moonNode) => {
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
		setSelectedMoonId((prev) => (prev === moonNode.id ? null : moonNode.id));
	};

	// ── Panel actions ──────────────────────────────────────────────────────────
	const handlePanelAction = async (action, moon, extra) => {
		switch (action) {
			case "ownership":
				await db.nodes.update(moon.id, { ownership: extra.ownership });
				await onNodesUpdate();
				showToast(
					extra.ownership === "entertained"
						? "Marked as entertained ✦"
						: "Back to asserted",
					"#FBBF24",
				);
				break;

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
						? "Marked uncertain 〰️"
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
					!moon.isLocked ? "Anchored ⚓" : "Released to orbit",
					"#60A5FA",
				);
				break;

			case "remove-relationship":
				const { targetMoonId } = extra;
				const targetMoon = childMoons.find((m) => m.id === targetMoonId);
				if (!targetMoon) break;
				await db.nodes.update(moon.id, {
					relationships: (moon.relationships || []).filter(
						(r) => r.targetMoonId !== targetMoonId,
					),
				});
				await db.nodes.update(targetMoonId, {
					relationships: (targetMoon.relationships || []).filter(
						(r) => r.targetMoonId !== moon.id,
					),
					isLocked: false,
				});
				await onNodesUpdate();
				showToast("Relationship removed", "#64748B");
				break;

			case "delete":
				if (window.confirm("Release this reflection into the void?")) {
					await db.nodes.delete(moon.id);
					await onNodesUpdate();
					setSelectedMoonId(null);
					showToast("Released 🌌", "#64748B");
				}
				break;
		}
	};

	// ── Relationship creation ──────────────────────────────────────────────────
	const handleStartRelationship = (type, moon) => {
		setCreatingRelationship(type);
		setRelationshipSourceMoon(moon);
		showToast(
			type === "tension"
				? "⚡ Click the conflicting moon"
				: "〜 Click the resonating moon",
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
		setSelectedMoonId(sourceMoon.id);
		showToast(
			type === "tension" ? "⚡ Conflict mapped" : "〜 Resonance mapped",
			type === "tension" ? "#EF4444" : "#10B981",
		);
	};

	// ── Save new reflection ────────────────────────────────────────────────────
	const handleSaveReflection = async (data) => {
		const previousCount = await getTotalReflectionCount();
		await db.nodes.add({
			type: "R",
			parentId: parentNode.id,
			dimension: addingDimension,
			text: data.text,
			// ↓ fields that were previously missing and caused UI glitches
			timestamp: Date.now(),
			ownership: "asserted",
			isLocked: false,
			lensesUsed: data.lensesUsed || [],
			orbitAngle: DIMENSION_START_ANGLES[addingDimension] || 0,
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

	// ── Build relationship line positions ──────────────────────────────────────
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

			const removeRel = (confirmMsg, extraUpdates = {}) => {
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
						onClick={() => removeRel("Remove this resonance relationship?")}
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
							removeRel(
								"Remove this conflict? Both moons will be unanchored.",
								{ isLocked: false },
							)
						}
					/>,
				);
			}
		});
	});

	// ── Render ─────────────────────────────────────────────────────────────────
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
			{/* ── TOP BAR ──────────────────────────────────────────────────────── */}
			<div
				style={{
					height: TOP_BAR_HEIGHT,
					padding: "0 24px",
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					background: "rgba(10,15,28,0.97)",
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
						outline: "none",
					}}
					onMouseEnter={(e) => {
						e.currentTarget.style.background = "#6C63FF";
						e.currentTarget.style.color = "#fff";
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.background = "rgba(108,99,255,0.12)";
						e.currentTarget.style.color = "#A78BFA";
					}}>
					<ArrowLeft size={13} /> Exit
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

			{/* ── CANVAS + PANEL ROW ────────────────────────────────────────────── */}
			<div
				style={{
					flex: 1,
					display: "flex",
					overflow: "hidden",
					position: "relative",
				}}>
				{/* ── CANVAS ────────────────────────────────────────────────────── */}
				<div style={{ flex: 1, position: "relative" }}>
					{/* Instruction hint */}
					{!showInputCard && !creatingRelationship && !selectedMoonId && (
						<div
							style={{
								position: "absolute",
								top: 16,
								left: "50%",
								transform: "translateX(-50%)",
								padding: "7px 14px",
								background: "rgba(10,15,28,0.95)",
								border: "1px solid rgba(108,99,255,0.18)",
								borderRadius: "7px",
								color: "#64748B",
								fontSize: "11px",
								fontWeight: 600,
								zIndex: 10,
								whiteSpace: "nowrap",
								pointerEvents: "none",
							}}>
							{childMoons.length === 0
								? "Hover an orbit ring and click to add your first reflection"
								: "Click a moon to inspect · Click a ring to add a reflection"}
						</div>
					)}

					{/* Relationship creation mode banner */}
					{creatingRelationship && (
						<div
							style={{
								position: "absolute",
								top: 14,
								left: "50%",
								transform: "translateX(-50%)",
								padding: "11px 18px",
								background: "rgba(8,12,24,0.98)",
								border: `2px solid ${
									creatingRelationship === "tension" ? "#EF4444" : "#10B981"
								}`,
								borderRadius: "9px",
								color: "#E6EEF8",
								fontSize: "12px",
								fontWeight: 600,
								zIndex: 20,
								textAlign: "center",
								boxShadow: `0 4px 20px ${
									creatingRelationship === "tension" ? "#EF444420" : "#10B98120"
								}`,
							}}>
							<div>
								{creatingRelationship === "tension"
									? "⚡ Click the conflicting moon"
									: "〜 Click the resonating moon"}
							</div>
							<div
								style={{
									fontSize: "10px",
									color: "#475569",
									fontWeight: 400,
									marginTop: "3px",
								}}>
								ESC to cancel
							</div>
						</div>
					)}

					{/* Toast */}
					{toast && (
						<div
							style={{
								position: "absolute",
								bottom: "56px",
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

					{/* ── SVG CANVAS ─────────────────────────────────────────────── */}
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
								<feGaussianBlur stdDeviation="2.5" result="blur" />
								<feMerge>
									<feMergeNode in="blur" />
									<feMergeNode in="SourceGraphic" />
								</feMerge>
							</filter>
							<filter id="ringHoverGlow">
								<feGaussianBlur stdDeviation="4" result="blur" />
								<feMerge>
									<feMergeNode in="blur" />
									<feMergeNode in="SourceGraphic" />
								</feMerge>
							</filter>
						</defs>

						<g style={{ pointerEvents: "auto" }}>
							{/* ── ORBITAL RINGS ─────────────────────────────────────── */}
							{orbitalPaths
								.filter((p) => unlockedDimensions.includes(p.dimension))
								.map((path) => {
									const isHovered = hoveredRingDimension === path.dimension;
									const plusX = path.centerX;
									const plusY = path.centerY - path.radius;

									return (
										<g key={path.dimension}>
											{/* Invisible wide stroke for easy click target */}
											<circle
												cx={path.centerX}
												cy={path.centerY}
												r={path.radius}
												fill="none"
												stroke="transparent"
												strokeWidth={24}
												style={{ pointerEvents: "stroke", cursor: "pointer" }}
												onClick={() => handleRingClick(path.dimension)}
												onMouseEnter={() =>
													setHoveredRingDimension(path.dimension)
												}
												onMouseLeave={() => setHoveredRingDimension(null)}
											/>

											{/* Visual ring */}
											<circle
												cx={path.centerX}
												cy={path.centerY}
												r={path.radius}
												fill="none"
												stroke={path.color}
												strokeWidth={isHovered ? 2.5 : 1.5}
												strokeOpacity={isHovered ? 0.85 : 0.5}
												strokeDasharray={isHovered ? "none" : "3,10"}
												filter={
													isHovered ? "url(#ringHoverGlow)" : "url(#orbitGlow)"
												}
												style={{
													pointerEvents: "none",
													transition: "all 0.2s",
												}}
											/>

											{/* + badge at top of ring on hover */}
											{isHovered && (
												<g style={{ pointerEvents: "none" }}>
													<circle
														cx={plusX}
														cy={plusY}
														r={13}
														fill={path.color}
														opacity={0.92}
													/>
													<text
														x={plusX}
														y={plusY}
														textAnchor="middle"
														dominantBaseline="central"
														fontSize={17}
														fontWeight="700"
														fill="#fff"
														style={{ userSelect: "none" }}>
														+
													</text>
													<text
														x={plusX + 18}
														y={plusY}
														dominantBaseline="central"
														fontSize={10}
														fontWeight="700"
														fill={path.color}
														letterSpacing="0.08em"
														style={{ userSelect: "none" }}>
														{moonConfig.dimension[
															path.dimension
														].name.toUpperCase()}
													</text>
												</g>
											)}
										</g>
									);
								})}

							{/* ── RELATIONSHIP LINES ────────────────────────────────── */}
							{relLines}

							{/* ── SOURCE MOON GLOW during relationship creation ─────── */}
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
										<g key="rel-source-glow">
											<circle cx={pos.x} cy={pos.y} r={r + 4} fill={`${c}10`} />
											<circle
												cx={pos.x}
												cy={pos.y}
												r={r + 9}
												fill="none"
												stroke={c}
												strokeWidth={2}>
												<animate
													attributeName="r"
													values={`${r + 6};${r + 15};${r + 6}`}
													dur="1.4s"
													repeatCount="indefinite"
												/>
												<animate
													attributeName="opacity"
													values="0.4;0.9;0.4"
													dur="1.4s"
													repeatCount="indefinite"
												/>
											</circle>
										</g>
									);
								})()}

							{/* ── PLANET ────────────────────────────────────────────── */}
							<Planet
								node={centeredPlanet}
								moons={childMoons}
								isHovered={false}
								isSelected={false}
								isFocused={true}
							/>

							{/* ── MOONS ─────────────────────────────────────────────── */}
							{!showInputCard &&
								distributedMoons.map((moon) => {
									const pos = getMoonPosition(moon, centeredPlanet, orbitTime);
									const liveMoon =
										childMoons.find((m) => m.id === moon.id) || moon;
									const isSelected = selectedMoonId === moon.id;
									const isHovered = hoveredMoonId === moon.id;

									return (
										<g key={moon.id}>
											<Moon
												node={liveMoon}
												position={pos}
												isHovered={isHovered || isSelected}
												isSelected={isSelected}
												onClick={(n) => handleMoonClick(n)}
												onMouseEnter={() => setHoveredMoonId(moon.id)}
												onMouseLeave={() => setHoveredMoonId(null)}
											/>
											{/* Text preview on hover */}
											{isHovered && !isSelected && (
												<g style={{ pointerEvents: "none" }}>
													<rect
														x={pos.x - 64}
														y={
															pos.y -
															moonConfig.dimension[moon.dimension].radius -
															30
														}
														width={128}
														height={22}
														rx={5}
														fill="rgba(8,12,24,0.96)"
														stroke={moonConfig.dimension[moon.dimension].color}
														strokeWidth={1}
														strokeOpacity={0.5}
													/>
													<text
														x={pos.x}
														y={
															pos.y -
															moonConfig.dimension[moon.dimension].radius -
															17
														}
														textAnchor="middle"
														fontSize={10}
														fill="#94A3B8"
														fontWeight={500}>
														{moon.text.substring(0, 20)}
														{moon.text.length > 20 ? "…" : ""}
													</text>
												</g>
											)}
										</g>
									);
								})}
						</g>
					</svg>
				</div>

				{/* ── SIDE PANEL ─────────────────────────────────────────────────── */}
				{panelOpen && selectedMoon && (
					<MoonSidePanel
						moon={selectedMoon}
						allMoons={childMoons}
						dimColor={moonConfig.dimension[selectedMoon.dimension].color}
						onClose={() => setSelectedMoonId(null)}
						onAction={handlePanelAction}
						onStartRelationship={handleStartRelationship}
					/>
				)}
			</div>

			{/* ── BOTTOM BAR ───────────────────────────────────────────────────── */}
			<div
				style={{
					height: BOTTOM_BAR_HEIGHT,
					padding: "0 24px",
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
						fontSize: "10px",
						color: "#64748B",
						fontWeight: 700,
						textTransform: "uppercase",
						letterSpacing: "0.7px",
						whiteSpace: "nowrap",
					}}>
					Observation
				</span>
				<span
					style={{ fontSize: "13px", color: "#7A8FA6", fontStyle: "italic" }}>
					{parentNode.text?.substring(0, 120) || "No description"}
					{parentNode.text?.length > 120 ? "…" : ""}
				</span>
			</div>

			{/* ── INPUT CARD ───────────────────────────────────────────────────── */}
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

			{/* ── UNLOCK NOTIFICATION ──────────────────────────────────────────── */}
			{unlockNotification && (
				<DimensionUnlockNotification
					dimension={unlockNotification.dimension}
					onDismiss={() => setUnlockNotification(null)}
				/>
			)}

			<style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateX(-50%) translateY(6px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0);   }
        }
      `}</style>
		</div>
	);
}
