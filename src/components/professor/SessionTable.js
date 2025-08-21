import SessionTableRow from "./SessionTableRow";

function SortHeader({
	field,
	label,
	sortField,
	sortDir,
	onSortChange,
	className,
}) {
	const isActive = sortField === field;
	const arrow = !isActive ? "⇅" : sortDir === "asc" ? "↑" : "↓";
	return (
		<th
			className={`py-2 cursor-pointer select-none ${className || ""}`}
			onClick={() => onSortChange(field)}
			aria-sort={
				isActive ? (sortDir === "asc" ? "ascending" : "descending") : "none"
			}
			scope="col"
		>
			<span className={isActive ? "font-semibold" : ""}>
				{label} <span className="opacity-60">{arrow}</span>
			</span>
		</th>
	);
}

// Props: rows, busy, sortField, sortDir, onSortChange
export default function SessionTable({
	rows = [],
	busy = false,
	sortField,
	sortDir,
	onSortChange,
}) {
	return (
		<table className="w-full text-sm border rounded overflow-hidden">
			<thead className="bg-gray-50">
				<tr className="text-left border-b">
					<SortHeader
						field="student"
						label="Student"
						sortField={sortField}
						sortDir={sortDir}
						onSortChange={onSortChange}
						className="pl-2"
					/>
					<th>Session ID</th>
					<SortHeader
						field="createdAt"
						label="Created"
						sortField={sortField}
						sortDir={sortDir}
						onSortChange={onSortChange}
					/>
					<SortHeader
						field="completedAt"
						label="Completed"
						sortField={sortField}
						sortDir={sortDir}
						onSortChange={onSortChange}
					/>
					<SortHeader
						field="status"
						label="Status"
						sortField={sortField}
						sortDir={sortDir}
						onSortChange={onSortChange}
					/>
					<SortHeader
						field="feedback"
						label="Feedback"
						sortField={sortField}
						sortDir={sortDir}
						onSortChange={onSortChange}
					/>
				</tr>
			</thead>
			<tbody>
				<SessionTableRow
					rows={rows}
					busy={busy}
				/>
			</tbody>
		</table>
	);
}

