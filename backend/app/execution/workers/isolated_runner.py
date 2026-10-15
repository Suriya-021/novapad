import os
import sys
import time
import shutil
import tempfile
import subprocess
from typing import Dict, Any

from app.core.config import settings
from app.security.limits import get_best_cpp_compiler, get_best_c_compiler

def get_restricted_environment() -> Dict[str, str]:
    """Provides a sanitized, minimal environment for worker processes without leaking credentials."""
    safe_keys = ["PATH", "SYSTEMROOT", "WINDIR", "TEMP", "TMP"]
    env = {k: os.environ[k] for k in safe_keys if k in os.environ}
    env["PYTHONUNBUFFERED"] = "1"
    return env

def truncate_output(text: str, max_bytes: int = settings.MAX_OUTPUT_BYTES) -> str:
    encoded = text.encode("utf-8", errors="replace")
    if len(encoded) > max_bytes:
        truncated = encoded[:max_bytes].decode("utf-8", errors="ignore")
        return truncated + f"\n\n[Output truncated: exceeded maximum limit of {max_bytes} bytes]"
    return text

def run_isolated_task(
    language: str,
    active_file: str,
    source: str,
    files: Dict[str, str],
    timeout_sec: int,
    stdin: str = "",
) -> Dict[str, Any]:
    start_time = time.perf_counter()
    clean_lang = language.lower().strip()

    with tempfile.TemporaryDirectory(prefix="ide_sandbox_") as sandbox_dir:
        # Write project files into the sandbox
        for rel_path, content in (files or {}).items():
            # Prevent path traversal outside sandbox
            safe_name = os.path.basename(rel_path)
            file_dest = os.path.join(sandbox_dir, safe_name)
            with open(file_dest, "w", encoding="utf-8") as f:
                f.write(content)

        # Write active file source
        active_filename = os.path.basename(active_file) or "main.txt"
        source_path = os.path.join(sandbox_dir, active_filename)
        with open(source_path, "w", encoding="utf-8") as f:
            f.write(source)

        env = get_restricted_environment()

        # Handle Python server execution
        if clean_lang in ["python", "python_server"]:
            try:
                proc = subprocess.run(
                    [sys.executable, "-I", active_filename],
                    input=stdin,
                    cwd=sandbox_dir,
                    capture_output=True,
                    text=True,
                    timeout=timeout_sec,
                    env=env,
                )
                duration_ms = int((time.perf_counter() - start_time) * 1000)
                return {
                    "status": "success" if proc.returncode == 0 else "error",
                    "stdout": truncate_output(proc.stdout),
                    "stderr": truncate_output(proc.stderr),
                    "exitCode": proc.returncode,
                    "durationMs": duration_ms,
                    "errorCategory": "runtime" if proc.returncode != 0 else None,
                }
            except subprocess.TimeoutExpired:
                duration_ms = int((time.perf_counter() - start_time) * 1000)
                return {
                    "status": "timed_out",
                    "stdout": "",
                    "stderr": f"Execution timed out after {timeout_sec} seconds.",
                    "exitCode": -1,
                    "durationMs": duration_ms,
                    "errorCategory": "timeout",
                    "errorMessage": f"Time limit of {timeout_sec}s exceeded",
                }

        # Handle C / C++ execution
        if clean_lang in ["c", "cpp"]:
            compiler = get_best_cpp_compiler() if clean_lang == "cpp" else get_best_c_compiler()

            if not compiler:
                duration_ms = int((time.perf_counter() - start_time) * 1000)
                comp_name = "g++ (for C++)" if clean_lang == "cpp" else "gcc (for C)"
                return {
                    "status": "error",
                    "stdout": "",
                    "stderr": (
                        f"Compiler Toolchain Not Found: {comp_name} is not installed or not in PATH on this server host.\n\n"
                        "To execute C/C++ on the backend:\n"
                        "1. Install MinGW-w64 or Clang on the host system, or\n"
                        "2. Deploy the IDE backend inside the provided Docker sandbox image."
                    ),
                    "exitCode": 1,
                    "durationMs": duration_ms,
                    "errorCategory": "system",
                    "errorMessage": f"Missing compiler: {comp_name}",
                }

            # Compile step
            binary_name = "program.exe" if os.name == "nt" else "program.out"
            binary_path = os.path.join(sandbox_dir, binary_name)

            compile_args = [compiler, "-O2"]
            if clean_lang == "cpp":
                compile_args.append("-std=c++17")
            compile_args.extend([active_filename, "-o", binary_name])

            try:
                compile_proc = subprocess.run(
                    compile_args,
                    cwd=sandbox_dir,
                    capture_output=True,
                    text=True,
                    timeout=min(timeout_sec, 15),
                    env=env,
                )
            except subprocess.TimeoutExpired:
                duration_ms = int((time.perf_counter() - start_time) * 1000)
                return {
                    "status": "timed_out",
                    "stdout": "",
                    "stderr": "Compilation timed out.",
                    "exitCode": 1,
                    "durationMs": duration_ms,
                    "errorCategory": "timeout",
                    "errorMessage": "Compilation timeout",
                }

            if compile_proc.returncode != 0:
                duration_ms = int((time.perf_counter() - start_time) * 1000)
                return {
                    "status": "error",
                    "stdout": "",
                    "stderr": truncate_output(compile_proc.stderr or compile_proc.stdout),
                    "exitCode": compile_proc.returncode,
                    "durationMs": duration_ms,
                    "errorCategory": "syntax",
                    "errorMessage": "Compilation failed",
                    "compilerOutput": compile_proc.stderr,
                }

            # Run binary step
            try:
                run_proc = subprocess.run(
                    [binary_path],
                    input=stdin,
                    cwd=sandbox_dir,
                    capture_output=True,
                    text=True,
                    timeout=timeout_sec,
                    env=env,
                )
                duration_ms = int((time.perf_counter() - start_time) * 1000)
                return {
                    "status": "success" if run_proc.returncode == 0 else "error",
                    "stdout": truncate_output(run_proc.stdout),
                    "stderr": truncate_output(run_proc.stderr),
                    "exitCode": run_proc.returncode,
                    "durationMs": duration_ms,
                    "errorCategory": "runtime" if run_proc.returncode != 0 else None,
                }
            except subprocess.TimeoutExpired:
                duration_ms = int((time.perf_counter() - start_time) * 1000)
                return {
                    "status": "timed_out",
                    "stdout": "",
                    "stderr": f"Program execution timed out after {timeout_sec} seconds.",
                    "exitCode": -1,
                    "durationMs": duration_ms,
                    "errorCategory": "timeout",
                    "errorMessage": f"Time limit of {timeout_sec}s exceeded",
                }

        # Unsupported server language
        duration_ms = int((time.perf_counter() - start_time) * 1000)
        return {
            "status": "error",
            "stdout": "",
            "stderr": f"Backend execution service does not support language: '{language}'.",
            "exitCode": 1,
            "durationMs": duration_ms,
            "errorCategory": "unsupported",
            "errorMessage": f"Unsupported language: {language}",
        }
