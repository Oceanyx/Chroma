// src/components/ReflectionSpace.jsx - V5.2
// Fixes: window resize now re-centres the planet correctly (useWindowSize hook)
import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import Planet from "./Planet";
import Moon from "./Moon";
import MoonInputCard from "./MoonInputCard";
import MoonSidePanel from "./MoonSidePanel";
import DimensionUnlockNotification from "./DimensionUnlockNotification";
import SupportLine from "./SupportLine";
import TensionLine from "./TensionLine";
import EchoLine from "./EchoLine";
import MoonComparisonView from "./MoonComparisonView";
import UnfiledMoonsList from "./UnfiledMoonsList";
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
	getSetting,
} from "../lib/db";

// ── Constants ────────────────────────────────────────────────────────────────
const TOP_BAR_HEIGHT = 60;
const BOTTOM_BAR_HEIGHT = 44;
const ORBIT_SCALE = 0.62;
const MIN_ZOOM = 0.35;
const MAX_ZOOM = 1.6;
// Space to leave beyond the outermost ring for the "+" buttons and moon
// glow that sit just past it, and for a bit of breathing room.
const RING_PADDING = 70;

const DIMENSION_START_ANGLES = {
	subjective: Math.PI * 1.5,
	behavioral: 0,
	intersubjective: Math.PI * 0.5,
	framing: Math.PI,
};

