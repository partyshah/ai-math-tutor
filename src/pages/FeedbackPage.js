import React, { useEffect, useState } from "react";
import FeedbackDisplay from "../components/feedback/FeedbackDisplay";
import { loadTestFeedback } from "../services/api"; // Adjust the import path as needed

export default function FeedbackPage() {
	const [feedbackData, setFeedbackData] = useState(null);
	const [loading, setLoading] = useState(true);

	const goBack = () => window.history.back();

    // TODO: Once tested, wrap this function in development checks
    // TODO: What does /feedback/test return?
    // TODO: Should I just move this whole function into a service file?
	const loadTestFeedback = async () => {
		try {
			const data = await loadTestFeedback();
			if (data?.feedback) {
				const legacyData = {
					feedback_type: "legacy",
					slides: [],
					qa_feedback: null,
					legacy_text: data.feedback,
				};
				localStorage.setItem("pitchFeedback", JSON.stringify(legacyData));
				setFeedbackData(legacyData);
			}
		} catch (error) {
			console.error("Error loading test feedback:", error);
		}
	};

    // TODO: This useEffect is messy. Clean up logic and error handling.
	useEffect(() => {
		const storedFeedback = localStorage.getItem("pitchFeedback");
		if (storedFeedback) {
			try {
				const parsed = JSON.parse(storedFeedback);
				if (parsed.slides) setFeedbackData(parsed);
				else
					setFeedbackData({
						feedback_type: "legacy",
						slides: [],
						qa_feedback: null,
						legacy_text: storedFeedback,
					});
			} catch {
				setFeedbackData({
					feedback_type: "legacy",
					slides: [],
					qa_feedback: null,
					legacy_text: storedFeedback,
				});
			}
		} else {
			setFeedbackData(null);
		}
		setLoading(false);
	}, []);

	if (loading) {
		return (
			<div style={{ padding: 20 }}>
				<h1>Loading Feedback...</h1>
			</div>
		);
	}

	return (
		<FeedbackDisplay
			data={feedbackData}
			readOnly={false}
			onBack={goBack}
			onLoadTest={loadTestFeedback}
		/>
	);
}
