// src/components/Onboarding.jsx
// First-run walkthrough. Deliberately a simple step sequence rather than
// coach-marks pointing at live UI elements — anchoring arrows to exact pixel
// positions of dynamic canvas elements is fragile; a plain sequence is
// robust and just as clear. Skip is available on every single step, no
// exceptions — see the Purpose-screen lesson earlier in this project about
// what happens when onboarding can't be exited.
import React, { useState } from "react";
import { X } from "lucide-react";

// Small looping demo: a cursor moves to a spot, "clicks" (ripple), and a
// planet fades/scales in. Pure CSS keyframes — no video file, no external
// asset, renders natively at any size, and reuses the app's real colors.
function CreatePlanetDemo() {
	return (
		<div
			style={{
				position: "relative",
				width: "100%",
				height: 140,
				borderRadius: 12,
				background: "rgba(8,13,25,0.6)",
				border: "1px solid rgba(255,255,255,0.08)",
				overflow: "hidden",
				marginTop: 22,
				marginBottom: 18,
			}}>
			<style>{`
				@keyframes chromaDemoCursor {
					0%   { transform: translate(30px, 100px); opacity: 0; }
					12%  { opacity: 1; }
					38%  { transform: translate(190px, 45px); }
					48%  { transform: translate(190px, 45px) scale(0.85); }
					58%  { transform: translate(190px, 45px) scale(1); }
					85%  { opacity: 1; }
					100% { opacity: 0; transform: translate(190px, 45px); }
				}
				@keyframes chromaDemoRipple {
					0%, 44% { opacity: 0; transform: translate(190px, 45px) scale(0.3); }
					50%     { opacity: 0.8; }
					68%     { opacity: 0; transform: translate(190px, 45px) scale(2.4); }
					100%    { opacity: 0; transform: translate(190px, 45px) scale(2.4); }
				}
				@keyframes chromaDemoPlanet {
					0%, 46%  { opacity: 0; transform: translate(190px, 45px) scale(0); }
					60%      { opacity: 1; transform: translate(190px, 45px) scale(1.15); }
					72%      { transform: translate(190px, 45px) scale(1); }
					90%      { opacity: 1; transform: translate(190px, 45px) scale(1); }
					100%     { opacity: 0; transform: translate(190px, 45px) scale(1); }
				}
				.chroma-demo-cursor {
					animation: chromaDemoCursor 3.2s ease-in-out infinite;
				}
				.chroma-demo-ripple {
					animation: chromaDemoRipple 3.2s ease-out infinite;
				}
				.chroma-demo-planet {
					animation: chromaDemoPlanet 3.2s ease-out infinite;
				}
			`}</style>

			{/* Ripple */}
			<div
				className="chroma-demo-ripple"
				style={{
					position: "absolute",
					top: 0,
					left: 0,
					width: 36,
					height: 36,
					marginTop: -18,
					marginLeft: -18,
					borderRadius: "50%",
					border: "2px solid #A78BFA",
				}}
			/>

			{/* Planet appearing */}
			<div
				className="chroma-demo-planet"
				style={{
					position: "absolute",
					top: 0,
					left: 0,
					width: 30,
					height: 30,
					marginTop: -15,
					marginLeft: -15,
					borderRadius: "50%",
					background: "radial-gradient(circle at 35% 30%, #4D9FFF, #2563EB)",
					boxShadow: "0 0 14px rgba(77,159,255,0.6)",
				}}
			/>

			{/* Cursor */}
			<svg
				className="chroma-demo-cursor"
				width="18"
				height="18"
				viewBox="0 0 18 18"
				style={{ position: "absolute", top: 0, left: 0 }}>
				<path
					d="M2 1 L2 15 L6 11.5 L8.5 16.5 L10.5 15.5 L8 10.5 L13 10.5 Z"
					fill="#E6EEF8"
					stroke="#0A0F1C"
					strokeWidth="1"
				/>
			</svg>
		</div>
	);
}

