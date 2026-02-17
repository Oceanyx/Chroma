// src/components/ReflectionSpace.jsx - V3.1 Space-Themed Hover UI
import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import Planet from "./Planet";
import Moon from "./Moon";
import MoonInputCard from "./MoonInputCard";
import DimensionUnlockNotification from "./DimensionUnlockNotification";
import SupportLine from "./SupportLine";
import TensionLine from "./TensionLine";
import {
	getGhostMoonPositions,
	groupMoonsByDimension,
	getOrbitalPaths,
	distributeMoonsEvenly,
	calculateAnimatedOrbit,
} from "../lib/orbitalPhysics";
import { moonConfig, lenses } from "../seedData";
import {
	db,
	getTotalReflectionCount,
	checkDimensionUnlock,
	getUnlockedDimensions,
} from "../lib/db";

// ============================================================================
// ACTION BUTTON CONFIG - Space-themed, meaning-first
// ============================================================================
const ACTION_BUTTONS = [
	// Row 1 — individual moon states
	{
		action: "edit",
		emoji: "🔭",
		label: "Refine",
		sublabel: "Revisit what you wrote",
		hoverColor: "#6C63FF",
		activeCheck: () => false,
	},
	{
		action: "anchor",
		emoji: "⚓",
		label: "Anchor",
		sublabel: "Hold still for comparison",
		hoverColor: "#4D9FFF",
		activeCheck: (moon) => !!moon.isLocked,
	},
	{
		action: "uncertain",
		emoji: "〰️",
		label: "Uncertain",
		sublabel: "Not sure this is true",
		hoverColor: "#FBBF24",
		activeCheck: (moon) => moon.confidence === "wobbly",
	},
	// Row 2 — relational / existential
	{
		action: "tension",
		emoji: "☄️",
		label: "Conflicts With",
		sublabel: "Links to another moon",
		hoverColor: "#F97316",
		activeCheck: () => false,
	},
	{
		action: "support",
		emoji: "🌊",
		label: "Resonates With",
		sublabel: "Echoes another moon",
		hoverColor: "#10B981",
		activeCheck: () => false,
	},
	{
		action: "delete",
		emoji: "🌌",
		label: "Release",
		sublabel: "Let go of this reflection",
		hoverColor: "#EF4444",
		activeCheck: () => false,
	},
];

