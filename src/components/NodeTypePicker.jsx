// src/components/NodeTypePicker.jsx - V2.0
// Changes from V1.x:
//   - Colors now read from the shared nodeTypeColors instead of four
//     separately hardcoded copies
//   - Persistent color reinforcement at rest, not just on hover: a colored
//     left stripe and a tinted icon, so the picker teaches the color
//     mapping before you've committed to a choice, not after
import React from "react";
import { Eye, Zap, Target, CircleDashed } from "lucide-react";
import { nodeTypeColors } from "../seedData";

const TYPES = [
	{
		type: "O",
		Icon: Eye,
		label: "Observation",
		desc: "What did you notice?",
	},
	{ type: "A", Icon: Zap, label: "Action", desc: "What did you do?" },
	{
		type: "I",
		Icon: Target,
		label: "Intention",
		desc: "A commitment to change",
	},
	{
		type: "H",
		Icon: CircleDashed,
		label: "Hypothetical",
		desc: "Something imagined, dreamed, or wondered about",
	},
];

function TypeButton({ type, Icon, label, desc, onSelect }) {
	const accent = nodeTypeColors[type].accent;
	return (
		<button
			onClick={() => onSelect(type)}
			style={{
				width: "100%",
				padding: "12px 16px 12px 13px",
				marginBottom: "8px",
				background: `${accent}14`,
				border: `1px solid ${accent}45`,
				borderLeft: `4px solid ${accent}`,
				borderRadius: "8px",
				color: "#E6EEF8",
				fontSize: "15px",
				fontWeight: 600,
				textAlign: "left",
				cursor: "pointer",
				display: "flex",
				alignItems: "center",
				gap: "12px",
				transition: "all 0.2s",
			}}
			onMouseEnter={(e) => {
				e.currentTarget.style.background = `${accent}28`;
				e.currentTarget.style.borderColor = accent;
				e.currentTarget.style.transform = "translateX(4px)";
			}}
			onMouseLeave={(e) => {
				e.currentTarget.style.background = `${accent}14`;
				e.currentTarget.style.borderColor = `${accent}45`;
				e.currentTarget.style.borderLeftColor = accent;
				e.currentTarget.style.transform = "translateX(0)";
			}}>
			<Icon size={20} color={accent} />
			<div>
				<div>{label}</div>
				<div style={{ fontSize: "11px", color: "#94A3B8", fontWeight: 400 }}>
					{desc}
				</div>
			</div>
		</button>
	);
}

export default function NodeTypePicker({ position, onSelect, onCancel }) {
	return (
		<>
			{/* Backdrop - click to cancel */}
			<div
				onClick={onCancel}
				style={{
					position: "fixed",
					inset: 0,
					background: "rgba(0,0,0,0.4)",
					backdropFilter: "blur(4px)",
					zIndex: 499,
				}}
			/>

			{/* Picker Card */}
			<div
				style={{
					position: "fixed",
					left: position.x,
					top: position.y,
					transform: "translate(-50%, -50%)",
					padding: "16px",
					background: "rgba(30, 41, 59, 0.98)",
					backdropFilter: "blur(20px)",
					border: "2px solid #6C63FF",
					borderRadius: "16px",
					boxShadow: "0 12px 40px rgba(0,0,0,0.8)",
					zIndex: 500,
					minWidth: "240px",
					animation: "scaleIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
				}}>
				<h3
					style={{
						margin: "0 0 12px 0",
						fontSize: "13px",
						fontWeight: 600,
						color: "#94A3B8",
						textTransform: "uppercase",
						letterSpacing: "0.05em",
					}}>
					Create Node:
				</h3>

				{TYPES.map((t) => (
					<TypeButton key={t.type} {...t} onSelect={onSelect} />
				))}

				{/* Cancel Button */}
				<button
					onClick={onCancel}
					style={{
						width: "100%",
						padding: "8px",
						background: "transparent",
						border: "1px solid rgba(255,255,255,0.2)",
						borderRadius: "6px",
						color: "#94A3B8",
						fontSize: "13px",
						cursor: "pointer",
						transition: "all 0.2s",
					}}
					onMouseEnter={(e) => {
						e.currentTarget.style.background = "rgba(255,255,255,0.05)";
						e.currentTarget.style.color = "#94A3B8";
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.background = "transparent";
						e.currentTarget.style.color = "#94A3B8";
					}}>
					Cancel
				</button>

				{/* Scale-in Animation */}
				<style>{`
          @keyframes scaleIn {
            from {
              transform: translate(-50%, -50%) scale(0.9);
              opacity: 0;
            }
            to {
              transform: translate(-50%, -50%) scale(1);
              opacity: 1;
            }
          }
        `}</style>
			</div>
		</>
	);
}