// Demo 2: a moon fades in next to a planet, then traces one full orbit
// around it before fading out at the same point, so the loop resets clean.
// Points are precomputed at 45° steps around center (90,70) radius 40.
function ReflectMoonDemo() {
	return (
		<div
			style={{
				position: "relative",
				width: "100%",
				height: 140,
				borderRadius: 12,
				background: "rgba(8,13,25,0.6)",
				border: "1px solid rgba(255,255,255,0.08)",
				overflow: "hidden",
				marginTop: 22,
				marginBottom: 18,
			}}>
			<style>{`
				@keyframes chromaOrbitMoon {
					0%   { opacity: 0; transform: translate(130px, 70px) scale(0.5); }
					8%   { opacity: 1; transform: translate(130px, 70px) scale(1); }
					19%  { transform: translate(118px, 42px) scale(1); }
					30%  { transform: translate(90px, 30px) scale(1); }
					41%  { transform: translate(62px, 42px) scale(1); }
					52%  { transform: translate(50px, 70px) scale(1); }
					63%  { transform: translate(62px, 98px) scale(1); }
					74%  { transform: translate(90px, 110px) scale(1); }
					85%  { transform: translate(118px, 98px) scale(1); }
					92%  { opacity: 1; transform: translate(130px, 70px) scale(1); }
					100% { opacity: 0; transform: translate(130px, 70px) scale(0.5); }
				}
				.chroma-orbit-moon {
					animation: chromaOrbitMoon 4.5s ease-in-out infinite;
				}
			`}</style>

			{/* Planet, fixed at center */}
			<div
				style={{
					position: "absolute",
					top: 70,
					left: 90,
					width: 44,
					height: 44,
					marginTop: -22,
					marginLeft: -22,
					borderRadius: "50%",
					background: "radial-gradient(circle at 35% 30%, #4D9FFF, #2563EB)",
					boxShadow: "0 0 16px rgba(77,159,255,0.5)",
				}}
			/>

			{/* Orbiting moon */}
			<div
				className="chroma-orbit-moon"
				style={{
					position: "absolute",
					top: 0,
					left: 0,
					width: 16,
					height: 16,
					marginTop: -8,
					marginLeft: -8,
					borderRadius: "50%",
					background: "radial-gradient(circle at 35% 30%, #C4B5FD, #A78BFA)",
					boxShadow: "0 0 10px rgba(167,139,250,0.7)",
				}}
			/>
		</div>
	);
}

// Demo 3: a highlight slides between four mock tool buttons, pausing on
// each — shows "these switch what clicking does" without needing to
// simulate all four distinct behaviors.
function ToolsDemo() {
	const tools = ["Select", "Pan", "Connect", "Group"];
	return (
		<div
			style={{
				position: "relative",
				width: "100%",
				height: 140,
				borderRadius: 12,
				background: "rgba(8,13,25,0.6)",
				border: "1px solid rgba(255,255,255,0.08)",
				overflow: "hidden",
				marginTop: 22,
				marginBottom: 18,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
			}}>
			<style>{`
				@keyframes chromaToolSlide {
					0%, 20%   { transform: translateX(0); }
					25%, 45%  { transform: translateX(64px); }
					50%, 70%  { transform: translateX(128px); }
					75%, 95%  { transform: translateX(192px); }
					100%      { transform: translateX(0); }
				}
				.chroma-tool-highlight {
					animation: chromaToolSlide 4.8s ease-in-out infinite;
				}
			`}</style>
			<div
				style={{
					position: "relative",
					display: "flex",
					gap: 8,
					padding: 4,
					background: "rgba(15,23,36,0.8)",
					borderRadius: 9,
					border: "1px solid rgba(255,255,255,0.08)",
				}}>
				<div
					className="chroma-tool-highlight"
					style={{
						position: "absolute",
						top: 4,
						left: 4,
						width: 56,
						height: 30,
						borderRadius: 6,
						background: "#6C63FF",
					}}
				/>
				{tools.map((t) => (
					<div
						key={t}
						style={{
							position: "relative",
							width: 56,
							height: 30,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							fontSize: 10,
							fontWeight: 700,
							color: "#E6EEF8",
						}}>
						{t}
					</div>
				))}
			</div>
		</div>
	);
}

