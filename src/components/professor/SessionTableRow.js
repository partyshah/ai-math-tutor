import React, { useState } from "react";
import { Link } from "react-router-dom";
import FeedbackRow from "./FeedbackRow";

function Chevron({ open }) {
	return (
		<span
			className={`inline-block transition-transform ${open ? "rotate-90" : ""}`}
		>
			▶
		</span>
	);
}

function Row({ r }) {
	const [open, setOpen] = useState(false);
	const studentName = r.student?.name || "—";
	const created = r.createdAt ? new Date(r.createdAt).toLocaleString() : "—";
	const completed = r.completedAt
		? new Date(r.completedAt).toLocaleString()
		: "—";
	const status = r.status || "—";
	const hasFeedback = !!r.feedback;

	return (
		<>
			<tr className="border-b">
				<td className="py-2 pl-2">
					<button
						type="button"
						onClick={() => setOpen((v) => !v)}
						className="inline-flex items-center gap-2"
						aria-expanded={open}
						aria-label={open ? "Collapse feedback" : "Expand feedback"}
					>
						<Chevron open={open} />
						<span className="underline decoration-dotted">Details</span>
					</button>
				</td>
				<td className="py-2">{studentName}</td>
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

			{/* Expanded panel */}
			{open && (
				<tr className="border-b bg-white">
					<td
						colSpan={7}
						className="p-0"
					>
						<FeedbackRow sessionId={r.id} />
					</td>
				</tr>
			)}
		</>
	);
}

export default function SessionTableRow({ rows = [], busy = false }) {
	if (busy && (!rows || rows.length === 0)) {
		return (
			<tr>
				<td
					colSpan="7"
					className="text-center py-4 text-gray-500"
				>
					Loading…
				</td>
			</tr>
		);
	}
	if (!rows || rows.length === 0) {
		return (
			<tr>
				<td
					colSpan="7"
					className="text-center py-4 text-gray-500"
				>
					No sessions found.
				</td>
			</tr>
		);
	}
	return (
		<>
			{rows.map((r) => (
				<Row
					key={r.id}
					r={r}
				/>
			))}
		</>
	);
}
