"""Extract alexfiel.com (Adobe Portfolio) into presentation-agnostic Markdown + an asset manifest.

Design intent: the output describes WHAT each block is, never WHERE Adobe put it.
Per-module padding, pixel widths, float directions and injected font-family spans are
deliberately discarded so every page can render from one global style -- and so the same
content can drive a future 3D portfolio without carrying 2D page geometry along.

Media blocks use remark container/leaf directives (`::figure{...}`, `:::gallery`) rather
than MDX, so the files stay readable and parseable outside a React toolchain.

Images are referenced by asset UUID through assets/manifest.json, never by CDN URL, so
nothing points at Adobe after cutover.
"""

import json
import re
from collections import OrderedDict
from html import unescape
from pathlib import Path
from urllib.parse import urlparse

from bs4 import BeautifulSoup, NavigableString, Tag

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "raw"
CONTENT = ROOT / "content"
ASSETS = ROOT / "assets"

SITE_ID = "803ba528-c60a-4721-a6da-3c1706da6f46"

# Adobe emits several crop/resize suffixes: _rw_<w> (plain resize), _rwc_<x>x<y>x<w>x<h>x<out>
# (resize-with-crop) and _car_/_carw_<ar>x<ar>x<w> (aspect-ratio cover crops). A URL with no
# suffix at all is the untouched original.
UUID = r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}"
ASSET_RE = re.compile(
    rf"cdn\.myportfolio\.com/{SITE_ID}/({UUID})(_(rw|rwc|car|carw)_([\dx]+))?\.(\w+)")
IMAGE_EXTS = {"jpg", "jpeg", "png", "gif", "webp", "svg", "avif", "tif", "tiff", "bmp"}

CATEGORY_PAGES = ["virtual-reality", "3d-design", "microcontrollers", "instalation",
                  "web-dev", "photography", "graphic-design"]
NON_PROJECT = set(CATEGORY_PAGES) | {"_home", "about", "all-the-things"}

# --- deliberate corrections to the source site -------------------------------------
# Applied here rather than by hand-editing content/ so re-running extraction keeps them.

# The original site had a typo in this category's URL. The old path is recorded in
# taxonomy.json as a redirect so existing links keep working.
CATEGORY_RENAMES = {"instalation": "installation"}

# Three projects were in no category and so never appeared on a category page.
EXTRA_CATEGORIES = {
    "openai-case": ["3d-design"],          # 3D-printed enclosure
    "borzoi-vacuum": ["3d-design"],        # photogrammetry-based costume build
    "office-sign": ["installation", "3d-design"],  # laser-cut sign, physically installed
}

# Reachable only from the 3d-design category page -- the home grid never linked it.
UNLISTED_PROJECTS = {"photogrammetry-tests"}

# ccv id -> the local file rescued by rescue_videos.py
CCV_TO_FILE = {
    "TdnBcMxRy6B": "atlas-virtual-graduation.mp4",
    "438gLSxIkv2": "bww-goggles.mp4",
    "2XAQF4_wqaI": "fiske-planetarium-gravity-demonstration.mp4",
    "CiyFi5F63UE": "solar-magnetism-exhibit.mp4",
    "3YeNpw_UI5L": "stanchions-1.mp4",
    "BT-Fgh7x2GG": "stanchions-2.mp4",
}

# uuid -> record. Populated as pages are parsed.
MANIFEST: "OrderedDict[str, dict]" = OrderedDict()


# --------------------------------------------------------------------------- assets

def parse_asset(url):
    """Return (uuid, ext, width_hint, is_original, crop) for a myportfolio CDN image URL."""
    if not url:
        return None
    m = ASSET_RE.search(url)
    if not m:
        return None
    uuid, suffix, kind, dims, ext = m.groups()
    ext = ext.lower()
    if ext not in IMAGE_EXTS:
        return None  # stylesheets and scripts also live under the site id

    # For every suffix form the trailing number is the rendered pixel width.
    width = None
    if dims:
        try:
            width = int(dims.split("x")[-1])
        except ValueError:
            width = None
    crop = f"{kind}:{dims}" if kind and kind in ("rwc", "car", "carw") else None
    return uuid, ext, width, suffix is None, crop


