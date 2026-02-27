// src/components/DimensionUnlockNotification.jsx
import React, { useEffect } from "react";
import { moonConfig } from "../seedData";

export default function DimensionUnlockNotification({ dimension, onDismiss }) {
	const config = moonConfig.dimension[dimension];

	useEffect(() => {
		const timer = setTimeout(() => {
			onDismiss();
		}, 10000);
		return () => clearTimeout(timer);
	}, [onDismiss]);

	return (
		<div
			style={{
				position: "fixed",
				top: "50%",
				left: "50%",
				transform: "translate(-50%, -50%)",
				width: "500px",
				maxWidth: "90vw",
				background:
					"linear-gradient(135deg, rgba(30, 41, 59, 0.98) 0%, rgba(15, 23, 36, 0.98) 100%)",
				backdropFilter: "blur(30px)",
				border: `2px solid ${config.color}`,
				borderRadius: "20px",
				padding: "40px",
				boxShadow: `0 20px 80px rgba(0, 0, 0, 0.8), 0 0 60px ${config.color}60`,
				animation: "celebrationPulse 0.6s ease",
				zIndex: 5000,
			}}>
			{/* Celebration Header */}
			<div style={{ textAlign: "center", marginBottom: "24px" }}>
				<div
					style={{
						fontSize: "48px",
						marginBottom: "16px",
						animation: "bounce 1s ease infinite",
					}}>
					🎉
				</div>
				<h2
					style={{
						margin: 0,
						fontSize: "28px",
						fontWeight: 700,
						color: config.color,
						marginBottom: "8px",
					}}>
					New Dimension Unlocked!
				</h2>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						gap: "12px",
						marginTop: "16px",
					}}>
					<div
						style={{
							width: "16px",
							height: "16px",
							borderRadius: "50%",
							background: config.color,
							boxShadow: `0 0 20px ${config.color}`,
						}}
					/>
					<h3
						style={{
							margin: 0,
							fontSize: "24px",
							fontWeight: 600,
							color: "#E6EEF8",
						}}>
						{config.name}
					</h3>
				</div>
			</div>

			{/* Description */}
			<div
				style={{
					padding: "20px",
					background: "rgba(15, 23, 36, 0.6)",
					borderRadius: "12px",
					border: `1px solid ${config.color}40`,
					marginBottom: "24px",
				}}>
				<p
					style={{
						margin: 0,
						fontSize: "16px",
						lineHeight: "1.6",
						color: "#CBD5E1",
						textAlign: "center",
					}}>
					{config.description}
				</p>
			</div>

			{/* Examples */}
			<div style={{ marginBottom: "24px" }}>
				<h4
					style={{
						margin: "0 0 12px 0",
						fontSize: "14px",
						fontWeight: 600,
						color: "#94A3B8",
						textTransform: "uppercase",
						letterSpacing: "0.5px",
					}}>
					Examples:
				</h4>
				<div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
					{getExamplesForDimension(dimension).map((example, i) => (
						<div
							key={i}
							style={{
								padding: "12px",
								background: `${config.color}15`,
								borderLeft: `3px solid ${config.color}`,
								borderRadius: "6px",
								fontSize: "13px",
								color: "#E6EEF8",
								fontStyle: "italic",
							}}>
							"{example}"
						</div>
					))}
				</div>
			</div>

			{/* Dismiss */}
			<button
				onClick={onDismiss}
				style={{
					width: "100%",
					padding: "14px",
					background: `linear-gradient(135deg, ${config.color} 0%, ${config.color}CC 100%)`,
					border: "none",
					borderRadius: "10px",
					color: "#fff",
					fontSize: "15px",
					fontWeight: 600,
					cursor: "pointer",
					transition: "all 0.2s",
					boxShadow: `0 4px 16px ${config.color}40`,
				}}
				onMouseEnter={(e) => {
					e.target.style.transform = "translateY(-2px)";
					e.target.style.boxShadow = `0 6px 24px ${config.color}60`;
				}}
				onMouseLeave={(e) => {
					e.target.style.transform = "translateY(0)";
					e.target.style.boxShadow = `0 4px 16px ${config.color}40`;
				}}>
				Got it! ✨
			</button>

			<style>{`
        @keyframes celebrationPulse {
          0%   { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
          50%  { transform: translate(-50%, -50%) scale(1.05); }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-10px); }
        }
      `}</style>
		</div>
	);
}

function getExamplesForDimension(dimension) {
	const examples = {
		behavioral: [
			"I crossed my arms",
			"I said 'You always do this'",
			"I walked out of the room",
		],
		framing: [
			"Through an attachment lens, this is anxious attachment activating",
			"A systems view: the hierarchy made disagreement feel unsafe",
			"Psychologically, this is the fawning response I default to with authority",
		],
	};

	return examples[dimension] || [];
}
