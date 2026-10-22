// SpongeBob บน QPU (Final project) — วางทั้งไฟล์ใน https://oreilly-qc.github.io แล้วกด Run
// ภาพ 64x64: qx 6 qubit + qy 6 qubit, pixel (x, y) คือ state |y*64 + x>
// สีของแต่ละ pixel = phase (8 ระดับ ห่างกันทีละ 45 องศา)
// - pixel ทั่วไป: flip ทีละ pixel แบบ oracle ของ Grover (Lec06)
// - ตา: สมการวงกลม x^2 + y^2 < r^2 (Lec11 Example 11-2) ใช้ qacc เป็นที่ทดเลข

// สีที่ QCEngine แสดง: ตั้งได้ 4 ทิศ มุมที่อยู่ระหว่างกลาง QCEngine ผสมสีของ 2 ทิศข้างเคียง
qc_options.color_by_phase = true;
qc_options.book_render = true;
qc_options.qc_cnorth = [1, 1, 1];          // 0   ขาว
qc_options.qc_cwest  = [1, 1, 0.3];        // 90  เหลือง
qc_options.qc_csouth = [0, 0, 0];          // 180 ดำ
qc_options.qc_ceast  = [0.75, 0.58, 0.25]; // 270 น้ำตาล
qc_options.circle_scale = 0.15;
qc.disableAnimation();

// ตัวอักษรในภาพ -> มุม phase
var ANGLE = {'.': 0, 'Y': 45, 'y': 90, 'r': 135, '#': 180, 'd': 225, 'b': 270, 'g': 315};

// ภาพจาก png_to_rows.py (ตาถูกลบออก เพราะวาดด้วย circle() ข้างล่าง)
var image = [
  "................................................................",
  "................................................................",
  "................................................................",
  "................................................................",
  "................................................................",
  "................................................................",
  "................................................................",
  "................................................................",
  "................................................................",
  "................................................................",
  "...........################################.....................",
  "..........##yyyyyyyyybbyyyyyyyyyybbbbbyyy##.....................",
  ".........##yybbbbyyyybbyyyyyyyyyyybbbyy####.....................",
  "........##yybbbbbbyyyyyyyyyyyyyyyyyyyy##yy#.....................",
  "......##yyyyybbbbyyyyyyyyybbbyyyyyyy###yyy#.....................",
  ".....##yyyyyyyyyyyyyyyyyyybbbyyyyyyy#yyyyy#.....................",
  "....#################################yyybb##....................",
  "....#yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy#yybbbb#....................",
  "....#yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy#yybbbb#....................",
  "....##yyyyyyyyyyyyyyyyyyyyyyyyyyyyyy#yyybby#..........##........",
  ".....##y.....yyyyyyyyyyyyyy.......yy#yyyyyy##........#y#........",
  "......#.......yyyyyyyYYYyy.........y#yyyyyyy#.......#yy#........",
  "...............yyYYYYYYYy...ggg.....#yyyyyyy##.######yy#........",
  "................yYYYYYYYy.g.gg......#yybbyyyy###....#yy#........",
  "...........g....yYYyyYYy#.g..g......##ybbyyyyy#..g..#yy#.####...",
  "................yYyyyYyy#.g.........y##yyyyyyy#.g.g.##y###yy#...",
  "............g...yYyyyYYy#...gg......yy#yyyyyy#......##y#yyyy#...",
  "............g...yyyyyYYY#...gg......yy#yyyyyy#.....###y#yyy##...",
  "...............yyyyyYYYYY...........yy#yyybby#..###dd#y##y#.....",
  "..............yyyyyyYYYYYy.........yyy##ybbbb####y####yyyy#.....",
  ".............yyy##yyYYYYYyY.......yyyyy##bbbbyybby####yyy#......",
  "..........##yyyy#yyyYYyYYYyyyyyyyyyyyyyy##bbyyybbyy#.######.....",
  "........###yyyy##yyyyYYyyyyyyyyyyyyyyyyyy#yyyyyyyyy#..##dd##....",
  "........#yyyyy##yyyyyyyyyyyyyyyyyYyyyYyyy##yyyyyyyy#...#ddd#....",
  "........##yy###yyyyyyyy########yyyyyybbyyy##yyyyyyy#...#ddd#....",
  ".........####yyyYyyyyy##rrrrr##yyyyybbbbyyy##yyyyyy#...#ddd#....",
  "............#yyyyyyy###rrrr###yyyyyybbbbyyyy###yybb#...#ddd#....",
  "............##yYYyy##rrrr###yyyyyyyyybbyyyyyyy##ybb#...#####....",
  ".............#yYYy#rrrr###yyyyyyYyYyyyyyyyyyyyy#####.##.........",
  ".............#yyyy######yyyyyyyyyyyyyyyyyyyyyyyyyy###...........",
  ".............#yyyy#....####yyyyyyYyyyyyyyyyyyyyy###.............",
  ".............#yyy##.......#########yyyyyyyy#######..............",
  "..............#yy#........#ddddd#.##########ddddd#..............",
  "...............###........#ddddd#..........#ddddd#..............",
  "................#.....###########..........#######..............",
  "......................#yyyyyyy#.............#y#.....##..........",
  "......................#.#######.............#y#....####.........",
  "......................#.#...................#y#########.........",
  "......................#.#...................#y.....####.........",
  "..................#####.####................###########.........",
  ".................###########..................########..........",
  ".................###########.................########...........",
  ".................###########.................#######............",
  "..................####..###...................#####.............",
  "................................................................",
  "................................................................",
  "................................................................",
  "................................................................",
  "................................................................",
  "................................................................",
  "................................................................",
  "................................................................",
  "................................................................",
  "................................................................",
];

