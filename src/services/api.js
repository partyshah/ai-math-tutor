import { ENDPOINTS } from "../constants";

// --- Sesssions ---
export async function createSession({ studentName, slideCount, pdfUrl }) {
	const r = await fetch(ENDPOINTS.session.create, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ studentName, slideCount, pdfUrl }),
	});
	if (!r.ok) throw new Error(`createSession failed: ${r.status}`);
	return r.json();
}

export async function patchSession(
	sessionId,
	{ slideCount, status, pdfUrl, completedAt }
) {
	const r = await fetch(ENDPOINTS.session.patch(sessionId), {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ slideCount, status, pdfUrl, completedAt }),
	});
	if (!r.ok) throw new Error(`patchSession failed: ${r.status}`);
	return r.json();
}

export async function listProfessorSessions() {
	const r = await fetch(ENDPOINTS.professor.sessions);
	if (!r.ok) throw new Error(`listProfessorSessions failed: ${r.status}`);
	return r.json();
}

export async function getProfessorSession(id) {
	const r = await fetch(ENDPOINTS.professor.session(id));
	if (!r.ok) throw new Error(`getProfessorSession failed: ${r.status}`);
	return r.json();
}

export async function markSessionReviewed(sessionId, reviewed = true) {
	const r = await fetch(ENDPOINTS.professor.markReviewed(sessionId), {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ reviewed }),
	});
	if (!r.ok) throw new Error(`markSessionReviewed failed: ${r.status}`);
	return r.json();
}

// --- Chat ---
export async function createChat({
	sessionId,
	messages,
	selectedAssignment,
	slideNumber,
}) {
	const timestamp = new Date().toISOString();
	const response = await fetch(ENDPOINTS.chat, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			sessionId,
			messages,
			selectedAssignment,
			slideNumber,
			timestamp,
		}),
	});

	return response;
}

// TODO: After new endpoint is created, switch to using it
export async function createFormChat(formData) {
	formData.append("timestamp", new Date().toISOString());
	const response = await fetch(ENDPOINTS.chat, {
		method: "POST",
		body: formData,
	});
	if (!response.ok) throw new Error(`createFormChat failed ${response.status}`);
	return response;
}

// --- Conversations ---
export async function logConversation({
	sessionId,
	role,
	content,
	slideNumber,
	timestamp,
}) {
	const r = await fetch(ENDPOINTS.session.conversations(sessionId), {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ role, content, slideNumber, timestamp }),
	});
	if (!r.ok) throw new Error(`logConversation failed ${r.status}`);
	return r.json();
}

// --- Feedback ---
export async function saveFeedback({
	sessionId,
	overallFeedback = "",
	presentationScore = null,
	slideFeedback = null,
	strengths = null,
	improvements = null,
}) {
	const r = await fetch(ENDPOINTS.feedback.create, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			sessionId,
			overallFeedback,
			presentationScore,
			slideFeedback,
			strengths,
			improvements,
		}),
	});
	if (!r.ok) throw new Error(`saveFeedback failed ${r.status}`);
	return r.json();
}

export async function loadTestFeedback() {
	const r = await fetch(ENDPOINTS.feedback.test);
	if (!r.ok) throw new Error(`loadTestFeedback failed ${r.status}`);
	return r.json();
}