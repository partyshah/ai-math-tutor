const BASE_API = process.env.REACT_APP_API_URL || "http://localhost:5001/api";

export async function createSession({ studentName, slideCount, pdfUrl }) {
	const r = await fetch(`${BASE_API}/session/create`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ studentName, slideCount, pdfUrl }),
	});
	if (!r.ok) throw new Error(`createSession failed: ${r.status}`);
	return r.json();
}

export async function createChat({
	sessionId,
	messages,
	selectedAssignment,
	slideNumber
}) {
	const timestamp = new Date().toISOString();
	const response = await fetch(`${BASE_API}/chat`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			sessionId,
			messages,
			selectedAssignment,
			slideNumber,
			timestamp,
		}),
	})
	return response
	// if (!response.ok) throw new Error(`createChat failed ${response.status}`);
	// return response.json();
}

export async function createFormChat(formData) {
	formData.append("timestamp", new Date().toISOString());
	const response = await fetch(`${BASE_API}/chat`, {
		method: "POST",
		body: formData,
	});
	if (!response.ok) throw new Error(`createFormChat failed ${response.status}`);
	return response
}

export async function logConversation({
	sessionId,
	role,
	content,
	slideNumber,
	timestamp,
}) {
	const r = await fetch(`${BASE_API}/session/${sessionId}/conversations`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ role, content, slideNumber, timestamp }),
	});
	if (!r.ok) throw new Error(`logConversation failed ${r.status}`);
	return r.json();
}

export async function listProfessorSessions() {
	const r = await fetch(`${BASE_API}/professor/sessions`);
	if (!r.ok) throw new Error(`listProfessorSessions failed: ${r.status}`);
	return r.json();
}

export async function getProfessorSession(id) {
	const r = await fetch(`${BASE_API}/professor/session/${id}`);
	if (!r.ok) throw new Error(`getProfessorSession failed: ${r.status}`);
	return r.json();
}

export async function saveFeedback({
	sessionId,
	overallFeedback,
	presentationScore,
}) {
	const r = await fetch(`${BASE_API}/feedback`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ sessionId, overallFeedback, presentationScore }),
	});
	if (!r.ok) throw new Error(`saveFeedback failed ${r.status}`);
	return r.json();
}
