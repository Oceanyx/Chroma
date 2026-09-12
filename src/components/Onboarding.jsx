// src/components/Onboarding.jsx
// First-run walkthrough. Deliberately a simple step sequence rather than
// coach-marks pointing at live UI elements — anchoring arrows to exact pixel
// positions of dynamic canvas elements is fragile; a plain sequence is
// robust and just as clear. Skip is available on every single step, no
// exceptions — see the Purpose-screen lesson earlier in this project about
// what happens when onboarding can't be exited.
import React, { useState } from "react";
import { X } from "lucide-react";

const steps = [
	{
		title: "Welcome to Chroma",
		body: "This is a space for mapping how you make sense of your own experiences. A few quick things before you start — you can skip this anytime.",
	},
	{
		title: "Planets are your experiences",
		body: "Click anywhere on the empty canvas to create one: an Observation (something you noticed), an Action (something you did), or an Intention (something you're planning).",
	},
	{
		title: "Moons are your reflections",
		body: "Open a planet and add reflections on it — how it felt, how it looked from outside, what you actually did, what pattern it fits. More dimensions unlock the more you reflect.",
	},
	{
		title: "Tools, at the bottom",
		body: "Select opens planets. Connect links two planets together. Group gathers several into a named constellation. Pan moves you around — or just hold Space anytime.",
	},
	{
		title: "You're set",
		body: "If you ever forget any of this, the ? button in the corner brings up a full reference, and can replay this walkthrough too.",
	},
];

export default function Onboarding({ onDone }) {
	const [step, setStep] = useState(0);
	const isLast = step === steps.length - 1;

	return (
		<div
			style={{
				position: "fixed",
				inset: 0,
				background: "rgba(0,0,0,0.6)",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				zIndex: 5000,
				backdropFilter: "blur(4px)",
			}}>
			<div
				style={{
					width: 440,
					maxWidth: "90vw",
					background: "linear-gradient(135deg, #161F30 0%, #1A1F35 100%)",
					borderRadius: 18,
					border: "1px solid rgba(108,99,255,0.4)",
					boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
					padding: "28px 28px 22px",
					color: "#E6EEF8",
					position: "relative",
				}}>
				<button
					onClick={onDone}
					title="Skip"
					style={{
						position: "absolute",
						top: 14,
						right: 14,
						background: "transparent",
						border: "none",
						color: "#7A8FA6",
						cursor: "pointer",
						padding: 4,
					}}>
					<X size={18} />
				</button>

				<div
					style={{
						fontSize: 19,
						fontWeight: 700,
						marginBottom: 12,
						paddingRight: 24,
					}}>
					{steps[step].title}
				</div>
				<div style={{ fontSize: 14, color: "#CBD5E1", lineHeight: 1.6 }}>
					{steps[step].body}
				</div>

				<div
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						marginTop: 26,
					}}>
					<div style={{ display: "flex", gap: 6 }}>
						{steps.map((_, i) => (
							<div
								key={i}
								style={{
									width: 6,
									height: 6,
									borderRadius: "50%",
									background: i === step ? "#A78BFA" : "rgba(255,255,255,0.15)",
								}}
							/>
						))}
					</div>
					<div style={{ display: "flex", gap: 8 }}>
						<button
							onClick={onDone}
							style={{
								padding: "8px 14px",
								background: "transparent",
								border: "none",
								color: "#7A8FA6",
								cursor: "pointer",
								fontSize: 13,
								fontWeight: 600,
							}}>
							Skip
						</button>
						{step > 0 && (
							<button
								onClick={() => setStep((s) => s - 1)}
								style={{
									padding: "8px 14px",
									background: "rgba(255,255,255,0.06)",
									border: "1px solid rgba(255,255,255,0.12)",
									borderRadius: 7,
									color: "#CBD5E1",
									cursor: "pointer",
									fontSize: 13,
									fontWeight: 600,
								}}>
								Back
							</button>
						)}
						<button
							onClick={() => (isLast ? onDone() : setStep((s) => s + 1))}
							style={{
								padding: "8px 16px",
								background: "#6C63FF",
								border: "none",
								borderRadius: 7,
								color: "#fff",
								cursor: "pointer",
								fontSize: 13,
								fontWeight: 700,
							}}>
							{isLast ? "Start" : "Next"}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
