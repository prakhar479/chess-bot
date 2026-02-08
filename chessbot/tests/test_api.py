"""API integration tests."""
from fastapi.testclient import TestClient

from chessbot.web.app import APP


client = TestClient(APP)


def test_bot_registration_and_match() -> None:
    """Register bots and run a match."""
    response = client.post(
        "/api/bots",
        json={"name": "Random", "command": ["python", "bots/random_bot.py"]},
    )
    assert response.status_code == 200
    white_bot = response.json()

    response = client.post(
        "/api/bots",
        json={"name": "Greedy", "command": ["python", "bots/greedy_bot.py"]},
    )
    assert response.status_code == 200
    black_bot = response.json()

    match_response = client.post(
        "/api/matches",
        json={
            "white_bot_id": white_bot["id"],
            "black_bot_id": black_bot["id"],
            "move_timeout_s": 2,
            "max_moves": 10,
        },
    )
    assert match_response.status_code == 200
    payload = match_response.json()
    assert payload["moves"]
