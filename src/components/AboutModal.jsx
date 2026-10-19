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
							Chroma is a tool for mapping your experiences. Each experience is
							a planet, and your reflections on it (how it felt, what you did,
							the patterns it fits) are moons in orbit.
						</p>
						<p>
							I built it because perception shapes everything we do, and we
							almost never look at how we form it. Two people can live through
							the same moment and come away with different versions of it. I
							wanted a way to look at my own version and see which beliefs are
							steering me.
						</p>
						<p>
							Some questions I had in mind: why do ads and propaganda work? Can
							you escape outside framing, and should you? What actually drives
							your decisions? Even when we feel like we have an answer we
							believe in, is it really the one single answer, or is it just the
							one that fits the current moment inside your body and mind? How do
							you know if your beliefs are true, or just convenient? Is it just
							consistency in a belief that makes it feel true, or is there
							something more?
						</p>
						<p>
							Perceptual mapping might feel aimless and pointless at first.
							That's fine. Part of the exercise is asking why we need an aim at
							all.
						</p>
						<p>
							There's no answer at the end, just what you notice. "I am smart"
							or "I am flawed" can feel fixed, but a different angle or a
							different set of values gives a different answer. Keep what's
							useful, challenge the rest.
						</p>
						<p style={{ marginBottom: 0 }}>— Brian</p>
					</div>
				</div>
			</div>
		</div>
	);
}
