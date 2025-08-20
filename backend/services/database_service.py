from typing import Optional, List, Dict, Any
import time
from datetime import datetime
from services.db import db


# --- Students ---
# TODO: replace the “create student by name” shortcut with real auth + student context.
# For now it unblocks persistence.
def create_student(name: str):
    return db.student.create(data={"name": name})


def create_session(
    student_id: str,
    slide_count: Optional[int] = None,
    pdf_url: Optional[str] = None,
):
    return db.session.create(
        data={
            "studentId": student_id,
            "slideCount": slide_count,
            "pdfUrl": pdf_url,
            "status": "created",
        }
    )

# --- Sessions ---
def update_session(session_id: str, data: Dict[str, Any]):
    return db.session.update(where={"id": session_id}, data=data)


def get_session(session_id: str):
    return db.session.find_unique(
        where={"id": session_id},
        include={"student": True, "feedback": True, "conversations": True},
    )


# fetch all student sessions with feedback
def list_sessions():
    return db.session.find_many(include={"student": True, "feedback": True})


# --- Conversations ---

def add_conversation(
    session_id: str,
    role: str,
    content: str,
    slide_number: Optional[int] = None,
    timestamp: Optional[str] = None,
):
    ts = None
    if timestamp:
        try:
            ts = datetime.fromisoformat(timestamp.replace("Z", "+00:00"))
        except Exception:
            raise ValueError(f"Invalid timestamp format: {timestamp}")
    else:
        ts = datetime.fromisoformat(time.strftime("%Y-%m-%dT%H:%M:%S.%fZ"))

    return db.conversation.create(
        data={
            "sessionId": session_id,
            "role": role,
            "content": content,
            "slideNumber": slide_number,
            "timestamp": ts,
        }
    )


def add_conversations_bulk(items: List[Dict[str, Any]]):
    # items: [{sessionId, role, content, slideNumber?, timestamp}]
    return db.conversation.create_many(data=items)


# --- Feedback ---
def save_feedback(
    session_id: str,
    overall_feedback: str,
    presentation_score: Optional[int] = None,
    slide_feedback: Optional[str] = None,
    strengths: Optional[str] = None,
    improvements: Optional[str] = None,
):
    return db.feedback.create(
        data={
            "sessionId": session_id,
            "overallFeedback": overall_feedback,
            "presentationScore": presentation_score,
            "slideFeedback": slide_feedback,
            "strengths": strengths,
            "improvements": improvements,
        }
    )
