# Generates public/og-image.png (1200x630 social preview).
# Run: python scripts/build-og.py   (needs Pillow; uses Windows fonts Georgia / Consolas / Segoe UI)
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H = 1200, 630
INK = (11, 13, 10); FG = (232, 237, 228); MUTE = (141, 148, 136); LIME = (198, 244, 50)
F = 'C:/Windows/Fonts/'

img = Image.new('RGB', (W, H), INK)
glow = Image.new('RGB', (W, H), INK)
ImageDraw.Draw(glow).ellipse((380, 380, 1000, 900), fill=(60, 80, 12))
img = Image.blend(img, glow.filter(ImageFilter.GaussianBlur(120)), 0.9)

# photo on the right, fading into the background
ph = Image.open('public/img/joao.jpg').convert('RGB')
pw = 420
ph = ph.resize((pw, int(ph.height * pw / ph.width)))
top = int(ph.height * 0.18)
ph = ph.crop((0, top, pw, top + H))
mask = Image.new('L', (pw, H), 0)
m = ImageDraw.Draw(mask)
for x in range(pw):
    m.line([(x, 0), (x, H)], fill=int(255 * min(1, x / 160)))
img.paste(ph, (W - pw, 0), mask)

d = ImageDraw.Draw(img)
serif = ImageFont.truetype(F + 'georgia.ttf', 74)
serifi = ImageFont.truetype(F + 'georgiai.ttf', 74)
mono = ImageFont.truetype(F + 'consola.ttf', 20)
sans = ImageFont.truetype(F + 'segoeui.ttf', 26)

d.text((70, 70), 'JOÃO MENESES  ·  FULL-STACK SOFTWARE ENGINEER', font=mono, fill=MUTE)
d.text((70, 160), 'I build systems', font=serif, fill=FG)
x = 70
d.text((x, 250), 'that ', font=serif, fill=FG)
x += d.textlength('that ', font=serif)
d.text((x, 250), "don't break", font=serifi, fill=LIME)
d.text((70, 340), 'at 3am.', font=serif, fill=FG)
d.text((70, 470), 'C# / .NET  ·  React / Next.js  ·  PostgreSQL', font=sans, fill=FG)
d.text((70, 515), 'Relocating to Valencia  ·  Open to sponsorship & remote', font=sans, fill=MUTE)
d.rounded_rectangle((70, 568, 290, 602), radius=17, fill=LIME)
d.text((88, 574), 'devmeneses.com', font=mono, fill=INK)
img.save('public/og-image.png')
print('public/og-image.png')
