#!/usr/bin/env python3
"""
Build the Getting Here route map from real geography.

    python3 scripts/gen-route-map.py <natural-earth-geojson-dir>

Reads Natural Earth 1:10m `ne_10m_land` and `ne_10m_rivers_lake_centerlines`
(public domain, https://www.naturalearthdata.com — the GeoJSON copies live at
github.com/nvkelso/natural-earth-vector/tree/master/geojson), clips them to
the delta between Kolkata and the Bay of Bengal, smooths the coastlines, and
writes src/components/route/geo.ts.

At 1:10m Natural Earth joins Mousuni to the mainland, so the Chinai is cut
across the southern tip by hand (CHINAI below). Station and town positions
are approximate; the map says so on screen.
"""
import json
import math
import sys
from pathlib import Path

# Lon/lat window: Kolkata in the north, the bay in the south.
BB = (87.85, 21.35, 88.85, 22.75)
K = math.cos(math.radians((BB[1] + BB[3]) / 2))  # equirectangular, true at mid-latitude
W = 1000
S = W / ((BB[2] - BB[0]) * K)
H = round((BB[3] - BB[1]) * S)


def project(lon, lat):
    return ((lon - BB[0]) * K * S, (BB[3] - lat) * S)


def rings(geom):
    t, cs = geom["type"], geom["coordinates"]
    if t == "Polygon":
        return cs
    if t == "MultiPolygon":
        return [r for p in cs for r in p]
    if t == "LineString":
        return [cs]
    if t == "MultiLineString":
        return cs
    return []


def clip(poly, x0, y0, x1, y1):
    """Sutherland–Hodgman: clip a polygon to an axis-aligned box."""

    def run(pts, inside, cut):
        out = []
        for i in range(len(pts)):
            a, b = pts[i - 1], pts[i]
            if inside(b):
                if not inside(a):
                    out.append(cut(a, b))
                out.append(b)
            elif inside(a):
                out.append(cut(a, b))
        return out

    ix = lambda x: lambda a, b: (x, a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]))
    iy = lambda y: lambda a, b: (a[0] + (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]), y)
    pts = [tuple(c[:2]) for c in poly]
    for inside, cut in [
        (lambda p: p[0] >= x0, ix(x0)),
        (lambda p: p[0] <= x1, ix(x1)),
        (lambda p: p[1] >= y0, iy(y0)),
        (lambda p: p[1] <= y1, iy(y1)),
    ]:
        if not pts:
            break
        pts = run(pts, inside, cut)
    return pts


def smooth(pts, closed):
    """Catmull–Rom through the points, written as cubic Béziers."""
    n = len(pts)
    if n < 3:
        return "M" + " L".join(f"{x:.1f} {y:.1f}" for x, y in pts)
    get = (lambda i: pts[i % n]) if closed else (lambda i: pts[max(0, min(n - 1, i))])
    d = [f"M{pts[0][0]:.1f} {pts[0][1]:.1f}"]
    for i in range(n if closed else n - 1):
        p0, p1, p2, p3 = get(i - 1), get(i), get(i + 1), get(i + 2)
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        d.append(f"C{c1[0]:.1f} {c1[1]:.1f} {c2[0]:.1f} {c2[1]:.1f} {p2[0]:.1f} {p2[1]:.1f}")
    return "".join(d) + ("Z" if closed else "")


def through(lonlats):
    return smooth([project(*p) for p in lonlats], closed=False)


