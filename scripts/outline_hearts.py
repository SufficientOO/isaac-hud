#!/usr/bin/env python3
"""Generate white-outlined copies of the heart sprites.

The heart PNGs are transparent-background sprites, so a square CSS border
looks wrong. Instead bake a 1px outline that follows the heart silhouette:
dilate the alpha by 1px and paint the resulting ring white, then keep the
original pixels on top. Output goes to assets/sprites/hearts/outlined/.
Run from the repository root.
"""
import os
import numpy as np
from PIL import Image

SRC = "assets/sprites/hearts"
OUT = os.path.join(SRC, "outlined")

# Every base heart sprite (the ones in HealthBar's HEARTS map). Overlays
# (eternal/gold) sit on top of these and don't need their own outline.
NAMES = [
    "red_full", "red_half", "empty",
    "rotten_full", "rotten_bone",
    "blue_full", "blue_half",
    "black_full", "black_half",
    "bone_full", "bone_half", "bone_empty",
    "coin_full", "coin_half", "coin_empty",
    "broken", "broken_coin", "mantle",
]


def outline(img: Image.Image, thickness: int = 2) -> Image.Image:
    a = np.array(img.convert("RGBA"))
    # Heart body only: the drop shadow is drawn semi-transparent (alpha ~77)
    # to the right/below the heart, while the body (outline, rim and fill —
    # even the semi-opaque 'empty' fill at alpha ~192) is >= 128. Thresholding
    # keeps the outline hugging the heart, not the shadow.
    solid = a[..., 3] >= 128
    # Dilate by `thickness` px (4-neighbourhood, iterated) for the ring.
    dil = solid.copy()
    for _ in range(thickness):
        d = dil.copy()
        d[1:, :] |= dil[:-1, :]
        d[:-1, :] |= dil[1:, :]
        d[:, 1:] |= dil[:, :-1]
        d[:, :-1] |= dil[:, 1:]
        dil = d
    ring = dil & ~solid
    out = a.copy()
    out[ring] = [255, 255, 255, 255]
    return Image.fromarray(out, "RGBA")


def main():
    os.makedirs(OUT, exist_ok=True)
    for name in NAMES:
        p = os.path.join(SRC, name + ".png")
        if not os.path.exists(p):
            print("skip (missing):", p)
            continue
        outline(Image.open(p)).save(os.path.join(OUT, name + ".png"))
        print("wrote", os.path.join(OUT, name + ".png"))


if __name__ == "__main__":
    main()
