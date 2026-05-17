from __future__ import annotations

import httpx


BASE = "http://localhost:8000"


def main() -> None:
    with httpx.Client(base_url=BASE, timeout=10.0) as c:
        print("health", c.get("/health").status_code, c.get("/health").json())

        client = c.post(
            "/api/users", json={"email": "client@demo.local", "display_name": "Client"}
        ).json()
        student = c.post(
            "/api/users", json={"email": "student@demo.local", "display_name": "Student"}
        ).json()
        mentor = c.post(
            "/api/users", json={"email": "mentor@demo.local", "display_name": "Mentor"}
        ).json()
        print("users", client["id"], student["id"], mentor["id"])

        org = c.post("/api/organizations", json={"type": "company", "name": "Demo Company"}).json()
        print("org", org["id"])

        task = c.post(
            "/api/tasks",
            json={
                "organization_id": org["id"],
                "title": "QA regression: MVP",
                "description": "Прогнать регресс по чек-листу. Не трогаем прод.",
                "category": "qa",
                "budget_amount_rub": 10000,
                "required_skills": [],
            },
        ).json()
        print("task", task["id"], task["status"])

        app = c.post(
            f"/api/tasks/{task['id']}/apply",
            json={
                "applicant_id": student["id"],
                "proposed_amount_rub": 9000,
                "message": "Готов начать сегодня, есть опыт регресса.",
            },
        ).json()
        print("application", app["id"], app["status"])

        asg = c.post(
            f"/api/tasks/{task['id']}/assign",
            json={"executor_id": student["id"], "mentor_id": mentor["id"]},
        ).json()
        print("assignment", asg["id"], asg["status"])

        disp = c.post(
            f"/api/tasks/{task['id']}/disputes",
            json={
                "opened_by_id": client["id"],
                "reason": "Нужно уточнение по критериям готовности.",
                "sla_minutes": 10,
            },
        ).json()
        print("dispute", disp["id"], disp["status"])

        plans = c.get("/api/plans").json()
        print("plans", [p["code"] for p in plans])


if __name__ == "__main__":
    main()