def widest_from_srcset(srcset):
    """Pick the highest-resolution entry from a srcset string."""
    best, best_w = None, -1
    for part in (srcset or "").split(","):
        part = part.strip()
        if not part:
            continue
        bits = part.split()
        url = bits[0]
        w = int(bits[1][:-1]) if len(bits) > 1 and bits[1].endswith("w") else 0
        if w > best_w:
            best, best_w = url, w
    return best


def register(url, page, *, width=None, height=None, alt=None, role="inline"):
    """Record an asset, keeping the best-quality URL seen for it. Returns the uuid."""
    info = parse_asset(url)
    if not info:
        return None
    uuid, ext, rw_width, is_original, crop = info

    rec = MANIFEST.get(uuid)
    if rec is None:
        rec = MANIFEST[uuid] = {
            "uuid": uuid, "ext": ext, "source_url": url,
            "is_original": is_original, "best_width": rw_width,
            "intrinsic_width": width, "intrinsic_height": height,
            "alt": alt, "roles": [], "used_by": [], "cover_crop": None,
        }
    else:
        # An un-suffixed URL is the untouched original -- always prefer it.
        # Otherwise prefer the largest resized variant we have seen.
        better = (is_original and not rec["is_original"]) or (
            not rec["is_original"] and rw_width and (rec["best_width"] or 0) < rw_width)
        if better:
            rec.update(source_url=url, is_original=is_original,
                       best_width=rw_width, ext=ext)
        if width and not rec["intrinsic_width"]:
            rec["intrinsic_width"], rec["intrinsic_height"] = width, height
        if alt and not rec["alt"]:
            rec["alt"] = alt

    # The cover crop is an editorial choice (which part of the image represents the
    # project), so keep it even though we download the uncropped asset.
    if role == "cover" and crop and not rec["cover_crop"]:
        rec["cover_crop"] = crop

    if page not in rec["used_by"]:
        rec["used_by"].append(page)
    if role not in rec["roles"]:
        rec["roles"].append(role)
    return uuid


def best_image_url(img):
    """Highest-quality URL advertised by an <img>, preferring srcset's widest entry."""
    cands = [img.get("data-src"), img.get("src")]
    for ss in (img.get("data-srcset"), img.get("srcset")):
        cands.append(widest_from_srcset(ss))
    scored = []
    for u in cands:
        info = parse_asset(u)
        if info:
            # An original (no suffix) outranks any resized variant.
            scored.append((float("inf") if info[3] else (info[2] or 0), u))
    if not scored:
        return None
    return max(scored, key=lambda t: t[0])[1]


# ------------------------------------------------------------------- html -> markdown

INLINE_TAGS = {"b": "**", "strong": "**", "i": "*", "em": "*", "code": "`"}

# Adobe's editor sprinkles non-breaking and zero-width spaces through the copy.
INVISIBLES = str.maketrans({
    "\u00a0": " ",   # no-break space
    "\u200b": "",    # zero-width space
    "\u200c": "",    # zero-width non-joiner
    "\u200d": "",    # zero-width joiner
    "\ufeff": "",    # BOM / zero-width no-break space
    "\u2028": "\n",  # line separator
    "\u2029": "\n",  # paragraph separator
})


def clean_text(text):
    return re.sub(r"[ \t]{2,}", " ", (text or "").translate(INVISIBLES)).strip()


def md_escape(text):
    return re.sub(r"([\\`*_\[\]])", r"\\\1", text)


