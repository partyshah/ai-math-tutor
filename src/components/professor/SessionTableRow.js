import { Link } from "react-router-dom";

export default function SessionTableRow({ rows = [], busy = false }) {
	let contextText = "No sessions found.";
	if (busy && (!rows || !rows.length)) contextText = "Loading..."
	let content = (
		<tr>
			<td
				colSpan="6"
				className="text-center py-4 text-gray-500"
			>
				{contextText}
			</td>
		</tr>
	);

	if (rows && rows.length && !busy) {
		content = rows.map((r) => {
			const studentName = r.student?.name || "-";
			const created = r.createdAt
				? new Date(r.createdAt).toLocaleString()
				: "—";
			const completed = r.completedAt
				? new Date(r.completedAt).toLocaleString()
				: "—";
			const status = r.status || "—";
			const hasFeedback = !!r.feedback;
			return (
				<tr
					key={r.id}
					className="border-b"
				>
					<td className="py-2 pl-2">{studentName}</td>
					<td className="font-mono">
						<Link
							to={`/professor/session/${r.id}`}
							className="text-blue-600 underline"
						>
							{r.id.slice(0, 8)}…
						</Link>
					</td>
					<td>{created}</td>
					<td>{completed}</td>
					<td className="capitalize">{status}</td>
					<td>{hasFeedback ? "Yes" : "No"}</td>
				</tr>
			);
		});
	}

	return content;
}
