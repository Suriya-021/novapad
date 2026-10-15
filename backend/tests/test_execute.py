import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "compilers" in data
    assert isinstance(data["compilers"], dict)

def test_server_python_execution_success():
    payload = {
        "requestId": "test-req-1",
        "language": "python_server",
        "activeFile": "script.py",
        "source": "x = 40 + 2\nprint(f'Computed answer: {x}')",
        "timeoutSeconds": 5,
    }
    response = client.post("/api/v1/execute", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "Computed answer: 42" in data["stdout"]
    assert data["exitCode"] == 0

def test_server_python_file_mounting():
    payload = {
        "requestId": "test-req-2",
        "language": "python_server",
        "activeFile": "app.py",
        "source": "with open('input.txt') as f:\n    print('Data: ' + f.read().strip())",
        "files": {
            "input.txt": "Sandbox mount test"
        },
        "timeoutSeconds": 5,
    }
    response = client.post("/api/v1/execute", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "Data: Sandbox mount test" in data["stdout"]

def test_server_python_syntax_error():
    payload = {
        "requestId": "test-req-3",
        "language": "python_server",
        "activeFile": "bad.py",
        "source": "def broken_code(",
        "timeoutSeconds": 5,
    }
    response = client.post("/api/v1/execute", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "error"
    assert "SyntaxError" in data["stderr"]
    assert data["exitCode"] != 0

def test_cpp_compiler_structured_error_or_success():
    payload = {
        "requestId": "test-req-4",
        "language": "cpp",
        "activeFile": "main.cpp",
        "source": "#include <iostream>\nint main() { std::cout << \"Hello C++\"; return 0; }",
        "timeoutSeconds": 5,
    }
    response = client.post("/api/v1/execute", json=payload)
    assert response.status_code == 200
    data = response.json()
    # If g++ is missing, it returns a structured error explaining the requirement
    # If g++ is present, it returns success
    if data["status"] == "error":
        assert "Compiler Toolchain Not Found" in data["stderr"] or "Compilation failed" in data["stderr"]
    else:
        assert data["status"] == "success"
        assert "Hello C++" in data["stdout"]

def test_payload_size_limit():
    huge_source = "a = 1\n" * 150000  # Exceeds 512KB
    payload = {
        "requestId": "test-req-5",
        "language": "python_server",
        "activeFile": "big.py",
        "source": huge_source,
    }
    response = client.post("/api/v1/execute", json=payload)
    assert response.status_code == 400
    assert "exceeds maximum allowable size" in response.json()["detail"]

def test_server_python_stdin():
    payload = {
        "requestId": "test-req-stdin",
        "language": "python_server",
        "activeFile": "add.py",
        "source": "import sys\nlines = sys.stdin.read().split()\na = int(lines[0])\nb = int(lines[1])\nprint(f'Sum is: {a + b}')",
        "stdin": "15 27",
        "timeoutSeconds": 5,
    }
    response = client.post("/api/v1/execute", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "Sum is: 42" in data["stdout"]