qc.reset(20);
var qx = qint.new(6, 'qx');
var qy = qint.new(6, 'qy');
var qacc = qint.new(8, 'qacc');
qc.write(0);
qx.hadamard();
qy.hadamard();

// flip phase ของ pixel (x, y) เพียงตัวเดียว
function flip(x, y, angle) {
  var index = y * 64 + x;
  qc.not(~index & 0xFFF);    // ทำให้ state นี้กลายเป็น |111111111111>
  qc.cphase(angle, 0xFFF);   // เปลี่ยน phase เฉพาะตอนที่ทั้ง 12 qubit เป็น 1
  qc.not(~index & 0xFFF);    // คืนค่า
}

for (var y = 0; y < 64; y++)
  for (var x = 0; x < 64; x++) {
    var angle = ANGLE[image[y][x]];
    if (angle != 0)
      flip(x, y, angle);
  }

// flip phase ทุก pixel ที่ (x-cx)^2 + (y-cy)^2 < r2
// เลื่อนให้ศูนย์กลางอยู่ที่ 8 แล้วใช้ (x-8)^2 = x^2 - 16x + 64 จะได้ไม่มีเลขติดลบ
// ทำเฉพาะในกรอบ 16x16 รอบศูนย์กลาง (bit 4, 5 ของ x และ y เป็น 0) กันเลขล้น qacc
function circle(cx, cy, r2, angle) {
  qx.subtract(cx - 8);
  qy.subtract(cy - 8);
  qacc.addSquared(qx);
  qacc.subtractShifted(qx, 4);     // ลบ x << 4 = ลบ 16x
  qacc.addSquared(qy);
  qacc.subtractShifted(qy, 4);
  qacc.add(64 + 64 - r2);          // qacc = (x-8)^2 + (y-8)^2 - r2
  qc.not(0x030 | 0xC00);
  qc.cphase(angle, 0x80000 | 0x030 | 0xC00);  // qacc ติดลบ (bit บนสุด = 1) และอยู่ในกรอบ
  qc.not(0x030 | 0xC00);
  // uncompute: ทำย้อนกลับให้ qacc กลับเป็น 0 และ qx, qy กลับเป็นค่าเดิม
  qacc.subtract(64 + 64 - r2);
  qacc.addShifted(qy, 4);
  qacc.subtractSquared(qy);
  qacc.addShifted(qx, 4);
  qacc.subtractSquared(qx);
  qy.add(cy - 8);
  qx.add(cx - 8);
}

// ตาแต่ละข้าง: วงนอก 180 + วงใน 180 อีกรอบ (ข้างในรวม 360 = ขาว เหลือแต่ขอบ) + ตาดำ 180
circle(10, 25, 30, 180);
circle(10, 25, 20, 180);
circle(8, 24, 8, 180);
circle(30, 25, 36, 180);
circle(30, 25, 25, 180);
circle(32, 24, 8, 180);

// พิมพ์ phase ของทุก pixel (0-7 = มุม / 45) ไว้ให้ render_png.py ทำภาพ
// QCEngine เก็บ phase เป็น e^(-i angle) จึงต้องใส่เครื่องหมายลบกลับ
var text = '';
for (var y = 0; y < 64; y++) {
  for (var x = 0; x < 64; x++) {
    var c = qc.qReg.peekComplexValue(y * 64 + x);
    var deg = -Math.atan2(c.y, c.x) * 180 / Math.PI;
    text += (Math.round(deg / 45) + 8) % 8;
  }
  text += '\n';
}
qc.print(text);

// ขยายช่อง circle notation ให้เห็นแถวละ 64 วง
for (var i = 0; i < qc.panel_chart.widgets.length; i++)
  qc.panel_chart.widgets[i].autoMagScale = true;
qc.panel_chart.setSize(1250, 1250);
