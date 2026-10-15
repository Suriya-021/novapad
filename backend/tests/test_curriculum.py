import io
import base64
import zipfile
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_docx_upload_invalid_base64():
    payload = {
        "fileName": "test.docx",
        "contentBase64": "invalid_base64_payload$$$",
        "courseId": "test-course",
    }
    response = client.post("/api/v1/curriculum/upload-docx", json=payload)
    assert response.status_code == 400
    assert "Invalid base64 payload" in response.json()["detail"]

def test_docx_upload_not_a_zip():
    payload = {
        "fileName": "test.docx",
        "contentBase64": base64.b64encode(b"corrupt-non-zip-data").decode("utf-8"),
        "courseId": "test-course",
    }
    response = client.post("/api/v1/curriculum/upload-docx", json=payload)
    assert response.status_code == 400
    assert "not a valid docx document" in response.json()["detail"]

def test_docx_upload_valid_mock_docx():
    # Build minimal valid docx in memory
    buf = io.BytesIO()
    doc_xml = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
      <w:body>
        <w:p><w:r><w:t>CHAPTER 1: Python Fundamentals</w:t></w:r></w:p>
        <w:p><w:r><w:t>Variables and Types</w:t></w:r></w:p>
        <w:p><w:r><w:t>Variables store data values in computer memory.</w:t></w:r></w:p>
      </w:body>
    </w:document>
    """.strip()

    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("word/document.xml", doc_xml.encode("utf-8"))

    b64_content = base64.b64encode(buf.getvalue()).decode("utf-8")

    payload = {
        "fileName": "fundamentals.docx",
        "contentBase64": b64_content,
        "courseId": "course-test-1",
    }
    response = client.post("/api/v1/curriculum/upload-docx", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "chapter" in data
    assert data["chapter"]["courseId"] == "course-test-1"
    assert "CHAPTER 1: Python Fundamentals" in data["chapter"]["title"]
