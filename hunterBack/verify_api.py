import requests

BASE_URL = "http://localhost:8000/api/v1"


def test_api():
    print("starting verification...")

    # 1. Create Monument
    monument_data = {
        "name": "Integration Test Monument",
        "description": "Created by automated verification script",
        "location": {"type": "Point", "coordinates": [2.3522, 48.8566]},
        "images": [],
        "tags": ["Test"],
    }

    print("\n[+] Creating Monument...")
    res = requests.post(f"{BASE_URL}/pois/monument", json=monument_data)
    if res.status_code != 201:
        print(f"FAILED: {res.status_code} - {res.text}")
        return

    monument = res.json()
    monument_id = monument["id"] if "id" in monument else monument["_id"]
    print(f"SUCCESS: Created Monument {monument_id}")

    # 2. Get Monument
    print(f"\n[+] Fetching Monument {monument_id}...")
    res = requests.get(f"{BASE_URL}/pois/{monument_id}")
    if res.status_code != 200:
        print(f"FAILED: {res.status_code}")
        # Debug: List all
        print("[*] Listing all POIs to debug...")
        list_res = requests.get(f"{BASE_URL}/pois/")
        if list_res.status_code == 200:
            all_pois = list_res.json()
            ids = [p["id"] if "id" in p else p.get("_id") for p in all_pois]
            print(f"Found IDs: {ids}")
            if monument_id in ids:
                print("ID exists in list! weird.")
            else:
                print("ID NOT found in list.")
        return
    print("SUCCESS: Monument found")

    # 3. Create Walk using this Monument
    walk_data = {
        "title": "Integration Test Walk",
        "description": "Testing Walk Creation",
        "stops": [monument_id],
        "difficulty": "Easy",
        "estimated_duration_minutes": 45,
    }

    print("\n[+] Creating Walk Draft...")
    res = requests.post(f"{BASE_URL}/walks/", json=walk_data)
    if res.status_code != 201:
        print(f"FAILED: {res.status_code} - {res.text}")
    else:
        walk = res.json()
        walk_id = walk["id"] if "id" in walk else walk["_id"]
        print(f"SUCCESS: Created Walk {walk_id}")

        # 4. Update Walk
        print(f"\n[+] Updating Walk {walk_id}...")
        update_data = {"title": "Updated Walk Title", "difficulty": "Hard"}
        res = requests.put(f"{BASE_URL}/walks/{walk_id}", json=update_data)
        if res.status_code != 200:
            print(f"FAILED Update: {res.status_code} - {res.text}")
        else:
            updated_walk = res.json()
            if (
                updated_walk["title"] == "Updated Walk Title"
                and updated_walk["difficulty"] == "Hard"
            ):
                print("SUCCESS: Walk updated")
            else:
                print("FAILED: Walk content not updated correctly")

        # 5. Delete Walk
        print(f"\n[+] Deleting Walk {walk_id}...")
        res = requests.delete(f"{BASE_URL}/walks/{walk_id}")
        if res.status_code == 204:
            print("SUCCESS: Walk deleted")
            # Verify deletion
            _ = requests.get(f"{BASE_URL}/walks/")
            # This returns list, we assume it's gone
        else:
            print(f"FAILED: {res.status_code} - {res.text}")

    # 6. Delete Monument
    print(f"\n[+] Deleting Monument {monument_id}...")
    res = requests.delete(f"{BASE_URL}/pois/{monument_id}")
    if res.status_code == 204:
        print("SUCCESS: Monument deleted")
    else:
        print(f"FAILED: {res.status_code} - {res.text}")


if __name__ == "__main__":
    try:
        test_api()
    except Exception as e:
        print(f"Error running script: {e}")
        print("Make sure the backend is running on localhost:8000")
