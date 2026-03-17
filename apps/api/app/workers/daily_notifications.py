from datetime import date

from app.services.notifications import NotificationService


def run_daily_notifications() -> None:
    today = date.today()
    print(f"Daily notification worker placeholder for {today.isoformat()}")
    print("Integrate with Supabase jobs table, SendGrid, and decision auto-generation here.")


if __name__ == "__main__":
    run_daily_notifications()
