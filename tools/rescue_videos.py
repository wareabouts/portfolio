"""Rescue videos hosted on Adobe's CCV player before the Portfolio subscription lapses.

Adobe stores a max rendition of 1280x720 for these. The playback URLs are signed
with an `hdnts` token that expires in ~3 days, so we re-fetch the embed page for a
fresh token immediately before each download rather than reusing a cached URL.
"""

import json
import re
import subprocess
import sys
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "video"
OUT.mkdir(parents=True, exist_ok=True)

# ccv id -> output name. Discovered by scanning the site for www-ccv.adobe.io embeds.
VIDEOS = [
    ("TdnBcMxRy6B", "atlas-virtual-graduation"),
    ("438gLSxIkv2", "bww-goggles"),
    ("2XAQF4_wqaI", "fiske-planetarium-gravity-demonstration"),
    ("CiyFi5F63UE", "solar-magnetism-exhibit"),
    ("3YeNpw_UI5L", "stanchions-1"),
    ("BT-Fgh7x2GG", "stanchions-2"),
]

EMBED = ("https://www-ccv.adobe.io/v1/player/ccv/{ccv}/embed"
         "?bgcolor=%23191919&lazyLoading=true&api_key=BehancePro2View")

M3U8 = re.compile(r'https://[^"\'\s\\]+?/rend/master\.m3u8[^"\'\s\\]*')
MP4 = re.compile(r'https://[^"\'\s\\]+?/rend/[^"\'\s\\]+?\.mp4[^"\'\s\\]*')


def unescape(u: str) -> str:
    return u.replace("\\u0026", "&").replace("\\/", "/").replace("&amp;", "&")


def fresh_urls(ccv: str):
    """Fetch the embed page for a freshly-signed manifest URL."""
    r = requests.get(EMBED.format(ccv=ccv), timeout=45)
    r.raise_for_status()
    hls = M3U8.search(r.text)
    mp4 = MP4.search(r.text)
    return (unescape(hls.group(0)) if hls else None,
            unescape(mp4.group(0)) if mp4 else None)


def probe(path: Path):
    """Return 'WIDTHxHEIGHT @ DURATIONs' for a downloaded file."""
    try:
        out = subprocess.run(
            ["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
             "stream=width,height:format=duration", "-of", "json", str(path)],
            capture_output=True, text=True, timeout=60)
        d = json.loads(out.stdout)
        s = d["streams"][0]
        dur = float(d["format"]["duration"])
        return f"{s['width']}x{s['height']} @ {dur:.1f}s"
    except Exception as e:
        return f"(probe failed: {e})"


def main():
    results = []
    for ccv, name in VIDEOS:
        dest = OUT / f"{name}.mp4"
        if dest.exists() and dest.stat().st_size > 0:
            print(f"[skip] {name} already downloaded", flush=True)
            results.append({"ccv": ccv, "name": name, "status": "skipped",
                            "file": dest.name, "info": probe(dest)})
            continue

        print(f"[fetch] {name} ({ccv}) - getting fresh signed URL", flush=True)
        try:
            hls, mp4 = fresh_urls(ccv)
        except Exception as e:
            print(f"[FAIL] {name}: could not read embed page: {e}", flush=True)
            results.append({"ccv": ccv, "name": name, "status": "failed", "error": str(e)})
            continue

        src = hls or mp4
        if not src:
            print(f"[FAIL] {name}: no media URL in embed page", flush=True)
            results.append({"ccv": ccv, "name": name, "status": "failed",
                            "error": "no media url"})
            continue

        # -bsf:a aac_adtstoasc is required when remuxing HLS/TS audio into MP4.
        cmd = ["ffmpeg", "-y", "-loglevel", "error",
               "-headers", "Referer: https://www-ccv.adobe.io/\r\n",
               "-i", src, "-c", "copy"]
        if hls:
            cmd += ["-bsf:a", "aac_adtstoasc"]
        cmd += [str(dest)]

        print(f"[dl]   {name} via {'HLS' if hls else 'MP4'}", flush=True)
        p = subprocess.run(cmd, capture_output=True, text=True, timeout=900)
        if p.returncode != 0 or not dest.exists() or dest.stat().st_size == 0:
            print(f"[FAIL] {name}: ffmpeg: {p.stderr[:400]}", flush=True)
            results.append({"ccv": ccv, "name": name, "status": "failed",
                            "error": p.stderr[:400]})
            continue

        info = probe(dest)
        size_mb = dest.stat().st_size / 1e6
        print(f"[OK]   {name}: {info}, {size_mb:.1f} MB", flush=True)
        results.append({"ccv": ccv, "name": name, "status": "ok",
                        "file": dest.name, "info": info,
                        "size_mb": round(size_mb, 1)})

    (OUT / "rescue-report.json").write_text(json.dumps(results, indent=2), encoding="utf-8")
    ok = sum(1 for r in results if r["status"] in ("ok", "skipped"))
    print(f"\n=== {ok}/{len(VIDEOS)} videos secured ===", flush=True)
    return 0 if ok == len(VIDEOS) else 1


if __name__ == "__main__":
    sys.exit(main())