def html_to_md(node):
    """Convert Adobe rich-text HTML to Markdown, dropping its injected styling.

    Adobe wraps runs in <span style="font-family:dvkf;...">; those spans carry no meaning
    and are unwrapped. Semantic emphasis and links are preserved.
    """
    out = []
    for child in node.children:
        if isinstance(child, NavigableString):
            out.append(md_escape(unescape(str(child)).translate(INVISIBLES)))
            continue
        if not isinstance(child, Tag):
            continue
        name = child.name.lower()

        if name == "br":
            out.append("\n")
        elif name in INLINE_TAGS:
            inner = html_to_md(child).strip()
            mark = INLINE_TAGS[name]
            out.append(f"{mark}{inner}{mark}" if inner else "")
        elif name == "a":
            inner = html_to_md(child).strip()
            href = child.get("href", "")
            out.append(f"[{inner}]({href})" if href else inner)
        elif name in ("ul", "ol"):
            items = []
            for i, li in enumerate(child.find_all("li", recursive=False), 1):
                bullet = "- " if name == "ul" else f"{i}. "
                items.append(bullet + html_to_md(li).strip())
            out.append("\n" + "\n".join(items) + "\n")
        elif name in ("p", "div"):
            inner = html_to_md(child).strip()
            if inner:
                out.append("\n\n" + inner + "\n\n")
        elif name in ("h1", "h2", "h3", "h4", "h5", "h6"):
            inner = html_to_md(child).strip()
            if inner:
                out.append(f"\n\n### {inner}\n\n")
        elif name in ("script", "style"):
            continue
        else:
            # span, font, and friends: unwrap, keep the text.
            out.append(html_to_md(child))

    text = "".join(out)
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def attr(s):
    """Escape a value for use inside a directive attribute."""
    return (s or "").replace("\\", "\\\\").replace('"', '\\"').replace("\n", " ").strip()


# ------------------------------------------------------------------------ module walk

def classes(el):
    return [c for c in el.get("class", []) if not c.startswith(("js-", "e2e-"))]


def module_type(el):
    cls = classes(el)
    if "module-caption-container" in cls:
        return "caption"
    for t in ("text", "image", "media_collection", "embed", "tree",
              "button", "video", "form"):
        if t in cls:
            return t
    return None


def embed_ref(src):
    """Classify an iframe src into (kind, payload)."""
    if not src:
        return None
    if "youtube" in src:
        m = re.search(r"/embed/([\w-]+)", src)
        if m:
            return "youtube", m.group(1)
    if "vimeo" in src:
        m = re.search(r"/video/(\d+)", src)
        if m:
            return "vimeo", m.group(1)
    if "www-ccv.adobe.io" in src:
        m = re.search(r"/ccv/([\w-]+)/embed", src)
        if m:
            return "adobe_ccv", m.group(1)
    return "iframe", src


