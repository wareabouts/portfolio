"""Sanity-check the extracted content against the original HTML.

Catches the failure modes that matter for a migration: silently dropped copy, dangling
asset references, unbalanced directives, and pages that came out suspiciously empty.
"""

import json
import re
from collections import Counter
from pathlib import Path

from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "raw"
CONTENT = ROOT / "content"

DIRECTIVE = re.compile(r'^(:+)(\w+)(\{.*\})?\s*$')
ASSET_REF = re.compile(r'asset="([0-9a-f-]{36})"')


def words(s):
    return len(re.findall(r"[A-Za-z0-9']+", s))


def body_of(md):
    return md.split("---", 2)[2] if md.startswith("---") else md


def prose_of(md):
    """Markdown body minus directive lines -- i.e. just the human copy."""
    return "\n".join(l for l in body_of(md).splitlines()
                     if not DIRECTIVE.match(l.strip()) and not l.strip().startswith("::"))


def source_prose(slug):
    s = BeautifulSoup((RAW / f"{slug}.html").read_text(encoding="utf-8"), "html.parser")
    c = s.select_one(".js-project-modules")
    if not c:
        return ""
    out = []
    for rt in c.select(".rich-text.module-text"):
        out.append(rt.get_text(" ", strip=True))
    return " ".join(out)


def main():
    manifest = json.loads((ROOT / "assets/manifest.json").read_text(encoding="utf-8"))
    known = {a["uuid"] for a in manifest["assets"]}

    files = sorted(CONTENT.rglob("*.md"))
    problems = Counter()
    report = []

    for f in files:
        slug = f.stem
        md = f.read_text(encoding="utf-8")
        issues = []

        # 1. unbalanced container directives
        # Openers are `:::name`, closers are a bare `:::` of the same width.
        depth = {}
        for line in body_of(md).splitlines():
            line = line.strip()
            if re.fullmatch(r":{2,}", line):
                depth[len(line)] = depth.get(len(line), 0) - 1
                continue
            m = DIRECTIVE.match(line)
            if not m:
                continue
            colons, name = len(m.group(1)), m.group(2)
            if name in ("figure", "item", "embed", "video", "button", "form"):
                continue  # leaf directive, never closed
            depth[colons] = depth.get(colons, 0) + 1
        for colons, n in depth.items():
            if n:
                issues.append(f"unbalanced {':'*colons} directive (net {n:+d})")

        # 2. dangling asset references
        refs = set(ASSET_REF.findall(md))
        missing = refs - known
        if missing:
            issues.append(f"{len(missing)} asset refs not in manifest")

        # 3. duplicated heading immediately followed by its own text
        for m in re.finditer(r"^## (.+)\n\n(.+)$", body_of(md), re.M):
            if m.group(1).strip().lower() == m.group(2).strip().lower():
                issues.append(f"duplicated heading {m.group(1)!r}")

        # 4. copy loss vs source
        if (RAW / f"{slug}.html").exists():
            src_w, got_w = words(source_prose(slug)), words(prose_of(md))
            if src_w > 40 and got_w < src_w * 0.9:
                issues.append(f"copy loss: {got_w}/{src_w} words ({got_w/src_w:.0%})")

        # 5. empty output
        if not body_of(md).strip():
            issues.append("EMPTY body")

        if issues:
            for i in issues:
                problems[i.split(":")[0].split("(")[0].strip()] += 1
            report.append((slug, issues))

    print(f"checked {len(files)} content files, {len(known)} manifest assets\n")
    if not report:
        print("PASS - no issues found")
    else:
        for slug, issues in report:
            print(f"  [{slug}]")
            for i in issues:
                print(f"     - {i}")
        print("\nsummary:", dict(problems))

    # coverage: every asset referenced somewhere, every project has a cover
    all_md = "\n".join(f.read_text(encoding="utf-8") for f in files)
    referenced = set(ASSET_REF.findall(all_md)) | set(
        re.findall(r"^cover: ([0-9a-f-]{36})", all_md, re.M))
    orphans = known - referenced
    print(f"\nassets referenced by content : {len(referenced)}/{len(known)}")
    if orphans:
        roles = Counter(r for a in manifest["assets"] if a["uuid"] in orphans
                        for r in a["roles"])
        print(f"  {len(orphans)} unreferenced (roles: {dict(roles)}) "
              f"- expected for listing-page cover crops & site chrome")


if __name__ == "__main__":
    main()
