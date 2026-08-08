"""Download every asset in assets/manifest.json at the best resolution Adobe exposes.

Adobe signs each size variant with a `?h=` hash, so only the exact variants published in
the page HTML are fetchable -- you cannot request an arbitrary size. `source_url` therefore
already holds the best available: an untouched original where the lightbox exposed one,
otherwise the largest resized variant seen anywhere on the site.

Safe to re-run: existing files are skipped, and the manifest is updated in place with the
real on-disk dimensions and a sha256 for integrity checking.
"""

import concurrent.futures as cf
import hashlib
import json
import sys
from pathlib import Path

import requests
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
MANIFEST = ROOT / "assets" / "manifest.json"
OUT = ROOT / "assets" / "originals"
OUT.mkdir(parents=True, exist_ok=True)

WORKERS = 8
TIMEOUT = 120
RETRIES = 3


def fetch(rec):
    uuid, ext, url = rec["uuid"], rec["ext"], rec["source_url"]
    dest = OUT / f"{uuid}.{ext}"

    if dest.exists() and dest.stat().st_size > 0:
        return finalize(rec, dest, "skipped")

    last = None
    for attempt in range(RETRIES):
        try:
            r = requests.get(url, timeout=TIMEOUT)
            r.raise_for_status()
            if not r.content:
                raise ValueError("empty response body")
            dest.write_bytes(r.content)
            return finalize(rec, dest, "ok")
        except Exception as e:  # noqa: BLE001 - report per-asset, keep the batch going
            last = e
    rec["download"] = {"status": "failed", "error": str(last)}
    return rec


def finalize(rec, dest, status):
    data = dest.read_bytes()
    info = {"status": status, "file": dest.name, "bytes": len(data),
            "sha256": hashlib.sha256(data).hexdigest()}
    try:
        with Image.open(dest) as im:
            info["width"], info["height"] = im.size
            info["frames"] = getattr(im, "n_frames", 1)
        rec["intrinsic_width"] = info["width"]
        rec["intrinsic_height"] = info["height"]
    except Exception as e:  # noqa: BLE001
        info["probe_error"] = str(e)
    rec["download"] = info
    return rec


def main():
    doc = json.loads(MANIFEST.read_text(encoding="utf-8"))
    assets = doc["assets"]
    print(f"downloading {len(assets)} assets -> {OUT}", flush=True)

    done = 0
    with cf.ThreadPoolExecutor(max_workers=WORKERS) as ex:
        for _ in ex.map(fetch, assets):
            done += 1
            if done % 50 == 0:
                print(f"  {done}/{len(assets)}", flush=True)

    MANIFEST.write_text(json.dumps(doc, indent=2), encoding="utf-8")

    ok = [a for a in assets if a["download"]["status"] in ("ok", "skipped")]
    bad = [a for a in assets if a["download"]["status"] == "failed"]
    total_mb = sum(a["download"].get("bytes", 0) for a in ok) / 1e6
    px = [(a["download"].get("width") or 0) for a in ok]
    print(f"\ndownloaded : {len(ok)}/{len(assets)}  ({total_mb:.0f} MB)")
    if px:
        print(f"widths     : min={min(px)} median={sorted(px)[len(px)//2]} max={max(px)}")
    if bad:
        print(f"\nFAILED ({len(bad)}):")
        for a in bad[:20]:
            print(f"  {a['uuid']}.{a['ext']}  {a['download']['error'][:90]}")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