def render_module(el, page, depth=0):
    """Turn one Adobe module into directive/Markdown text. Returns list of block strings."""
    kind = module_type(el)

    if kind == "text":
        # One rich-text block often holds SEVERAL sections: title, body, title, body...
        # so walk its children in order rather than assuming a single leading title.
        # Body markup also varies across the site's history (`.main-text`, a bare <div>,
        # or `.main-text` followed by more divs), which this handles uniformly.
        blocks = []
        for rt in el.select(".rich-text.module-text") or [el]:
            children = rt.find_all(recursive=False)
            if not children:
                body = html_to_md(rt)
                if body:
                    blocks.append(body)
                continue

            buf = []

            def flush():
                if not buf:
                    return
                frag = BeautifulSoup("".join(str(x) for x in buf), "html.parser")
                body = html_to_md(frag)
                if body:
                    blocks.append(body)
                buf.clear()

            for child in children:
                cls = child.get("class") or []
                if "title" in cls:
                    flush()
                    t = clean_text(child.get_text(" ", strip=True))
                    if t:
                        blocks.append(f"## {t}")
                elif "sub-title" in cls:
                    flush()
                    t = clean_text(child.get_text(" ", strip=True))
                    if t:
                        blocks.append(f"### {t}")
                else:
                    buf.append(child)
            flush()
        return blocks

    if kind == "image":
        lb = el.select_one("[data-src]")
        img = el.find("img")
        # The lightbox wrapper exposes the untouched original; the <img> only resized copies.
        url = None
        if lb is not None and lb.name != "img":
            cand = lb.get("data-src")
            if parse_asset(cand):
                url = cand
        if not url and img is not None:
            url = best_image_url(img)
        if not url:
            return []
        uuid = register(url, page, alt=(img.get("alt") if img else None), role="figure")
        if img is not None:
            alt_url = best_image_url(img)
            if alt_url:
                register(alt_url, page, role="figure")
        return [f'::figure{{asset="{uuid}"}}'] if uuid else []

    if kind == "media_collection":
        items = []
        for it in el.select(".grid__item-container"):
            def as_int(v):
                try:
                    return int(float(v))
                except (TypeError, ValueError):
                    return None
            w, h = as_int(it.get("data-width")), as_int(it.get("data-height"))
            # The <script> template holds the full-size markup; the visible <img> is lazy.
            url = None
            tpl = it.find("script", class_="js-lightbox-slide-content")
            if tpl:
                inner = BeautifulSoup(tpl.string or "", "html.parser")
                timg = inner.find("img")
                if timg:
                    url = best_image_url(timg)
            if not url:
                vimg = it.find("img")
                if vimg:
                    url = best_image_url(vimg)
            if not url:
                continue
            cap_el = it.select_one(".grid__image-caption")
            cap = cap_el.get_text(" ", strip=True) if cap_el else ""
            uuid = register(url, page, width=w, height=h, role="gallery")
            if not uuid:
                continue
            line = f'  ::item{{asset="{uuid}"'
            if cap:
                line += f' caption="{attr(cap)}"'
            items.append(line + "}")
        if not items:
            return []
        return [":::gallery\n" + "\n".join(items) + "\n:::"]

    if kind in ("embed", "video"):
        iframe = el.find("iframe")
        if not iframe:
            return []
        ref = embed_ref(iframe.get("src"))
        if not ref:
            return []
        prov, payload = ref
        if prov == "adobe_ccv":
            f = CCV_TO_FILE.get(payload)
            # Self-hosted after cutover; the Adobe id is kept only for provenance.
            return [f'::video{{src="{f}" source="adobe-ccv:{payload}"}}'] if f else []
        if prov == "iframe":
            return [f'::embed{{provider="iframe" src="{attr(payload)}"}}']
        return [f'::embed{{provider="{prov}" id="{payload}"}}']

    if kind == "button":
        a = el.find("a")
        if not a:
            return []
        return [f'::button{{href="{attr(a.get("href"))}" '
                f'label="{attr(a.get_text(" ", strip=True))}"}}']

    if kind == "form":
        fields = []
        for inp in el.select("input[name], textarea[name]"):
            lab = el.select_one(f'label[for="{inp.get("name")}"]')
            fields.append(attr(lab.get_text(" ", strip=True)) if lab else inp.get("name"))
        return [f'::form{{fields="{", ".join(fields)}"}}']

    if kind == "tree":
        # A multi-column layout. Columns are kept as a semantic grouping, but Adobe's
        # flex weights are dropped -- the renderer decides how (or whether) to split.
        cols = []
        for col in el.select(".tree-child-wrapper"):
            members = [c for c in col.find_all(class_="project-module", recursive=True)
                       if c.find_parent(class_="tree-child-wrapper") is col]
            inner = render_sequence(members, page, depth + 1)
            if inner:
                cols.append("\n\n".join(inner))
        if not cols:
            return []
        if len(cols) == 1:
            return [cols[0]]
        # remark-directive nesting: the outer container needs MORE colons than the inner.
        inner = "\n\n".join(f":::column\n\n{c}\n\n:::" for c in cols)
        return ["::::columns\n\n" + inner + "\n\n::::"]

    return []


def render_sequence(elements, page, depth=0):
    """Render modules in document order, folding caption modules into the figure above.

    Adobe puts a caption in its own `.module-caption-container` module -- sometimes a
    sibling of the image, sometimes nested inside it, and sometimes inside a tree column.
    Handling it in one place keeps all three cases working.
    """
    blocks, pending = [], None
    for el in elements:
        if module_type(el) == "caption":
            cap = clean_text(el.get_text(" ", strip=True))
            if cap and blocks and blocks[-1].startswith("::figure{"):
                blocks[-1] = blocks[-1][:-1] + f' caption="{attr(cap)}"}}'
            elif cap:
                pending = cap
            continue
        rendered = render_module(el, page, depth)
        if pending and rendered and rendered[0].startswith("::figure{"):
            rendered[0] = rendered[0][:-1] + f' caption="{attr(pending)}"}}'
            pending = None
        blocks.extend(rendered)
    return blocks


