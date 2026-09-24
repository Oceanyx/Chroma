// src/components/AboutModal.jsx
import React from "react";
import { X, Moon } from "lucide-react";

export default function AboutModal({ onClose }) {
	return (
		<div
			style={{
				position: "fixed",
				inset: 0,
				background: "rgba(0,0,0,0.8)",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				zIndex: 4000,
				backdropFilter: "blur(8px)",
				animation: "fadeIn 0.2s ease",
			}}>
			<div
				style={{
					width: "600px",
					maxWidth: "90vw",
					maxHeight: "85vh",
					background: "linear-gradient(135deg, #0F1724 0%, #1A1F35 100%)",
					borderRadius: "20px",
					border: "1px solid rgba(108, 99, 255, 0.3)",
					boxShadow: "0 20px 60px rgba(0, 0, 0, 0.6)",
					display: "flex",
					flexDirection: "column",
					color: "#E6EEF8",
					overflow: "hidden",
				}}>
				{/* Header */}
				<div
					style={{
						padding: "24px",
						borderBottom: "1px solid rgba(255,255,255,0.1)",
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						background:
							"linear-gradient(135deg, rgba(108, 99, 255, 0.1) 0%, rgba(77, 159, 255, 0.05) 100%)",
					}}>
					<div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
						<Moon size={24} color="#6C63FF" />
						<h2 style={{ margin: 0, fontSize: "22px", fontWeight: 700 }}>
							From the creator
						</h2>
					</div>
					<button
						onClick={onClose}
						style={{
							background: "transparent",
							border: "none",
							color: "#94A3B8",
							fontSize: "28px",
							cursor: "pointer",
							padding: "0 8px",
							lineHeight: "1",
						}}>
						×
					</button>
				</div>

				{/* Content */}
				<div
					className="chroma-scroll"
					style={{
						flex: 1,
						overflowY: "auto",
						padding: "32px",
					}}>
					<div
						style={{
							fontSize: "15px",
							lineHeight: "1.75",
							color: "#CBD5E1",
						}}>
						<p>Hi, I'm Brian. Thanks for checking out Chroma.</p>
						<p>
							Chroma is a tool for mapping your experiences. Think of each
							experience as a planet, and your reflections on it (how it felt,
							what you did, the patterns it fits) as moons in orbit.
						</p>
						<p>
							Mechanics aside, I built Chroma because perception shapes
							everything we do, yet we rarely examine how we form it. Everyone
							around us sees the same moment through a different lens.
							Deconstructing your own perspective is how you sharpen your mind
							and uncover your own internalized truth. This tool is designed to
							help you spot those patterns and see how beliefs quietly direct
							who we become.
						</p>
						<p>
							Mapping raw experience into structure comes with friction,
							especially when the process feels aimless. But there is real value
							on the other side of asking why we feel the need for an aim at
							all.
						</p>
						<p>
							Why do ads or propaganda work? Can you escape outside framing, and
							should you? What drives your decisions? Chroma was built to sit
							with these questions as a kind of mental exercise.
						</p>
						<p>
							Ultimately, what I want for you here is a freedom to explore your
							thoughts. There are no pre-packaged answers at the end, only
							observations and beliefs. Statements like "I am smart" or "I am
							flawed" may feel fixed, but no belief is final just because you
							hold it or because others repeat it back to you. A different lens,
							a different vantage point, a different value system, etc. all
							create different answers based on how you hold it. You might find
							ideas here worth keeping, or ones worth challenging.
						</p>
						<p>
							I provided the scaffolding. The meaning you give it is up to you.
						</p>
						<p style={{ marginBottom: 0 }}>
							Happy perceiving.
							<br />— Brian
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
