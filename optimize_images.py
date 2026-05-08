"""
Generate responsive WebP + JPEG variants for /images.
Run: python optimize_images.py
"""
import os
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).parent
SRC = ROOT / "images"
OUT = SRC / "optimized"
OUT.mkdir(parents=True, exist_ok=True)

# Gallery: served at ~600-800px CSS, full-width on mobile.
# Portrait: served at ~400px CSS column on desktop.
JOBS = {
    "gallery_1.jpg":      {"sizes": [1600, 800], "quality_webp": 78, "quality_jpg": 78},
    "gallery_2.jpg":      {"sizes": [1600, 800], "quality_webp": 78, "quality_jpg": 78},
    "gallery_3.jpg":      {"sizes": [1600, 800], "quality_webp": 78, "quality_jpg": 78},
    "gallery_4.jpg":      {"sizes": [1600, 800], "quality_webp": 78, "quality_jpg": 78},
    "gallery_5.jpg":      {"sizes": [1600, 800], "quality_webp": 78, "quality_jpg": 78},
    "gallery_6.jpeg":     {"sizes": [1600, 800], "quality_webp": 76, "quality_jpg": 78},
    "gallery_7.jpeg":     {"sizes": [1600, 800], "quality_webp": 76, "quality_jpg": 78},
    "adri_portrait.jpg":  {"sizes": [1200, 800, 480], "quality_webp": 82, "quality_jpg": 82},
}


def process(name: str, conf: dict) -> None:
    src = SRC / name
    if not src.exists():
        print(f"  ! Missing: {name}")
        return

    stem = Path(name).stem
    with Image.open(src) as im:
        im = ImageOps.exif_transpose(im)
        if im.mode not in ("RGB",):
            im = im.convert("RGB")

        original_w = im.width
        for target_w in conf["sizes"]:
            if target_w >= original_w:
                resized = im.copy()
            else:
                ratio = target_w / original_w
                resized = im.resize(
                    (target_w, max(1, int(round(im.height * ratio)))),
                    Image.Resampling.LANCZOS,
                )

            webp_path = OUT / f"{stem}-{target_w}.webp"
            jpg_path = OUT / f"{stem}-{target_w}.jpg"

            resized.save(
                webp_path,
                format="WEBP",
                quality=conf["quality_webp"],
                method=6,
            )
            resized.save(
                jpg_path,
                format="JPEG",
                quality=conf["quality_jpg"],
                optimize=True,
                progressive=True,
            )
            print(
                f"  {stem}-{target_w}: "
                f"webp {webp_path.stat().st_size/1024:6.1f}KB  "
                f"jpg {jpg_path.stat().st_size/1024:6.1f}KB"
            )


def main() -> None:
    total_in = 0
    total_out = 0
    for name in JOBS:
        p = SRC / name
        if p.exists():
            total_in += p.stat().st_size

    for name, conf in JOBS.items():
        print(f"-> {name}")
        process(name, conf)

    for f in OUT.iterdir():
        if f.is_file():
            total_out += f.stat().st_size

    print()
    print(f"Originals total : {total_in/1024/1024:6.2f} MB")
    print(f"Optimized total : {total_out/1024/1024:6.2f} MB")
    if total_in:
        print(f"Saving          : {(1 - total_out/total_in)*100:5.1f}%")


if __name__ == "__main__":
    main()
