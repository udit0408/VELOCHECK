"""VELOCHECK FastAPI server: ESP32 ingestion, dashboard telemetry, service passes & maintenance."""
import json
import os
import sqlite3
from contextlib import closing
from datetime import datetime, timezone
from pathlib import Path
from typing import Literal, Optional

from fastapi import FastAPI, Header, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

ROOT = Path(__file__).resolve().parent
DATABASE = Path("/tmp/velocheck.db") if os.getenv("VERCEL") else (ROOT / "velocheck.db")
API_KEY = os.getenv("VELOCHECK_API_KEY", "")

app = FastAPI(title="VELOCHECK Telemetry & Safety API", version="2.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class ReadingIn(BaseModel):
    device_id: str = Field(min_length=1, max_length=100)
    vehicle_type: Literal["bike", "car"] = "bike"
    wheel: str = Field(default="front", min_length=1, max_length=30)
    tyre_distance_mm: float | None = Field(default=None, ge=0)
    tread_depth_mm: float | None = Field(default=None, ge=0)
    temperature_c: float | None = None
    humidity_percent: float | None = Field(default=None, ge=0, le=100)
    pressure_kpa: float | None = Field(default=None, ge=0)


class ServicePassIn(BaseModel):
    token_id: str
    service_type: str = "TOWING"
    vehicle_type: str = "Hatchback"
    vehicle_number: str = "UP32 AW 7094"
    contact_phone: str
    provider_name: Optional[str] = "Sameer Khan (8383629470)"
    slot_time: Optional[str] = "Immediate Dispatch (ETA ~12 mins)"
    location: Optional[str] = "Hazratganj, Lucknow"
    security_pin: str
    notes: Optional[str] = ""


class MaintenanceLogIn(BaseModel):
    service_date: str
    vehicle_number: str
    service_type: str
    workshop_name: str
    tyre_section: str
    odometer_km: Optional[int] = None
    cost_inr: Optional[float] = None
    notes: Optional[str] = ""


def db_connection() -> sqlite3.Connection:
    connection = sqlite3.connect(DATABASE)
    connection.row_factory = sqlite3.Row
    return connection


def initialise_database() -> None:
    DATABASE.parent.mkdir(parents=True, exist_ok=True)
    with closing(db_connection()) as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS readings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                recorded_at TEXT NOT NULL,
                device_id TEXT NOT NULL,
                vehicle_type TEXT NOT NULL,
                wheel TEXT NOT NULL,
                tyre_distance_mm REAL,
                tread_depth_mm REAL,
                temperature_c REAL,
                humidity_percent REAL,
                pressure_kpa REAL,
                payload TEXT NOT NULL
            )
            """
        )
        connection.execute(
            "CREATE INDEX IF NOT EXISTS idx_readings_lookup "
            "ON readings(vehicle_type, wheel, id DESC)"
        )
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS service_passes (
                token_id TEXT PRIMARY KEY,
                created_at TEXT NOT NULL,
                service_type TEXT NOT NULL,
                vehicle_type TEXT NOT NULL,
                vehicle_number TEXT NOT NULL,
                contact_phone TEXT NOT NULL,
                provider_name TEXT,
                slot_time TEXT,
                location TEXT,
                security_pin TEXT NOT NULL,
                notes TEXT,
                status TEXT DEFAULT 'ACTIVE'
            )
            """
        )
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS maintenance_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                service_date TEXT NOT NULL,
                vehicle_number TEXT NOT NULL,
                service_type TEXT NOT NULL,
                workshop_name TEXT NOT NULL,
                tyre_section TEXT NOT NULL,
                odometer_km INTEGER,
                cost_inr REAL,
                notes TEXT
            )
            """
        )

        cursor = connection.execute("SELECT COUNT(*) FROM readings")
        count = cursor.fetchone()[0]
        if count == 0:
            now = datetime.now(timezone.utc).isoformat()
            demo_readings = [
                (now, "ESP32-BIKE-01", "bike", "front", 18.5, 5.2, 32.4, 48.0, 220.6, "{}"),
                (now, "ESP32-BIKE-01", "bike", "rear", 19.2, 4.8, 34.1, 47.5, 234.4, "{}"),
                (now, "ESP32-CAR-01", "car", "front_left", 22.1, 6.4, 31.8, 45.0, 227.5, "{}"),
                (now, "ESP32-CAR-01", "car", "front_right", 21.9, 6.2, 32.2, 45.2, 225.0, "{}"),
                (now, "ESP32-CAR-01", "car", "rear_left", 22.8, 5.9, 33.0, 46.0, 230.0, "{}"),
                (now, "ESP32-CAR-01", "car", "rear_right", 22.5, 5.8, 33.4, 46.1, 228.0, "{}"),
            ]
            connection.executemany(
                """
                INSERT INTO readings (
                    recorded_at, device_id, vehicle_type, wheel, tyre_distance_mm,
                    tread_depth_mm, temperature_c, humidity_percent, pressure_kpa, payload
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                demo_readings,
            )

            demo_maint = [
                ("2026-09-15", "UP32 AW 7094", "Tyre Rotation & Dynamic Balance", "Velocheck Cyber Hub - Hazratganj", "Front & Rear Axles", 18450, 650.0, "Rotated front to rear cross pattern, balanced 4 wheels"),
                ("2026-07-20", "UP32 AW 7094", "Nitrogen Purge & Bead Seal", "Velocheck Pitstop - Gomti Nagar", "All 4 Tyres", 15200, 350.0, "Repaired micro bead slow leak on FL rim"),
                ("2026-04-10", "UP32 EV 2026", "New Radial Replacement", "Velocheck Highway Express - Shaheed Path", "Front Pair (FL + FR)", 11300, 7800.0, "Fitted Bridgestone Turanza 195/65 R15"),
            ]
            connection.executemany(
                """
                INSERT INTO maintenance_logs (
                    service_date, vehicle_number, service_type, workshop_name, tyre_section, odometer_km, cost_inr, notes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                demo_maint,
            )

        connection.commit()


try:
    initialise_database()
except Exception:
    pass


@app.on_event("startup")
def startup() -> None:
    initialise_database()


def public_reading(row: sqlite3.Row) -> dict:
    reading = dict(row)
    reading.pop("payload", None)
    pressure_kpa = reading.get("pressure_kpa")
    reading["pressure_psi"] = round(pressure_kpa * 0.145037738, 2) if pressure_kpa is not None else None
    return reading


def _value(row: sqlite3.Row, key: str) -> float | None:
    if key == "pressure_psi":
        return round(row["pressure_kpa"] * 0.145037738, 2) if row["pressure_kpa"] is not None else None
    return row[key]


def _average(rows: list[sqlite3.Row], key: str) -> float | None:
    values = [_value(row, key) for row in rows]
    values = [value for value in values if value is not None]
    return round(sum(values) / len(values), 2) if values else None


def require_api_key(authorization: str | None) -> None:
    if not API_KEY:
        return
    expected = f"Bearer {API_KEY}"
    if authorization != expected:
        raise HTTPException(status_code=401, detail="Invalid API key")


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok", "service": "VELOCHECK Telemetry API", "time": datetime.now(timezone.utc).isoformat()}


@app.post("/api/readings", status_code=201)
def create_reading(reading: ReadingIn, authorization: str | None = Header(default=None)) -> dict:
    require_api_key(authorization)
    recorded_at = datetime.now(timezone.utc).isoformat()
    payload = reading.model_dump()
    with closing(db_connection()) as connection:
        cursor = connection.execute(
            """
            INSERT INTO readings (
                recorded_at, device_id, vehicle_type, wheel, tyre_distance_mm,
                tread_depth_mm, temperature_c, humidity_percent, pressure_kpa, payload
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                recorded_at, reading.device_id, reading.vehicle_type, reading.wheel,
                reading.tyre_distance_mm, reading.tread_depth_mm, reading.temperature_c,
                reading.humidity_percent, reading.pressure_kpa, json.dumps(payload),
            ),
        )
        connection.commit()
        row = connection.execute("SELECT * FROM readings WHERE id = ?", (cursor.lastrowid,)).fetchone()
    return {"accepted": True, "reading": public_reading(row)}


