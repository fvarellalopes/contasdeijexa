"""Gera favicons circulares transparentes a partir da logo oficial."""
import base64
from pathlib import Path
from PIL import Image, ImageDraw


def main() -> None:
    """Aplica o recorte circular e exporta os formatos usados pelos navegadores."""
    root = Path(__file__).resolve().parents[1] / 'dist'
    logo = Image.open(root / 'assets/logo-contas-de-ijexa.png').convert('RGBA')
    # O disco ocupa o centro da arte; a margem externa branca fica fora do ícone.
    inset = round(min(logo.size) * 0.025)
    square = logo.crop((inset, inset, logo.width - inset, logo.height - inset))
    mask = Image.new('L', square.size, 0)
    ImageDraw.Draw(mask).ellipse((0, 0, square.width - 1, square.height - 1), fill=255)
    square.putalpha(mask)
    for name, size in [('favicon.png', 96), ('favicon-192.png', 192), ('apple-touch-icon.png', 180)]:
        square.resize((size, size), Image.Resampling.LANCZOS).save(root / name)
    square.save(root / 'favicon.ico', format='ICO', sizes=[(16,16), (32,32), (48,48), (64,64)])
    encoded = base64.b64encode((root / 'favicon-192.png').read_bytes()).decode('ascii')
    (root / 'favicon.svg').write_text(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192">'
        '<image width="192" height="192" href="data:image/png;base64,'
        + encoded + '"/></svg>', encoding='utf-8')


if __name__ == '__main__':
    main()
