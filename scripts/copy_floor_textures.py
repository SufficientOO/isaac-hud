#!/usr/bin/env python3
"""Copy the game's per-floor backdrop textures into the frontend assets.

Reads backdrops.xml (extracted game data) and copies each backdrop's
`nfloorgfx` (the normal floor texture) to assets/floors/<backdropId>.png so
the HUD can use the current floor's texture as its background (normal mode).

Usage: python3 scripts/copy_floor_textures.py <extracted_resources_dir>
Run from the repository root.
"""
import os
import sys
import xml.etree.ElementTree as ET

OUT = "assets/floors"


def main():
    if len(sys.argv) < 2:
        print("usage: copy_floor_textures.py <extracted_resources_dir>")
        sys.exit(1)
    res = sys.argv[1]
    root = ET.parse(os.path.join(res, "backdrops.xml")).getroot()
    srcdir = os.path.join(res, "gfx", "backdrop")
    # case-insensitive lookup (xml uses CamelCase, files are lowercased)
    files = {f.lower(): f for f in os.listdir(srcdir)}
    os.makedirs(OUT, exist_ok=True)

    n = 0
    for b in root.iter("backdrop"):
        bid = int(b.get("id"))
        nf = b.get("nfloorgfx")
        if not nf:
            print("no nfloor for id", bid)
            continue
        actual = files.get(nf.lower())
        if not actual:
            print("MISSING", nf, "for id", bid)
            continue
        with open(os.path.join(srcdir, actual), "rb") as f:
            data = f.read()
        with open(os.path.join(OUT, f"{bid}.png"), "wb") as f:
            f.write(data)
        n += 1
    print(f"copied {n} floor textures to {OUT}")


if __name__ == "__main__":
    main()