// ── useWindowSize ─────────────────────────────────────────────────────────────
// Re-renders any consumer when the browser window is resized.
function useWindowSize() {
	const [size, setSize] = useState({
		width: window.innerWidth,
		height: window.innerHeight,
	});

	useEffect(() => {
		const handleResize = () =>
			setSize({ width: window.innerWidth, height: window.innerHeight });

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	return size;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function getMoonPosition(moon, parent, orbitTime, speedMultiplier = 1) {
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
		speedMultiplier,
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
	const { width: windowWidth, height: windowHeight } = useWindowSize();

	const [selectedMoonId, setSelectedMoonId] = useState(null);
	// { moonAId, moonBId, relType } | null — drives MoonComparisonView.
	// Holding ids rather than the moon objects so the view always reflects
	// live data even if a moon is edited while the comparison is open.
	const [comparisonRel, setComparisonRel] = useState(null);
	const [creatingRelationship, setCreatingRelationship] = useState(null);
	const [relationshipSourceMoon, setRelationshipSourceMoon] = useState(null);
	const [hoveredMoonId, setHoveredMoonId] = useState(null);
	const [hoveredRingDimension, setHoveredRingDimension] = useState(null);
	const [showInputCard, setShowInputCard] = useState(false);
	const [addingDimension, setAddingDimension] = useState(null);
	// True when writing via the unfiled-reflections list rather than clicking
	// a dimension ring — the moon gets created with dimension: null.
	const [addingUnsorted, setAddingUnsorted] = useState(false);
	const [unlockNotification, setUnlockNotification] = useState(null);
	const [unlockedDimensions, setUnlockedDimensions] = useState([]);
	const [orbitTime, setOrbitTime] = useState(0);
	const lastTimestampRef = useRef(null);
	const [toast, setToast] = useState(null);
	const [orbitSpeedMultiplier, setOrbitSpeedMultiplier] = useState(1);

	useEffect(() => {
		getSetting("orbitSpeedMultiplier").then((v) => {
			if (v) setOrbitSpeedMultiplier(v);
		});
	}, []);

	// ── Centering — reacts to windowWidth/windowHeight only. Previously also
	// shifted left when the moon panel opened to "make room" for it; now
	// that the panel overlays instead of pushing, the view no longer needs
	// to move when it opens.
	const panelOpen = selectedMoonId !== null;
	const viewportCenterX = windowWidth / 2;
	const viewportCenterY =
		(windowHeight - TOP_BAR_HEIGHT - BOTTOM_BAR_HEIGHT) / 2;

	// ── Zoom — Reflection Space is always centered (see comment above), so
	// unlike the main canvas there's no panning to do, just scale. Defaults
	// to whatever fits the outermost *unlocked* ring in the available space;
	// switches to a user-controlled fixed value once they zoom manually.
	const [userZoom, setUserZoom] = useState(null); // null = auto-fit
	const outermostUnlockedRadius =
		unlockedDimensions.length > 0
			? Math.max(
					...unlockedDimensions.map(
						(d) => moonConfig.dimension[d].orbitRadius * ORBIT_SCALE,
					),
				)
			: moonConfig.dimension.subjective.orbitRadius * ORBIT_SCALE;
	const availableRadius =
		Math.min(viewportCenterX, viewportCenterY) - RING_PADDING;
	const autoFitZoom = Math.min(
		MAX_ZOOM,
		Math.max(MIN_ZOOM, availableRadius / Math.max(outermostUnlockedRadius, 1)),
	);
	const zoom = userZoom ?? autoFitZoom;

	const handleZoom = (delta) => {
		setUserZoom(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom + delta)));
	};
	const handleResetZoom = () => setUserZoom(null);

	// Ctrl/Cmd + scroll to zoom, same gesture as the main canvas
	const reflectionSvgRef = useRef(null);
	useEffect(() => {
		const el = reflectionSvgRef.current;
		if (!el) return;
		const onWheel = (e) => {
			if (!(e.ctrlKey || e.metaKey)) return;
			e.preventDefault();
			const delta = e.deltaY > 0 ? -0.1 : 0.1;
			setUserZoom((prev) =>
				Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, (prev ?? autoFitZoom) + delta)),
			);
		};
		el.addEventListener("wheel", onWheel, { passive: false });
		return () => el.removeEventListener("wheel", onWheel);
	}, [autoFitZoom]);

	const centeredPlanet = {
		...parentNode,
		position: {
			x: viewportCenterX - planetConfig.baseRadius,
			y: viewportCenterY - planetConfig.baseRadius,
		},
	};

	const childMoons = nodes.filter((n) => n.parentId === parentNode.id);
	const unfiledMoons = childMoons.filter((m) => !m.dimension);
	const filedMoons = childMoons.filter((m) => m.dimension);
	const distributedMoons = distributeMoonsEvenly(filedMoons, centeredPlanet);
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
	const showToast = (message, color = "#10B981", duration = 2500) => {
		setToast({ message, color });
		setTimeout(() => setToast(null), duration);
	};

	// ── Ring click ─────────────────────────────────────────────────────────────
	const handleRingClick = (dimension) => {
		if (creatingRelationship || showInputCard) return;
		setAddingDimension(dimension);
		setShowInputCard(true);
	};

	const handleStartUnsorted = () => {
		if (creatingRelationship || showInputCard) return;
		setAddingUnsorted(true);
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

			case "claimType":
				await db.nodes.update(moon.id, { claimType: extra.claimType });
				await onNodesUpdate();
				showToast(
					extra.claimType === "reading"
						? "Marked as reading ◈"
						: "Marked as reporting ○",
					"#6366F1",
				);
				break;

			case "vantage":
				await db.nodes.update(moon.id, { vantage: extra.vantage });
				await onNodesUpdate();
				break;

			case "save-edit":
				await db.nodes.update(moon.id, {
					text: extra.text,
					lensUsed: extra.lensUsed,
					lensesUsed: extra.lensesUsed,
					editedAt: Date.now(),
				});
				await onNodesUpdate();
				showToast("Updated ✎", "#8B5CF6");
				break;

			case "save-evolved":
				await db.nodes.update(moon.id, {
					text: extra.text,
					lensUsed: extra.lensUsed,
					lensesUsed: extra.lensesUsed,
					editedAt: Date.now(),
					versions: [
						...(moon.versions || []).slice(-4),
						{
							text: moon.text,
							lensesUsed: moon.lensesUsed || [],
							savedAt: moon.editedAt || moon.timestamp || Date.now(),
						},
					],
				});
				await onNodesUpdate();
				showToast("Evolution marked ✦", "#A78BFA");
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
				showToast("Relationship removed", "#94A3B8");
				break;

			case "delete":
				if (window.confirm("Release this reflection into the void?")) {
					await db.nodes.delete(moon.id);
					await onNodesUpdate();
					setSelectedMoonId(null);
					showToast("Released 🌌", "#94A3B8");
				}
				break;
		}
	};

	// ── Relationship creation ──────────────────────────────────────────────────
	// Echo is deliberately the lightest of the three: no intensity, no lock —
	// "this reminded me of that" shouldn't cost you the freedom to keep
	// re-reading either moon on its own terms.
	const REL_TYPE_META = {
		tension: {
			startPrompt: "⚡ Click the conflicting moon",
			createdMsg: "⚡ Conflict mapped — click the line to compare or remove",
			color: "#EF4444",
			locks: true,
		},
		support: {
			startPrompt: "〜 Click the resonating moon",
			createdMsg: "〜 Resonance mapped — click the line to compare or remove",
			color: "#10B981",
			locks: false,
		},
		association: {
			startPrompt: "◈ Click the echoing moon",
			createdMsg: "◈ Echo mapped — click the line to compare or remove",
			color: "#6366F1",
			locks: false,
		},
	};

	const handleStartRelationship = (type, moon) => {
		setCreatingRelationship(type);
		setRelationshipSourceMoon(moon);
		const meta = REL_TYPE_META[type];
		showToast(meta.startPrompt, meta.color);
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

		const meta = REL_TYPE_META[type];
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

		if (meta.locks) {
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
		showToast(meta.createdMsg, meta.color, 3800);
	};

	// ── File an unfiled moon into a dimension ──────────────────────────────────
	const handleFileMoon = async (moonId, dimension) => {
		const dimensionMoons = childMoons.filter((m) => m.dimension === dimension);
		if (dimensionMoons.length >= MAX_MOONS_PER_DIMENSION) {
			showToast(
				`This dimension is full (${MAX_MOONS_PER_DIMENSION} max)`,
				"#EF4444",
			);
			return;
		}
		const angleStep = (Math.PI * 2) / MAX_MOONS_PER_DIMENSION;
		const orbitAngle =
			(DIMENSION_START_ANGLES[dimension] || 0) +
			dimensionMoons.length * angleStep;
		await db.nodes.update(moonId, { dimension, orbitAngle });
		await onNodesUpdate();
		showToast(
			`Filed under ${moonConfig.dimension[dimension].name}`,
			moonConfig.dimension[dimension].color,
		);
	};

	// ── Save new reflection ────────────────────────────────────────────────────
	const MAX_MOONS_PER_DIMENSION = 12;
	const handleSaveReflection = async (data) => {
		if (addingUnsorted) {
			const previousCount = await getTotalReflectionCount();
			await db.nodes.add({
				type: "R",
				parentId: parentNode.id,
				dimension: null,
				text: data.text,
				timestamp: Date.now(),
				ownership: "asserted",
				isLocked: false,
				lensUsed: data.lensUsed || null,
				lensesUsed: data.lensesUsed || [],
				claimType: "reporting",
				vantage: "mine",
				orbitAngle: 0,
				confidence: "stable",
				versions: [],
				relationships: [],
			});
			const newCount = await getTotalReflectionCount();
			await onNodesUpdate();
			setShowInputCard(false);
			setAddingUnsorted(false);
			showToast("Saved — file it whenever you're ready", "#94A3B8", 3200);
			const unlocks = await checkDimensionUnlock(previousCount, newCount);
			if (unlocks.length > 0) {
				setUnlockedDimensions(await getUnlockedDimensions());
				setUnlockNotification(unlocks[0]);
			}
			return;
		}
		const dimensionMoons = childMoons.filter(
			(m) => m.dimension === addingDimension,
		);
		if (dimensionMoons.length >= MAX_MOONS_PER_DIMENSION) {
			showToast(
				`This dimension is full (${MAX_MOONS_PER_DIMENSION} max) — mark an
				 existing reflection as evolved instead, or start a new planet`,
				"#EF4444",
			);
			return;
		}
		const previousCount = await getTotalReflectionCount();
		// Spread evenly around the ring based on how many already exist here —
		// previously every new moon in a dimension started at the exact same
		// fixed angle, and since moons in the same dimension all orbit at the
		// same speed, they animated in permanent lockstep and never actually
		// separated visually.
		const angleStep = (Math.PI * 2) / MAX_MOONS_PER_DIMENSION;
		const orbitAngle =
			(DIMENSION_START_ANGLES[addingDimension] || 0) +
			dimensionMoons.length * angleStep;
		await db.nodes.add({
			type: "R",
			parentId: parentNode.id,
			dimension: addingDimension,
			text: data.text,
			timestamp: Date.now(),
			ownership: "asserted",
			isLocked: false,
			lensUsed: data.lensUsed || null,
			lensesUsed: data.lensesUsed || [],
			claimType: data.claimType || "reporting",
			vantage: data.vantage || "mine",
			orbitAngle,
			confidence: "stable",
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
		moonPositionMap[m.id] = getMoonPosition(
			m,
			centeredPlanet,
			orbitTime,
			orbitSpeedMultiplier,
		);
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

			const removeRel = (extraUpdates = {}) => {
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
				showToast("Relationship removed", "#94A3B8");
			};

			const openComparison = () =>
				setComparisonRel({
					moonAId: moon.id,
					moonBId: target.id,
					relType: rel.type,
					// Bound here since it already has the right moon/target/extraUpdates
					// closed over; MoonComparisonView just calls it after its own confirm.
					remove: () =>
						removeRel(rel.type === "tension" ? { isLocked: false } : {}),
				});

			if (rel.type === "support") {
				relLines.push(
					<SupportLine
						key={key}
						moonA={moon}
						moonB={target}
						posA={posA}
						posB={posB}
						isHovered={false}
						onClick={openComparison}
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
						onClick={openComparison}
					/>,
				);
			} else if (rel.type === "association") {
				relLines.push(
					<EchoLine
						key={key}
						moonA={moon}
						moonB={target}
						posA={posA}
						posB={posB}
						isHovered={false}
						onClick={openComparison}
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
					title={parentNode.text || "Untitled"}
					style={{
						fontSize: "14px",
						fontWeight: 600,
						color: "#CBD5E1",
						maxWidth: "400px",
						overflow: "hidden",
						textOverflow: "ellipsis",
						whiteSpace: "nowrap",
						cursor: parentNode.text?.length > 60 ? "help" : "default",
					}}>
					{parentNode.text?.substring(0, 60) || "Untitled"}
					{parentNode.text?.length > 60 ? "…" : ""}
				</div>

				{/* Focal question — shown if set */}
				{parentNode.focalQuestion && (
					<div
						title={parentNode.focalQuestion}
						style={{
							position: "absolute",
							top: TOP_BAR_HEIGHT,
							left: "50%",
							transform: "translateX(-50%)",
							fontSize: 12,
							fontStyle: "italic",
							color: "rgba(255,255,255,0.25)",
							pointerEvents: "auto",
							cursor:
								parentNode.focalQuestion?.length > 60 ? "help" : "default",
							whiteSpace: "nowrap",
							maxWidth: 480,
							overflow: "hidden",
							textOverflow: "ellipsis",
							letterSpacing: "0.02em",
						}}>
						Exploring: {parentNode.focalQuestion}
					</div>
				)}

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
				<div ref={reflectionSvgRef} style={{ flex: 1, position: "relative" }}>
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
								color: "#94A3B8",
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
									color: "#94A3B8",
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

					{/* Unfiled reflections */}
					{!showInputCard && !creatingRelationship && (
						<UnfiledMoonsList
							moons={unfiledMoons}
							selectedMoonId={selectedMoonId}
							onSelectMoon={(id) => setSelectedMoonId(id)}
							onStartNew={handleStartUnsorted}
						/>
					)}

					{/* Zoom controls */}
					<div
						style={{
							position: "absolute",
							bottom: 16,
							left: 16,
							zIndex: 40,
							display: "flex",
							alignItems: "center",
							background: "rgba(10,15,28,0.9)",
							backdropFilter: "blur(10px)",
							border: "1px solid rgba(108,99,255,0.2)",
							borderRadius: 8,
							overflow: "hidden",
						}}>
						<button
							onClick={() => handleZoom(-0.1)}
							title="Zoom out"
							style={{
								padding: "6px 9px",
								background: "transparent",
								border: "none",
								color: "#94A3B8",
								cursor: "pointer",
								display: "flex",
								alignItems: "center",
							}}>
							<ZoomOut size={14} />
						</button>
						<button
							onClick={handleResetZoom}
							title="Fit to unlocked rings"
							style={{
								padding: "6px 9px",
								background: "transparent",
								border: "none",
								borderLeft: "1px solid rgba(255,255,255,0.12)",
								borderRight: "1px solid rgba(255,255,255,0.12)",
								color: "#94A3B8",
								cursor: "pointer",
								display: "flex",
								alignItems: "center",
							}}>
							<Maximize2 size={13} />
						</button>
						<button
							onClick={() => handleZoom(0.1)}
							title="Zoom in"
							style={{
								padding: "6px 9px",
								background: "transparent",
								border: "none",
								color: "#94A3B8",
								cursor: "pointer",
								display: "flex",
								alignItems: "center",
							}}>
							<ZoomIn size={14} />
						</button>
					</div>

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

						<g
							transform={`translate(${viewportCenterX}, ${viewportCenterY}) scale(${zoom}) translate(${-viewportCenterX}, ${-viewportCenterY})`}
							style={{ pointerEvents: "auto" }}>
							{/* ── ORBITAL RINGS ─────────────────────────────────────── */}
							{orbitalPaths
								.filter((p) => unlockedDimensions.includes(p.dimension))
								.map((path) => {
									const isHovered = hoveredRingDimension === path.dimension;
									const plusX = path.centerX;
									const plusY = path.centerY - path.radius;

									return (
										<g key={path.dimension}>
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
									const pos = getMoonPosition(
										src,
										centeredPlanet,
										orbitTime,
										orbitSpeedMultiplier,
									);
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
									const pos = getMoonPosition(
										moon,
										centeredPlanet,
										orbitTime,
										orbitSpeedMultiplier,
									);
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
						dimColor={
							selectedMoon.dimension
								? (
										moonConfig.dimension[selectedMoon.dimension] ||
										moonConfig.dimension.framing
									).color
								: "#94A3B8"
						}
						unlockedDimensions={unlockedDimensions}
						onFileMoon={handleFileMoon}
						temporalDistance={parentNode?.temporalDistance}
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
						color: "#94A3B8",
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
			{showInputCard && (addingDimension || addingUnsorted) && (
				<MoonInputCard
					dimension={addingDimension}
					onSave={handleSaveReflection}
					onCancel={() => {
						setShowInputCard(false);
						setAddingDimension(null);
						setAddingUnsorted(false);
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

			{/* ── RELATIONSHIP COMPARISON VIEW ────────────────────────────────── */}
			{comparisonRel &&
				(() => {
					const moonA = childMoons.find((m) => m.id === comparisonRel.moonAId);
					const moonB = childMoons.find((m) => m.id === comparisonRel.moonBId);
					if (!moonA || !moonB) return null;
					return (
						<MoonComparisonView
							moonA={moonA}
							moonB={moonB}
							relType={comparisonRel.relType}
							onClose={() => setComparisonRel(null)}
							onRemove={comparisonRel.remove}
							onOpenMoon={(moonId) => {
								setComparisonRel(null);
								setSelectedMoonId(moonId);
							}}
						/>
					);
				})()}

			<style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateX(-50%) translateY(6px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0);   }
        }
      `}</style>
		</div>
	);
}
