// src/components/PurposeScreen.jsx
import React, { useState, useEffect, useRef } from "react";
import {
	Sparkles,
	ArrowRight,
	Upload,
	Github,
	Globe,
	Mail,
	Coffee,
	HelpCircle,
	Heart,
} from "lucide-react";
import AboutModal from "./AboutModal";

export default function PurposeScreen({ onComplete, onSkip }) {
	const [formData, setFormData] = useState({
		title: "",
		purpose: "",
		currentState: "",
		orientationQuestion: "",
	});
	const [showAbout, setShowAbout] = useState(false);
	const canvasRef = useRef(null);
	const mousePos = useRef({ x: 0, y: 0 });
	const creatures = useRef([]);

	// Interactive background animation
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;

		// Small stars that drift and gently gather toward the mouse — in the
		// app's actual brand hues (210–256°, the range #4D9FFF through
		// #A78BFA actually falls in), not the generic cyan-blue the old
		// blob creatures used, and previewing the starfield/orbital visual
		// language the rest of the app already uses.
		class Star {
			constructor() {
				this.x = Math.random() * canvas.width;
				this.y = Math.random() * canvas.height;
				this.size = Math.random() * 1.4 + 0.8;
				this.vx = 0;
				this.vy = 0;
				this.hue = Math.random() * 46 + 210;
				this.twinklePhase = Math.random() * Math.PI * 2;
				this.twinkleSpeed = Math.random() * 0.02 + 0.015;
			}

			update(mouseX, mouseY) {
				// Responsive attraction to mouse
				const dx = mouseX - this.x;
				const dy = mouseY - this.y;
				const dist = Math.sqrt(dx * dx + dy * dy);

				if (dist > 30) {
					this.vx += (dx / dist) * 0.12;
					this.vy += (dy / dist) * 0.12;
				}

				// Friction — higher than before so stars track the cursor
				// crisply instead of floating/overshooting past it
				this.vx *= 0.88;
				this.vy *= 0.88;

				// Update position
				this.x += this.vx;
				this.y += this.vy;

				// Wrap around edges
				if (this.x < -20) this.x = canvas.width + 20;
				if (this.x > canvas.width + 20) this.x = -20;
				if (this.y < -20) this.y = canvas.height + 20;
				if (this.y > canvas.height + 20) this.y = -20;

				this.twinklePhase += this.twinkleSpeed;
			}

			draw(ctx) {
				const twinkle = Math.sin(this.twinklePhase) * 0.35 + 0.65;
				const currentSize = this.size;

				ctx.save();
				ctx.translate(this.x, this.y);

				// Soft glow
				const gradient = ctx.createRadialGradient(
					0,
					0,
					0,
					0,
					0,
					currentSize * 5,
				);
				gradient.addColorStop(
					0,
					`hsla(${this.hue}, 85%, 75%, ${0.5 * twinkle})`,
				);
				gradient.addColorStop(
					0.4,
					`hsla(${this.hue}, 80%, 65%, ${0.18 * twinkle})`,
				);
				gradient.addColorStop(1, `hsla(${this.hue}, 80%, 60%, 0)`);
				ctx.fillStyle = gradient;
				ctx.fillRect(
					-currentSize * 5,
					-currentSize * 5,
					currentSize * 10,
					currentSize * 10,
				);

				// Bright core point
				ctx.fillStyle = `hsla(${this.hue}, 90%, 88%, ${0.85 * twinkle})`;
				ctx.beginPath();
				ctx.arc(0, 0, currentSize, 0, Math.PI * 2);
				ctx.fill();

				ctx.restore();
			}
		}

		// Initialize stars
		for (let i = 0; i < 70; i++) {
			creatures.current.push(new Star());
		}

		// Animation loop
		let animationId;
		const animate = () => {
			ctx.fillStyle = "rgba(10, 15, 30, 0.18)";
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			creatures.current.forEach((creature) => {
				creature.update(mousePos.current.x, mousePos.current.y);
				creature.draw(ctx);
			});

			animationId = requestAnimationFrame(animate);
		};

		animate();

		// Mouse tracking
		const handleMouseMove = (e) => {
			mousePos.current = { x: e.clientX, y: e.clientY };
		};

		window.addEventListener("mousemove", handleMouseMove);
		window.addEventListener("resize", () => {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		});

		return () => {
			cancelAnimationFrame(animationId);
			window.removeEventListener("mousemove", handleMouseMove);
		};
	}, []);

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!formData.title.trim()) {
			alert("Please give your perception map a title");
			return;
		}
		onComplete(formData);
	};

	const handleSkip = () => {
		onSkip({
			title: "Untitled Perception Map",
			purpose: "",
			currentState: "",
			orientationQuestion: "",
		});
	};

	const handleImport = () => {
		const input = document.createElement("input");
		input.type = "file";
		input.accept = ".json";
		input.onchange = async (e) => {
			const file = e.target.files[0];
			if (!file) return;

			if (!window.confirm("This will replace the current form. Continue?")) {
				return;
			}

			try {
				const text = await file.text();
				const data = JSON.parse(text);

				if (!data.purposeData && !data.nodes) {
					alert("Invalid perception map file");
					return;
				}

				// If it has purposeData, use it; otherwise check for nodes/edges
				if (data.purposeData) {
					onComplete(data);
				} else {
					alert(
						"This file doesn't contain purpose data. It will be imported on the canvas.",
					);
					onSkip({
						title: "Imported Map",
						purpose: "",
						currentState: "",
						orientationQuestion: "",
					});
				}
			} catch (error) {
				console.error("Import error:", error);
				alert("Failed to import file. Please check the file format.");
			}
		};
		input.click();
	};

	return (
		<div
			style={{
				position: "fixed",
				inset: 0,
				background: "#0A0F1E",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				overflow: "hidden",
			}}>
			{/* Animated background */}
			<canvas
				ref={canvasRef}
				style={{
					position: "absolute",
					top: 0,
					left: 0,
					width: "100%",
					height: "100%",
					pointerEvents: "none",
				}}
			/>

			{/* Logo - Top Left */}
			<div
				style={{
					position: "absolute",
					top: "40px",
					left: "40px",
					zIndex: 2,
					display: "flex",
					alignItems: "center",
					gap: "12px",
				}}>
				<img
					src={`${import.meta.env.BASE_URL}logo.PNG`}
					alt="Chroma Logo"
					style={{
						width: "48px",
						height: "48px",
						filter: "drop-shadow(0 4px 12px rgba(108, 99, 255, 0.4))",
					}}
				/>
				<div>
					<h1
						style={{
							margin: 0,
							fontSize: "28px",
							fontWeight: 700,
							background:
								"linear-gradient(90deg, #6C63FF 0%, #4D9FFF 25%, #A78BFA 50%, #4D9FFF 75%, #6C63FF 100%)",
							backgroundSize: "250% auto",
							WebkitBackgroundClip: "text",
							WebkitTextFillColor: "transparent",
							backgroundClip: "text",
							letterSpacing: "-0.5px",
							display: "inline-block",
							animation: "chromaShimmer 7s ease-in-out infinite",
							filter: "drop-shadow(0 0 0px rgba(108,99,255,0))",
							transform: "scale(1)",
							transition: "filter 0.3s ease, transform 0.3s ease",
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.animationDuration = "1.6s";
							e.currentTarget.style.filter =
								"drop-shadow(0 0 14px rgba(108,99,255,0.65))";
							e.currentTarget.style.transform = "scale(1.035)";
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.animationDuration = "7s";
							e.currentTarget.style.filter =
								"drop-shadow(0 0 0px rgba(108,99,255,0))";
							e.currentTarget.style.transform = "scale(1)";
						}}>
						Chroma
					</h1>
					<p
						style={{
							margin: "4px 0 0 0",
							fontSize: "12px",
							color: "#94A3B8",
							fontWeight: 500,
							letterSpacing: "0.3px",
						}}>
						Your Perception, Amplified.
					</p>
				</div>
			</div>

			{/* Form card */}
			<div
				style={{
					position: "relative",
					zIndex: 1,
					width: "500px",
					maxWidth: "90vw",
					background: "rgba(15, 23, 36, 0.9)",
					backdropFilter: "blur(20px)",
					borderRadius: "20px",
					border: "1px solid rgba(108, 99, 255, 0.3)",
					boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
					padding: "40px",
				}}>
				<div
					style={{
						textAlign: "center",
						marginBottom: "32px",
					}}>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: "10px",
							justifyContent: "center",
							marginBottom: "8px",
						}}>
						<Sparkles size={22} color="#6C63FF" />
						<h2
							style={{
								margin: 0,
								fontSize: "22px",
								fontWeight: 600,
								color: "#E6EEF8",
							}}>
							Begin Mapping
						</h2>
					</div>
					<p
						style={{
							margin: 0,
							color: "#94A3B8",
							fontSize: "14px",
							lineHeight: "1.5",
						}}>
						Each experience becomes a planet — you'll reflect on it from
						different angles: how it felt, how it looked from outside, what you
						actually did.
					</p>
				</div>

				<form onSubmit={handleSubmit}>
					<div style={{ marginBottom: "20px" }}>
						<label
							style={{
								display: "block",
								color: "#E6EEF8",
								fontSize: "13px",
								fontWeight: 500,
								marginBottom: "6px",
							}}>
							Map Title <span style={{ color: "#6C63FF" }}>*</span>
						</label>
						<input
							value={formData.title}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, title: e.target.value }))
							}
							placeholder="e.g., Morning Reflection, Work Tensions..."
							style={{
								width: "100%",
								padding: "12px 14px",
								background: "rgba(30, 41, 59, 0.6)",
								border: "1px solid rgba(148, 163, 184, 0.3)",
								borderRadius: "8px",
								color: "#E6EEF8",
								fontSize: "14px",
								outline: "none",
								transition: "all 0.2s",
								boxSizing: "border-box",
							}}
							onFocus={(e) => {
								e.currentTarget.style.borderColor = "#6C63FF";
								e.currentTarget.style.boxShadow =
									"0 0 0 3px rgba(108, 99, 255, 0.1)";
							}}
							onBlur={(e) => {
								e.currentTarget.style.borderColor = "rgba(148, 163, 184, 0.3)";
								e.currentTarget.style.boxShadow = "none";
							}}
						/>
					</div>

					<div style={{ marginBottom: "20px" }}>
						<label
							style={{
								display: "block",
								color: "#E6EEF8",
								fontSize: "13px",
								fontWeight: 500,
								marginBottom: "6px",
							}}>
							Session Purpose
						</label>
						<textarea
							value={formData.purpose}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, purpose: e.target.value }))
							}
							placeholder="What are you hoping to understand?"
							rows={2}
							style={{
								width: "100%",
								padding: "12px 14px",
								background: "rgba(30, 41, 59, 0.6)",
								border: "1px solid rgba(148, 163, 184, 0.3)",
								borderRadius: "8px",
								color: "#E6EEF8",
								fontSize: "14px",
								outline: "none",
								transition: "all 0.2s",
								resize: "vertical",
								fontFamily: "inherit",
								boxSizing: "border-box",
							}}
							onFocus={(e) => {
								e.currentTarget.style.borderColor = "#6C63FF";
								e.currentTarget.style.boxShadow =
									"0 0 0 3px rgba(108, 99, 255, 0.1)";
							}}
							onBlur={(e) => {
								e.currentTarget.style.borderColor = "rgba(148, 163, 184, 0.3)";
								e.currentTarget.style.boxShadow = "none";
							}}
						/>
					</div>

					<div style={{ marginBottom: "20px" }}>
						<label
							style={{
								display: "block",
								color: "#E6EEF8",
								fontSize: "13px",
								fontWeight: 500,
								marginBottom: "6px",
							}}>
							Current State
						</label>
						<textarea
							value={formData.currentState}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									currentState: e.target.value,
								}))
							}
							placeholder="How are you feeling right now?"
							rows={2}
							style={{
								width: "100%",
								padding: "12px 14px",
								background: "rgba(30, 41, 59, 0.6)",
								border: "1px solid rgba(148, 163, 184, 0.3)",
								borderRadius: "8px",
								color: "#E6EEF8",
								fontSize: "14px",
								outline: "none",
								transition: "all 0.2s",
								resize: "vertical",
								fontFamily: "inherit",
								boxSizing: "border-box",
							}}
							onFocus={(e) => {
								e.currentTarget.style.borderColor = "#6C63FF";
								e.currentTarget.style.boxShadow =
									"0 0 0 3px rgba(108, 99, 255, 0.1)";
							}}
							onBlur={(e) => {
								e.currentTarget.style.borderColor = "rgba(148, 163, 184, 0.3)";
								e.currentTarget.style.boxShadow = "none";
							}}
						/>
					</div>

					<div style={{ marginBottom: "28px" }}>
						<label
							style={{
								display: "block",
								color: "#E6EEF8",
								fontSize: "13px",
								fontWeight: 500,
								marginBottom: "6px",
							}}>
							Guiding Question
						</label>
						<textarea
							value={formData.orientationQuestion}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									orientationQuestion: e.target.value,
								}))
							}
							placeholder="What question are you holding?"
							rows={2}
							style={{
								width: "100%",
								padding: "12px 14px",
								background: "rgba(30, 41, 59, 0.6)",
								border: "1px solid rgba(148, 163, 184, 0.3)",
								borderRadius: "8px",
								color: "#E6EEF8",
								fontSize: "14px",
								outline: "none",
								transition: "all 0.2s",
								resize: "vertical",
								fontFamily: "inherit",
								boxSizing: "border-box",
							}}
							onFocus={(e) => {
								e.currentTarget.style.borderColor = "#6C63FF";
								e.currentTarget.style.boxShadow =
									"0 0 0 3px rgba(108, 99, 255, 0.1)";
							}}
							onBlur={(e) => {
								e.currentTarget.style.borderColor = "rgba(148, 163, 184, 0.3)";
								e.currentTarget.style.boxShadow = "none";
							}}
						/>
					</div>

					<button
						type="button"
						onClick={handleImport}
						style={{
							width: "100%",
							padding: "12px",
							background: "rgba(16, 185, 129, 0.1)",
							border: "1px solid rgba(16, 185, 129, 0.3)",
							borderRadius: "8px",
							color: "#10B981",
							fontSize: "14px",
							fontWeight: 500,
							cursor: "pointer",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							gap: "8px",
							transition: "all 0.2s",
							marginBottom: "12px",
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.background = "rgba(16, 185, 129, 0.2)";
							e.currentTarget.style.borderColor = "rgba(16, 185, 129, 0.5)";
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.background = "rgba(16, 185, 129, 0.1)";
							e.currentTarget.style.borderColor = "rgba(16, 185, 129, 0.3)";
						}}>
						<Upload size={18} /> Import Existing Map
					</button>

					<button
						type="submit"
						style={{
							width: "100%",
							padding: "14px",
							background: "linear-gradient(135deg, #6C63FF 0%, #A78BFA 100%)",
							border: "none",
							borderRadius: "8px",
							color: "#fff",
							fontSize: "15px",
							fontWeight: 600,
							cursor: "pointer",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							gap: "8px",
							transition: "all 0.2s",
							boxShadow: "0 4px 12px rgba(108, 99, 255, 0.3)",
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.transform = "translateY(-2px)";
							e.currentTarget.style.boxShadow =
								"0 6px 20px rgba(108, 99, 255, 0.4)";
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.transform = "translateY(0)";
							e.currentTarget.style.boxShadow =
								"0 4px 12px rgba(108, 99, 255, 0.3)";
						}}>
						Begin Mapping <ArrowRight size={18} />
					</button>

					<button
						type="button"
						onClick={handleSkip}
						style={{
							width: "100%",
							marginTop: "10px",
							padding: "6px",
							background: "transparent",
							border: "none",
							color: "#94A3B8",
							fontSize: "12px",
							cursor: "pointer",
							transition: "color 0.2s",
						}}
						onMouseEnter={(e) => (e.currentTarget.style.color = "#94A3B8")}
						onMouseLeave={(e) => (e.currentTarget.style.color = "#94A3B8")}>
						Skip for now
					</button>
				</form>
			</div>
			{/* What's This Button - Bottom Left */}
			<button
				onClick={() => setShowAbout(true)}
				title="A note from the creator"
				style={{
					position: "fixed",
					bottom: "20px",
					left: "20px",
					zIndex: 2,
					padding: "14px",
					background:
						"linear-gradient(135deg, rgba(108, 99, 255, 0.2) 0%, rgba(77, 159, 255, 0.1) 100%)",
					backdropFilter: "blur(10px)",
					border: "1px solid rgba(108, 99, 255, 0.3)",
					borderRadius: "50%",
					color: "#6C63FF",
					cursor: "pointer",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					transition: "all 0.2s",
					boxShadow: "0 4px 12px rgba(108, 99, 255, 0.2)",
				}}
				onMouseEnter={(e) => {
					e.currentTarget.style.transform = "scale(1.1)";
					e.currentTarget.style.boxShadow =
						"0 6px 20px rgba(108, 99, 255, 0.4)";
				}}
				onMouseLeave={(e) => {
					e.currentTarget.style.transform = "scale(1)";
					e.currentTarget.style.boxShadow =
						"0 4px 12px rgba(108, 99, 255, 0.2)";
				}}>
				<Heart size={28} />
			</button>

			{/* About Modal */}
			{showAbout && <AboutModal onClose={() => setShowAbout(false)} />}

			{/* Footer - Socials & Copyright */}
			<div
				style={{
					position: "fixed",
					bottom: "20px",
					right: "20px",
					zIndex: 2,
					display: "flex",
					flexDirection: "column",
					alignItems: "flex-end",
					gap: "12px",
				}}>
				{/* Social Links */}
				<div
					style={{
						display: "flex",
						gap: "12px",
						padding: "12px",
						background: "rgba(15, 23, 36, 0.8)",
						backdropFilter: "blur(10px)",
						borderRadius: "12px",
						border: "1px solid rgba(108, 99, 255, 0.2)",
					}}>
					<a
						href="https://github.com/Oceanyx/Chroma"
						target="_blank"
						rel="noopener noreferrer"
						style={{ color: "#88CCFF", transition: "transform 0.2s" }}
						onMouseEnter={(e) =>
							(e.currentTarget.style.transform = "scale(1.1)")
						}
						onMouseLeave={(e) =>
							(e.currentTarget.style.transform = "scale(1)")
						}>
						<Github size={24} />
					</a>
					<a
						href="https://oceanyx.github.io"
						target="_blank"
						rel="noopener noreferrer"
						style={{ color: "#4D9FFF", transition: "transform 0.2s" }}
						onMouseEnter={(e) =>
							(e.currentTarget.style.transform = "scale(1.1)")
						}
						onMouseLeave={(e) =>
							(e.currentTarget.style.transform = "scale(1)")
						}>
						<Globe size={24} />
					</a>
					<a
						href="mailto:bchanyx@gmail.com"
						style={{ color: "#10B981", transition: "transform 0.2s" }}
						onMouseEnter={(e) =>
							(e.currentTarget.style.transform = "scale(1.1)")
						}
						onMouseLeave={(e) =>
							(e.currentTarget.style.transform = "scale(1)")
						}>
						<Mail size={24} />
					</a>
					<a
						href="https://ko-fi.com/oceanyx"
						target="_blank"
						rel="noopener noreferrer"
						style={{ color: "#FF5E5B", transition: "transform 0.2s" }}
						onMouseEnter={(e) =>
							(e.currentTarget.style.transform = "scale(1.1)")
						}
						onMouseLeave={(e) =>
							(e.currentTarget.style.transform = "scale(1)")
						}>
						<Coffee size={24} />
					</a>
				</div>

				{/* Copyright */}
				<div
					style={{
						fontSize: "12px",
						color: "#94A3B8",
						textAlign: "right",
					}}>
					© 2026 Oceanyx · Brian Chan
				</div>
			</div>
		</div>
	);
}
