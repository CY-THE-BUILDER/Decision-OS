from datetime import date

from app.models import Decision, NotificationSettings


class NotificationService:
    @staticmethod
    def build_daily_email(settings: NotificationSettings, decision: Decision | None, for_date: date) -> dict[str, str]:
        subject = f"Decision OS Top 3 for {for_date.isoformat()}"
        if not decision or not decision.items:
            body = "Your workspace has no Strategic 3 yet. Open Decision OS to generate today's focus."
        else:
            lines = [f"{item.rank}. {item.task.title}" for item in decision.items]
            body = "Today's Strategic 3:\n" + "\n".join(lines)
        return {"to": settings.channel, "subject": subject, "body": body}
