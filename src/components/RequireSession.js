import React from "react";
import { Navigate } from "react-router-dom";
import { useSession } from "../contexts/SessionContext";

export default function RequireSession({ children }) {
	const { sessionId } = useSession();
	if (!sessionId)
		return (
			<Navigate
				to="/start"
				replace
			/>
		);
	return children;
}
