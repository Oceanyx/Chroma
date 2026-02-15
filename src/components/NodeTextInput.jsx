// src/components/NodeTextInput.jsx
import React, { useState, useRef, useEffect } from "react";

export default function NodeTextInput({
	position,
	nodeType,
	onSave,
	onCancel,
}) {
	const [text, setText] = useState("");
	const textareaRef = useRef(null);

	useEffect(() => {
		textareaRef.current?.focus();
	}, []);

	const handleKeyDown = (e) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			if (text.trim()) {
				onSave(text.trim());
			}
		}
		if (e.key === "Escape") {
			onCancel();
		}
	};

	const typeConfig = {
		O: { label: "Observation", color: "#3B82F6", emoji: "👁️" },
		A: { label: "Action", color: "#F97316", emoji: "⚡" },
		I: { label: "Intention", color: "#FBBF24", emoji: "🎯" },
	};

	const config = typeConfig[nodeType];

	return (
		<>
			{/* Backdrop */}
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

			{/* Input Card */}
			<div
				style={{
					position: "fixed",
					left: position.x,
					top: position.y,
					transform: "translate(-50%, -50%)",
					width: "380px",
					maxWidth: "90vw",
					padding: "20px",
					background: "rgba(30, 41, 59, 0.98)",
					backdropFilter: "blur(20px)",
					border: `2px solid ${config.color}`,
					borderRadius: "16px",
					boxShadow: "0 12px 40px rgba(0,0,0,0.8)",
					zIndex: 500,
					animation: "scaleIn 0.2s ease",
				}}>
				{/* Header */}
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						marginBottom: "16px",
					}}>
					<div
						style={{
							padding: "6px 12px",
							background: `${config.color}20`,
							border: `1px solid ${config.color}`,
							borderRadius: "12px",
							fontSize: "13px",
							fontWeight: 600,
							color: "#E6EEF8",
							display: "flex",
							alignItems: "center",
							gap: "8px",
						}}>
						<span>{config.emoji}</span>
						<span>{config.label}</span>
					</div>
					<button
						onClick={onCancel}
						style={{
							width: "28px",
							height: "28px",
							border: "none",
							background: "transparent",
							color: "#64748B",
							fontSize: "20px",
							cursor: "pointer",
							transition: "all 0.2s",
							borderRadius: "4px",
						}}
						onMouseEnter={(e) => {
							e.target.style.color = "#E6EEF8";
							e.target.style.background = "rgba(255,255,255,0.1)";
						}}
						onMouseLeave={(e) => {
							e.target.style.color = "#64748B";
							e.target.style.background = "transparent";
						}}>
						✕
					</button>
				</div>

				{/* Text Input */}
				<textarea
					ref={textareaRef}
					value={text}
					onChange={(e) => setText(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder={
						nodeType === "O"
							? "What did you notice?"
							: nodeType === "A"
								? "What did you do?"
								: "What do you intend to change?"
					}
					maxLength={200}
					rows={4}
					style={{
						width: "100%",
						padding: "12px",
						background: "rgba(15, 23, 36, 0.6)",
						border: `1px solid ${config.color}40`,
						borderRadius: "8px",
						color: "#E6EEF8",
						fontSize: "14px",
						fontFamily: "inherit",
						resize: "vertical",
						outline: "none",
						transition: "all 0.2s",
						boxSizing: "border-box",
						lineHeight: "1.5",
					}}
					onFocus={(e) => {
						e.target.style.borderColor = config.color;
						e.target.style.boxShadow = `0 0 0 3px ${config.color}20`;
					}}
					onBlur={(e) => {
						e.target.style.borderColor = `${config.color}40`;
						e.target.style.boxShadow = "none";
					}}
				/>

				{/* Footer */}
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						marginTop: "12px",
					}}>
					<span
						style={{
							fontSize: "11px",
							color: text.length > 180 ? "#FB923C" : "#64748B",
							fontFamily: "monospace",
						}}>
						{text.length} / 200
					</span>

					<button
						onClick={() => text.trim() && onSave(text.trim())}
						disabled={!text.trim()}
						style={{
							padding: "10px 20px",
							background: text.trim() ? config.color : "rgba(30, 41, 59, 0.6)",
							border: "none",
							borderRadius: "8px",
							color: "white",
							fontSize: "14px",
							fontWeight: 600,
							cursor: text.trim() ? "pointer" : "not-allowed",
							transition: "all 0.2s",
							opacity: text.trim() ? 1 : 0.5,
						}}
						onMouseEnter={(e) => {
							if (text.trim()) {
								e.target.style.transform = "translateY(-2px)";
								e.target.style.boxShadow = `0 4px 12px ${config.color}60`;
							}
						}}
						onMouseLeave={(e) => {
							if (text.trim()) {
								e.target.style.transform = "translateY(0)";
								e.target.style.boxShadow = "none";
							}
						}}>
						Create Node
					</button>
				</div>

				{/* Keyboard Hint */}
				<div
					style={{
						marginTop: "12px",
						fontSize: "11px",
						color: "#64748B",
						textAlign: "center",
						fontStyle: "italic",
					}}>
					Enter to create • Shift+Enter for new line • ESC to cancel
				</div>

				{/* Animation */}
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