@app.get("/api/readings/latest")
def latest_readings(vehicle_type: Literal["bike", "car"] = "bike") -> dict:
    with closing(db_connection()) as connection:
        rows = connection.execute(
            """
            SELECT r.* FROM readings r
            INNER JOIN (
                SELECT wheel, MAX(id) AS newest_id
                FROM readings WHERE vehicle_type = ? GROUP BY wheel
            ) newest ON newest.newest_id = r.id
            """,
            (vehicle_type,),
        ).fetchall()
    return {"vehicle_type": vehicle_type, "readings": {row["wheel"]: public_reading(row) for row in rows}}


@app.get("/api/readings/history")
def reading_history(
    vehicle_type: Literal["bike", "car"] = "bike",
    wheel: str | None = None,
    limit: int = Query(default=10, ge=1, le=100),
) -> dict:
    query = "SELECT * FROM readings WHERE vehicle_type = ?"
    values: list[object] = [vehicle_type]
    if wheel:
        query += " AND wheel = ?"
        values.append(wheel)
    query += " ORDER BY id DESC LIMIT ?"
    values.append(limit)
    with closing(db_connection()) as connection:
        rows = connection.execute(query, values).fetchall()
    return {"vehicle_type": vehicle_type, "readings": [public_reading(row) for row in reversed(rows)]}


