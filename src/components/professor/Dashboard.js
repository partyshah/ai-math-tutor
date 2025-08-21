import React, { useEffect, useMemo, useState } from "react";
import { listProfessorSessions } from "../../services/api";
import SessionTable from "./SessionTable";

export default function Dashboard() {
	const [rows, setRows] = useState([]);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState("");

	// UI state
	const [query, setQuery] = useState(""); // search by student name
	const [sortField, setSortField] = useState("createdAt"); // 'student' | 'createdAt' | 'completedAt' | 'status' | 'feedback'
	const [sortDir, setSortDir] = useState("desc"); // 'asc' | 'desc'
	const [page, setPage] = useState(1);
	const pageSize = 20;

	const load = async () => {
		setBusy(true);
		setError("");
		try {
			const data = await listProfessorSessions();
			setRows(data || []);
		} catch (e) {
			setError(e?.message || "Failed to load sessions");
		} finally {
			setBusy(false);
		}
	};

	// initial + polling
	useEffect(() => {
		let alive = true;
		(async () => {
			if (!alive) return;
			await load();
		})();
		const id = setInterval(load, 30000);
		return () => {
			alive = false;
			clearInterval(id);
		};
	}, []);

	// Handlers
	const onRefresh = () => load();
	const onSortChange = (field) => {
		if (field === sortField) {
			setSortDir((d) => (d === "asc" ? "desc" : "asc"));
		} else {
			setSortField(field);
			setSortDir("asc");
		}
		setPage(1);
	};

	// Derived: filter → sort → paginate
	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) return rows;
		return rows.filter((r) =>
			(r.student?.name || "").toLowerCase().includes(q)
		);
	}, [rows, query]);

	const sorted = useMemo(() => {
		const arr = [...filtered];
		const dir = sortDir === "asc" ? 1 : -1;
		arr.sort((a, b) => {
			switch (sortField) {
				case "student": {
					const an = (a.student?.name || "").toLowerCase();
					const bn = (b.student?.name || "").toLowerCase();
					return an > bn ? dir : an < bn ? -dir : 0;
				}
				case "createdAt": {
					const at = a.createdAt ? new Date(a.createdAt).getTime() : 0;
					const bt = b.createdAt ? new Date(b.createdAt).getTime() : 0;
					return (at - bt) * dir;
				}
				case "completedAt": {
					const at = a.completedAt ? new Date(a.completedAt).getTime() : 0;
					const bt = b.completedAt ? new Date(b.completedAt).getTime() : 0;
					return (at - bt) * dir;
				}
				case "status": {
					const as = (a.status || "").toString();
					const bs = (b.status || "").toString();
					return as > bs ? dir : as < bs ? -dir : 0;
				}
				case "feedback": {
					// true first (or last) depending on dir
					const af = !!a.feedback;
					const bf = !!b.feedback;
					return (Number(af) - Number(bf)) * dir;
				}
				default:
					return 0;
			}
		});
		return arr;
	}, [filtered, sortField, sortDir]);

	const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
	const paged = useMemo(() => {
		const start = (page - 1) * pageSize;
		return sorted.slice(start, start + pageSize);
	}, [sorted, page, pageSize]);

	const onPageChange = (next) => {
		if (next < 1 || next > totalPages) return;
		setPage(next);
	};

	return (
		<div className="p-6">
			<div className="flex items-center justify-between mb-4">
				<h1 className="text-xl font-semibold">Professor Dashboard</h1>
				<div className="flex items-center gap-2">
					<input
						type="search"
						value={query}
						onChange={(e) => {
							setQuery(e.target.value);
							setPage(1);
						}}
						placeholder="Search by student name…"
						className="border rounded px-3 py-1.5 text-sm"
						aria-label="Search by student name"
					/>
					<button
						onClick={onRefresh}
						className="px-3 py-1.5 text-sm rounded border"
						disabled={busy}
					>
						{busy ? "Refreshing…" : "Refresh"}
					</button>
				</div>
			</div>

			{error && <div className="text-sm text-red-600 mb-2">Error: {error}</div>}
			{busy && !rows.length && (
				<div className="text-sm text-gray-500 mb-2">Loading…</div>
			)}

			<SessionTable
				rows={paged}
				busy={busy}
				sortField={sortField}
				sortDir={sortDir}
				onSortChange={onSortChange}
			/>

			{/* Pagination */}
			<div className="mt-3 flex items-center justify-between text-sm">
				<div>
					Page {page} of {totalPages} • {sorted.length} total
				</div>
				<div className="flex items-center gap-1">
					<button
						className="px-2 py-1 rounded border"
						onClick={() => onPageChange(1)}
						disabled={page === 1}
					>
						« First
					</button>
					<button
						className="px-2 py-1 rounded border"
						onClick={() => onPageChange(page - 1)}
						disabled={page === 1}
					>
						‹ Prev
					</button>
					<button
						className="px-2 py-1 rounded border"
						onClick={() => onPageChange(page + 1)}
						disabled={page === totalPages}
					>
						Next ›
					</button>
					<button
						className="px-2 py-1 rounded border"
						onClick={() => onPageChange(totalPages)}
						disabled={page === totalPages}
					>
						Last »
					</button>
				</div>
			</div>
		</div>
	);
}
