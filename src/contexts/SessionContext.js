import React, { createContext, useContext, useState, useEffect } from "react";

const SessionCtx = createContext(null);
export function useSession() {
	return useContext(SessionCtx);
}

export function SessionProvider({ children }) {
	const [sessionId, setSessionId] = useState(
		() => localStorage.getItem("sessionId") || ""
	);
	const [studentId, setStudentId] = useState(
		() => localStorage.getItem("studentId") || ""
	);
	const [studentName, setStudentName] = useState(
		() => localStorage.getItem("studentName") || ""
	);

    // TODO: Local Storage?
	useEffect(() => {
		if (sessionId) localStorage.setItem("sessionId", sessionId);
	}, [sessionId]);
	useEffect(() => {
		if (studentId) localStorage.setItem("studentId", studentId);
	}, [studentId]);
	useEffect(() => {
		if (studentName) localStorage.setItem("studentName", studentName);
	}, [studentName]);

	const value = {
		sessionId,
		setSessionId,
		studentId,
		setStudentId,
		studentName,
		setStudentName,
	};
	return <SessionCtx.Provider value={value}>{children}</SessionCtx.Provider>;
}