@app.get("/api/readings/analytics")
def reading_analytics(
    vehicle_type: Literal["bike", "car"] = "bike",
    wheel: str = "front",
    limit: int = Query(default=20, ge=2, le=100),
) -> dict:
    with closing(db_connection()) as connection:
        rows = connection.execute(
            "SELECT * FROM readings WHERE vehicle_type = ? AND wheel = ? "
            "ORDER BY id DESC LIMIT ?",
            (vehicle_type, wheel, limit),
        ).fetchall()
    rows.reverse()
    if not rows:
        return {
            "vehicle_type": vehicle_type, "wheel": wheel, "count": 0,
            "previous_record": None, "measuring_time": None,
            "average_last_20": {}, "next_predicted_data": {}
        }
    fields = ("pressure_psi", "temperature_c", "tread_depth_mm", "humidity_percent")
    averages = {field: _average(rows, field) for field in fields}
    latest = rows[-1]
    previous = public_reading(rows[-2]) if len(rows) > 1 else None
    prediction: dict[str, float | None] = {}
    for field in fields:
        vals = [_value(row, field) for row in rows]
        vals = [value for value in vals if value is not None]
        if not vals:
            prediction[field] = None
        elif len(vals) == 1:
            prediction[field] = round(vals[-1], 2)
        else:
            prediction[field] = round(vals[-1] + (vals[-1] - vals[0]) / (len(vals) - 1), 2)
    return {
        "vehicle_type": vehicle_type, "wheel": wheel, "count": len(rows),
        "previous_record": previous,
        "measuring_time": latest["recorded_at"],
        "average_last_20": averages,
        "next_predicted_data": prediction,
    }


# Service Passes (Towing & Service Center Tokens)
@app.post("/api/passes", status_code=201)
def create_service_pass(pass_in: ServicePassIn) -> dict:
    created_at = datetime.now(timezone.utc).isoformat()
    with closing(db_connection()) as connection:
        connection.execute(
            """
            INSERT OR REPLACE INTO service_passes (
                token_id, created_at, service_type, vehicle_type, vehicle_number,
                contact_phone, provider_name, slot_time, location, security_pin, notes, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                pass_in.token_id, created_at, pass_in.service_type, pass_in.vehicle_type,
                pass_in.vehicle_number, pass_in.contact_phone, pass_in.provider_name,
                pass_in.slot_time, pass_in.location, pass_in.security_pin, pass_in.notes, "ACTIVE"
            )
        )
        connection.commit()
        row = connection.execute("SELECT * FROM service_passes WHERE token_id = ?", (pass_in.token_id,)).fetchone()
    return {"status": "ok", "pass": dict(row)}


@app.get("/api/passes")
def list_service_passes() -> dict:
    with closing(db_connection()) as connection:
        rows = connection.execute("SELECT * FROM service_passes ORDER BY created_at DESC").fetchall()
    return {"passes": [dict(r) for r in rows]}


# Maintenance History Logs
@app.post("/api/maintenance", status_code=201)
def add_maintenance_log(log_in: MaintenanceLogIn) -> dict:
    with closing(db_connection()) as connection:
        cursor = connection.execute(
            """
            INSERT INTO maintenance_logs (
                service_date, vehicle_number, service_type, workshop_name, tyre_section, odometer_km, cost_inr, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                log_in.service_date, log_in.vehicle_number, log_in.service_type,
                log_in.workshop_name, log_in.tyre_section, log_in.odometer_km,
                log_in.cost_inr, log_in.notes
            )
        )
        connection.commit()
        row = connection.execute("SELECT * FROM maintenance_logs WHERE id = ?", (cursor.lastrowid,)).fetchone()
    return {"status": "ok", "log": dict(row)}


@app.get("/api/maintenance")
def get_maintenance_logs(vehicle_number: Optional[str] = None) -> dict:
    with closing(db_connection()) as connection:
        if vehicle_number:
            rows = connection.execute(
                "SELECT * FROM maintenance_logs WHERE vehicle_number = ? ORDER BY service_date DESC, id DESC",
                (vehicle_number,)
            ).fetchall()
        else:
            rows = connection.execute(
                "SELECT * FROM maintenance_logs ORDER BY service_date DESC, id DESC"
            ).fetchall()
    return {"logs": [dict(r) for r in rows]}


@app.get("/api")
@app.get("/api/")
def api_index() -> dict:
    return {
        "status": "ok",
        "service": "VELOCHECK Telemetry & Safety API",
        "endpoints": {
            "health": "/api/health",
            "latest": "/api/readings/latest",
            "history": "/api/readings/history",
            "analytics": "/api/readings/analytics",
            "passes": "/api/passes",
            "maintenance": "/api/maintenance",
            "docs": "/docs",
        },
    }


# Fallback file serving when running standalone without Next.js dev proxy
static_dir = (ROOT / "www") if (ROOT / "www").is_dir() else ROOT


@app.get("/")
def serve_root():
    for candidate in [static_dir / "index.html", ROOT / "index.html"]:
        if candidate.is_file():
            return FileResponse(candidate)
    return {"status": "ok", "message": "VELOCHECK API is online"}


@app.get("/{page_name:path}")
def serve_page(page_name: str):
    for base in [static_dir, ROOT]:
        target = (base / page_name).resolve()
        if target.is_file() and str(target).startswith(str(ROOT)):
            return FileResponse(target)
        html_target = (base / f"{page_name}.html").resolve()
        if html_target.is_file() and str(html_target).startswith(str(ROOT)):
            return FileResponse(html_target)
    raise HTTPException(status_code=404, detail="Page not found")
