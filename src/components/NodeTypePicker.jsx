// src/components/NodeTypePicker.jsx
import React from "react";
import { Eye, Zap, Target } from "lucide-react";

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
						color: "#64748B",
						textTransform: "uppercase",
						letterSpacing: "0.05em",
					}}>
					Create Node:
				</h3>

				{/* Observation Button */}
				<button
					onClick={() => onSelect("O")}
					style={{
						width: "100%",
						padding: "12px 16px",
						marginBottom: "8px",
						background: "rgba(15, 23, 36, 0.6)",
						border: "1px solid rgba(59, 130, 246, 0.3)",
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
						e.target.style.background = "rgba(59, 130, 246, 0.2)";
						e.target.style.borderColor = "#3B82F6";
						e.target.style.transform = "translateX(4px)";
					}}
					onMouseLeave={(e) => {
						e.target.style.background = "rgba(15, 23, 36, 0.6)";
						e.target.style.borderColor = "rgba(59, 130, 246, 0.3)";
						e.target.style.transform = "translateX(0)";
					}}>
					<Eye size={20} />
					<div>
						<div>Observation</div>
						<div
							style={{
								fontSize: "11px",
								color: "#94A3B8",
								fontWeight: 400,
							}}>
							What did you notice?
						</div>
					</div>
				</button>

				{/* Action Button */}
				<button
					onClick={() => onSelect("A")}
					style={{
						width: "100%",
						padding: "12px 16px",
						marginBottom: "8px",
						background: "rgba(15, 23, 36, 0.6)",
						border: "1px solid rgba(249, 115, 22, 0.3)",
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
						e.target.style.background = "rgba(249, 115, 22, 0.2)";
						e.target.style.borderColor = "#F97316";
						e.target.style.transform = "translateX(4px)";
					}}
					onMouseLeave={(e) => {
						e.target.style.background = "rgba(15, 23, 36, 0.6)";
						e.target.style.borderColor = "rgba(249, 115, 22, 0.3)";
						e.target.style.transform = "translateX(0)";
					}}>
					<Zap size={20} />
					<div>
						<div>Action</div>
						<div
							style={{
								fontSize: "11px",
								color: "#94A3B8",
								fontWeight: 400,
							}}>
							What did you do?
						</div>
					</div>
				</button>

				{/* Intention Button */}
				<button
					onClick={() => onSelect("I")}
					style={{
						width: "100%",
						padding: "12px 16px",
						marginBottom: "12px",
						background: "rgba(15, 23, 36, 0.6)",
						border: "1px solid rgba(251, 191, 36, 0.3)",
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
						e.target.style.background = "rgba(251, 191, 36, 0.2)";
						e.target.style.borderColor = "#FBBF24";
						e.target.style.transform = "translateX(4px)";
					}}
					onMouseLeave={(e) => {
						e.target.style.background = "rgba(15, 23, 36, 0.6)";
						e.target.style.borderColor = "rgba(251, 191, 36, 0.3)";
						e.target.style.transform = "translateX(0)";
					}}>
					<Target size={20} />
					<div>
						<div>Intention</div>
						<div
							style={{
								fontSize: "11px",
								color: "#94A3B8",
								fontWeight: 400,
							}}>
							A commitment to change
						</div>
					</div>
				</button>

				{/* Cancel Button */}
				<button
					onClick={onCancel}
					style={{
						width: "100%",
						padding: "8px",
						background: "transparent",
						border: "1px solid rgba(255,255,255,0.2)",
						borderRadius: "6px",
						color: "#64748B",
						fontSize: "13px",
						cursor: "pointer",
						transition: "all 0.2s",
					}}
					onMouseEnter={(e) => {
						e.target.style.background = "rgba(255,255,255,0.05)";
						e.target.style.color = "#94A3B8";
					}}
					onMouseLeave={(e) => {
						e.target.style.background = "transparent";
						e.target.style.color = "#64748B";
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
