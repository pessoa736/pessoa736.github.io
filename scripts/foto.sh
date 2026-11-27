#!/usr/bin/env bash
# Prepares the portrait used on the home page: removes the background, crops to the
# person and saves a light WebP at public/images/eu-recorte.webp.
#
#   npm run foto -- caminho/da/foto.jpg
#
# Needs `uv` (runs rembg in a throwaway Python 3.12 env; the first run downloads the
# ~180 MB isnet model) and Python with Pillow. The TV filter itself is CSS
# (src/components/Portrait.astro); the sepia tone is baked into the file.
set -euo pipefail

input="${1:?uso: npm run foto -- caminho/da/foto.jpg}"
out="public/images/eu-recorte.webp"
tmp="$(mktemp --suffix=.png)"
trap 'rm -f "$tmp"' EXIT

echo "removendo o fundo de $input ..."
uvx -q --python 3.12 --from "rembg[cpu,cli]" rembg i -m isnet-general-use -a "$input" "$tmp" 2>/dev/null

python3 - "$tmp" "$out" <<'EOF'
import sys
from PIL import Image
src, dst = sys.argv[1], sys.argv[2]
im = Image.open(src).convert("RGBA")
# crop to what is left of the person, then cap the width for the web
im = im.crop(im.getchannel("A").point(lambda a: 255 if a > 24 else 0).getbbox())
im.thumbnail((900, 1200))
# bake the old-print look into the file (monochrome, warm, a bit of contrast).
# Doing it with a CSS filter made Chromium stop painting the image when it shakes.
from PIL import ImageOps, ImageEnhance
alpha = im.getchannel("A")
gray = ImageEnhance.Contrast(ImageOps.grayscale(im.convert("RGB"))).enhance(1.15)
im = ImageOps.colorize(gray, black="#1d1812", white="#f1e4c6", mid="#8c7a60").convert("RGBA")
im.putalpha(alpha)
im.save(dst, "WEBP", quality=82, method=6)
print(f"salvo {dst} ({im.width}x{im.height})")
EOF
