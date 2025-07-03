from fastapi.testclient import TestClient
from .main import app
from io import BytesIO


client = TestClient(app)
headers = {"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsImtpZCI6IlU4RzFGWXhQOEg5KzEzcUoiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2dzYWt2aWRhdHJrZXN4bW1ycXZ4LnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiJlNzcyMDM3Yi0wMTJlLTQyY2MtYjk5ZS05ZDNmOGQ2MjY2ZDMiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzQ5NDE4ODkyLCJpYXQiOjE3NDk0MTUyOTIsImVtYWlsIjoicGFyYWcuc2hhaDk3QGdtYWlsLmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiXX0sInVzZXJfbWV0YWRhdGEiOnsiZW1haWxfdmVyaWZpZWQiOnRydWV9LCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImFhbCI6ImFhbDEiLCJhbXIiOlt7Im1ldGhvZCI6InBhc3N3b3JkIiwidGltZXN0YW1wIjoxNzQ5NDE1MjkyfV0sInNlc3Npb25faWQiOiIxN2Q5NDcyMS0wOGI3LTQ0ZWItYjhhZS1mYTljNWQ0MDI5MjUiLCJpc19hbm9ueW1vdXMiOmZhbHNlfQ.RlNFGe952AK96oyZUPy0b5aKrnjZbyNNRFBnvf0VaV4"}

PROJECT_ID = "test_project"
KEY = "button.test"
VALUE = "test"
CATEGORY = "Testing"
DESCRIPTION = "Testing purpose"
LANGUAGE = "en"
UPDATED_BY = "parag.shah97@gmail.com"

def test_get_projects_and_langs():
    response = client.get("/localizations/", headers=headers)
    assert response.status_code == 200

    json_data = response.json()
    assert "projects" in json_data
    assert "languages" in json_data

def test_add_translation():
    payload = {
        "key": KEY,
        "value": VALUE,
        "language": LANGUAGE,
        "category": CATEGORY,
        "description": DESCRIPTION,
        "updated_by": UPDATED_BY
    }

    response = client.post(f"/localizations/{PROJECT_ID}", json=payload, headers=headers)
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["status"] == "success"
    assert json_data["key_id"] == KEY


def test_update_translation():
    payload = {
        "key": KEY,
        "value": "Updated Value",
        "language": LANGUAGE,
        "description": "Updated description",
        "updated_by": UPDATED_BY
    }

    response = client.put(f"/localizations/{PROJECT_ID}", json=payload, headers=headers)
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["status"] == "success"
    assert json_data["key_id"] == KEY

def test_get_localizations():
    response = client.get(f"/localizations/{PROJECT_ID}/{LANGUAGE}", headers=headers)
    assert response.status_code == 200

    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 1

    item = data[0]
    assert item["key"] == KEY
    assert item["category"] == CATEGORY
    assert item["description"] == "Updated description"
    assert item["translations"][LANGUAGE]["value"] == "Updated Value"
    assert item["translations"][LANGUAGE]["updatedBy"] == UPDATED_BY

def test_delete_translation_key():
    response = client.delete(f"/localizations/{PROJECT_ID}/{KEY}", headers=headers)
    assert response.status_code == 200

    json_data = response.json()
    assert json_data["status"] == "success"
    assert json_data["deleted_key"] == KEY


def test_upload_csv():
    csv_content = (
        "key,value,category,description\n"
        "link.test,Link,Testing,Link Type\n"
        "label.test,Label,Testing,Label Type\n"
    )
    files = {
        "file": ("test.csv", BytesIO(csv_content.encode()), "text/csv")
    }

    response = client.post(
        f"/localizations/upload/{PROJECT_ID}/{LANGUAGE}",
        files=files,
        headers=headers
    )

    assert response.status_code == 200
    json_data = response.json()
    assert json_data["status"] == "success"
    assert "uploaded" in json_data
    assert "link.test" in json_data["uploaded"]
    assert "label.test" in json_data["uploaded"]