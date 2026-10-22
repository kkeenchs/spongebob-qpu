import sys
from PIL import Image

#color in pic --> char
COLORS = {
    (255, 255, 255): '.',  #white
    (255, 255, 0): 'Y',    #bright yellow
    (255, 255, 77): 'y',   #yellow
    (226, 255, 77): 'y',   #green yellow
    (102, 0, 0): 'r',      #dark red
    (0, 0, 0): '#',        #black
    (17, 17, 17): '#',
    (77, 61, 26): 'd',     #dark brown
    (191, 149, 64): 'b',   #brown
    (238, 238, 238): 'g',  #grey
}
SHIFT_UP = 8

EYES = [(10, 25, 30, 20, 8, 24, 8), (30, 25, 36, 25, 32, 24, 8)]


def nearest(c):
    return COLORS[min(COLORS, key=lambda p: sum((a - b) ** 2 for a, b in zip(p, c)))]


def inside(x, y, cx, cy, r2):
    return (x - cx) ** 2 + (y - cy) ** 2 < r2


im = Image.open(sys.argv[1]).convert('RGB')
rows = []
for y in range(64):
    row = ''
    for x in range(64):
        ch = '.'
        if y + SHIFT_UP < 64:
            ch = nearest(im.getpixel((x, y + SHIFT_UP)))
        for cx, cy, r_out, r_in, px, py, r_pupil in EYES:
            if inside(x, y, cx, cy, r_out):
                in_white = inside(x, y, cx, cy, r_in) and not inside(x, y, px, py, r_pupil)
                if not (ch == 'g' and in_white):
                    ch = '.'
        row += ch
    rows.append(row)

for row in rows:
    print('  "' + row + '",')
