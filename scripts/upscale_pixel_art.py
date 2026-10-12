#!/usr/bin/env python3
"""Bake a nearest-neighbor upscale into sprite PNGs.

Android's Image pipeline has no nearest-neighbor mode (imageRendering is
react-native-web-only): every bitmap is upscaled with bilinear filtering,
which mushes pixel art — badly at high factors (the HUD's active-item
sprite shows 1x art at ~5.3x, while 2x-scaled assets shown at ~2.3x look
crisp). Baking a big NN upscale into the asset turns the display path into
a small bilinear DOWNSCALE, which keeps hard edges.

Usage: python3 scripts/upscale_pixel_art.py [factor]  (default 6)
Run from the repository root. Upscales IN PLACE:
  - assets/sprites/collectibles_outlined/*.png  (active-item sprites)
  - assets/sprites/collectibles/<same ids>.png  (ActiveItem fallback set)
"""

import glob
import os
import sys

from PIL import Image

OUT_O = "assets/sprites/collectibles_outlined"
SRC_C = "assets/sprites/collectibles"


def upscale(path: str, factor: int) -> None:
    img = Image.open(path).convert("RGBA")
    w, h = img.size
    img.resize((w * factor, h * factor), Image.NEAREST).save(path)


def main():
    factor = int(sys.argv[1]) if len(sys.argv) > 1 else 6
    targets = sorted(glob.glob(f"{OUT_O}/collectibles_*_*.png"))
    n = 0
    for p in targets:
        # outlined and plain share the SAME filename (collectibles_105_dice.png)
        src = os.path.join(SRC_C, os.path.basename(p))
        if os.path.exists(src):
            upscale(src, factor)
        upscale(p, factor)
        n += 1
    print(f"upscaled {n} sprites x{factor} (outlined + plain fallback)")


if __name__ == "__main__":
    main()