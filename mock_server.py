#!/usr/bin/env python3
"""Mock Isaac HUD Stream server for testing the companion app."""
import http.server
import json
import math
import time

MOCK_STATE = {
    "hp": {
        "red": 4, "max": 6, "soul": 4, "black": 2, "bone": 1, "lives": 1,
        # full vanilla heart row (types/overlays, see src/types.ts)
        "hearts": [
            {"t": "RedFull"},
            {"t": "RedFull"},
            {"t": "RedHalf"},
            {"t": "Rotten"},
            {"t": "BoneHalf"},
            {"t": "BlackFull"},
            {"t": "BlueFull", "o": "Eh"},
            {"t": "HolyMantle"},
            {"t": "RedFull"},
            {"t": "RedFull"},
            {"t": "RedFull"},
            {"t": "RedHalf"},
        ],
    },
    "stats": {"damage": 4.20, "tears": 2.73, "fireDelay": 10, "shotSpeed": 1.00, "speed": 1.15, "range": 6.50, "tearRange": 260, "luck": 1.00, "devil": 37.5, "angel": 12.5},
    "resources": {"coins": 15, "bombs": 3, "keys": 2},
    "items": [
        {"id": 1, "name": "The Sad Onion"},
        {"id": 12, "name": "Magic Mushroom"},
        {"id": 15, "name": "Heart"},
        {"id": 28, "name": "Monstro's Lung"},
        {"id": 47, "name": "Brimstone"},
        {"id": 105, "name": "The D6"},
        {"id": 118, "name": "Tech X"},
        {"id": 153, "name": "Crown of Light"},
        {"id": 224, "name": "Sacred Heart"},
    ],
    # batteryCharge > 0 exercises The Battery's blue dual bar (6 green + 3 blue
    # of a 12-level re-divided bar)
    "activeItem": {"id": 105, "name": "The D6", "charge": 6, "maxCharge": 6, "batteryCharge": 3},
    "floor": {"stage": 4, "stageType": 0, "name": "Caves I", "seed": "ABCD 1234", "time": 53730, "curses": 0, "backdrop": 2},  # 29:51 (30 ticks/s); curses = LevelCurse bitmask; backdrop = BACKDROP_* id
    "pocketItem": {"type": "none", "id": 0, "name": ""},
    "trinket": {"id": 0, "name": ""},
    # HUD overlay messages (pill effect text, ...) — ttl is static in the mock
    "messages": [{"id": 1, "text": "Feels like I'm walking on sunshine!", "ttl": 2.5}],
    "minimap": [
        # listIndex/index/shape/visited/cleared/displayFlags/x/y/isCurrent/pickups
        # displayFlags bits: 1=visible 2=shadow 4=show icon (game semantics)
        {"listIndex": 0, "index": 84, "type": 1, "shape": 1, "visited": True,  "cleared": True,  "displayFlags": 1, "x": 6, "y": 6, "isCurrent": True,  "pickups": []},
        {"listIndex": 1, "index": 83, "type": 1, "shape": 1, "visited": True,  "cleared": True,  "displayFlags": 1, "x": 5, "y": 6, "isCurrent": False, "pickups": ["key", "coin"]},
        {"listIndex": 2, "index": 85, "type": 2, "shape": 6, "visited": False, "cleared": False, "displayFlags": 5, "x": 7, "y": 6, "isCurrent": False, "pickups": []},
        {"listIndex": 3, "index": 71, "type": 4, "shape": 1, "visited": True,  "cleared": True,  "displayFlags": 5, "x": 6, "y": 5, "isCurrent": False, "pickups": ["collectible"]},
        {"listIndex": 4, "index": 70, "type": 7, "shape": 1, "visited": False, "cleared": False, "displayFlags": 3, "x": 5, "y": 5, "isCurrent": False, "pickups": []},
        {"listIndex": 5, "index": 97, "type": 5, "shape": 1, "visited": False, "cleared": False, "displayFlags": 5, "x": 6, "y": 7, "isCurrent": False, "pickups": []},
        {"listIndex": 6, "index": 98, "type": 1, "shape": 1, "visited": False, "cleared": False, "displayFlags": 0, "x": 7, "y": 7, "isCurrent": False, "pickups": []}
    ],
}

class Handler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/state":
            # Exercise the Found-HUD stat deltas: luck drifts smoothly (a
            # green/red "+0.25"-style delta next to the stat), and every few
            # seconds damage makes a discrete jump.
            state = json.loads(json.dumps(MOCK_STATE))
            t = time.time()
            state["stats"]["luck"] = round(1.00 + 0.25 * math.sin(t / 4.0), 2)
            state["stats"]["damage"] = round(
                4.20 + (0.50 if int(t // 8) % 2 == 0 else -0.30), 2
            )
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps(state).encode())
        elif self.path == "/health":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(b'{"ok":true}')
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, format, *args):
        pass

if __name__ == "__main__":
    server = http.server.HTTPServer(("0.0.0.0", 8088), Handler)
    print("Mock Isaac HUD server on http://0.0.0.0:8088")
    server.serve_forever()