const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

export async function createSession(studentName, slideCount, pdfUrl) {
	const r = await fetch(`${API}/api/session/create`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ studentName, slideCount, pdfUrl }),
	});
	if (!r.ok) throw new Error("createSession failed");
	return r.json();
}

export async function saveFeedback(
	sessionId,
	overallFeedback,
	presentationScore
) {
	const r = await fetch(`${API}/api/feedback`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ sessionId, overallFeedback, presentationScore }),
	});
	if (!r.ok) throw new Error("saveFeedback failed");
	return r.json();
}

export async function listSessions() {
	const r = await fetch(`${API}/api/professor/sessions`);
	if (!r.ok) throw new Error("listSessions failed");
	return r.json();
}
