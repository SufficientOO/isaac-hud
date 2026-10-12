#!/usr/bin/env python3
"""Bake nearest-neighbor upscales into ALL sprite assets (Android fix).

Android's Image pipeline always bilinear-filters; imageRendering is
react-native-web-only. Any asset displayed above its art scale gets mushed
(assets are 1x or 2x pre-scaled; the HUD shows them at ~2.3-5.3x device dp).
Baking a large NN upscale turns every display path into a small bilinear
DOWNSCALE, which preserves hard edges.

IN PLACE (git is the idempotence net — `git checkout -- <dir>` resets).
Usage: python3 scripts/upscale_all_sprites.py [factor]   (default 6)
Run from the repository root.
Skip-list files already larger than a threshold to avoid compounding when
running repeatedly (a 6x-baked 192x192 from a 32x32 source would be re-baked
to 1152 otherwise, hence the max-side guard).
"""

import glob
import os
import sys

from PIL import Image

# asset dirs (relative to the repository root) shown at or above their art scale
DIRS = [
    "assets/sprites/hearts",
    "assets/sprites/hearts/outlined",
    "assets/sprites/chargebar",
    "assets/sprites/pickups",
    "assets/sprites/mappickups",
    "assets/sprites/minimap",
    "assets/sprites/mapicons",
    "assets/sprites/stats",
    "assets/sprites/tempesta-font/green",
    "assets/sprites/tempesta-font/red",
    "assets/sprites/tempesta-font",
    "assets/sprites/font",
    "assets/sprites/trinkets",
    "assets/sprites/cards",
    "assets/sprites/ui",
    "assets/sprites/collectibles_outlined",
    "assets/floors",  # 1x snippets; tiled at ~5x device — keep sharp
]

# files too big to re-upscale (already-baked or true full-screen art)
MAX_SIDE_BAKED = 1024


def upscale(path: str, factor: int) -> None:
    img = Image.open(path).convert("RGBA")
    w, h = img.size
    if max(w, h) * factor > MAX_SIDE_BAKED:
        return  # don't compound / don't bloat true big art
    img.resize((w * factor, h * factor), Image.NEAREST).save(path)


def main():
    factor = int(sys.argv[1]) if len(sys.argv) > 1 else 6
    total = 0
    for d in DIRS:
        for p in sorted(glob.glob(os.path.join(d, "*.png"))):
            before = Image.open(p).size
            upscale(p, factor)
            if Image.open(p).size != before:
                total += 1
    print(f"baked NN x{factor} into {total} sprites")


if __name__ == "__main__":
    main()