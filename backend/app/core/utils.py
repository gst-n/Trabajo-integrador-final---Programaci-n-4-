from datetime import datetime, timezone


def utcnow() -> datetime:
    """Fecha y hora UTC sin zona horaria (compatible con SQLite y PostgreSQL)."""
    return datetime.now(timezone.utc).replace(tzinfo=None)
