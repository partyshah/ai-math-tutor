from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
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
        include={
            "student": True,
            "feedback": True,
            "conversations": {
                "orderBy": {"timestamp": "asc"},
                "include": {
                    "session": True  # Include session details in conversations
                }
            }
        },
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
    ts: datetime
    if timestamp:
        try:
            # support "Z" suffix
            normalized = timestamp.replace("Z", "+00:00")
            ts = datetime.fromisoformat(normalized)
            if ts.tzinfo is None:
                ts = ts.replace(tzinfo=timezone.utc)
            else:
                ts = ts.astimezone(timezone.utc)
        except Exception:
            raise ValueError(f"Invalid timestamp format: {timestamp}")
    else:
        ts = datetime.now(timezone.utc)

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
    # Convert incoming items' timestamps to datetime in UTC
    normed = []
    for it in items:
        ts = it.get("timestamp")
        if ts:
            try:
                ts_norm = datetime.fromisoformat(str(ts).replace("Z", "+00:00"))
                if ts_norm.tzinfo is None:
                    ts_norm = ts_norm.replace(tzinfo=timezone.utc)
                else:
                    ts_norm = ts_norm.astimezone(timezone.utc)
            except Exception:
                # You can choose to raise; here we default to "now"
                ts_norm = datetime.now(timezone.utc)
        else:
            ts_norm = datetime.now(timezone.utc)

        normed.append(
            {
                "sessionId": it.get("sessionId"),
                "role": it.get("role"),
                "content": it.get("content"),
                "slideNumber": it.get("slideNumber"),
                "timestamp": ts_norm,
            }
        )

    return db.conversation.create_many(data=normed)


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
