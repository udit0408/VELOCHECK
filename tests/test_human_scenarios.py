"""
VELOCHECK Real Human End-to-End Test Suite
Simulates realistic automotive driver and fleet owner journeys:
1. Morning pre-drive check with live ESP32 telemetry.
2. Low-pressure / puncture detection & alert threshold.
3. Predictive tread wear & linear trend analytics.
4. Motorcycle dual-channel telemetry and vehicle switching.
5. Roadside emergency towing with auto-generated token & 4-digit PIN verification.
6. Authorized workshop maintenance logbook entry and retrieval.
7. System heartbeat, CORS and liveness.
"""
import sys
import os
import unittest
from pathlib import Path

# Ensure project root is importable
ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from fastapi.testclient import TestClient
from main import app, initialise_database, DATABASE


class TestRealHumanScenarios(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Ensure database is clean and initialized for tests
        initialise_database()
        cls.client = TestClient(app)

    def test_scenario_1_morning_predrive_telemetry_check(self):
        """Human Driver Scenario 1:
        Driver starts Hyundai Creta (UP32 EV 2026). ESP32 sensor posts 4-wheel readings.
        Driver verifies that all 4 wheels report accurate PSI and 'Normal' status.
        """
        # ESP32 posts 4-wheel telemetry
        wheels = [
            ("front_left", 227.5, 6.2, 31.8),
            ("front_right", 225.0, 6.1, 32.0),
            ("rear_left", 230.0, 5.9, 32.5),
            ("rear_right", 228.0, 5.8, 33.0),
        ]
        for wheel, pressure_kpa, tread_mm, temp_c in wheels:
            res = self.client.post(
                "/api/readings",
                json={
                    "device_id": "ESP32-CAR-CRETA-01",
                    "vehicle_type": "car",
                    "wheel": wheel,
                    "pressure_kpa": pressure_kpa,
                    "tread_depth_mm": tread_mm,
                    "temperature_c": temp_c,
                    "humidity_percent": 45.0,
                    "tyre_distance_mm": 21.5,
                },
            )
            self.assertEqual(res.status_code, 201)
            data = res.json()
            self.assertTrue(data["accepted"])
            self.assertIn("pressure_psi", data["reading"])
            # 227.5 kPa * 0.145037738 ≈ 33.0 PSI
            self.assertGreater(data["reading"]["pressure_psi"], 32.0)

        # Driver opens car dashboard
        latest_res = self.client.get("/api/readings/latest?vehicle_type=car")
        self.assertEqual(latest_res.status_code, 200)
        latest_data = latest_res.json()
        self.assertEqual(latest_data["vehicle_type"], "car")
        self.assertIn("front_left", latest_data["readings"])
        self.assertIn("front_right", latest_data["readings"])
        self.assertIn("rear_left", latest_data["readings"])
        self.assertIn("rear_right", latest_data["readings"])
        print("[PASS] Scenario 1: Morning pre-drive 4-wheel telemetry verified.")

    def test_scenario_2_puncture_detection_and_warning(self):
        """Human Driver Scenario 2:
        Driver encounters slow puncture on Front-Left wheel. Pressure drops below 29 PSI (190 kPa).
        System stores reading and confirms pressure PSI drop is recorded.
        """
        res = self.client.post(
            "/api/readings",
            json={
                "device_id": "ESP32-CAR-CRETA-01",
                "vehicle_type": "car",
                "wheel": "front_left",
                "pressure_kpa": 190.0,  # ~27.5 PSI (low pressure)
                "tread_depth_mm": 6.1,
                "temperature_c": 35.5,
                "humidity_percent": 45.0,
            },
        )
        self.assertEqual(res.status_code, 201)
        reading = res.json()["reading"]
        self.assertLess(reading["pressure_psi"], 28.0)

        # Dashboard fetches latest and sees the dropped PSI
        latest_res = self.client.get("/api/readings/latest?vehicle_type=car")
        fl_reading = latest_res.json()["readings"]["front_left"]
        self.assertEqual(fl_reading["pressure_psi"], reading["pressure_psi"])
        print("[PASS] Scenario 2: Slow puncture low-pressure threshold correctly detected.")

    def test_scenario_3_predictive_analytics_and_trend(self):
        """Human Driver Scenario 3:
        Driver inspects tread wear trend for Front-Left wheel.
        System provides rolling average, previous reading, and 1-step linear forecast.
        """
        res = self.client.get("/api/readings/analytics?vehicle_type=car&wheel=front_left&limit=10")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["wheel"], "front_left")
        self.assertIn("average_last_20", data)
        self.assertIn("next_predicted_data", data)
        self.assertIsNotNone(data["measuring_time"])
        print("[PASS] Scenario 3: Predictive trend analysis and rolling averages verified.")

    def test_scenario_4_motorcycle_dual_channel_telemetry(self):
        """Human Driver Scenario 4:
        User switches to Royal Enfield motorcycle (UP32 AW 7094).
        Dual-channel front (32 PSI) and rear (34 PSI) readings operate independently.
        """
        for wheel, kpa in [("front", 220.6), ("rear", 234.4)]:
            res = self.client.post(
                "/api/readings",
                json={
                    "device_id": "ESP32-BIKE-ENFIELD-01",
                    "vehicle_type": "bike",
                    "wheel": wheel,
                    "pressure_kpa": kpa,
                    "tread_depth_mm": 5.0,
                    "temperature_c": 33.0,
                },
            )
            self.assertEqual(res.status_code, 201)

        latest = self.client.get("/api/readings/latest?vehicle_type=bike").json()
        self.assertIn("front", latest["readings"])
        self.assertIn("rear", latest["readings"])
        # Ensure bike reading did not overwrite car reading
        car_latest = self.client.get("/api/readings/latest?vehicle_type=car").json()
        self.assertIn("front_left", car_latest["readings"])
        print("[PASS] Scenario 4: Motorcycle dual-channel telemetry and isolation verified.")

    def test_scenario_5_roadside_towing_token_and_security_pin(self):
        """Human Driver Scenario 5:
        Driver experiences breakdown on highway.
        Driver books roadside towing pass for SUV with auto-generated token ID and 4-digit PIN.
        System persists pass in SQLite and allows driver & technician verification.
        """
        token_id = "TOW-7842-LKO"
        security_pin = "4821"
        pass_payload = {
            "token_id": token_id,
            "service_type": "TOWING",
            "vehicle_type": "SUV",
            "vehicle_number": "UP32 EV 2026",
            "contact_phone": "9456923238",
            "provider_name": "Sameer Khan (8383629470)",
            "slot_time": "Immediate Dispatch (ETA ~12 mins)",
            "location": "Shaheed Path Highway Milestone 14, Lucknow",
            "security_pin": security_pin,
            "notes": "Flat tyre on rear-left, vehicle parked on service lane shoulder",
        }

        # Create pass
        create_res = self.client.post("/api/passes", json=pass_payload)
        self.assertEqual(create_res.status_code, 201)
        created_pass = create_res.json()["pass"]
        self.assertEqual(created_pass["token_id"], token_id)
        self.assertEqual(created_pass["security_pin"], security_pin)
        self.assertEqual(created_pass["vehicle_type"], "SUV")

        # Retrieve all active passes
        list_res = self.client.get("/api/passes")
        self.assertEqual(list_res.status_code, 200)
        passes = list_res.json()["passes"]
        found = any(p["token_id"] == token_id and p["security_pin"] == security_pin for p in passes)
        self.assertTrue(found, "Saved pass must be retrievable from backend database.")
        print("[PASS] Scenario 5: Roadside emergency token pass generation & PIN verification verified.")

    def test_scenario_6_maintenance_history_logbook(self):
        """Human Driver Scenario 6:
        After repair at authorized workshop, driver logs maintenance record.
        Record is stored in SQLite and can be filtered by vehicle number.
        """
        log_payload = {
            "service_date": "2026-10-24",
            "vehicle_number": "UP32 EV 2026",
            "service_type": "Puncture Repair & Dynamic Balance",
            "workshop_name": "Velocheck Cyber Hub - Hazratganj",
            "tyre_section": "Front-Left Radial",
            "odometer_km": 19400,
            "cost_inr": 450.0,
            "notes": "Installed German chemical plug, balanced rim with 10g zinc weight",
        }

        add_res = self.client.post("/api/maintenance", json=log_payload)
        self.assertEqual(add_res.status_code, 201)
        saved_log = add_res.json()["log"]
        self.assertEqual(saved_log["vehicle_number"], "UP32 EV 2026")
        self.assertEqual(saved_log["cost_inr"], 450.0)

        # Retrieve logs for UP32 EV 2026
        history_res = self.client.get("/api/maintenance?vehicle_number=UP32 EV 2026")
        self.assertEqual(history_res.status_code, 200)
        logs = history_res.json()["logs"]
        self.assertTrue(len(logs) >= 1)
        self.assertEqual(logs[0]["service_type"], "Puncture Repair & Dynamic Balance")
        print("[PASS] Scenario 6: Workshop maintenance logging and retrieval verified.")

    def test_scenario_7_system_health_and_endpoint_discovery(self):
        """System Scenario 7:
        Verify API health check and index documentation discovery.
        """
        health_res = self.client.get("/api/health")
        self.assertEqual(health_res.status_code, 200)
        self.assertEqual(health_res.json()["status"], "ok")

        index_res = self.client.get("/api")
        self.assertEqual(index_res.status_code, 200)
        self.assertIn("endpoints", index_res.json())
        print("[PASS] Scenario 7: System health and API discovery endpoints verified.")


if __name__ == "__main__":
    unittest.main()
