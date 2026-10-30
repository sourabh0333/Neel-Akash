#!/usr/bin/env python3
"""
Build the Getting Here route map from real geography.

    python3 scripts/gen-route-map.py <natural-earth-geojson-dir>

Reads Natural Earth 1:10m `ne_10m_land` and `ne_10m_rivers_lake_centerlines`
(public domain, https://www.naturalearthdata.com — the GeoJSON copies live at
github.com/nvkelso/natural-earth-vector/tree/master/geojson), clips them to
the delta between Kolkata and the Bay of Bengal, smooths the coastlines, and
writes src/components/route/geo.ts.

At 1:10m Natural Earth joins Mousuni, the Bakkhali island and the Namkhana
mainland into one shape, so the two channels that matter are cut by hand:
the Hatania-Doania, east–west under Namkhana (crossed by the Namkhana
Bridge), and the Chinai, north–south between the Bakkhali island and
Mousuni (crossed by boat from Hujjaiter Kheya Ghat). The road, the ghat,
the parking and the camp follow Google Maps' route from Namkhana, which
crosses level with Kusumtala and runs straight west to the camp on
Mousuni's west shore. Positions are approximate; the map says so on screen.
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
    # Generous margin: the camera pulls back past the window for the overview,
    # and a wide (21:9) map shows a lot of country either side of the route.
    m = 1.3
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

    def band(centre, half, across):
        """A channel of half-width `half` (degrees) along a centreline."""
        if across == "lon":  # runs north–south: offset east and west
            a = [(x + half, y) for x, y in centre]
            b = [(x - half, y) for x, y in reversed(centre)]
        else:  # runs east–west: offset north and south
            a = [(x, y + half) for x, y in centre]
            b = [(x, y - half) for x, y in reversed(centre)]
        return smooth([project(*p) for p in a + b], closed=True)

    # The Hatania-Doania, from the Muri Ganga east to the Saptamukhi, with
    # Namkhana on its north bank.
    hatania = band([(88.180, 21.7585), (88.215, 21.7580), (88.233, 21.7575), (88.255, 21.7565), (88.295, 21.7550)], 0.0032, "lat")
    # The Chinai, from the Hatania-Doania south to the bay: Mousuni to the
    # west, the Bakkhali island (and 7 Mile) to the east.
    chinai = band([(88.2125, 21.7570), (88.2140, 21.7300), (88.2170, 21.7080), (88.2165, 21.6800), (88.2150, 21.6500), (88.2165, 21.6200), (88.2185, 21.5980)], 0.0036, "lon")

    stations = [
        ("Sealdah", 88.3700, 22.5675),
        ("Namkhana", 88.2316, 21.7700),
        ("Hujjaiter Ghat", 88.2205, 21.6690),
        ("Mousuni Island", 88.2112, 21.6680),
        ("Penguin Beach Camp", 88.1880, 21.6667),
    ]
    towns = [("Baruipur", 88.4330, 22.3560), ("Lakshmikantapur", 88.3200, 22.1000), ("Kakdwip", 88.1900, 21.8700)]
    # Along the road leg; named only once the camera is close.
    stops = [("Namkhana Bridge", 88.2330, 21.7575), ("7 Mile", 88.2390, 21.6752)]
    # The Indira Gandhi Car Parking Centre, on the road just before the ghat.
    parking = (88.2214, 21.6728)

    st = {n: (lon, lat) for n, lon, lat in stations}
    legs = [
        # The Namkhana line, through its real stations.
        through([st["Sealdah"], (88.4330, 22.3560), (88.3200, 22.1000), (88.1900, 21.8700), st["Namkhana"]]),
        # Over the Namkhana Bridge, south on the Bakkhali road to 7 Mile
        # Bazar, then right (west) to the ghat.
        through([st["Namkhana"], (88.2330, 21.7575), (88.2370, 21.7350), (88.2393, 21.7000), (88.2394, 21.6800),
                 (88.2390, 21.6752), (88.2360, 21.6744), (88.2300, 21.6744), (88.2235, 21.6744), parking, st["Hujjaiter Ghat"]]),
        # Across the Chinai, then a toto due west through Kusumtala.
        through([st["Hujjaiter Ghat"], (88.2160, 21.6683), st["Mousuni Island"]]),
        through([st["Mousuni Island"], (88.2000, 21.6676), st["Penguin Beach Camp"]]),
    ]

    labels = [
        ("Kolkata", 88.40, 22.62, "city"),
        ("Hooghly", 88.18, 22.38, "water"),
        ("Sagar Island", 88.06, 21.70, "land"),
        ("Bay of Bengal", 88.35, 21.45, "sea"),
        ("Chinai", 88.2235, 21.638, "water-sm"),
        ("Hatania-Doania", 88.262, 21.7625, "water-sm"),
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
        f"export const HATANIA = {js(hatania)};\n\n"
        f"export const STATIONS = {js([dict(name=n, **pt(lon, lat)) for n, lon, lat in stations])};\n\n"
        f"export const TOWNS = {js([dict(name=n, **pt(lon, lat)) for n, lon, lat in towns])};\n\n"
        f"export const STOPS = {js([dict(name=n, **pt(lon, lat)) for n, lon, lat in stops])};\n\n"
        f"export const PARKING = {js(pt(*parking))};\n\n"
        f"export const LEGS: string[] = {js(legs)};\n\n"
        f"export const LABELS = {js([dict(text=t, kind=k, **pt(lon, lat)) for t, lon, lat, k in labels])};\n"
    )
    print(f"wrote {out.relative_to(Path.cwd()) if out.is_relative_to(Path.cwd()) else out}: "
          f"{len(land)} land, {len(rivers)} rivers, view {W}x{H}")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else ".")
