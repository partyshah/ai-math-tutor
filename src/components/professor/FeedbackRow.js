import React, { useEffect, useMemo, useRef, useState } from "react";
import { getProfessorSession, markSessionReviewed } from "../../services/api";
import FeedbackDisplay from "../feedback/FeedbackDisplay";


function convertDbFeedbackToDisplay(feedback) {
	// Render DB feedback as "legacy" text for now, so it shows in the same UI.
	// You can later enhance this to a fully structured object if you store slides, qa, etc. in DB.
	const parts = [];
	if (feedback.presentationScore != null) {
		parts.push(`Presentation Score: ${feedback.presentationScore}`);
	}
	if (feedback.overallFeedback) {
		parts.push(`\nOverall Feedback:\n${feedback.overallFeedback}`);
	}
	if (feedback.slideFeedback) {
		parts.push(`\nSlide Feedback:\n${feedback.slideFeedback}`);
	}
	if (feedback.strengths) {
		parts.push(`\nStrengths:\n${feedback.strengths}`);
	}
	if (feedback.improvements) {
		parts.push(`\nImprovements:\n${feedback.improvements}`);
	}
	const text = parts.join("\n").trim();
	return {
		feedback_type: "legacy",
		slides: [],
		qa_feedback: null,
		legacy_text: text || "No feedback text provided.",
	};
}

/**
 * Props:
 * - sessionId: string
 * - onReviewed?: (updated) => void
 * - defaultOpen?: boolean   // parent controls mount/unmount; we still animate
 */
export default function FeedbackRow({
	sessionId,
	onReviewed,
	defaultOpen = true,
}) {
	const [loading, setLoading] = useState(true);
	const [err, setErr] = useState("");
	const [session, setSession] = useState(null);
	const [animReady, setAnimReady] = useState(false); // to trigger CSS transition after mount
	const panelRef = useRef(null);

	useEffect(() => {
		let alive = true;
		(async () => {
			setLoading(true);
			setErr("");
			try {
				const data = await getProfessorSession(sessionId);
				if (alive) setSession(data);
			} catch (e) {
				if (alive) setErr(e?.message || "Failed to load feedback");
			} finally {
				if (alive) setLoading(false);
				// allow next tick so height is measured after render
				requestAnimationFrame(() => setAnimReady(true));
			}
		})();
		return () => {
			alive = false;
		};
	}, [sessionId]);

	const feedback = session?.feedback || null;
	const meta = useMemo(() => {
		const created = session?.createdAt
			? new Date(session.createdAt).toLocaleString()
			: "—";
		const completed = session?.completedAt
			? new Date(session.completedAt).toLocaleString()
			: "—";
		const slides = session?.slideCount ?? "—";
		// audio duration not persisted; show em dash for now
		return { created, completed, slides, audio: "—" };
	}, [session]);

	async function onMarkReviewed() {
		try {
			const updated = await markSessionReviewed(sessionId, true);
			setSession((prev) => ({
				...(prev || {}),
				feedback: { ...(prev?.feedback || {}), ...updated },
			}));
			onReviewed?.(updated);
		} catch (e) {
			alert(e?.message || "Failed to mark as reviewed");
		}
	}

	// Printing
	function handlePrint() {
		window.print();
	}

	// Export to PDF (lazy import to avoid adding bundle weight upfront)
	async function handleExportPdf() {
		try {
			const [{ jsPDF }, html2canvas] = await Promise.all([
				import("jspdf"),
				import("html2canvas"),
			]);
			const node = panelRef.current;
			if (!node) return;
			const canvas = await html2canvas.default(node, {
				scale: 2,
				useCORS: true,
				backgroundColor: "#ffffff",
			});
			const imgData = canvas.toDataURL("image/png");
			const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
			const pageWidth = pdf.internal.pageSize.getWidth();
			const pageHeight = pdf.internal.pageSize.getHeight();
			const imgWidth = pageWidth - 64; // margins
			const imgHeight = (canvas.height * imgWidth) / canvas.width;
			const x = 32;
			let y = 32;

			// paginate if longer than one page
			if (imgHeight <= pageHeight - 64) {
				pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);
			} else {
				// simple slice into pages
				let remaining = imgHeight;
				let position = 0;
				const pageCanvas = document.createElement("canvas");
				const ctx = pageCanvas.getContext("2d");
				const sliceHeight = ((pageHeight - 64) * canvas.width) / imgWidth;

				pageCanvas.width = canvas.width;
				pageCanvas.height = sliceHeight;

				while (remaining > 0) {
					ctx.clearRect(0, 0, pageCanvas.width, pageCanvas.height);
					ctx.drawImage(
						canvas,
						0,
						position,
						canvas.width,
						sliceHeight,
						0,
						0,
						pageCanvas.width,
						pageCanvas.height
					);
					const pageImg = pageCanvas.toDataURL("image/png");
					pdf.addImage(pageImg, "PNG", x, y, imgWidth, pageHeight - 64);
					remaining -= pageHeight - 64;
					position += sliceHeight;
					if (remaining > 0) pdf.addPage();
				}
			}

			pdf.save(`feedback_${sessionId.slice(0, 8)}.pdf`);
		} catch (e) {
			console.error(e);
			alert("Failed to export PDF");
		}
	}

	return (
		<div
			ref={panelRef}
			className={`overflow-hidden transition-[max-height] duration-300 ${
				animReady ? "max-h-[2000px]" : "max-h-0"
			}`}
		>
			<div className="p-4 bg-gray-50 border-t">
				{/* Meta */}
				<div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 mb-3">
					<div>
						<span className="font-medium">Created:</span> {meta.created}
					</div>
					<div>
						<span className="font-medium">Completed:</span> {meta.completed}
					</div>
					<div>
						<span className="font-medium">Slides:</span> {meta.slides}
					</div>
					<div>
						<span className="font-medium">Audio:</span> {meta.audio}
					</div>
					{feedback?.viewedByProfessor && (
						<div className="text-green-700">Reviewed ✓</div>
					)}
				</div>

				{/* Actions */}
				<div className="flex gap-2 mb-3">
					<button
						onClick={handlePrint}
						className="px-3 py-1 text-sm border rounded"
					>
						Print
					</button>
					<button
						onClick={handleExportPdf}
						className="px-3 py-1 text-sm border rounded"
					>
						Export PDF
					</button>
					{!feedback?.viewedByProfessor && (
						<button
							onClick={onMarkReviewed}
							className="px-3 py-1 text-sm rounded bg-blue-600 text-white"
						>
							Mark as Reviewed
						</button>
					)}
				</div>

				{/* Content */}
				{loading ? (
					<div className="text-sm text-gray-500">Loading feedback…</div>
				) : err ? (
					<div className="text-sm text-red-600">Error: {err}</div>
				) : feedback ? (
					<FeedbackDisplay
						data={convertDbFeedbackToDisplay(feedback)}
						readOnly
					/>
				) : (
					<div className="text-sm text-gray-500">
						No feedback saved for this session.
					</div>
				)}
			</div>
		</div>
	);
}
