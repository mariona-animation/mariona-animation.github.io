#!/usr/bin/env python3
"""Genera els placeholders (PNG + MP4) a partir de dibuixos_web.xlsx.
Mida = Ample/Alt % de l'escena 1920x1080 x2 (retina), tal com diu l'Excel.
Ús:  python3 tools/generate_placeholders.py [ruta/dibuixos_web.xlsx]
Requereix: pillow, numpy, openpyxl, ffmpeg."""
import sys, os, json, colorsys, subprocess, math, random
import numpy as np, openpyxl
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
XLSX = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "dibuixos_web.xlsx")
IMG, VID = os.path.join(ROOT, "src/img"), os.path.join(ROOT, "src/video")
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
S = 2  # retina

def folder(i, page):
    if i.startswith("nav"): return "icons"
    if i.startswith("poster"): return "logos"
    return {"Global (totes les pàgines)": "illustrations/global", "Home": "illustrations/home",
            "Projects": "illustrations/projects", "Animation": "illustrations/animation",
            "Rig & Tools": "illustrations/rig-tools"}[page]

def font(sz): return ImageFont.truetype(FONT, max(8, int(sz)))
def fit(d, txt, box, fill, stroke=None, maxsz=400, anchor="mm"):
    x0, y0, x1, y1 = box
    lo, hi = 8, maxsz
    while lo < hi:
        m = (lo + hi + 1) // 2
        b = d.textbbox((0, 0), txt, font=font(m))
        if b[2] - b[0] <= (x1 - x0) and b[3] - b[1] <= (y1 - y0): lo = m
        else: hi = m - 1
    f = font(lo); cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    sw = max(1, lo // 14) if stroke else 0
    d.text((cx, cy), txt, font=f, fill=fill, anchor=anchor, stroke_width=sw, stroke_fill=stroke)
    return lo

def shade(c, k):  # k<1 fosca, k>1 clara
    return tuple(max(0, min(255, int(v * k if k <= 1 else v + (255 - v) * (k - 1)))) for v in c)

def palette(n):
    out = []
    for i in range(n):
        h = (i * 0.61803398875) % 1.0
        s = (0.85, 0.65, 0.95)[i % 3]; v = (0.95, 0.75, 0.6)[i % 3]
        r, g, b = colorsys.hsv_to_rgb(h, s, v); out.append((int(r * 255), int(g * 255), int(b * 255)))
    return out

def lowres_alpha(W, H, fn, k=8):
    w, h = max(2, W // k), max(2, H // k)
    yy, xx = np.mgrid[0:h, 0:w]; a = fn(xx / (w - 1), yy / (h - 1))
    im = Image.fromarray((np.clip(a, 0, 1) * 255).astype("uint8"), "L")
    return im.resize((W, H), Image.BICUBIC)

def solid(W, H, c, a=255): return Image.new("RGBA", (W, H), c + (a,))
def label(im, i, W, H, kind, c, y=None):
    d = ImageDraw.Draw(im); lum = 0.3*c[0]+0.59*c[1]+0.11*c[2]
    fg, st = ((255,255,255),(0,0,0)) if lum < 150 else ((0,0,0),(255,255,255))
    cy = H/2 if y is None else y; bh = min(H*0.3, W*0.3)
    fit(d, i, (W*0.08, cy-bh*0.6, W*0.92, cy+bh*0.1), fg, st)
    fit(d, f"{W//S}×{H//S} px · {kind}", (W*0.08, cy+bh*0.15, W*0.92, cy+bh*0.45), fg, st, maxsz=120)

# ---------------------------------------------------------------- dibuixos
def draw(i, W, H, c, kind):
    dk, lt = shade(c, .55), shade(c, 1.45)
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    R = lambda x0, y0, x1, y1: (x0*W, y0*H, x1*W, y1*H)
    t = max(2, W // 300)

    if i == "frame":
        b = round(W * .032); d.rectangle((0,0,W,H), fill=c+(255,)); d.rectangle((b,b,W-b,H-b), fill=(0,0,0,0))
        d.rectangle((b-t*2,b-t*2,W-b+t*2,H-b+t*2), outline=lt+(255,), width=t*2)
        d.rectangle((0,0,W-1,H-1), outline=dk+(255,), width=t*2)
        fit(d, "frame — centre transparent", (W*.2, b*.15, W*.8, b*.85), (255,255,255), (0,0,0))
    elif i == "fxVignette":
        a = lowres_alpha(W, H, lambda x, y: np.clip((np.hypot((x-.5)*1.25, (y-.5)*1.25)-.45)/.45, 0, 1)**1.6*.85)
        im = Image.new("RGBA", (W, H), dk + (255,)); im.putalpha(a)
        fit(ImageDraw.Draw(im), "fxVignette", R(.44,.955,.56,.985), (255,255,255), (0,0,0))
    elif i == "lightIdle":
        im = solid(W, H, c, 85); label(im, i, W, H, kind, c)
    elif i in ("lampsOff", "lampsOn"):
        on = i == "lampsOn"; d.rectangle(R(0,0,1,.12), fill=shade(c,.5)+(255,)); d.rectangle(R(0,.09,1,.12), fill=lt+(255,))
        for cx in (.25, .75):
            d.rectangle(R(cx-.004,.12,cx+.004,.4), fill=dk+(255,))
            d.polygon([(W*(cx-.035),H*.8),(W*(cx+.035),H*.8),(W*(cx+.02),H*.4),(W*(cx-.02),H*.4)], fill=shade(c,.8)+(255,), outline=dk+(255,))
            lens = (255,250,200) if on else shade(c,.35)
            d.ellipse(R(cx-.03,.72,cx+.03,.98), fill=lens+(255,), outline=lt+(255,), width=t)
            if on: d.ellipse(R(cx-.012,.78,cx+.012,.9), fill=(255,255,255,255))
        fit(d, i, R(.4,.3,.6,.75), (255,255,255), (0,0,0))
    elif i == "beamL":
        pm = Image.new("L", (W//8, H//8), 0); pd = ImageDraw.Draw(pm); w, h = pm.size
        pd.polygon([(w*.36,0),(w*.42,0),(w*1.0,h),(w*.1,h)], fill=255)
        pm = pm.filter(ImageFilter.GaussianBlur(w*.03)).resize((W,H), Image.BICUBIC)
        fade = lowres_alpha(W, H, lambda x, y: 1.0 - .75*y)
        a = np.minimum(np.array(pm), np.array(fade)).astype("uint8")
        im = Image.new("RGBA", (W, H), lt + (255,)); im.putalpha(Image.fromarray(a, "L"))
        fit(ImageDraw.Draw(im), i, R(.3,.55,.9,.7), (255,255,255), (0,0,0))
    elif i == "lightLit":
        def blobs(x, y):
            a = 0
            for bx, by, r in ((.25,.2,.28),(.75,.2,.28),(.5,.85,.4),(.3,.9,.2),(.7,.9,.2)):
                a = np.maximum(a, np.clip(1-np.hypot((x-bx)*1.78, y-by)/r, 0, 1))
            return a*.7
        im = Image.new("RGBA", (W, H), lt + (255,)); im.putalpha(lowres_alpha(W, H, blobs))
        fit(ImageDraw.Draw(im), i, R(.4,.46,.6,.54), (255,255,255), (0,0,0))
    elif i == "curtainL":
        d.rectangle((0,0,W,H), fill=c+(255,)); n = 6
        for k in range(n):
            x0 = W*k/n
            for s in range(int(W/n)):
                v = .6 + .5*math.sin(s/(W/n)*math.pi); d.line((x0+s,0,x0+s,H), fill=shade(c, .45+.8*v*.8)+(255,))
        d.rectangle((0,H-H*.03,W,H), fill=dk+(255,))
        fit(d, "curtainL", R(.08,.45,.92,.55), (255,255,255), (0,0,0)); fit(d, f"{W//S}×{H//S}", R(.1,.57,.9,.62), (255,255,255), (0,0,0), 80)
    elif i == "valance":
        d.rectangle(R(0,0,1,.7), fill=c+(255,)); n = 14
        for k in range(n): d.pieslice(R(k/n,.35,(k+1)/n,1.0), 0, 180, fill=c+(255,), outline=dk+(255,), width=t)
        d.rectangle(R(0,.68,1,.72), fill=lt+(255,)); label(im, i, W, H, kind, c, H*.3)
    elif i == "proscenium":
        b = W*.04; d.rectangle((0,0,W,H), fill=c+(255,)); d.rectangle((b,b*1.4,W-b,H-b*.6), fill=(0,0,0,0))
        d.rectangle((b-t*2,b*1.4-t*2,W-b+t*2,H-b*.6+t*2), outline=lt+(255,), width=t*2)
        fit(d, "proscenium — centre transparent", R(.25,.005,.75,.045), (255,255,255), (0,0,0))
    elif i in ("garlandFront", "garlandGlow", "garlandBack"):
        pts = [(W*k/60, H*(.25+.25*math.sin(k/60*math.pi*5)**2)) for k in range(61)]
        if i == "garlandBack":
            d.line(pts, fill=dk+(255,), width=t*2)
            for k in range(2, 60, 3):
                x, y = pts[k]; d.polygon([(x-W*.014,y),(x+W*.014,y),(x,y+H*.5)], fill=shade(c, .8+ (k%2)*.5)+(255,), outline=dk+(255,))
            fit(d, i, R(.4,.7,.6,.95), (255,255,255), (0,0,0))
        elif i == "garlandFront":
            d.line(pts, fill=dk+(255,), width=t*2)
            for k in range(1, 60, 2):
                x, y = pts[k]; r = H*.09; d.ellipse((x-r,y,x+r,y+r*2), fill=shade(c,.6)+(255,), outline=lt+(255,), width=t)
            fit(d, i, R(.4,.7,.6,.98), (255,255,255), (0,0,0))
        else:
            g = Image.new("RGBA", (W, H), (0,0,0,0)); gd = ImageDraw.Draw(g)
            for k in range(1, 60, 2):
                x, y = pts[k]; r = H*.4; gd.ellipse((x-r,y+H*.09-r,x+r,y+H*.09+r), fill=lt+(150,)); gd.ellipse((x-H*.1,y,x+H*.1,y+H*.18), fill=(255,255,255,255))
            im = g.filter(ImageFilter.GaussianBlur(H*.08)); fit(ImageDraw.Draw(im), i, R(.4,.7,.6,.98), (255,255,255), (0,0,0))
    elif i == "lever":
        d.rounded_rectangle(R(.38,.12,.62,1.0), radius=W*.1, fill=shade(c,.8)+(255,), outline=dk+(255,), width=t)
        d.ellipse((0, 0, W, W), fill=lt+(255,), outline=dk+(255,), width=t)
        d.rectangle(R(0,.88,1,1), fill=dk+(255,)); fit(d, "lever", (W*.1, H*.2, W*.9, H*.3), (255,255,255), (0,0,0))
    elif i == "machineBody":
        d.rounded_rectangle(R(.02,.02,.98,.98), radius=W*.04, fill=c+(255,), outline=dk+(255,), width=t*2)
        d.rectangle(R(.38,.07,.62,.12), fill=(15,10,10,255), outline=lt+(255,), width=t)   # ranura palanca
        d.rectangle(R(.1,.22,.9,.5), fill=shade(c,.4)+(255,), outline=lt+(255,), width=t*2)
        fit(d, "SHOWREEL", R(.14,.25,.86,.42), (255,255,255), (0,0,0)); fit(d, f"machineBody {W//S}×{H//S}", R(.14,.43,.86,.48), (255,255,255), (0,0,0), 90)
        for k, x in enumerate((.2,.4,.6,.8)): d.ellipse(R(x-.05,.58,x+.05,.58+.1*W/H), fill=shade(c,.45)+(255,), outline=lt+(255,), width=t)
        d.rectangle(R(.3,.8,.7,.88), fill=dk+(255,)); d.rectangle(R(.08,.93,.92,.98), fill=dk+(255,))
    elif i == "machineGlow":
        g = Image.new("RGBA", (W, H), (0,0,0,0)); gd = ImageDraw.Draw(g)
        gd.rectangle(R(.1,.22,.9,.5), fill=lt+(110,))
        for x in (.2,.4,.6,.8):
            gd.ellipse(R(x-.12,.58-.12*W/H*.5,x+.12,.58+.12*W/H*1.5), fill=lt+(170,)); gd.ellipse(R(x-.05,.58,x+.05,.58+.1*W/H), fill=(255,255,255,255))
        im = g.filter(ImageFilter.GaussianBlur(W*.012)); fit(ImageDraw.Draw(im), "machineGlow", R(.14,.65,.86,.72), (255,255,255), (0,0,0))
    elif i == "reelRopes":
        for x in (.2, .8):
            d.rectangle(R(x-.012,0,x+.012,1), fill=c+(255,))
            for y in range(0, H, max(6, H//40)): d.line((W*(x-.012), y, W*(x+.012), y+H//80), fill=dk+(255,), width=t)
        fit(d, "reelRopes", R(.3,.4,.7,.55), (255,255,255), (0,0,0))
    elif i == "reelBoard":
        d.rounded_rectangle(R(0,0,1,1), radius=W*.02, fill=c+(255,), outline=dk+(255,), width=t*2)
        x0, y0, x1, y1 = .055, .10, .055+.89, .10+.80
        d.rectangle(R(x0-.006,y0-.012,x1+.006,y1+.012), outline=lt+(255,), width=t*2); d.rectangle(R(x0,y0,x1,y1), fill=(0,0,0,0))
        fit(d, f"reelBoard {W//S}×{H//S} — finestra transparent", R(.1,.915,.9,.985), (255,255,255), (0,0,0))
    elif i.startswith("puppet"):
        n = i[-1]; d.rectangle(R(.05,.02,.95,.98), outline=lt+(255,), width=t*2)
        d.line(R(.5,0,.5,.18), fill=dk+(255,), width=t*2); d.ellipse(R(.33,.16,.67,.16+.34*W/H*1.0), fill=c+(255,), outline=dk+(255,), width=t*2)
        d.rounded_rectangle(R(.3,.38,.7,.72), radius=W*.06, fill=shade(c,.85)+(255,), outline=dk+(255,), width=t*2)
        d.line(R(.3,.42,.1,.62), fill=c+(255,), width=int(W*.07)); d.line(R(.7,.42,.9,.62), fill=c+(255,), width=int(W*.07))
        d.rectangle(R(.34,.72,.46,.95), fill=c+(255,), outline=dk+(255,), width=t); d.rectangle(R(.54,.72,.66,.95), fill=c+(255,), outline=dk+(255,), width=t)
        label(im, i, W, H, kind, c, H*.52)
    elif i.startswith("file") and i[-1].isdigit():
        fh = round(H*.074); d.rounded_rectangle((0,0,W*.34,fh*1.6), radius=fh*.4, fill=lt+(255,), outline=dk+(255,), width=t)  # solapa en blanc
        d.rectangle((0,fh,W,H), fill=c+(255,), outline=dk+(255,), width=t*2)
        d.rectangle(R(.03,.11,.97,.98), fill=(0,0,0,0))
        d.rectangle(R(.03-.003,.11-.005,.97+.003,.98+.005), outline=lt+(255,), width=t)
        fit(d, f"{i} · {W//S}×{H//S} · forat transparent", R(.38,.007,.99,.095), (255,255,255), (0,0,0), 60)
    elif i == "drawerBg":
        d.rectangle((0,0,W,H), fill=dk+(255,)); vp = np.array([W*.5, -.3*H]); P = lambda x, y: np.array([x*W, y*H])
        o = [P(.2,.1), P(.8,.1), P(.8,.65), P(.2,.65)]; f = .55; b = [vp + f*(p-vp) for p in o]
        T = lambda *p: [tuple(q) for q in p]
        d.polygon(T(*o), fill=shade(c,.5)+(255,))                      # interior (fons)
        d.polygon(T(o[0],b[0],b[3],o[3]), fill=shade(c,.8)+(255,))     # paret esq.
        d.polygon(T(o[1],b[1],b[2],o[2]), fill=shade(c,.7)+(255,))     # paret dreta
        d.polygon(T(o[3],o[2],b[2],b[3]), fill=lt+(255,))              # terra
        d.polygon(T(*b), fill=shade(c,.95)+(255,), outline=dk+(255,))  # fons del calaix
        for p in o: d.line([tuple(p), tuple(vp + .75*(p-vp))], fill=dk+(255,), width=t)
        d.polygon(T(*o), outline=lt+(255,)); d.line(T(*o, o[0]), fill=lt+(255,), width=t*2)
        fit(d, "drawerBg — perspectiva, punt de fuga (50%, −30%)", R(.2,.02,.8,.08), (255,255,255), (0,0,0)); fit(d, f"{W//S}×{H//S} px · {kind}", R(.3,.88,.7,.94), (255,255,255), (0,0,0), 80)
    elif i == "drawerFront":
        d.rectangle((0,0,W,H), fill=c+(255,)); d.rectangle((0,0,W,t*6), fill=lt+(255,)); d.rectangle((0,t*6,W,t*10), fill=dk+(255,))
        d.rounded_rectangle(R(.42,.22,.58,.38), radius=W*.01, fill=lt+(255,), outline=dk+(255,), width=t*2)
        label(im, i, W, H, kind, c, H*.7)
    elif i == "workshopBg":
        d.rectangle((0,0,W,H), fill=c+(255,)); d.rectangle(R(0,.78,1,1), fill=dk+(255,)); d.rectangle(R(0,.76,1,.78), fill=lt+(255,))
        for x in (.5, .52, .54): d.rectangle(R(x-.004,.1,x+.004,.7), fill=shade(c,.8)+(255,))
        for k in range(6): d.ellipse(R(.02+k*.017,.84,.03+k*.017,.84+.016*W/H), fill=lt+(255,))
        for r in ((.04,.12,.48,.70),(.52,.12,.96,.70)): d.rectangle(R(*r), fill=shade(c,.75)+(255,), outline=lt+(255,), width=t*2)
        fit(d, "workshopBg — espais lliures per a les 2 pissarres", R(.1,.88,.9,.95), (255,255,255), (0,0,0), 90); fit(d, f"{W//S}×{H//S} px · {kind}", R(.3,.95,.7,.99), (255,255,255), (0,0,0), 60)
    elif i in ("boardRigs", "boardTools"):
        d.rounded_rectangle(R(0,0,1,1), radius=W*.02, fill=c+(255,), outline=dk+(255,), width=t*2)
        d.rectangle(R(.04,.05,.96,.95), fill=(30,38,34,255), outline=lt+(255,), width=t*2)
        fit(d, "Rigs" if i == "boardRigs" else "Anim Tools", R(.12,.1,.88,.35), (240,240,235), None); fit(d, f"{i} · {W//S}×{H//S} px", R(.12,.45,.88,.55), lt, None, 100)
        d.rectangle(R(.04,.95,.96,.99), fill=dk+(255,))
    elif i == "stageBg":
        d.rectangle((0,0,W,H), fill=c+(255,)); d.rectangle(R(0,.75,1,1), fill=dk+(255,)); d.line(R(0,.75,1,.75), fill=lt+(255,), width=t*3)
        for k in range(-12, 13): d.line((W*.5+k*W*.025, H*.75, W*.5+k*W*.12, H), fill=shade(c,.4)+(255,), width=t)
        fit(d, "stageBg — paret + terra (≈25%)", R(.15,.82,.85,.9), (255,255,255), (0,0,0), 120); fit(d, f"{W//S}×{H//S} px · {kind}", R(.3,.9,.7,.96), (255,255,255), (0,0,0), 80)
    elif i == "projectsBg":
        d.rectangle((0,0,W,H), fill=c+(255,))
        for k, (x, y) in enumerate(((.14,.1),(.385,.1),(.63,.1),(.14,.515),(.385,.515),(.63,.515)), 1):
            d.rectangle(R(x,y,x+.23,y+.385), fill=shade(c,.35)+(255,), outline=lt+(255,), width=t*2); d.rectangle(R(x-.01,y+.37,x+.24,y+.395), fill=dk+(255,))
            fit(d, str(k), R(x+.09,y+.33,x+.14,y+.37), (255,255,255), (0,0,0), 60)
        fit(d, f"projectsBg — graella 3×2 · {W//S}×{H//S} px", R(.15,.93,.85,.99), (255,255,255), (0,0,0), 90)
    elif i.startswith("nav"):
        d.rounded_rectangle((0,0,W-1,H-1), radius=H*.14, fill=c+(255,), outline=dk+(255,), width=t*2)
        for x in (.08, .92): d.ellipse((W*x-H*.06, H*.1, W*x+H*.06, H*.1+H*.12), fill=dk+(255,))
        nm = {"navHome":"Home","navProjects":"Projects","navAnimation":"Animation","navRig":"Rig & Tools","navAbout":"About","navContact":"Contact"}[i]
        fit(d, nm, (W*.15, H*.2, W*.85, H*.8), (255,255,255) if sum(c)<420 else (0,0,0), (0,0,0) if sum(c)<420 else (255,255,255))
    elif i.startswith("poster"):
        d.rounded_rectangle((0,0,W-1,H-1), radius=W*.04, fill=c+(255,), outline=dk+(255,), width=t*2)
        d.rectangle(R(.08,.08,.92,.92), outline=lt+(255,), width=t*2)
        nm = {"posterLinkedin":"LinkedIn","posterMail":"Gmail","posterCv":"CV"}[i]
        fit(d, nm, R(.12,.35,.88,.6), (255,255,255), (0,0,0)); fit(d, f"{i} {W//S}×{H//S}", R(.12,.8,.88,.88), (255,255,255), (0,0,0), 60)
    else:
        im = solid(W, H, c); label(im, i, W, H, kind, c)
    return im

def make_video(path, W, H, c, text, kind):
    fps, n = 12, (12 if kind == 'grain' else 36)
    p = subprocess.Popen(["ffmpeg","-y","-loglevel","error","-f","rawvideo","-pix_fmt","rgb24","-s",f"{W}x{H}","-r",str(fps),"-i","-",
        "-c:v","libx264","-preset","veryfast","-crf","38" if kind == "grain" else "30","-pix_fmt","yuv420p","-movflags","+faststart","-an",path], stdin=subprocess.PIPE)
    rnd = np.random.default_rng(1)
    for f in range(n):
        if kind == "grain":
            fr = np.stack([rnd.integers(0,256,(H,W),dtype="uint8")]*3, -1)
        else:
            im = Image.new("RGB", (W, H), (0,0,0) if kind == "particles" else c); d = ImageDraw.Draw(im)
            if kind == "particles":
                random.seed(7)
                for k in range(160):
                    x = (random.random()*W + f*W/n*random.choice((0,1,1))*0) % W; y = (random.random()*H - f*H/n*(.5+random.random())) % H
                    r = random.randint(2, 6)*W//1920+1; d.ellipse((x-r,y-r,x+r,y+r), fill=(235,235,255))
            else:
                x = (W-W*.1)*f/(n-1); d.rectangle((x, H*.88, x+W*.1, H*.94), fill=shade(c,1.6))
                fit(d, text, (W*.08,H*.3,W*.92,H*.55), (255,255,255), (0,0,0)); fit(d, f"{W}×{H} · MP4 · placeholder (bucle {n/fps:.0f} s)", (W*.1,H*.58,W*.9,H*.66), (255,255,255), (0,0,0), 80)
            fr = np.array(im)
        p.stdin.write(fr.tobytes())
    p.stdin.close(); p.wait()

def main():
    ws = openpyxl.load_workbook(XLSX)["Dibuixos"]
    rows = [r for r in ws.iter_rows(min_row=2, values_only=True) if r[1]]
    cols = palette(len(rows)); manifest = {}
    for r, c in zip(rows, cols):
        i, page, need, tipus, w, h = r[1], r[2], r[4], r[5], r[9], r[10]
        if not str(need).startswith("Sí"): print("salto", i, "(mirall)"); continue
        W, H = round(w*19.2*S), round(h*10.8*S)
        if tipus.startswith("Vídeo"):
            os.makedirs(VID, exist_ok=True); path = f"src/video/{i}.mp4"
            vw, vh = (480, 270) if i == "fxGrain" else (W//S, H//S)
            if i in ("anim1","anim2","anim3","anim4","anim5","homeAnim"): vw, vh = 1920, 1080  # l'Excel: es grava a 1920×1080
            make_video(os.path.join(ROOT, path), vw - vw % 2, vh - vh % 2, c, i, "grain" if i == "fxGrain" else "particles" if i == "fxParticles" else "color")
        else:
            d = os.path.join(IMG, folder(i, page)); os.makedirs(d, exist_ok=True)
            path = f"src/img/{folder(i, page)}/{i}.png"
            kind = "PNG opac" if "opac" in tipus else "PNG alfa"
            im = draw(i, W, H, c, kind)
            if "opac" in tipus: im = Image.alpha_composite(Image.new("RGBA", im.size, (0,0,0,255)), im)
            im.save(os.path.join(ROOT, path), optimize=True)
        manifest[i] = path; print("ok", path, os.path.getsize(os.path.join(ROOT, path))//1024, "KB")
    json.dump(manifest, open(os.path.join(ROOT, "tools/manifest.json"), "w"), indent=1)

if __name__ == "__main__": main()