// ============================================================================
// COMPONENT
// ============================================================================
export default function ReflectionSpace({
	parentNode,
	nodes,
	onSwitchToObservation,
	onNodesUpdate,
}) {
	// Relationship creation
	const [creatingRelationship, setCreatingRelationship] = useState(null); // 'tension' | 'support'
	const [relationshipSourceMoon, setRelationshipSourceMoon] = useState(null);

	// UI state
	const [hoveredRelationshipId, setHoveredRelationshipId] = useState(null);
	const [hoveredDimension, setHoveredDimension] = useState(null);
	const [selectedDimension, setSelectedDimension] = useState(null);
	const [expandedDimension, setExpandedDimension] = useState(null);
	const [showInputCard, setShowInputCard] = useState(false);
	const [unlockNotification, setUnlockNotification] = useState(null);
	const [unlockedDimensions, setUnlockedDimensions] = useState([]);
	const [orbitTime, setOrbitTime] = useState(0);

	// Edit modal state
	const [editingMoon, setEditingMoon] = useState(null);
	const [editText, setEditText] = useState("");
	const [editLenses, setEditLenses] = useState([]);

	// Toast
	const [toast, setToast] = useState(null);

	// ============================================================================
	// DERIVED DATA
	// ============================================================================
	const viewportCenterX = window.innerWidth / 2;
	const viewportCenterY = (window.innerHeight - 60) / 2 + 60;

	const centeredPlanet = {
		...parentNode,
		position: {
			x: viewportCenterX - 50,
			y: viewportCenterY - 50,
		},
	};

	const childMoons = nodes.filter((n) => n.parentId === parentNode.id);
	const groupedMoons = groupMoonsByDimension(childMoons, centeredPlanet);
	const distributedMoons = distributeMoonsEvenly(childMoons, centeredPlanet);
	const ghostPositions = getGhostMoonPositions(centeredPlanet);
	const orbitalPaths = getOrbitalPaths(centeredPlanet);
	const hasAnyMoons = childMoons.length > 0;

	// ============================================================================
	// EFFECTS
	// ============================================================================
	useEffect(() => {
		let animationFrameId;
		const animate = () => {
			setOrbitTime((prev) => prev + 1);
			animationFrameId = requestAnimationFrame(animate);
		};
		animationFrameId = requestAnimationFrame(animate);
		return () => {
			if (animationFrameId) cancelAnimationFrame(animationFrameId);
		};
	}, []);

	useEffect(() => {
		async function loadUnlocked() {
			const unlocked = await getUnlockedDimensions();
			setUnlockedDimensions(unlocked);
		}
		loadUnlocked();
	}, []);

	useEffect(() => {
		const handleEscape = (e) => {
			if (e.key === "Escape") {
				if (editingMoon) {
					setEditingMoon(null);
					return;
				}
				if (creatingRelationship) {
					setCreatingRelationship(null);
					setRelationshipSourceMoon(null);
				}
			}
		};
		window.addEventListener("keydown", handleEscape);
		return () => window.removeEventListener("keydown", handleEscape);
	}, [creatingRelationship, editingMoon]);

	// ============================================================================
	// HELPERS
	// ============================================================================
	const showToast = (message, color = "#10B981") => {
		setToast({ message, color });
		setTimeout(() => setToast(null), 2500);
	};

	const availableGhostPositions = Object.fromEntries(
		Object.entries(ghostPositions).filter(([dimension]) =>
			unlockedDimensions.includes(dimension),
		),
	);

	// ============================================================================
	// HANDLERS
	// ============================================================================
	const handleGhostClick = (dimension) => {
		if (creatingRelationship) {
			showToast(
				"Finish creating the relationship first · ESC to cancel",
				"#EF4444",
			);
			return;
		}
		setSelectedDimension(dimension);
		setShowInputCard(true);
	};

	const handleAggregateMoonClick = (dimension) => {
		if (expandedDimension === dimension) {
			setExpandedDimension(null);
		} else {
			setExpandedDimension(dimension);
		}
	};

	const handleMoonAction = async (action, moon) => {
		switch (action) {
			case "edit":
				setEditingMoon(moon);
				setEditText(moon.text);
				setEditLenses(moon.lensesUsed || []);
				break;

			case "anchor":
				await db.nodes.update(moon.id, { isLocked: !moon.isLocked });
				await onNodesUpdate();
				showToast(
					moon.isLocked
						? "Moon unanchored — free to orbit"
						: "Moon anchored in place ⚓",
					"#4D9FFF",
				);
				break;

			case "uncertain":
				const newConfidence =
					moon.confidence === "wobbly" ? "stable" : "wobbly";
				await db.nodes.update(moon.id, { confidence: newConfidence });
				await onNodesUpdate();
				showToast(
					newConfidence === "wobbly"
						? "Marked as uncertain 〰️"
						: "Confidence restored ✨",
					"#FBBF24",
				);
				break;

			case "tension":
				setCreatingRelationship("tension");
				setRelationshipSourceMoon(moon);
				setExpandedDimension(null);
				break;

			case "support":
				setCreatingRelationship("support");
				setRelationshipSourceMoon(moon);
				setExpandedDimension(null);
				break;

			case "delete":
				if (
					window.confirm(
						`Release this ${moon.dimension} reflection into the void?`,
					)
				) {
					await db.nodes.delete(moon.id);
					await onNodesUpdate();
					showToast("Reflection released 🌌", "#94A3B8");
				}
				break;
		}
	};

	const handleSaveEdit = async () => {
		if (!editText.trim()) return;
		await db.nodes.update(editingMoon.id, {
			text: editText.trim(),
			lensesUsed: editLenses,
		});
		await onNodesUpdate();
		showToast("Reflection refined ✨", "#6C63FF");
		setEditingMoon(null);
	};

	const toggleEditLens = (lensId) => {
		setEditLenses((prev) =>
			prev.includes(lensId)
				? prev.filter((id) => id !== lensId)
				: [...prev, lensId],
		);
	};

	const createRelationship = async (sourceMoon, targetMoon, type) => {
		if (sourceMoon.id === targetMoon.id) {
			showToast("A moon can't relate to itself!", "#EF4444");
			return;
		}

		const sourceRels = sourceMoon.relationships || [];
		const existingRel = sourceRels.find(
			(r) => r.targetMoonId === targetMoon.id,
		);
		if (existingRel) {
			showToast(
				`A ${existingRel.type} relationship already exists here`,
				"#EF4444",
			);
			return;
		}

		const newSourceRels = [
			...sourceRels,
			{
				targetMoonId: targetMoon.id,
				type,
				intensity: type === "tension" ? 2 : undefined,
			},
		];
		const targetRels = targetMoon.relationships || [];
		const newTargetRels = [
			...targetRels,
			{
				targetMoonId: sourceMoon.id,
				type,
				intensity: type === "tension" ? 2 : undefined,
			},
		];

		if (type === "tension") {
			await db.nodes.update(sourceMoon.id, {
				relationships: newSourceRels,
				isLocked: true,
			});
			await db.nodes.update(targetMoon.id, {
				relationships: newTargetRels,
				isLocked: true,
			});
		} else {
			await db.nodes.update(sourceMoon.id, { relationships: newSourceRels });
			await db.nodes.update(targetMoon.id, { relationships: newTargetRels });
		}

		await onNodesUpdate();
		showToast(
			type === "tension"
				? "☄️ Conflict mapped between moons"
				: "🌊 Resonance mapped between moons",
			type === "tension" ? "#F97316" : "#10B981",
		);
	};

	const handleSaveReflection = async (reflectionData) => {
		const previousCount = await getTotalReflectionCount();

		const newMoon = {
			type: "R",
			parentId: parentNode.id,
			dimension: selectedDimension,
			text: reflectionData.text,
			lensesUsed: reflectionData.lensesUsed || [],
			orbitAngle: 0,
			confidence: "stable",
			intensity: "medium",
			temporality: "concurrent",
			versions: [],
			relationships: [],
		};

		await db.nodes.add(newMoon);

		const newCount = await getTotalReflectionCount();
		const unlocks = await checkDimensionUnlock(previousCount, newCount);
		if (unlocks.length > 0) {
			setUnlockNotification(unlocks[0]);
			const newUnlocked = await getUnlockedDimensions();
			setUnlockedDimensions(newUnlocked);
		}

		await onNodesUpdate();
		setShowInputCard(false);
		setSelectedDimension(null);
	};

	// ============================================================================
	// RENDER HELPERS
	// ============================================================================
	const dimColor = expandedDimension
		? moonConfig.dimension[expandedDimension].color
		: "#6C63FF";

	const renderActionButtons = (moon) => (
		<div
			className="moon-actions"
			style={{
				paddingTop: "10px",
				borderTop: "1px solid rgba(255,255,255,0.08)",
				opacity: 0,
				transition: "opacity 0.2s ease",
			}}>
			{/* Row 1 */}
			<div style={{ display: "flex", gap: "4px", marginBottom: "4px" }}>
				{ACTION_BUTTONS.slice(0, 3).map((btn) => {
					const isActive = btn.activeCheck(moon);
					return (
						<button
							key={btn.action}
							onClick={(e) => {
								e.stopPropagation();
								handleMoonAction(btn.action, moon);
							}}
							title={btn.sublabel}
							style={{
								flex: 1,
								padding: "7px 4px 5px",
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
								gap: "3px",
								background: isActive
									? `${btn.hoverColor}25`
									: "rgba(255,255,255,0.04)",
								border: `1px solid ${isActive ? btn.hoverColor : "rgba(255,255,255,0.08)"}`,
								borderRadius: "6px",
								cursor: "pointer",
								transition: "all 0.15s ease",
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.background = `${btn.hoverColor}20`;
								e.currentTarget.style.borderColor = btn.hoverColor;
								e.currentTarget.querySelector(".btn-label").style.color =
									btn.hoverColor;
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.background = isActive
									? `${btn.hoverColor}25`
									: "rgba(255,255,255,0.04)";
								e.currentTarget.style.borderColor = isActive
									? btn.hoverColor
									: "rgba(255,255,255,0.08)";
								e.currentTarget.querySelector(".btn-label").style.color =
									isActive ? btn.hoverColor : "#64748B";
							}}>
							<span style={{ fontSize: "14px", lineHeight: 1 }}>
								{btn.emoji}
							</span>
							<span
								className="btn-label"
								style={{
									fontSize: "8px",
									fontWeight: 600,
									color: isActive ? btn.hoverColor : "#64748B",
									whiteSpace: "nowrap",
									letterSpacing: "0.02em",
									transition: "color 0.15s",
								}}>
								{btn.label}
							</span>
						</button>
					);
				})}
			</div>
			{/* Row 2 */}
			<div style={{ display: "flex", gap: "4px" }}>
				{ACTION_BUTTONS.slice(3, 6).map((btn) => {
					const isActive = btn.activeCheck(moon);
					return (
						<button
							key={btn.action}
							onClick={(e) => {
								e.stopPropagation();
								handleMoonAction(btn.action, moon);
							}}
							title={btn.sublabel}
							style={{
								flex: 1,
								padding: "7px 4px 5px",
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
								gap: "3px",
								background: isActive
									? `${btn.hoverColor}25`
									: "rgba(255,255,255,0.04)",
								border: `1px solid ${isActive ? btn.hoverColor : "rgba(255,255,255,0.08)"}`,
								borderRadius: "6px",
								cursor: "pointer",
								transition: "all 0.15s ease",
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.background = `${btn.hoverColor}20`;
								e.currentTarget.style.borderColor = btn.hoverColor;
								e.currentTarget.querySelector(".btn-label").style.color =
									btn.hoverColor;
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.background = isActive
									? `${btn.hoverColor}25`
									: "rgba(255,255,255,0.04)";
								e.currentTarget.style.borderColor = isActive
									? btn.hoverColor
									: "rgba(255,255,255,0.08)";
								e.currentTarget.querySelector(".btn-label").style.color =
									isActive ? btn.hoverColor : "#64748B";
							}}>
							<span style={{ fontSize: "14px", lineHeight: 1 }}>
								{btn.emoji}
							</span>
							<span
								className="btn-label"
								style={{
									fontSize: "8px",
									fontWeight: 600,
									color: isActive ? btn.hoverColor : "#64748B",
									whiteSpace: "nowrap",
									letterSpacing: "0.02em",
									transition: "color 0.15s",
								}}>
								{btn.label}
							</span>
						</button>
					);
				})}
			</div>
		</div>
	);

	// ============================================================================
	// RENDER
	// ============================================================================
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
			{/* ================================================================ */}
			{/* TOP BAR */}
			{/* ================================================================ */}
			<div
				style={{
					padding: "20px 30px",
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					background: "rgba(30, 41, 59, 0.9)",
					backdropFilter: "blur(10px)",
					borderBottom: "1px solid rgba(108, 99, 255, 0.2)",
				}}>
				<button
					onClick={onSwitchToObservation}
					style={{
						padding: "10px 16px",
						background: "rgba(108, 99, 255, 0.2)",
						border: "1px solid rgba(108, 99, 255, 0.4)",
						borderRadius: "8px",
						color: "#6C63FF",
						cursor: "pointer",
						fontSize: "14px",
						fontWeight: 600,
						display: "flex",
						alignItems: "center",
						gap: "8px",
						transition: "all 0.2s",
					}}
					onMouseEnter={(e) => {
						e.currentTarget.style.background = "#6C63FF";
						e.currentTarget.style.color = "#fff";
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.background = "rgba(108, 99, 255, 0.2)";
						e.currentTarget.style.color = "#6C63FF";
					}}>
					<ArrowLeft size={16} /> Edit Observation
				</button>
				<div style={{ fontSize: "18px", fontWeight: 600, color: "#E6EEF8" }}>
					{parentNode.text?.substring(0, 40) || "Untitled"}
					{parentNode.text?.length > 40 ? "..." : ""}
				</div>
				<div style={{ width: "140px" }} />
			</div>

			{/* ================================================================ */}
			{/* MAIN CONTENT */}
			{/* ================================================================ */}
			<div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
				{/* Instructions pill */}
				{!showInputCard && !expandedDimension && (
					<div
						style={{
							position: "absolute",
							top: "30px",
							left: "50%",
							transform: "translateX(-50%)",
							padding: "10px 20px",
							background: "rgba(30, 41, 59, 0.95)",
							border: "1px solid rgba(108, 99, 255, 0.3)",
							borderRadius: "10px",
							color: "#CBD5E1",
							fontSize: "13px",
							fontWeight: 500,
							boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
							zIndex: 10,
							whiteSpace: "nowrap",
						}}>
						{hasAnyMoons
							? "Click a moon to view or add reflections"
							: "Click a glowing orbit ring to add your first reflection"}
					</div>
				)}

				{/* Toast notification */}
				{toast && (
					<div
						style={{
							position: "absolute",
							bottom: "80px",
							left: "50%",
							transform: "translateX(-50%)",
							padding: "10px 20px",
							background: "rgba(15, 23, 36, 0.97)",
							border: `1px solid ${toast.color}`,
							borderRadius: "8px",
							color: toast.color,
							fontSize: "13px",
							fontWeight: 600,
							zIndex: 200,
							whiteSpace: "nowrap",
							boxShadow: `0 4px 20px ${toast.color}30`,
							animation: "fadeInUp 0.2s ease",
						}}>
						{toast.message}
					</div>
				)}

				{/* ============================================================ */}
				{/* SVG CANVAS */}
				{/* ============================================================ */}
				<svg
					style={{
						position: "absolute",
						left: 0,
						top: 0,
						width: "100%",
						height: "100%",
						pointerEvents: "none",
					}}>
					<g style={{ pointerEvents: "auto" }}>
						{/* Orbital paths */}
						{orbitalPaths
							.filter((path) => unlockedDimensions.includes(path.dimension))
							.map((path) => (
								<circle
									key={path.dimension}
									cx={path.centerX}
									cy={path.centerY}
									r={path.radius}
									fill="none"
									stroke={path.color}
									strokeWidth={1.5}
									strokeOpacity={0.35}
									strokeDasharray="4,8"
								/>
							))}

						{/* Relationship lines */}
						{!showInputCard &&
							childMoons.map((moon) => {
								if (!moon.relationships || moon.relationships.length === 0)
									return null;

								return moon.relationships.map((rel) => {
									const targetMoon = childMoons.find(
										(m) => m.id === rel.targetMoonId,
									);
									if (!targetMoon) return null;

									const sourceMoonData = distributedMoons.find(
										(m) => m.id === moon.id,
									);
									const targetMoonData = distributedMoons.find(
										(m) => m.id === targetMoon.id,
									);
									if (!sourceMoonData || !targetMoonData) return null;

									const sourcePos = calculateAnimatedOrbit(
										sourceMoonData,
										centeredPlanet,
										orbitTime,
										false,
										moon.dimension,
									);
									const targetPos = calculateAnimatedOrbit(
										targetMoonData,
										centeredPlanet,
										orbitTime,
										false,
										targetMoon.dimension,
									);
									const lineId = `${moon.id}-${targetMoon.id}`;

									if (rel.type === "support") {
										return (
											<SupportLine
												key={lineId}
												moonA={moon}
												moonB={targetMoon}
												posA={sourcePos}
												posB={targetPos}
												isHovered={hoveredRelationshipId === lineId}
												onClick={() => {
													if (
														window.confirm(
															"Remove this resonance relationship?",
														)
													) {
														const newSourceRels = moon.relationships.filter(
															(r) => r.targetMoonId !== targetMoon.id,
														);
														const newTargetRels =
															targetMoon.relationships.filter(
																(r) => r.targetMoonId !== moon.id,
															);
														db.nodes.update(moon.id, {
															relationships: newSourceRels,
														});
														db.nodes.update(targetMoon.id, {
															relationships: newTargetRels,
														});
														onNodesUpdate();
													}
												}}
											/>
										);
									} else if (rel.type === "tension") {
										return (
											<TensionLine
												key={lineId}
												moonA={moon}
												moonB={targetMoon}
												posA={sourcePos}
												posB={targetPos}
												intensity={rel.intensity || 2}
												isHovered={hoveredRelationshipId === lineId}
												onClick={() => {
													if (
														window.confirm(
															"Remove this conflict relationship? Both moons will be unanchored.",
														)
													) {
														const newSourceRels = moon.relationships.filter(
															(r) => r.targetMoonId !== targetMoon.id,
														);
														const newTargetRels =
															targetMoon.relationships.filter(
																(r) => r.targetMoonId !== moon.id,
															);
														db.nodes.update(moon.id, {
															relationships: newSourceRels,
															isLocked: false,
														});
														db.nodes.update(targetMoon.id, {
															relationships: newTargetRels,
															isLocked: false,
														});
														onNodesUpdate();
													}
												}}
											/>
										);
									}
									return null;
								});
							})}

						{/* Source moon glow ring during relationship creation */}
						{creatingRelationship &&
							relationshipSourceMoon &&
							(() => {
								const sourceMoonData = distributedMoons.find(
									(m) => m.id === relationshipSourceMoon.id,
								);
								if (!sourceMoonData) return null;
								const sourcePos = calculateAnimatedOrbit(
									sourceMoonData,
									centeredPlanet,
									orbitTime,
									false,
									relationshipSourceMoon.dimension,
								);
								const dimCfg =
									moonConfig.dimension[relationshipSourceMoon.dimension];
								const pulseColor =
									creatingRelationship === "tension" ? "#F97316" : "#10B981";
								return (
									<g key="source-glow">
										<circle
											cx={sourcePos.x}
											cy={sourcePos.y}
											r={dimCfg.radius + 10}
											fill="none"
											stroke={pulseColor}
											strokeWidth={2.5}>
											<animate
												attributeName="r"
												values={`${dimCfg.radius + 6};${dimCfg.radius + 16};${dimCfg.radius + 6}`}
												dur="1.5s"
												repeatCount="indefinite"
											/>
											<animate
												attributeName="opacity"
												values="0.5;1;0.5"
												dur="1.5s"
												repeatCount="indefinite"
											/>
										</circle>
										<circle
											cx={sourcePos.x}
											cy={sourcePos.y}
											r={dimCfg.radius + 4}
											fill={`${pulseColor}15`}
										/>
									</g>
								);
							})()}

						{/* Central Planet */}
						<Planet
							node={centeredPlanet}
							moons={childMoons}
							isHovered={false}
							isSelected={false}
							isFocused={true}
						/>

						{/* Ghost / Aggregate moons */}
						{!showInputCard &&
							Object.entries(availableGhostPositions).map(
								([dimension, position]) => {
									const existingGroup = groupedMoons[dimension];
									const hasExisting = existingGroup && existingGroup.count > 0;

									if (hasExisting && !expandedDimension) {
										const aggregateNode = {
											id: `${parentNode.id}-${dimension}`,
											type: "R",
											dimension,
											text: `${existingGroup.count} ${dimension} reflection${existingGroup.count > 1 ? "s" : ""}`,
											position,
										};
										return (
											<Moon
												key={dimension}
												node={aggregateNode}
												position={position}
												count={existingGroup.count}
												isHovered={hoveredDimension === dimension}
												onClick={() => handleAggregateMoonClick(dimension)}
												onMouseEnter={() => setHoveredDimension(dimension)}
												onMouseLeave={() => setHoveredDimension(null)}
											/>
										);
									}

									if (
										!hasExisting ||
										(expandedDimension && expandedDimension !== dimension)
									) {
										const ghostNode = {
											id: `ghost-${dimension}`,
											type: "R",
											dimension,
											text: dimension,
										};
										return (
											<Moon
												key={dimension}
												node={ghostNode}
												position={position}
												isGhost={true}
												ghostLabel={`Add ${moonConfig.dimension[dimension].name}`}
												isHovered={hoveredDimension === dimension}
												onClick={() => handleGhostClick(dimension)}
												onMouseEnter={() => setHoveredDimension(dimension)}
												onMouseLeave={() => setHoveredDimension(null)}
											/>
										);
									}

									return null;
								},
							)}
					</g>
				</svg>

				{/* ============================================================ */}
				{/* RELATIONSHIP CREATION OVERLAY */}
				{/* ============================================================ */}
				{creatingRelationship && (
					<div
						style={{
							position: "absolute",
							top: "20px",
							left: "50%",
							transform: "translateX(-50%)",
							padding: "14px 24px",
							background: "rgba(15, 23, 36, 0.97)",
							border: `2px solid ${creatingRelationship === "tension" ? "#F97316" : "#10B981"}`,
							borderRadius: "12px",
							color: "#E6EEF8",
							fontSize: "14px",
							fontWeight: 600,
							boxShadow: `0 4px 24px ${creatingRelationship === "tension" ? "#F9731630" : "#10B98130"}`,
							zIndex: 100,
							textAlign: "center",
							maxWidth: "420px",
						}}>
						<div style={{ marginBottom: "4px" }}>
							{creatingRelationship === "tension" ? "☄️" : "🌊"}{" "}
							{creatingRelationship === "tension"
								? "Which reflection conflicts with"
								: "Which reflection resonates with"}{" "}
							<em
								style={{
									color:
										creatingRelationship === "tension" ? "#F97316" : "#10B981",
								}}>
								"{relationshipSourceMoon?.text?.substring(0, 35)}
								{relationshipSourceMoon?.text?.length > 35 ? "..." : ""}"
							</em>
							?
						</div>
						<div
							style={{ fontSize: "11px", fontWeight: 400, color: "#64748B" }}>
							Click another moon or open a dimension · ESC to cancel
						</div>
					</div>
				)}

				{/* ============================================================ */}
				{/* EXPANDED MOONS PANEL */}
				{/* ============================================================ */}
				{expandedDimension && groupedMoons[expandedDimension] && (
					<div
						style={{
							position: "absolute",
							top: "50%",
							left: "50%",
							transform: "translate(-50%, -50%)",
							background: "rgba(15, 23, 36, 0.97)",
							border: `2px solid ${moonConfig.dimension[expandedDimension].color}`,
							borderRadius: "16px",
							padding: "24px",
							minWidth: "320px",
							maxWidth: "420px",
							maxHeight: "65vh",
							overflowY: "auto",
							boxShadow: `0 16px 60px rgba(0, 0, 0, 0.6), 0 0 40px ${moonConfig.dimension[expandedDimension].color}15`,
							zIndex: 20,
						}}>
						{/* Panel header */}
						<div
							style={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								marginBottom: "16px",
								paddingBottom: "12px",
								borderBottom: `1px solid ${moonConfig.dimension[expandedDimension].color}30`,
							}}>
							<div>
								<h3
									style={{
										margin: 0,
										fontSize: "15px",
										fontWeight: 700,
										color: moonConfig.dimension[expandedDimension].color,
									}}>
									{creatingRelationship
										? creatingRelationship === "tension"
											? "☄️ Select the conflicting moon"
											: "🌊 Select the resonating moon"
										: `${moonConfig.dimension[expandedDimension].name} Reflections`}
								</h3>
								{creatingRelationship && (
									<p
										style={{
											margin: "4px 0 0 0",
											fontSize: "11px",
											color: "#64748B",
										}}>
										Click a reflection below to create the link
									</p>
								)}
							</div>
							<button
								onClick={() => setExpandedDimension(null)}
								style={{
									background: "transparent",
									border: "none",
									color: "#64748B",
									cursor: "pointer",
									fontSize: "22px",
									padding: "0 4px",
									lineHeight: 1,
									transition: "color 0.2s",
								}}
								onMouseEnter={(e) => (e.target.style.color = "#E6EEF8")}
								onMouseLeave={(e) => (e.target.style.color = "#64748B")}>
								×
							</button>
						</div>

						{/* Moon cards */}
						<div
							style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
							{groupedMoons[expandedDimension].moons.map((moon) => (
								<div
									key={moon.id}
									onClick={() => {
										if (creatingRelationship && relationshipSourceMoon) {
											createRelationship(
												relationshipSourceMoon,
												moon,
												creatingRelationship,
											);
											setCreatingRelationship(null);
											setRelationshipSourceMoon(null);
											setExpandedDimension(null);
										}
									}}
									style={{
										padding: "12px",
										background: "rgba(30, 41, 59, 0.5)",
										border: `1px solid ${moonConfig.dimension[expandedDimension].color}25`,
										borderRadius: "10px",
										transition: "all 0.2s",
										position: "relative",
										cursor: creatingRelationship ? "pointer" : "default",
									}}
									onMouseEnter={(e) => {
										e.currentTarget.style.background = `${moonConfig.dimension[expandedDimension].color}18`;
										e.currentTarget.style.borderColor = `${moonConfig.dimension[expandedDimension].color}70`;
										if (!creatingRelationship) {
											const actionBar =
												e.currentTarget.querySelector(".moon-actions");
											if (actionBar) actionBar.style.opacity = "1";
										}
									}}
									onMouseLeave={(e) => {
										e.currentTarget.style.background = "rgba(30, 41, 59, 0.5)";
										e.currentTarget.style.borderColor = `${moonConfig.dimension[expandedDimension].color}25`;
										const actionBar =
											e.currentTarget.querySelector(".moon-actions");
										if (actionBar) actionBar.style.opacity = "0";
									}}>
									{/* Relationship target indicator */}
									{creatingRelationship && (
										<div
											style={{
												position: "absolute",
												top: "8px",
												right: "8px",
												fontSize: "12px",
												color:
													creatingRelationship === "tension"
														? "#F97316"
														: "#10B981",
												opacity: 0.7,
											}}>
											{creatingRelationship === "tension" ? "☄️" : "🌊"}
										</div>
									)}

									{/* Status badges */}
									<div
										style={{
											display: "flex",
											gap: "6px",
											marginBottom: "6px",
											flexWrap: "wrap",
										}}>
										{moon.isLocked && (
											<span
												style={{
													fontSize: "10px",
													padding: "2px 6px",
													background: "#4D9FFF20",
													border: "1px solid #4D9FFF50",
													borderRadius: "4px",
													color: "#4D9FFF",
												}}>
												⚓ Anchored
											</span>
										)}
										{moon.confidence === "wobbly" && (
											<span
												style={{
													fontSize: "10px",
													padding: "2px 6px",
													background: "#FBBF2420",
													border: "1px solid #FBBF2450",
													borderRadius: "4px",
													color: "#FBBF24",
												}}>
												〰️ Uncertain
											</span>
										)}
										{moon.relationships?.length > 0 && (
											<span
												style={{
													fontSize: "10px",
													padding: "2px 6px",
													background: "#6C63FF20",
													border: "1px solid #6C63FF50",
													borderRadius: "4px",
													color: "#A78BFA",
												}}>
												{moon.relationships.length} link
												{moon.relationships.length > 1 ? "s" : ""}
											</span>
										)}
									</div>

									{/* Moon text */}
									<div
										style={{
											fontSize: "13px",
											color: "#E6EEF8",
											lineHeight: "1.5",
											marginBottom: "6px",
										}}>
										{moon.text}
									</div>

									{/* Lenses */}
									{moon.lensesUsed && moon.lensesUsed.length > 0 && (
										<div
											style={{
												display: "flex",
												gap: "4px",
												flexWrap: "wrap",
												marginBottom: "8px",
											}}>
											{moon.lensesUsed.map((lens) => {
												const lensData = lenses.find((l) => l.id === lens);
												return (
													<span
														key={lens}
														style={{
															padding: "2px 7px",
															background: `${moonConfig.dimension[expandedDimension].color}20`,
															borderRadius: "4px",
															fontSize: "10px",
															color:
																moonConfig.dimension[expandedDimension].color,
															textTransform: "capitalize",
														}}>
														{lensData?.emoji} {lens}
													</span>
												);
											})}
										</div>
									)}

									{/* Hover-reveal action buttons — hidden during relationship creation */}
									{!creatingRelationship && renderActionButtons(moon)}
								</div>
							))}

							{/* Add new reflection button */}
							{!creatingRelationship && (
								<button
									onClick={() => handleGhostClick(expandedDimension)}
									style={{
										padding: "12px",
										background: "transparent",
										border: `2px dashed ${moonConfig.dimension[expandedDimension].color}35`,
										borderRadius: "10px",
										color: moonConfig.dimension[expandedDimension].color,
										cursor: "pointer",
										fontSize: "13px",
										fontWeight: 600,
										transition: "all 0.2s",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										gap: "8px",
									}}
									onMouseEnter={(e) => {
										e.currentTarget.style.borderColor =
											moonConfig.dimension[expandedDimension].color;
										e.currentTarget.style.background = `${moonConfig.dimension[expandedDimension].color}10`;
									}}
									onMouseLeave={(e) => {
										e.currentTarget.style.borderColor = `${moonConfig.dimension[expandedDimension].color}35`;
										e.currentTarget.style.background = "transparent";
									}}>
									✦ Add New {moonConfig.dimension[expandedDimension].name}{" "}
									Reflection
								</button>
							)}
						</div>
					</div>
				)}

				{/* ============================================================ */}
				{/* EDIT MODAL */}
				{/* ============================================================ */}
				{editingMoon && (
					<>
						{/* Backdrop */}
						<div
							onClick={() => setEditingMoon(null)}
							style={{
								position: "absolute",
								inset: 0,
								background: "rgba(0,0,0,0.5)",
								backdropFilter: "blur(4px)",
								zIndex: 30,
							}}
						/>
						{/* Modal */}
						<div
							style={{
								position: "absolute",
								top: "50%",
								left: "50%",
								transform: "translate(-50%, -50%)",
								width: "460px",
								maxWidth: "90vw",
								background:
									"linear-gradient(135deg, rgba(30, 41, 59, 0.99) 0%, rgba(15, 23, 36, 0.99) 100%)",
								border: `2px solid ${moonConfig.dimension[editingMoon.dimension].color}`,
								borderRadius: "16px",
								padding: "28px",
								boxShadow: `0 24px 80px rgba(0,0,0,0.7), 0 0 40px ${moonConfig.dimension[editingMoon.dimension].color}20`,
								zIndex: 31,
							}}>
							{/* Modal header */}
							<div style={{ marginBottom: "20px" }}>
								<div
									style={{
										display: "flex",
										alignItems: "center",
										gap: "10px",
										marginBottom: "6px",
									}}>
									<span style={{ fontSize: "20px" }}>🔭</span>
									<h3
										style={{
											margin: 0,
											fontSize: "17px",
											fontWeight: 700,
											color: "#E6EEF8",
										}}>
										Refine Reflection
									</h3>
								</div>
								<p style={{ margin: 0, fontSize: "12px", color: "#64748B" }}>
									{moonConfig.dimension[editingMoon.dimension].name} ·{" "}
									{moonConfig.dimension[editingMoon.dimension].description}
								</p>
							</div>

							{/* Text editor */}
							<div style={{ marginBottom: "20px" }}>
								<label
									style={{
										display: "block",
										fontSize: "12px",
										fontWeight: 600,
										color: "#94A3B8",
										marginBottom: "8px",
										textTransform: "uppercase",
										letterSpacing: "0.5px",
									}}>
									Reflection
								</label>
								<textarea
									value={editText}
									onChange={(e) => setEditText(e.target.value)}
									autoFocus
									rows={4}
									style={{
										width: "100%",
										padding: "12px",
										background: "rgba(15, 23, 36, 0.8)",
										border: `1px solid ${moonConfig.dimension[editingMoon.dimension].color}40`,
										borderRadius: "8px",
										color: "#E6EEF8",
										fontSize: "14px",
										fontFamily: "inherit",
										resize: "vertical",
										outline: "none",
										lineHeight: "1.5",
										boxSizing: "border-box",
									}}
									onFocus={(e) => {
										e.target.style.borderColor =
											moonConfig.dimension[editingMoon.dimension].color;
										e.target.style.boxShadow = `0 0 0 2px ${moonConfig.dimension[editingMoon.dimension].color}20`;
									}}
									onBlur={(e) => {
										e.target.style.borderColor = `${moonConfig.dimension[editingMoon.dimension].color}40`;
										e.target.style.boxShadow = "none";
									}}
								/>
							</div>

							{/* Lenses */}
							<div style={{ marginBottom: "24px" }}>
								<label
									style={{
										display: "block",
										fontSize: "12px",
										fontWeight: 600,
										color: "#94A3B8",
										marginBottom: "10px",
										textTransform: "uppercase",
										letterSpacing: "0.5px",
									}}>
									Interpretive Lenses
								</label>
								<div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
									{lenses.map((lens) => (
										<button
											key={lens.id}
											onClick={() => toggleEditLens(lens.id)}
											style={{
												padding: "6px 12px",
												background: editLenses.includes(lens.id)
													? lens.color
													: "rgba(30, 41, 59, 0.6)",
												border: `1px solid ${editLenses.includes(lens.id) ? lens.color : "rgba(148, 163, 184, 0.2)"}`,
												borderRadius: "6px",
												color: editLenses.includes(lens.id)
													? "#fff"
													: "#94A3B8",
												cursor: "pointer",
												fontSize: "12px",
												fontWeight: 500,
												transition: "all 0.15s",
												display: "flex",
												alignItems: "center",
												gap: "5px",
											}}>
											<span>{lens.emoji}</span>
											<span>{lens.label}</span>
										</button>
									))}
								</div>
							</div>

							{/* Modal actions */}
							<div style={{ display: "flex", gap: "10px" }}>
								<button
									onClick={() => setEditingMoon(null)}
									style={{
										flex: 1,
										padding: "11px",
										background: "transparent",
										border: "1px solid rgba(148, 163, 184, 0.2)",
										borderRadius: "8px",
										color: "#64748B",
										cursor: "pointer",
										fontSize: "13px",
										fontWeight: 500,
										transition: "all 0.2s",
									}}
									onMouseEnter={(e) => {
										e.target.style.borderColor = "#94A3B8";
										e.target.style.color = "#94A3B8";
									}}
									onMouseLeave={(e) => {
										e.target.style.borderColor = "rgba(148, 163, 184, 0.2)";
										e.target.style.color = "#64748B";
									}}>
									Cancel
								</button>
								<button
									onClick={handleSaveEdit}
									disabled={!editText.trim()}
									style={{
										flex: 2,
										padding: "11px",
										background: editText.trim()
											? `linear-gradient(135deg, ${moonConfig.dimension[editingMoon.dimension].color} 0%, ${moonConfig.dimension[editingMoon.dimension].color}CC 100%)`
											: "rgba(30, 41, 59, 0.6)",
										border: "none",
										borderRadius: "8px",
										color: "#fff",
										cursor: editText.trim() ? "pointer" : "not-allowed",
										fontSize: "13px",
										fontWeight: 600,
										opacity: editText.trim() ? 1 : 0.5,
										transition: "all 0.2s",
									}}>
									Save Refinement ✨
								</button>
							</div>

							<p
								style={{
									margin: "10px 0 0 0",
									fontSize: "11px",
									color: "#64748B",
									textAlign: "center",
								}}>
								ESC to cancel
							</p>
						</div>
					</>
				)}

				{/* Input Card */}
				{showInputCard && selectedDimension && (
					<MoonInputCard
						dimension={selectedDimension}
						onSave={handleSaveReflection}
						onCancel={() => {
							setShowInputCard(false);
							setSelectedDimension(null);
						}}
					/>
				)}

				{/* Unlock Notification */}
				{unlockNotification && (
					<DimensionUnlockNotification
						dimension={unlockNotification.dimension}
						onDismiss={() => setUnlockNotification(null)}
					/>
				)}
			</div>

			{/* ================================================================ */}
			{/* BOTTOM BAR */}
			{/* ================================================================ */}
			<div
				style={{
					padding: "14px 30px",
					background: "rgba(30, 41, 59, 0.9)",
					backdropFilter: "blur(10px)",
					borderTop: "1px solid rgba(108, 99, 255, 0.2)",
					display: "flex",
					alignItems: "center",
					gap: "12px",
				}}>
				<div
					style={{
						fontSize: "11px",
						color: "#64748B",
						fontWeight: 600,
						textTransform: "uppercase",
						letterSpacing: "0.5px",
						whiteSpace: "nowrap",
					}}>
					Observation
				</div>
				<div
					style={{ fontSize: "14px", color: "#94A3B8", fontStyle: "italic" }}>
					{parentNode.text?.substring(0, 100) || "No description"}
					{parentNode.text?.length > 100 ? "..." : ""}
				</div>
			</div>

			{/* Animations */}
			<style>{`
				@keyframes fadeInUp {
					from { opacity: 0; transform: translateX(-50%) translateY(8px); }
					to { opacity: 1; transform: translateX(-50%) translateY(0); }
				}
			`}</style>
		</div>
	);
}