// Demo 4: cursor clicks the Help button, the Legend panel eases up beneath
// it — a concrete preview of the exact affordance mentioned in this step's
// text, rather than just describing it.
function HelpButtonDemo() {
	return (
		<div
			style={{
				position: "relative",
				width: "100%",
				height: 140,
				borderRadius: 12,
				background: "rgba(8,13,25,0.6)",
				border: "1px solid rgba(255,255,255,0.08)",
				overflow: "hidden",
				marginTop: 22,
				marginBottom: 18,
			}}>
			<style>{`
				@keyframes chromaHelpCursor {
					0%, 10%  { opacity: 0; transform: translate(60px, 100px); }
					22%      { opacity: 1; transform: translate(30px, 108px); }
					34%      { transform: translate(30px, 108px) scale(0.85); }
					44%      { transform: translate(30px, 108px) scale(1); }
					80%      { opacity: 1; transform: translate(30px, 108px); }
					100%     { opacity: 0; transform: translate(30px, 108px); }
				}
				@keyframes chromaHelpRipple {
					0%, 32% { opacity: 0; transform: translate(30px, 108px) scale(0.3); }
					40%     { opacity: 0.8; }
					55%, 100% { opacity: 0; transform: translate(30px, 108px) scale(2.2); }
				}
				@keyframes chromaHelpPanel {
					0%, 36% { opacity: 0; transform: translate(30px, 90px) scale(0.9); }
					55%     { opacity: 1; transform: translate(30px, 20px) scale(1); }
					85%     { opacity: 1; transform: translate(30px, 20px) scale(1); }
					100%    { opacity: 0; transform: translate(30px, 20px) scale(1); }
				}
				.chroma-help-cursor  { animation: chromaHelpCursor 4.2s ease-in-out infinite; }
				.chroma-help-ripple  { animation: chromaHelpRipple 4.2s ease-out infinite; }
				.chroma-help-panel   { animation: chromaHelpPanel 4.2s ease-out infinite; }
			`}</style>

			{/* Legend panel preview, rises up from the button */}
			<div
				className="chroma-help-panel"
				style={{
					position: "absolute",
					top: 0,
					left: 0,
					width: 130,
					height: 70,
					borderRadius: 8,
					background: "rgba(22,31,48,0.95)",
					border: "1px solid rgba(108,99,255,0.4)",
				}}
			/>

			{/* Ripple */}
			<div
				className="chroma-help-ripple"
				style={{
					position: "absolute",
					top: 0,
					left: 0,
					width: 28,
					height: 28,
					marginTop: -14,
					marginLeft: -14,
					borderRadius: "50%",
					border: "2px solid #94A3B8",
				}}
			/>

			{/* Help button */}
			<div
				style={{
					position: "absolute",
					top: 108,
					left: 30,
					width: 24,
					height: 24,
					marginTop: -12,
					marginLeft: -12,
					borderRadius: "50%",
					background: "rgba(15,23,36,0.95)",
					border: "1px solid rgba(255,255,255,0.2)",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					fontSize: 12,
					fontWeight: 700,
					color: "#94A3B8",
				}}>
				?
			</div>

			{/* Cursor */}
			<svg
				className="chroma-help-cursor"
				width="18"
				height="18"
				viewBox="0 0 18 18"
				style={{ position: "absolute", top: 0, left: 0 }}>
				<path
					d="M2 1 L2 15 L6 11.5 L8.5 16.5 L10.5 15.5 L8 10.5 L13 10.5 Z"
					fill="#E6EEF8"
					stroke="#0A0F1C"
					strokeWidth="1"
				/>
			</svg>
		</div>
	);
}

const steps = [
	{
		title: "Welcome to Chroma",
		body: "This is a space for mapping how you make sense of your own experiences. A few quick things before you start — you can skip this anytime.",
	},
	{
		title: "Planets are your experiences",
		body: "Click anywhere on the empty canvas to create one: an Observation (something you noticed), an Action (something you did), an Intention (something you're planning), or a Hypothetical (something you're imagining or wondering about).",
		demo: CreatePlanetDemo,
	},
	{
		title: "Moons are your reflections",
		body: "Open a planet and add reflections on it — how it felt, how it looked from outside, what you actually did, what pattern it fits. Double-click a planet to open it. More dimensions unlock the more you reflect.",
		demo: ReflectMoonDemo,
	},
	{
		title: "Tools, at the bottom",
		body: "Select opens planets. Pan moves you around — or just hold Space anytime. Connect links two planets together. Group gathers several into a named constellation.",
		demo: ToolsDemo,
	},
	{
		title: "You're set",
		body: "If you ever forget any of this, the ? button in the corner brings up a full reference, and can replay this walkthrough too.",
		demo: HelpButtonDemo,
	},
];

export default function Onboarding({ onDone }) {
	const [step, setStep] = useState(0);
	const isLast = step === steps.length - 1;
	const Demo = steps[step].demo;

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
					width: 460,
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

				{Demo && <Demo />}

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
