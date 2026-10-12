# isaac-hud — Isaac HUD companion app (beta 0.9)

Renders the in-game HUD of **The Binding of Isaac: Repentance+**: the full heart row, stats,
coins/bombs/keys, active item + charge, pocket item, trinket, floor name +
curses, and a live minimap.

The app polls the game-side mod (**hud-stream**, a Lua mod) — a tiny
**read-only** HTTP server inside the game, loopback only
(`127.0.0.1:8088`) — and draws the HUD. Nothing is ever sent back to the
game, and the server never binds to the network.

## Install

1. **Mod** — install the *hud-stream* Isaac mod from the Steam Workshop
   (search "hud-stream" in the Workshop for The Binding of Isaac: Rebirth).
   <!-- TODO: replace with the direct Workshop item URL after first upload -->
2. **Launch options** — enable `--luadebug`: Steam → right-click the game →
   Properties → Launch Options → `--luadebug`. Without it the mod cannot
   start its server and shows a yellow warning instead.
3. **App** — download the APK from [releases](../../releases) and install
   it **on the device the game runs on** (the app connects to the game on
   localhost).
4. Start the game and a run — the app waits and auto-connects to `localhost:8088`. For it to connect, you need to be unpaused and in a run (not just the main menu).

## Tips

- R3 (right-stick click) toggles the vanilla HUD on the main screen;
  [Mod Config Menu](https://steamcommunity.com/sharedfiles/filedetails/?id=3701683951)
  (optional) adds an in-game on/off toggle.
- `--luadebug` grants all Lua mods file/network access — only run mods
  you trust alongside it.
- Untested without Repentance+

## Building from source

```bash
npm install
npx expo start --web    # dev web server (hot reload)
npx expo run:android    # Android build (or `eas build` / local Gradle)
```

`mock_server.py` serves fake game state on `:8088` for frontend work
without the game running.

**Game art is intentionally omitted**: all ~1,600 sprites/textures are
© Nicalis / Edmund McMillen and are not ours to redistribute, so a fresh
checkout does not build until you supply them. See
[`assets/extract-these-assets-here`](assets/extract-these-assets-here) for
the full list of missing files and [`scripts/`](scripts) for the pipeline
that regenerates them from your own game install.

## License

GPL-3.0
