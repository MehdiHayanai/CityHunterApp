import json
import os
import sys

# Ensure the backend directory is in the python path
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from app.main import app


def export_openapi():
    print("Generating OpenAPI Schema...")
    openapi_data = app.openapi()

    output_path = "openapi.json"
    with open(output_path, "w") as f:
        json.dump(openapi_data, f, indent=2)

    print(f"Schema exported to {os.path.abspath(output_path)}")


if __name__ == "__main__":
    export_openapi()
