// src/components/PurposeModal.jsx
// Fix: the Edit button previously called onEdit, which TopNav wired to just
// close the modal — there was no actual edit mode. This adds one locally.
import React, { useState } from "react";
import { X, Edit2, Target, Check } from "lucide-react";

const fieldStyle = {
	width: "100%",
	fontSize: "14px",
	color: "#E6EEF8",
	lineHeight: "1.6",
	padding: "12px",
	background: "rgba(30, 41, 59, 0.4)",
	borderRadius: "8px",
	border: "1px solid rgba(108,99,255,0.35)",
	fontFamily: "inherit",
	resize: "vertical",
	boxSizing: "border-box",
};

const labelStyle = {
	display: "block",
	fontSize: "12px",
	color: "#94A3B8",
	fontWeight: 500,
	marginBottom: "6px",
	textTransform: "uppercase",
	letterSpacing: "0.5px",
};

export default function PurposeModal({ purposeData, onClose, onSave }) {
	const [isEditing, setIsEditing] = useState(false);
	const [draft, setDraft] = useState(purposeData);

	const startEdit = () => {
		setDraft(purposeData);
		setIsEditing(true);
	};

	const handleSave = () => {
		onSave?.(draft);
		setIsEditing(false);
	};

	const handleCancel = () => {
		setDraft(purposeData);
		setIsEditing(false);
	};

	return (
		<div
			style={{
				position: "fixed",
				inset: 0,
				background: "rgba(0,0,0,0.7)",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				zIndex: 3000,
				backdropFilter: "blur(4px)",
			}}>
			<div
				style={{
					width: "500px",
					maxWidth: "90vw",
					maxHeight: "80vh",
					background: "#161F30",
					borderRadius: "16px",
					border: "1px solid rgba(108, 99, 255, 0.45)",
					boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
					display: "flex",
					flexDirection: "column",
					color: "#E6EEF8",
					overflow: "hidden",
				}}>
				{/* Header */}
				<div
					style={{
						padding: "20px",
						borderBottom: "1px solid rgba(255,255,255,0.1)",
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
					}}>
					<div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
						<Target size={20} color="#6C63FF" />
						<h2 style={{ margin: 0, fontSize: "18px", fontWeight: 600 }}>
							Session Purpose
						</h2>
					</div>
					<div style={{ display: "flex", gap: "8px" }}>
						{isEditing ? (
							<>
								<button
									onClick={handleCancel}
									style={{
										padding: "6px 12px",
										background: "transparent",
										border: "1px solid rgba(255,255,255,0.1)",
										borderRadius: "6px",
										color: "#94A3B8",
										cursor: "pointer",
										fontSize: "13px",
									}}>
									Cancel
								</button>
								<button
									onClick={handleSave}
									style={{
										padding: "6px 12px",
										background: "rgba(108,99,255,0.2)",
										border: "1px solid #6C63FF",
										borderRadius: "6px",
										color: "#A78BFA",
										cursor: "pointer",
										fontSize: "13px",
										display: "flex",
										alignItems: "center",
										gap: "6px",
									}}>
									<Check size={14} /> Save
								</button>
							</>
						) : (
							<button
								onClick={startEdit}
								style={{
									padding: "6px 12px",
									background: "transparent",
									border: "1px solid rgba(255,255,255,0.1)",
									borderRadius: "6px",
									color: "#94A3B8",
									cursor: "pointer",
									fontSize: "13px",
									display: "flex",
									alignItems: "center",
									gap: "6px",
									transition: "all 0.2s",
								}}
								onMouseEnter={(e) => {
									e.target.style.borderColor = "#6C63FF";
									e.target.style.color = "#6C63FF";
								}}
								onMouseLeave={(e) => {
									e.target.style.borderColor = "rgba(255,255,255,0.1)";
									e.target.style.color = "#94A3B8";
								}}>
								<Edit2 size={14} /> Edit
							</button>
						)}
						<button
							onClick={onClose}
							style={{
								background: "transparent",
								border: "none",
								color: "#94A3B8",
								fontSize: "24px",
								cursor: "pointer",
								padding: "0 8px",
							}}>
							×
						</button>
					</div>
				</div>

				{/* Content */}
				<div
					style={{
						flex: 1,
						overflowY: "auto",
						padding: "20px",
					}}>
					<div style={{ marginBottom: "20px" }}>
						<label style={labelStyle}>Map Title</label>
						{isEditing ? (
							<input
								style={{ ...fieldStyle, fontSize: "16px", fontWeight: 600 }}
								value={draft.title || ""}
								onChange={(e) =>
									setDraft((d) => ({ ...d, title: e.target.value }))
								}
							/>
						) : (
							<div
								style={{ fontSize: "18px", color: "#E6EEF8", fontWeight: 600 }}>
								{purposeData.title || "Untitled Map"}
							</div>
						)}
					</div>

					{(isEditing || purposeData.purpose) && (
						<div style={{ marginBottom: "20px" }}>
							<label style={labelStyle}>Purpose</label>
							{isEditing ? (
								<textarea
									rows={3}
									style={fieldStyle}
									value={draft.purpose || ""}
									onChange={(e) =>
										setDraft((d) => ({ ...d, purpose: e.target.value }))
									}
								/>
							) : (
								<div
									style={{
										fontSize: "14px",
										color: "#CBD5E1",
										lineHeight: "1.6",
										padding: "12px",
										background: "rgba(30, 41, 59, 0.4)",
										borderRadius: "8px",
										border: "1px solid rgba(255,255,255,0.05)",
									}}>
									{purposeData.purpose}
								</div>
							)}
						</div>
					)}

					{(isEditing || purposeData.currentState) && (
						<div style={{ marginBottom: "20px" }}>
							<label style={labelStyle}>Current State</label>
							{isEditing ? (
								<textarea
									rows={3}
									style={fieldStyle}
									value={draft.currentState || ""}
									onChange={(e) =>
										setDraft((d) => ({ ...d, currentState: e.target.value }))
									}
								/>
							) : (
								<div
									style={{
										fontSize: "14px",
										color: "#CBD5E1",
										lineHeight: "1.6",
										padding: "12px",
										background: "rgba(30, 41, 59, 0.4)",
										borderRadius: "8px",
										border: "1px solid rgba(255,255,255,0.05)",
									}}>
									{purposeData.currentState}
								</div>
							)}
						</div>
					)}

					{(isEditing || purposeData.orientationQuestion) && (
						<div style={{ marginBottom: "20px" }}>
							<label style={labelStyle}>Guiding Question</label>
							{isEditing ? (
								<textarea
									rows={2}
									style={fieldStyle}
									value={draft.orientationQuestion || ""}
									onChange={(e) =>
										setDraft((d) => ({
											...d,
											orientationQuestion: e.target.value,
										}))
									}
								/>
							) : (
								<div
									style={{
										fontSize: "14px",
										color: "#CBD5E1",
										lineHeight: "1.6",
										padding: "12px",
										background: "rgba(30, 41, 59, 0.4)",
										borderRadius: "8px",
										border: "1px solid rgba(255,255,255,0.05)",
									}}>
									{purposeData.orientationQuestion}
								</div>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
