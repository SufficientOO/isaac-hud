#!/usr/bin/env python3
"""Trim the transparent gutter rows/columns from the minimap tile sprites.

The extractor sliced minimap1.png into 36x32 / 18x32 / 36x16 frames that
include the sheet's inter-tile gutters: every multi-cell tile (shapes 4-12)
has 2 fully-transparent rows at the BOTTOM and/or columns at the RIGHT,
which show as background gaps between adjacent rooms on the HUD minimap.
1x1 tiles (18x16) are clean.

Trimming in place (keeping the full cell grid size, only dropping the dead
edge) then re-scaling to the exact cell-grid size keeps the renderer's math
(cells = w*cellW x h*cellH) valid. We do it by REMOVING the transparent
edge rows/cols and REPEATING the last opaque row/col to restore the size.
"""

from PIL import Image
import numpy as np
import glob
import os

DIR = os.path.join(os.path.dirname(__file__), "..", "assets/sprites/minimap")


def trim_restore(path: str) -> None:
    img = Image.open(path).convert("RGBA")
    a = np.array(img)
    opaque = a[..., 3] > 0
    rows = np.where(opaque.any(axis=1))[0]
    cols = np.where(opaque.any(axis=0))[0]
    h, w = a.shape[:2]
    top, bottom = rows.min(), h - 1 - rows.max()
    left, right = cols.min(), w - 1 - cols.max()
    if top == 0 and bottom == 0 and left == 0 and right == 0:
        return  # clean
    # crop off the dead edges
    a = a[top: h - bottom, left: w - right]
    # restore the original cell-grid size by repeating the last opaque
    # row/col into the trimmed edge (keeps renderer math: full box is art)
    hh, ww = a.shape[:2]
    if bottom:
        a = np.concatenate([a, np.repeat(a[hh - 1: hh], bottom, axis=0)], axis=0)
        hh = a.shape[0]
    if right:
        a = np.concatenate([a, np.repeat(a[:, ww - 1: ww], right, axis=1)], axis=1)
    Image.fromarray(a, "RGBA").save(path)
    print(f"{os.path.basename(path)}: trimmed t{top} b{bottom} l{left} r{right}")


def main():
    for p in sorted(glob.glob(os.path.join(DIR, "*.png"))):
        trim_restore(p)


if __name__ == "__main__":
    main()