def main(src):
    src = Path(src)
    # Generous margin: the camera pulls back past the window for the overview.
    m = 0.6
    land = []
    for f in json.loads((src / "ne_10m_land.geojson").read_text())["features"]:
        for r in rings(f["geometry"]):
            c = clip(r, BB[0] - m, BB[1] - m, BB[2] + m, BB[3] + m)
            if len(c) > 2:
                land.append(smooth([project(*p) for p in c], closed=True))

    rivers = []
    for f in json.loads((src / "ne_10m_rivers_lake_centerlines.geojson").read_text())["features"]:
        for r in rings(f["geometry"]):
            run = [project(*c[:2]) for c in r if BB[0] - m <= c[0] <= BB[2] + m and BB[1] - m <= c[1] <= BB[3] + m]
            if len(run) > 2:
                rivers.append(smooth(run, closed=False))

    # The Chinai, cut by hand across the tip: a band from the estuary
    # channel on the west to the creek on the east, about 21.71°N.
    top = [(88.178, 21.718), (88.205, 21.716), (88.235, 21.713), (88.262, 21.709), (88.290, 21.706)]
    bottom = [(88.290, 21.698), (88.262, 21.701), (88.235, 21.704), (88.205, 21.707), (88.178, 21.708)]
    chinai = smooth([project(*p) for p in top + bottom], closed=True)

    stations = [
        ("Sealdah", 88.3700, 22.5675),
        ("Namkhana", 88.2316, 21.7700),
        ("Bagdanga Ghat", 88.2230, 21.7235),
        ("Mousuni Island", 88.2280, 21.6935),
        ("Penguin Beach Camp", 88.2050, 21.6430),
    ]
    towns = [("Baruipur", 88.4330, 22.3560), ("Lakshmikantapur", 88.3200, 22.1000), ("Kakdwip", 88.1900, 21.8700)]

    st = {n: (lon, lat) for n, lon, lat in stations}
    legs = [
        # The Namkhana line, through its real stations.
        through([st["Sealdah"], (88.4330, 22.3560), (88.3200, 22.1000), (88.1900, 21.8700), st["Namkhana"]]),
        through([st["Namkhana"], (88.2300, 21.7500), st["Bagdanga Ghat"]]),
        through([st["Bagdanga Ghat"], (88.2270, 21.7070), st["Mousuni Island"]]),
        through([st["Mousuni Island"], (88.2190, 21.6700), (88.2120, 21.6550), st["Penguin Beach Camp"]]),
    ]

    labels = [
        ("Kolkata", 88.40, 22.62, "city"),
        ("Hooghly", 88.18, 22.38, "water"),
        ("Sagar Island", 88.06, 21.70, "land"),
        ("Bay of Bengal", 88.35, 21.45, "sea"),
        ("Chinai", 88.27, 21.712, "water-sm"),
    ]

    def pt(lon, lat):
        x, y = project(lon, lat)
        return {"x": round(x, 1), "y": round(y, 1)}

    out = Path(__file__).resolve().parent.parent / "src/components/route/geo.ts"
    out.parent.mkdir(parents=True, exist_ok=True)
    js = lambda v: json.dumps(v, ensure_ascii=False)
    out.write_text(
        "/* Generated by scripts/gen-route-map.py from Natural Earth 1:10m (public\n"
        "   domain). Do not edit by hand — change the script and run it again. */\n\n"
        f"export const VIEW = {{ w: {W}, h: {H} }};\n\n"
        f"export const LAND: string[] = {js(land)};\n\n"
        f"export const RIVERS: string[] = {js(rivers)};\n\n"
        f"export const CHINAI = {js(chinai)};\n\n"
        f"export const STATIONS = {js([dict(name=n, **pt(lon, lat)) for n, lon, lat in stations])};\n\n"
        f"export const TOWNS = {js([dict(name=n, **pt(lon, lat)) for n, lon, lat in towns])};\n\n"
        f"export const LEGS: string[] = {js(legs)};\n\n"
        f"export const LABELS = {js([dict(text=t, kind=k, **pt(lon, lat)) for t, lon, lat, k in labels])};\n"
    )
    print(f"wrote {out.relative_to(Path.cwd()) if out.is_relative_to(Path.cwd()) else out}: "
          f"{len(land)} land, {len(rivers)} rivers, view {W}x{H}")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else ".")
