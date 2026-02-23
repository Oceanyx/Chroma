// src/components/TopNav.jsx - V2.1
import React, { useState } from "react";
import { MousePointer, Hand, Download, Target } from "lucide-react";
import PurposeModal from "./PurposeModal";

export default function TopNav({ purposeData, tool, onToolChange, onExport }) {
	const [showPurpose, setShowPurpose] = useState(false);

	return (
		<>
			<div
				style={{
					height: "60px",
					background: "linear-gradient(180deg, #1E293B 0%, #1A2332 100%)",
					borderBottom: "1px solid rgba(108, 99, 255, 0.2)",
					display: "grid",
					gridTemplateColumns: "1fr auto 1fr",
					alignItems: "center",
					padding: "0 20px",
					zIndex: 100,
					boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
					flexShrink: 0,
				}}>
				{/* ── Left: Logo ──────────────────────────────────────────────── */}
				<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
					<img
						src="/logo.PNG"
						alt="Chroma"
						style={{
							width: 34,
							height: 34,
							filter: "drop-shadow(0 2px 6px rgba(108,99,255,0.4))",
						}}
					/>
					<h1
						style={{
							margin: 0,
							fontSize: 17,
							fontWeight: 700,
							background:
								"linear-gradient(135deg, #6C63FF 0%, #4D9FFF 50%, #A78BFA 100%)",
							WebkitBackgroundClip: "text",
							WebkitTextFillColor: "transparent",
							backgroundClip: "text",
							letterSpacing: "-0.3px",
						}}>
						Chroma
					</h1>
				</div>

				{/* ── Center: Map title + tool selector ───────────────────────── */}
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						gap: 5,
					}}>
					{purposeData?.title && (
						<span
							style={{
								fontSize: 13,
								fontWeight: 600,
								color: "#94A3B8",
								letterSpacing: "0.01em",
								maxWidth: 360,
								overflow: "hidden",
								textOverflow: "ellipsis",
								whiteSpace: "nowrap",
								lineHeight: 1,
							}}>
							{purposeData.title}
						</span>
					)}

					{/* Tool selector */}
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: 3,
							padding: "3px",
							background: "rgba(15,23,36,0.6)",
							borderRadius: 7,
							border: "1px solid rgba(255,255,255,0.07)",
						}}>
						{[
							{ id: "select", Icon: MousePointer, label: "Select" },
							{ id: "hand", Icon: Hand, label: "Pan" },
						].map(({ id, Icon, label }) => (
							<button
								key={id}
								onClick={() => onToolChange(id)}
								style={{
									padding: "4px 10px",
									background: tool === id ? "#6C63FF" : "transparent",
									border: "none",
									borderRadius: 5,
									color: tool === id ? "#fff" : "#64748B",
									cursor: "pointer",
									fontSize: 11,
									fontWeight: 600,
									display: "flex",
									alignItems: "center",
									gap: 5,
									transition: "all 0.15s",
									outline: "none",
									whiteSpace: "nowrap",
								}}>
								<Icon size={12} />
								{label}
							</button>
						))}

						{/* Space shortcut hint — sits inside the tool group */}
						<div
							title="Hold Space to temporarily pan without switching tools"
							style={{
								padding: "4px 8px",
								marginLeft: 2,
								borderLeft: "1px solid rgba(255,255,255,0.07)",
								fontSize: 10,
								fontWeight: 700,
								color: "#475569",
								letterSpacing: "0.05em",
								cursor: "default",
								whiteSpace: "nowrap",
							}}>
							Hold SPACE to pan
						</div>
					</div>
				</div>

				{/* ── Right: Actions ───────────────────────────────────────────── */}
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: 8,
						justifyContent: "flex-end",
					}}>
					{purposeData && (
						<NavButton
							onClick={() => setShowPurpose(true)}
							icon={<Target size={13} />}
							label="Purpose"
						/>
					)}
					<NavButton
						onClick={onExport}
						icon={<Download size={13} />}
						label="Export"
						accent
					/>
				</div>
			</div>

			{showPurpose && purposeData && (
				<PurposeModal
					purposeData={purposeData}
					onClose={() => setShowPurpose(false)}
					onEdit={() => setShowPurpose(false)}
				/>
			)}
		</>
	);
}

function NavButton({ onClick, icon, label, accent = false }) {
	const [hovered, setHovered] = useState(false);
	return (
		<button
			onClick={onClick}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			style={{
				padding: "6px 12px",
				background: accent
					? hovered
						? "rgba(108,99,255,0.25)"
						: "rgba(108,99,255,0.12)"
					: hovered
						? "rgba(255,255,255,0.06)"
						: "transparent",
				border: accent
					? `1px solid ${hovered ? "rgba(108,99,255,0.6)" : "rgba(108,99,255,0.3)"}`
					: `1px solid ${hovered ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.07)"}`,
				borderRadius: 7,
				color: accent
					? hovered
						? "#A78BFA"
						: "#6C63FF"
					: hovered
						? "#94A3B8"
						: "#475569",
				cursor: "pointer",
				fontSize: 12,
				fontWeight: 600,
				display: "flex",
				alignItems: "center",
				gap: 6,
				transition: "all 0.15s",
				outline: "none",
			}}>
			{icon}
			{label}
		</button>
	);
}
