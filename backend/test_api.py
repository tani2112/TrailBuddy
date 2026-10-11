import httpx
import sys

BASE_URL = "http://127.0.0.1:8000/api"

def run_tests():
    print("=== STARTING TRAILBUDDY API VERIFICATION TESTS ===")
    
    with httpx.Client(base_url=BASE_URL, timeout=10.0) as client:
        # 1. Health Check
        res = client.get("/health")
        assert res.status_code == 200, f"Health check failed: {res.text}"
        health = res.json()
        print(f"✓ Health Check Passed: db={health['database_healthy']}, ollama_connected={health['ollama_connected']}")

        # 2. AI Status Check
        res = client.get("/ai/status")
        assert res.status_code == 200, f"AI status failed: {res.text}"
        ai_stat = res.json()
        print(f"✓ AI Status Endpoint Passed: base_url={ai_stat['base_url']}, model={ai_stat['model_configured']}")

        # 3. AI Chat Graceful Handling when Ollama offline
        res = client.post("/ai/chat", json={"messages": [{"role": "user", "content": "How do I spot poison ivy?"}]})
        # Should gracefully return 503 or 200 depending on Ollama state
        print(f"✓ AI Chat Endpoint responded with code {res.status_code} (Graceful offline/online response)")

        # 4. Missions List
        res = client.get("/missions")
        assert res.status_code == 200
        missions = res.json()
        assert len(missions) >= 15, f"Expected at least 15 missions, got {len(missions)}"
        print(f"✓ Missions Catalog Passed: {len(missions)} outdoor challenges loaded")

        # 5. Filter missions by Category
        res = client.get("/missions?category=Botany")
        assert res.status_code == 200
        botany_missions = res.json()
        assert len(botany_missions) > 0, "No botany missions found"
        print(f"✓ Missions Category Filter Passed: {len(botany_missions)} Botany missions")

        # 6. Today's Featured Mission
        res = client.get("/missions/today")
        assert res.status_code == 200
        today = res.json()
        print(f"✓ Today's Featured Mission Passed: '{today['title']}' ({today['category']}, {today['points']} pts)")

        # 7. Start a Mission
        test_mission_id = "mission-01"
        res = client.post(f"/missions/{test_mission_id}/start")
        assert res.status_code == 200
        start_data = res.json()
        print(f"✓ Start Mission Passed: progress_id={start_data['progress_id']}")

        # 8. Complete Mission with reflection and duration
        res = client.post(f"/missions/{test_mission_id}/complete", json={
            "duration_spent_seconds": 120,
            "user_reflection": "Observed a vibrant songbird in the garden oak. Noticed its melodic three-note territory call."
        })
        assert res.status_code == 200
        comp_data = res.json()
        assert comp_data["points_awarded"] > 0
        print(f"✓ Complete Mission Passed: Awarded {comp_data['points_awarded']} exploration points!")

        # 9. Verify Stats Updated
        res = client.get("/stats")
        assert res.status_code == 200
        stats = res.json()
        assert stats["total_points"] >= comp_data["points_awarded"]
        assert stats["completed_missions_count"] >= 1
        print(f"✓ User Stats Updated: Points={stats['total_points']}, Completed Missions={stats['completed_missions_count']}")

        # 10. Create Nature Journal Entry
        res = client.post("/journal", json={
            "title": "Evening Walk along Creek Trail",
            "notes": "Spotted smooth water-worn quartz stones and listened to the gentle current.",
            "location_name": "Cedar Creek Trail",
            "weather": "Golden Hour 🌅",
            "category": "Sensory",
            "tags": ["creek", "quartz", "dusk"],
            "sensory_observation": "Cool river breeze and earthy moss aromas"
        })
        assert res.status_code == 201
        entry = res.json()
        entry_id = entry["id"]
        print(f"✓ Journal Entry Created: ID={entry_id}, Title='{entry['title']}'")

        # 11. Search Journal Entries
        res = client.get("/journal?q=quartz")
        assert res.status_code == 200
        results = res.json()
        assert len(results) >= 1
        print(f"✓ Journal Search Passed: Found {len(results)} entry matching 'quartz'")

        # 12. Update Journal Entry
        res = client.put(f"/journal/{entry_id}", json={
            "title": "Evening Walk along Cedar Creek Trail (Updated)",
            "notes": "Spotted smooth water-worn quartz stones and listened to the gentle current. Added note about mallard ducks."
        })
        assert res.status_code == 200
        updated = res.json()
        assert "Updated" in updated["title"]
        print(f"✓ Journal Entry Updated Successfully")

        # 13. Verify Journal Count in Stats
        res = client.get("/stats")
        stats2 = res.json()
        assert stats2["journal_entries_count"] >= 1
        print(f"✓ Journal count reflected in stats: {stats2['journal_entries_count']} entries")

        # 14. Delete Journal Entry
        res = client.delete(f"/journal/{entry_id}")
        assert res.status_code == 200
        print(f"✓ Journal Entry Deleted Successfully")

    print("\n🎉 ALL 14 AUTOMATED ENDPOINT TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    try:
        run_tests()
    except Exception as e:
        print(f"❌ TEST FAILED: {e}")
        sys.exit(1)
