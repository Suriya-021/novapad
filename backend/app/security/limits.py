import shutil
from typing import Dict

def detect_available_compilers() -> Dict[str, bool]:
    return {
        "g++": shutil.which("g++") is not None,
        "gcc": shutil.which("gcc") is not None,
        "clang++": shutil.which("clang++") is not None,
        "clang": shutil.which("clang") is not None,
        "cl": shutil.which("cl") is not None,
    }

def get_best_cpp_compiler() -> str | None:
    for comp in ["g++", "clang++"]:
        if shutil.which(comp):
            return comp
    return None

def get_best_c_compiler() -> str | None:
    for comp in ["gcc", "clang"]:
        if shutil.which(comp):
            return comp
    return None
