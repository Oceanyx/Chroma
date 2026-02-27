// src/components/MoonInputCard.jsx - V3.0
// Changes from V2.2:
//   - Two-stage flow: lens selection → writing (all in one card, no navigation)
//   - Lens selected BEFORE writing; its dimension-aware instruction becomes the placeholder
//   - "Open" option skips lens — uses dimension default description as placeholder
//   - Permanent header: "From where you stand now, looking back —"
//   - claimType (reporting|reading) selected after writing, before save
//   - lensUsed (single id) replaces multi-select lensesUsed array in save payload
//   - Dimension renamed: symbolic → framing (reads from moonConfig)
import React, { useState, useEffect, useRef } from "react";
import { moonConfig, lenses } from "../seedData";

// Fallback instruction if a custom lens has no instruction for this dimension
function getLensInstruction(lens, dimension) {
	if (!lens) return null;
	return (
		lens.instructions?.[dimension] || `Look from this angle: ${lens.label}`
	);
}

export default function MoonInputCard({ dimension, onSave, onCancel }) {
	const [stage, setStage] = useState("lens"); // "lens" | "write"
	const [selectedLensId, setSelectedLensId] = useState(null); // null = "Open"
	const [text, setText] = useState("");
	const [claimType, setClaimType] = useState("reporting");
	const textareaRef = useRef(null);

	const dimensionConfig = moonConfig.dimension[dimension];
	if (!dimensionConfig) return null;

	const selectedLens = lenses.find((l) => l.id === selectedLensId) || null;

	// Placeholder text: lens instruction if lens selected, else dimension default
	const placeholder = selectedLens
		? getLensInstruction(selectedLens, dimension)
		: dimensionConfig.description;

	// Move to write stage and focus textarea
	const goToWrite = () => {
		setStage("write");
		setTimeout(() => textareaRef.current?.focus(), 30);
	};

	const handleLensSelect = (lensId) => {
		setSelectedLensId(lensId === selectedLensId ? null : lensId); // toggle off if same
	};

	const handleOpenClick = () => {
		setSelectedLensId(null);
		goToWrite();
	};

	const handleLensConfirm = () => {
		goToWrite();
	};

	const handleSave = () => {
		if (!text.trim()) return;
		onSave({
			text: text.trim(),
			lensUsed: selectedLensId,
			lensesUsed: selectedLensId ? [selectedLensId] : [],
			claimType,
		});
	};

	// ESC key
	useEffect(() => {
		const handleKeyDown = (e) => {
			if (e.key === "Escape") onCancel();
			if (e.key === "Enter" && e.metaKey && stage === "write" && text.trim())
				handleSave();
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [onCancel, stage, text]);

	const dimColor = dimensionConfig.color;

	return (
		<div
			style={{
				position: "absolute",
				top: "50%",
				left: "50%",
				transform: "translate(-50%, -50%)",
				width: "480px",
				maxWidth: "92vw",
				background:
					"linear-gradient(135deg, rgba(30, 41, 59, 0.98) 0%, rgba(15, 23, 36, 0.98) 100%)",
				backdropFilter: "blur(20px)",
				border: `2px solid ${dimColor}`,
				borderRadius: "18px",
				padding: "26px 24px 22px",
				boxShadow: `0 20px 60px rgba(0,0,0,0.6), 0 0 40px ${dimColor}40`,
				animation: "scaleIn 0.25s ease",
				zIndex: 300,
			}}>
			{/* ── Retrospective framing header ─────────────────────────────────── */}
			<p
				style={{
					margin: "0 0 18px",
					fontSize: 11,
					fontStyle: "italic",
					color: "rgba(255,255,255,0.3)",
					letterSpacing: "0.04em",
					textAlign: "center",
					userSelect: "none",
				}}>
				From where you stand now, looking back —
			</p>

			{/* ── Dimension badge ──────────────────────────────────────────────── */}
			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: 9,
					marginBottom: 20,
					paddingBottom: 16,
					borderBottom: `1px solid ${dimColor}30`,
				}}>
				<div
					style={{
						width: 11,
						height: 11,
						borderRadius: "50%",
						background: dimColor,
						boxShadow: `0 0 10px ${dimColor}80`,
						flexShrink: 0,
					}}
				/>
				<h3
					style={{ margin: 0, fontSize: 17, fontWeight: 600, color: dimColor }}>
					{dimensionConfig.name}
				</h3>
				{stage === "write" && selectedLens && (
					<button
						onClick={() => setStage("lens")}
						style={{
							marginLeft: "auto",
							background: `${selectedLens.color || dimColor}18`,
							border: `1px solid ${selectedLens.color || dimColor}40`,
							borderRadius: 20,
							color: selectedLens.color || dimColor,
							fontSize: 12,
							fontWeight: 700,
							padding: "3px 10px",
							cursor: "pointer",
							outline: "none",
							display: "flex",
							alignItems: "center",
							gap: 5,
						}}>
						{selectedLens.emoji} {selectedLens.label} ✎
					</button>
				)}
				{stage === "write" && !selectedLens && (
					<button
						onClick={() => setStage("lens")}
						style={{
							marginLeft: "auto",
							background: "rgba(255,255,255,0.05)",
							border: "1px solid rgba(255,255,255,0.12)",
							borderRadius: 20,
							color: "#64748B",
							fontSize: 12,
							fontWeight: 700,
							padding: "3px 10px",
							cursor: "pointer",
							outline: "none",
						}}>
						Open lens ✎
					</button>
				)}
			</div>

			{/* ══ STAGE 1: LENS SELECTION ══════════════════════════════════════════ */}
			{stage === "lens" && (
				<>
					<p
						style={{
							margin: "0 0 14px",
							fontSize: 12,
							color: "rgba(255,255,255,0.4)",
							fontWeight: 600,
							letterSpacing: "0.06em",
							textTransform: "uppercase",
						}}>
						Choose an angle of attention
					</p>

					{/* Lens buttons */}
					<div
						style={{
							display: "flex",
							flexWrap: "wrap",
							gap: 8,
							marginBottom: 16,
						}}>
						{lenses.map((lens) => {
							const active = selectedLensId === lens.id;
							const instruction = getLensInstruction(lens, dimension);
							return (
								<button
									key={lens.id}
									onClick={() => handleLensSelect(lens.id)}
									title={instruction}
									style={{
										padding: "8px 14px",
										background: active
											? `${lens.color}25`
											: "rgba(30,41,59,0.6)",
										border: `1px solid ${active ? lens.color : "rgba(148,163,184,0.2)"}`,
										borderRadius: 10,
										color: active ? lens.color : "#94A3B8",
										cursor: "pointer",
										fontSize: 13,
										fontWeight: active ? 700 : 500,
										transition: "all 0.15s",
										display: "flex",
										alignItems: "center",
										gap: 6,
										outline: "none",
										boxShadow: active ? `0 0 12px ${lens.color}30` : "none",
									}}
									onMouseEnter={(e) => {
										if (!active) {
											e.currentTarget.style.background = `${lens.color}12`;
											e.currentTarget.style.borderColor = `${lens.color}60`;
											e.currentTarget.style.color = lens.color;
										}
									}}
									onMouseLeave={(e) => {
										if (!active) {
											e.currentTarget.style.background = "rgba(30,41,59,0.6)";
											e.currentTarget.style.borderColor =
												"rgba(148,163,184,0.2)";
											e.currentTarget.style.color = "#94A3B8";
										}
									}}>
									<span>{lens.emoji}</span>
									<span>{lens.label}</span>
								</button>
							);
						})}
					</div>

					{/* Attentional instruction preview */}
					{selectedLensId && (
						<div
							style={{
								padding: "10px 14px",
								background: "rgba(255,255,255,0.03)",
								border: `1px solid ${lenses.find((l) => l.id === selectedLensId)?.color || dimColor}30`,
								borderLeft: `3px solid ${lenses.find((l) => l.id === selectedLensId)?.color || dimColor}`,
								borderRadius: 8,
								marginBottom: 16,
								fontSize: 13,
								color: "rgba(255,255,255,0.6)",
								fontStyle: "italic",
								lineHeight: 1.6,
							}}>
							{getLensInstruction(
								lenses.find((l) => l.id === selectedLensId),
								dimension,
							)}
						</div>
					)}

					{/* Action row */}
					<div style={{ display: "flex", gap: 10, marginTop: 4 }}>
						<button
							onClick={onCancel}
							style={{
								flex: 1,
								padding: "11px",
								background: "transparent",
								border: "1px solid rgba(148,163,184,0.2)",
								borderRadius: 9,
								color: "#64748B",
								cursor: "pointer",
								fontSize: 13,
								fontWeight: 600,
								outline: "none",
							}}>
							Cancel
						</button>
						<button
							onClick={handleOpenClick}
							style={{
								flex: 1,
								padding: "11px",
								background: "rgba(255,255,255,0.04)",
								border: "1px solid rgba(255,255,255,0.12)",
								borderRadius: 9,
								color: "#94A3B8",
								cursor: "pointer",
								fontSize: 13,
								fontWeight: 600,
								outline: "none",
							}}>
							Open (no lens)
						</button>
						{selectedLensId && (
							<button
								onClick={handleLensConfirm}
								style={{
									flex: 2,
									padding: "11px",
									background: `linear-gradient(135deg, ${dimColor} 0%, ${dimColor}CC 100%)`,
									border: "none",
									borderRadius: 9,
									color: "#fff",
									cursor: "pointer",
									fontSize: 13,
									fontWeight: 700,
									outline: "none",
									boxShadow: `0 4px 16px ${dimColor}40`,
								}}>
								Write →
							</button>
						)}
					</div>
				</>
			)}

			{/* ══ STAGE 2: WRITING ═════════════════════════════════════════════════ */}
			{stage === "write" && (
				<>
					{/* Textarea */}
					<textarea
						ref={textareaRef}
						value={text}
						onChange={(e) => setText(e.target.value)}
						placeholder={placeholder}
						rows={5}
						style={{
							width: "100%",
							padding: "14px",
							background: "rgba(15,23,36,0.8)",
							border: `1px solid ${dimColor}40`,
							borderRadius: 10,
							color: "#E6EEF8",
							fontSize: 15,
							fontFamily: "Georgia, 'Times New Roman', serif",
							fontStyle: "italic",
							lineHeight: 1.75,
							resize: "vertical",
							outline: "none",
							transition: "border-color 0.2s",
							boxSizing: "border-box",
							marginBottom: 16,
						}}
						onFocus={(e) => {
							e.target.style.borderColor = dimColor;
							e.target.style.boxShadow = `0 0 0 2px ${dimColor}20`;
						}}
						onBlur={(e) => {
							e.target.style.borderColor = `${dimColor}40`;
							e.target.style.boxShadow = "none";
						}}
					/>

					{/* Claim type toggle */}
					<div style={{ marginBottom: 18 }}>
						<p
							style={{
								margin: "0 0 9px",
								fontSize: 11,
								fontWeight: 700,
								color: "rgba(255,255,255,0.3)",
								letterSpacing: "0.08em",
								textTransform: "uppercase",
							}}>
							This reflection is —
						</p>
						<div style={{ display: "flex", gap: 8 }}>
							{[
								{
									id: "reporting",
									label: "Reporting",
									desc: "Best reconstruction of what was present",
									color: "#10B981",
								},
								{
									id: "reading",
									label: "Reading",
									desc: "A framework applied to make sense of it",
									color: "#6366F1",
								},
							].map(({ id, label, desc, color }) => {
								const active = claimType === id;
								return (
									<button
										key={id}
										onClick={() => setClaimType(id)}
										title={desc}
										style={{
											flex: 1,
											padding: "9px 12px",
											background: active
												? `${color}18`
												: "rgba(255,255,255,0.03)",
											border: `1px solid ${active ? `${color}60` : "rgba(255,255,255,0.1)"}`,
											borderRadius: 9,
											color: active ? color : "#475569",
											cursor: "pointer",
											fontSize: 12,
											fontWeight: 700,
											outline: "none",
											transition: "all 0.15s",
											textAlign: "left",
										}}>
										<div>{label}</div>
										<div
											style={{
												fontSize: 10,
												fontWeight: 500,
												marginTop: 3,
												opacity: 0.7,
												whiteSpace: "normal",
												lineHeight: 1.4,
											}}>
											{desc}
										</div>
									</button>
								);
							})}
						</div>
					</div>

					{/* Save / Cancel */}
					<div style={{ display: "flex", gap: 10 }}>
						<button
							onClick={onCancel}
							style={{
								flex: 1,
								padding: "12px",
								background: "transparent",
								border: "1px solid rgba(148,163,184,0.25)",
								borderRadius: 9,
								color: "#64748B",
								cursor: "pointer",
								fontSize: 14,
								fontWeight: 600,
								outline: "none",
							}}>
							Cancel
						</button>
						<button
							onClick={handleSave}
							disabled={!text.trim()}
							style={{
								flex: 2,
								padding: "12px",
								background: text.trim()
									? `linear-gradient(135deg, ${dimColor} 0%, ${dimColor}CC 100%)`
									: "rgba(30,41,59,0.6)",
								border: "none",
								borderRadius: 9,
								color: "#fff",
								cursor: text.trim() ? "pointer" : "not-allowed",
								fontSize: 14,
								fontWeight: 700,
								transition: "all 0.2s",
								boxShadow: text.trim() ? `0 4px 16px ${dimColor}40` : "none",
								opacity: text.trim() ? 1 : 0.45,
								outline: "none",
							}}>
							Save Reflection
						</button>
					</div>

					<div
						style={{
							marginTop: 10,
							fontSize: 11,
							color: "#334155",
							textAlign: "center",
							fontStyle: "italic",
						}}>
						⌘↵ to save · ESC to cancel
					</div>
				</>
			)}

			<style>{`
        @keyframes scaleIn {
          from { transform: translate(-50%, -50%) scale(0.92); opacity: 0; }
          to   { transform: translate(-50%, -50%) scale(1);    opacity: 1; }
        }
      `}</style>
		</div>
	);
}
