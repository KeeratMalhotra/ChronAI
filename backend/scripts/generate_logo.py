"""Generate the Haven logo PNG for use in emails.

Renders a raster version of frontend/app/icon.svg: a warm diagonal gradient
background (#e8a87c -> #8b5a3c) with a dark pixel-art "H" (#3a2418).

Email clients do not reliably render SVG or remote images, so we ship a small
PNG that is embedded inline (CID) in notification emails.

Run once to (re)generate the asset:

    python scripts/generate_logo.py

The resulting PNG is committed to the repo at app/assets/haven_logo.png.
"""

from pathlib import Path

from PIL import Image, ImageDraw

# Source icon.svg uses a 32x32 viewBox; render at 3x for a crisp 96x96 PNG.
SVG_SIZE = 32
SCALE = 3
SIZE = SVG_SIZE * SCALE

# Warm gradient endpoints (top-left -> bottom-right), matching icon.svg.
GRAD_START = (0xE8, 0xA8, 0x7C)  # #e8a87c
GRAD_END = (0x8B, 0x5A, 0x3C)    # #8b5a3c
H_COLOR = (0x3A, 0x24, 0x18)     # #3a2418

# "H" rectangles from icon.svg, in 32-unit coordinates: (x, y, w, h)
H_RECTS = [
    (4, 4, 8, 24),    # left vertical bar
    (20, 4, 8, 24),   # right vertical bar
    (12, 12, 8, 8),   # crossbar
]


def _lerp(a: int, b: int, t: float) -> int:
    return round(a + (b - a) * t)


def generate(out_path: Path) -> None:
    img = Image.new("RGB", (SIZE, SIZE))
    px = img.load()

    # Diagonal linear gradient: t runs 0->1 along the top-left -> bottom-right axis.
    max_sum = (SIZE - 1) * 2 or 1
    for y in range(SIZE):
        for x in range(SIZE):
            t = (x + y) / max_sum
            px[x, y] = (
                _lerp(GRAD_START[0], GRAD_END[0], t),
                _lerp(GRAD_START[1], GRAD_END[1], t),
                _lerp(GRAD_START[2], GRAD_END[2], t),
            )

    draw = ImageDraw.Draw(img)
    for (rx, ry, rw, rh) in H_RECTS:
        x0, y0 = rx * SCALE, ry * SCALE
        x1, y1 = (rx + rw) * SCALE - 1, (ry + rh) * SCALE - 1
        draw.rectangle([x0, y0, x1, y1], fill=H_COLOR)

    out_path.parent.mkdir(parents=True, exist_ok=True)
    img.save(out_path, "PNG")
    print(f"Wrote {out_path} ({out_path.stat().st_size} bytes, {SIZE}x{SIZE})")


if __name__ == "__main__":
    out = Path(__file__).resolve().parent.parent / "app" / "assets" / "haven_logo.png"
    generate(out)