def top_level_modules(container):
    """Modules in document order, skipping any nested inside a tree (handled by it)."""
    out = []
    for el in container.find_all(class_="project-module"):
        if el.find_parent(class_="tree-child-wrapper") is not None:
            continue
        out.append(el)
    return out


# ------------------------------------------------------------------------- page build

def load(name):
    return BeautifulSoup((RAW / f"{name}.html").read_text(encoding="utf-8"), "html.parser")


def build_cover_index():
    """title/year/cover per project slug, plus category membership, from listing pages."""
    meta, cats = {}, {}
    home = load("_home")
    for a in home.select("a.project-cover"):
        slug = (a.get("href") or "").strip("/")
        if not slug:
            continue
        t = a.select_one(".details .title")
        d = a.select_one(".details .date")
        img = a.find("img")
        cover_url = best_image_url(img) if img else None
        meta[slug] = {
            "title": t.get_text(" ", strip=True) if t else slug,
            "year": d.get_text(strip=True) if d else None,
            "cover_url": cover_url,
        }
    for cat in CATEGORY_PAGES:
        page = load(cat)
        out_cat = CATEGORY_RENAMES.get(cat, cat)
        for a in page.select("a.project-cover"):
            slug = (a.get("href") or "").strip("/")
            if slug:
                cats.setdefault(slug, []).append(out_cat)

    for slug, extra in EXTRA_CATEGORIES.items():
        for c in extra:
            if c not in cats.setdefault(slug, []):
                cats[slug].append(c)

    # Listing pages sometimes use a different crop of a project's cover than the home
    # page does; sweep them all so no cover asset is missed.
    for listing in ["_home", "all-the-things"] + CATEGORY_PAGES:
        page = load(listing)
        for a in page.select("a.project-cover"):
            img = a.find("img")
            if img is None:
                continue
            slug = (a.get("href") or "").strip("/")
            url = best_image_url(img)
            if url:
                register(url, slug or listing, role="cover")
            if slug and slug not in meta:
                t = a.select_one(".details .title")
                d = a.select_one(".details .date")
                meta[slug] = {"title": t.get_text(" ", strip=True) if t else slug,
                              "year": d.get_text(strip=True) if d else None,
                              "cover_url": url}
    return meta, cats


def register_site_chrome():
    """Logo, favicon and social-preview images -- referenced outside project modules."""
    page = load("_home")
    for img in page.select("img"):
        if img.find_parent("a", class_="project-cover") is not None:
            continue
        url = best_image_url(img)
        if url:
            register(url, "_site", alt=img.get("alt"), role="chrome")
    for sel, attr_name in (("link[rel*=icon]", "href"),
                           ("meta[property='og:image']", "content"),
                           ("meta[name='twitter:image']", "content")):
        for el in page.select(sel):
            if el.get(attr_name):
                register(el.get(attr_name), "_site", role="chrome")


def yaml_list(vals):
    return "[" + ", ".join(vals) + "]"


def extract_page(name, meta, cats):
    s = load(name)
    container = s.select_one(".js-project-modules") or s.select_one(".page-container")
    if container is None:
        return None

    h1 = s.select_one("h1.title")
    is_project = name not in NON_PROJECT
    info = meta.get(name, {})
    title = info.get("title") or (h1.get_text(" ", strip=True) if h1 else name)

    blocks = render_sequence(top_level_modules(container), name)

    # The h1 becomes frontmatter `title`; drop any duplicate of it from the body.
    if blocks and blocks[0].lstrip("# ").strip().lower() == title.strip().lower():
        blocks = blocks[1:]

    cover_uuid = None
    if info.get("cover_url"):
        cover_uuid = register(info["cover_url"], name, role="cover")

    fm = [f'title: "{attr(title)}"', f"slug: {name}"]
    if is_project:
        if info.get("year"):
            fm.append(f'year: {info["year"]}')
        fm.append(f"categories: {yaml_list(cats.get(name, []))}")
        if cover_uuid:
            fm.append(f"cover: {cover_uuid}")
    fm.append("source: adobe-portfolio")

    doc = "---\n" + "\n".join(fm) + "\n---\n\n" + "\n\n".join(b for b in blocks if b.strip()) + "\n"
    doc = re.sub(r"\n{3,}", "\n\n", doc)

    out_dir = CONTENT / ("projects" if is_project else "pages")
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / f"{name}.md").write_text(doc, encoding="utf-8")
    return {"slug": name, "title": title, "blocks": len(blocks),
            "chars": len(doc), "is_project": is_project}


