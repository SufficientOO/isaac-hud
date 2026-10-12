#!/usr/bin/env python3
"""Turn each floor texture atlas into a plain, tileable snippet.

The game's `nfloorgfx` images are ATLASES of floor pieces (inside/edge/
corner tiles with beveled borders) — tiling the whole atlas as a background
repeats those bordered blocks. The floor's actual surface is the plain
interior of the tiles, so we crop the lowest-variance NxN window (which is
guaranteed to sit inside a tile's plain area, away from the beveled edges)
and use that as the seamless-ish background.

Run from the repository root (rewrites assets/floors/<id>.png in place).
"""
import numpy as np
from PIL import Image
import glob, os

WIN = 72  # snippet size (px)


def plainest_crop(a: np.ndarray, win: int) -> np.ndarray:
    """Return the lowest-variance win×win window that is opaque floor area
    (skips the atlas's transparent/black padding, which has zero variance)."""
    lum = a[..., :3].astype(np.float64).mean(axis=2)
    valid = (a[..., 3] >= 250) & (lum > 0.06)  # opaque, not black padding

    ii = lum.cumsum(0).cumsum(1)
    ii2 = (lum * lum).cumsum(0).cumsum(1)
    iv = valid.astype(np.int64).cumsum(0).cumsum(1)

    def rect(ii_, y, x, h, w):
        s = ii_[y + h - 1, x + w - 1]
        if y > 0: s -= ii_[y - 1, x + w - 1]
        if x > 0: s -= ii_[y + h - 1, x - 1]
        if y > 0 and x > 0: s += ii_[y - 1, x - 1]
        return s

    H, W = lum.shape
    best = None
    best_var = None
    n = win * win
    for y in range(0, H - win + 1):
        for x in range(0, W - win + 1):
            if rect(iv, y, x, win, win) < n:
                continue  # window touches padding → not a floor interior
            s = rect(ii, y, x, win, win)
            s2 = rect(ii2, y, x, win, win)
            var = s2 / n - (s / n) ** 2
            if best_var is None or var < best_var:
                best_var = var
                best = (y, x)
    if best is None:  # no fully-opaque window: fall back to whole image
        return a[:win, :win]
    y, x = best
    return a[y:y + win, x:x + win]


def main():
    for p in sorted(glob.glob("assets/floors/*.png")):
        img = Image.open(p).convert("RGBA")
        a = np.array(img)
        if a.shape[0] < WIN or a.shape[1] < WIN:
            print("skip (too small):", p)
            continue
        crop = plainest_crop(a, WIN)
        Image.fromarray(crop, "RGBA").save(p)
        print(f"{os.path.basename(p)} -> {WIN}x{WIN} plain snippet")


if __name__ == "__main__":
    main()
