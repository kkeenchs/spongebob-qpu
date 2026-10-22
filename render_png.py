import sys
from PIL import Image

# phase (theta / 45) -> RGB
PALETTE = {
    0: (255, 255, 255),  # 0   white
    1: (255, 255, 0),    # 45  bright yellow
    2: (255, 255, 77),   # 90  yellow
    3: (140, 20, 20),    # 135 dark red
    4: (0, 0, 0),        # 180 black
    5: (77, 61, 26),     # 225 dark brown
    6: (191, 149, 64),   # 270 brown
    7: (215, 215, 215),  # 315 grey
}

lines = [line.strip() for line in open(sys.argv[1]) if len(line.strip()) == 64]
im = Image.new('RGB', (64, 64))
for y in range(64):
    for x in range(64):
        im.putpixel((x, y), PALETTE[int(lines[y][x])])

im.save(sys.argv[2])
im.resize((512, 512), Image.NEAREST).save(sys.argv[2].replace('.png', '_x8.png'))
