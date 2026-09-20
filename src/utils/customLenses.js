// src/utils/customLenses.js
// Shared storage for user-created lenses. Previously this lived only inside
// MoonSidePanel.jsx, which is why custom lenses were only reachable when
// editing an existing moon — MoonInputCard (the creation flow) had no access
// to them at all.
export const CUSTOM_LENS_KEY = "chroma_custom_lenses";

export function loadCustomLenses() {
	try {
		return JSON.parse(localStorage.getItem(CUSTOM_LENS_KEY) || "[]");
	} catch {
		return [];
	}
}

export function saveCustomLenses(l) {
	localStorage.setItem(CUSTOM_LENS_KEY, JSON.stringify(l));
}

export function addCustomLens({ label, emoji, color, customPrompt }) {
	const lens = {
		id: `custom_${Date.now()}`,
		label: label.trim(),
		emoji: emoji || "🔍",
		color,
		custom: true,
		customPrompt: customPrompt?.trim() || null,
	};
	const updated = [...loadCustomLenses(), lens];
	saveCustomLenses(updated);
	return updated;
}

export function deleteCustomLens(id) {
	const updated = loadCustomLenses().filter((l) => l.id !== id);
	saveCustomLenses(updated);
	return updated;
}
