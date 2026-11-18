import json

from sqlalchemy.exc import SQLAlchemyError

from app import main


def test_health_checks_database_connection():
    response = main.health_check()

    assert response["status"] == "healthy"
    assert response["database"] == "connected"
    assert response["database_engine"] == main.engine.dialect.name


def test_health_reports_database_connection_failure(monkeypatch):
    def fail_to_connect():
        raise SQLAlchemyError("database unavailable")

    monkeypatch.setattr(main.engine, "connect", fail_to_connect)
    response = main.health_check()

    assert response.status_code == 503
    assert json.loads(response.body) == {
        "status": "unhealthy",
        "database": "unavailable",
    }
