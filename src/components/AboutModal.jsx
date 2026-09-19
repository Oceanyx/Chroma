// src/components/AboutModal.jsx
import React from "react";
import { X, Sparkles } from "lucide-react";

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
						<Sparkles size={24} color="#6C63FF" />
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
						<p>
							Hi, I'm Brian — thank you for taking the time to look at Chroma.
							At its simplest, this is a tool for mapping your experiences: each
							one becomes a planet, and the ways you reflect on it — how it
							felt, how it looked from outside, what you actually did, what
							pattern it fits — orbit that planet as moons. But the mechanics
							are the easy part to explain. Here's why I actually built it.
						</p>
						<p>
							Perception is one of the strangest, most finicky things about
							being human, and given how fundamental it is to consciousness,
							I've come to think it's not just useful but necessary to actually
							sit with how we perceive things. Friends, family, colleagues, even
							adversaries all hand you different vantage points on the same
							moment. Building up — and taking apart — your own perception is
							part of what sharpens the mind on the way toward something like a
							personal, internalized truth. Part of what this project is trying
							to do is help people see patterns: not just in their own thinking,
							but in how belief itself can shape, and sometimes quietly control,
							who we become.
						</p>
						<p>
							As you map out your present and future here, you'll probably hit
							friction — the gap between raw experience and putting it into a
							structure like this is real, and it gets harder the more aimless
							it feels. But I think there's something worth finding on the other
							side of asking why you feel you need an "aim" at all.
						</p>
						<p>
							Take something as simple as a billboard, an ad, a piece of
							propaganda. Why does it work? Can you dodge the framing — and more
							importantly, should you? What makes you, or anyone, act the way
							you do? What's the shape of the whole pattern, not just the one
							moment? Those are close to the questions I built this to sit with.
							Maybe you'll use it that way too — a kind of practice, a mental
							exercise.
						</p>
						<p>
							One limit I keep running into, in myself and everyone else: you
							can't experience something you haven't experienced. Someone else's
							account can get you close — secondhand, through their own
							recollection — but it's never quite the shape of the thing itself.
						</p>
						<p>
							So here's what I actually want for you while you're using this:
							freedom. There's no answer waiting at the end, only observations,
							framings, beliefs. Some will feel real and fixed — "I am smart,"
							"I am ugly" — and none of them are final just because you believe
							them, or because other people keep repeating them back to you. You
							might find a belief here worth taking seriously. You might find
							one worth arguing with instead.
						</p>
						<p>
							Whatever you take from this, or don't, is yours to decide — the
							meaning of every word and category here is up to you. What I've
							built is just scaffolding. What you do with it is the actual
							project.
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
