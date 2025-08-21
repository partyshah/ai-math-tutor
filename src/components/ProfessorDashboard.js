import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listProfessorSessions } from "../services/api";

// TODO: Update css to make it match the rest of the app
export default function ProfessorDashboard() {
	const [rows, setRows] = useState([]);
	const [busy, setBusy] = useState(false);

	useEffect(() => {
		let alive = true;
		async function load() {
			setBusy(true);
			try {
				const data = await listProfessorSessions();
				if (alive) setRows(data);
			} finally {
				if (alive) setBusy(false);
			}
		}
		load();
		const id = setInterval(load, 30000); // simple polling
		return () => {
			alive = false;
			clearInterval(id);
		};
	}, []);

	return (
		<div className="p-6">
			<h1 className="text-xl font-semibold mb-4">Professor Dashboard</h1>
			{busy && <div className="text-sm text-gray-500 mb-2">Loading…</div>}
			<table className="w-full text-sm">
				<thead>
					<tr className="text-left border-b">
						<th className="py-2">Student</th>
						<th>Session ID</th>
						<th>Created</th>
						<th>Feedback?</th>
					</tr>
				</thead>
				<tbody>
					<StudentRows
						rows={rows}
						busy={busy}
					/>
				</tbody>
			</table>
		</div>
	);
}

function StudentRows({ rows = [], busy = false }) {
	let content = (
		<tr>
			<td
				colSpan="4"
				className="text-center py-4 text-gray-500"
			>
				No sessions found.
			</td>
		</tr>
	);

	if (rows && rows.length && !busy) {
		content = rows.map((r) => {
			const studentName = r.student?.name || "-"
			return (
				<tr
					key={r.id}
					className="border-b"
				>
					<td className="py-2">{studentName}</td>
					<td className="font-mono">
						<Link
							to={`/professor/session/${r.id}`}
							className="text-blue-600 underline"
						>
							{r.id.slice(0, 8)}… {/* compact */}
						</Link>
					</td>
					<td>{new Date(r.createdAt).toLocaleString()}</td>
					<td>{r.feedback ? "Yes" : "No"}</td>
				</tr>
			);
		});
	}

	return content;
}