def main():
    CONTENT.mkdir(exist_ok=True)
    ASSETS.mkdir(exist_ok=True)
    meta, cats = build_cover_index()
    register_site_chrome()

    results = []
    for f in sorted(RAW.glob("*.html")):
        name = f.stem
        if name == "_home":
            continue  # an index of the others; regenerated from frontmatter
        r = extract_page(name, meta, cats)
        if r:
            results.append(r)

    # taxonomy: nav order, labels, and membership -- drives listing pages in the rebuild
    home = load("_home")
    nav = []
    seen = set()
    for a in home.select("nav a, .nav a"):
        href = (a.get("href") or "").strip("/")
        label = a.get_text(" ", strip=True)
        if href and label and href in (set(CATEGORY_PAGES) | {"about", "all-the-things"}) \
                and href not in seen:
            seen.add(href)
            nav.append({"slug": CATEGORY_RENAMES.get(href, href), "label": label})

    order = [s.strip("/") for s in
             [a.get("href", "") for a in home.select("a.project-cover")] if s.strip("/")]
    # The home grid omits some projects; append them so nothing is unreachable.
    for slug in sorted(UNLISTED_PROJECTS):
        if slug not in order and (RAW / f"{slug}.html").exists():
            order.append(slug)

    out_cats = [CATEGORY_RENAMES.get(c, c) for c in CATEGORY_PAGES]
    taxonomy = {
        "nav": nav,
        "project_order": order,
        "categories": {c: [s for s, cl in cats.items() if c in cl] for c in out_cats},
        # old path -> new path, so the rebuild can keep existing links alive
        "redirects": {f"/{old}": f"/{new}" for old, new in CATEGORY_RENAMES.items()},
    }
    (CONTENT / "taxonomy.json").write_text(json.dumps(taxonomy, indent=2), encoding="utf-8")

    # Re-running extraction must not discard what download_assets.py recorded
    # (sha256, on-disk dimensions), so carry those forward for unchanged assets.
    manifest_path = ASSETS / "manifest.json"
    if manifest_path.exists():
        prior = {a["uuid"]: a for a in
                 json.loads(manifest_path.read_text(encoding="utf-8")).get("assets", [])}
        for uuid, rec in MANIFEST.items():
            old = prior.get(uuid)
            if old and old.get("download") and old.get("source_url") == rec["source_url"]:
                rec["download"] = old["download"]
                rec.setdefault("intrinsic_width", old.get("intrinsic_width"))
                rec.setdefault("intrinsic_height", old.get("intrinsic_height"))

    manifest_path.write_text(
        json.dumps({"site_id": SITE_ID, "assets": list(MANIFEST.values())}, indent=2),
        encoding="utf-8")

    projects = [r for r in results if r["is_project"]]
    pages = [r for r in results if not r["is_project"]]
    originals = sum(1 for a in MANIFEST.values() if a["is_original"])
    print(f"projects written : {len(projects)}")
    print(f"pages written    : {len(pages)}  ({', '.join(p['slug'] for p in pages)})")
    print(f"unique assets    : {len(MANIFEST)}  ({originals} true originals, "
          f"{len(MANIFEST) - originals} best-available resize)")
    print(f"categories       : " + ", ".join(
        f"{c}={len(v)}" for c, v in taxonomy['categories'].items()))
    thin = [r for r in projects if r["blocks"] <= 1]
    if thin:
        print(f"\nWARN thin pages ({len(thin)}): {', '.join(r['slug'] for r in thin)}")


if __name__ == "__main__":
    main()
