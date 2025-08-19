from services.db import db


# CRUD helpers
# TODO: replace the “create student by name” shortcut with real auth + student context.
# For now it unblocks persistence.
async def create_student(name: str):
    return db.student.create(data={"name": name})


async def save_feedback(
    session_id: int, overall_feedback: str, presentation_score: int | None = None
):
    return db.feedback.create(
        data={
            "sessionId": session_id,
            "overallFeedback": overall_feedback,
            "presentationScore": presentation_score,
        }
    )


async def create_session(
    student_id: int, slide_count: int | None = None, pdf_url: str | None = None
):
    return db.session.create(
        data={
            "studentId": student_id,
            "slideCount": slide_count,
            "pdfUrl": pdf_url,
            "status": "created",
        }
    )


async def get_session(session_id: int):
    return db.session.find_unique(
        where={"id": session_id},
        include={"student": True, "feedback": True, "conversations": True},
    )


# fetch all student sessions with feedback
async def list_sessions():
    return db.session.find_many(include={"student": True, "feedback": True})


# TODO:
# - implement get_all_sessions
