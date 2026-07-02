import re
import csv
import argparse
from datetime import datetime, date, timedelta, time
from pathlib import Path

BASE_DIR = Path(__file__).parent

RAW_IMAGE_URL = (
    "https://raw.githubusercontent.com/topher416/psian-social-media/main/images/{n}.png"
)


def fmt(dt: datetime) -> str:
    # Vista requires formats like '2026-01-21 10:00 am'
    return dt.strftime("%Y-%m-%d %I:%M %p").lower()


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def _remove_emojis(s: str) -> str:
    emoji_pattern = re.compile(
        "[\U0001F600-\U0001F64F"
        "\U0001F300-\U0001F5FF"
        "\U0001F680-\U0001F6FF"
        "\U0001F700-\U0001F77F"
        "\U0001F780-\U0001F7FF"
        "\U0001F800-\U0001F8FF"
        "\U0001F900-\U0001F9FF"
        "\U0001FA00-\U0001FA6F"
        "\U0001FA70-\U0001FAFF"
        "☀-⛿"
        "✀-➿"
        "⌀-⏿"
        "⬀-⯿"
        "]+",
        flags=re.UNICODE,
    )
    s = emoji_pattern.sub("", s)
    s = re.sub("[‍︎️]", "", s)
    return s


def _normalize_handles(s: str) -> str:
    return re.sub(r"@PsiikiAN", "@PsiAN", s, flags=re.IGNORECASE)


def _clean_text(s: str) -> str:
    s = re.sub(r"\r\n?", "\n", s)
    s = re.sub(r"\s+", " ", s).strip()
    s = _normalize_handles(s)
    s = _remove_emojis(s)
    return s


def _extract_section(block: str, title: str) -> str | None:
    m = re.search(rf"^###\s+{re.escape(title)}\s*\n(.*?)(?=^### |^## Post |^---\s*$|\Z)", block, re.S | re.M)
    if not m:
        return None
    return m.group(1).strip()


def _strip_link_line(text: str) -> tuple[str, str | None]:
    lines = [ln for ln in text.splitlines()]
    link = None
    kept = []
    for ln in lines:
        m = re.match(r"\s*\*\*Link\*\*:\s*(\S+)\s*$", ln)
        if m:
            link = m.group(1)
            continue
        kept.append(ln)
    return "\n".join(kept).strip(), link


def parse_posts(md: str):
    headers = list(re.finditer(r"^##\s+Post\s+(\d+):\s*(.*?)$", md, re.M))
    posts = []
    for i, hdr in enumerate(headers):
        start = hdr.end()
        end = headers[i + 1].start() if i + 1 < len(headers) else len(md)
        num = int(hdr.group(1))
        block = md[start:end]

        ig_fb_threads = _extract_section(block, "Instagram/Facebook/Threads Version")
        linkedin = _extract_section(block, "LinkedIn Version")
        x_thread = _extract_section(block, "X/Twitter Thread Version")
        bluesky = _extract_section(block, "Bluesky Version")

        ig_text = None
        if ig_fb_threads:
            ig_body, ig_link = _strip_link_line(ig_fb_threads)
            ig_text = ig_body
            if ig_link:
                ig_text = f"{ig_body}\n{ig_link}"
            ig_text = _clean_text(ig_text)

        li_text = _clean_text(linkedin) if linkedin else None
        bs_text = _clean_text(bluesky) if bluesky else None

        x_main = None
        comments: list[str] = []
        if x_thread:
            m_main = re.search(r"\*\*Main post[^*]*\*\*:\s*(.*?)(?=\n\*\*comment1|\n### |\n## Post |\Z)", x_thread, re.S)
            if m_main:
                x_main = _clean_text(m_main.group(1))
            for ci in range(1, 11):
                m_c = re.search(
                    rf"\*\*comment{ci}\*\*:\s*(.*?)(?=\n\*\*comment{ci+1}\*\*|\n### |\n## Post |\Z)",
                    x_thread,
                    re.S,
                )
                if not m_c:
                    break
                comments.append(_clean_text(m_c.group(1)))

        posts.append(
            {
                "n": num,
                "ig_fb_threads": ig_text,
                "linkedin": li_text,
                "x_main": x_main,
                "x_comments": comments,
                "bluesky": bs_text,
            }
        )

    posts.sort(key=lambda p: p["n"])
    return posts


def generate_schedule(start: date, slots: list[tuple[int, time]], count: int) -> list[datetime]:
    out: list[datetime] = []
    day = start
    while len(out) < count:
        for wd, t in slots:
            if day.weekday() == wd:
                out.append(datetime.combine(day, t))
        day += timedelta(days=1)
    out.sort()
    return out[:count]


def write_csv(path: Path, rows: list[list[str]], header: list[str]):
    with path.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(header)
        for r in rows:
            w.writerow(r)


def main():
    parser = argparse.ArgumentParser(description="Generate Vista Social CSVs from a converted_posts .md file.")
    parser.add_argument("--input", default="converted_posts_batch2.md", help="Path to converted posts .md file (default: converted_posts_batch2.md)")
    parser.add_argument("--start", default="2026-05-11", help="First scheduling date YYYY-MM-DD (default: 2026-05-11, a Monday — Batch 1 ran through May 5)")
    parser.add_argument("--prefix", default="batch2_", help="Output CSV filename prefix (default: batch2_)")
    args = parser.parse_args()

    md_path = BASE_DIR / args.input
    start = datetime.strptime(args.start, "%Y-%m-%d").date()

    md = read_text(md_path)
    posts = parse_posts(md)
    if not posts:
        raise SystemExit(f"No posts parsed from {md_path}")

    # Schedule slots (weekday: 0=Mon ... 6=Sun)
    IG_SLOTS = [(0, time(7, 0)), (4, time(19, 0))]   # Mon 7:00, Fri 19:00
    FB_SLOTS = [(0, time(10, 0)), (2, time(10, 0))]  # Mon, Wed 10:00
    LI_SLOTS = [(1, time(10, 0)), (2, time(10, 0)), (3, time(10, 0))]  # Tue/Wed/Thu 10:00
    X_SLOTS  = [(1, time(21, 0)), (2, time(21, 0))]  # Tue/Wed 21:00

    # Instagram CSV
    ig_schedule = generate_schedule(start, IG_SLOTS, len(posts))
    ig_rows = []
    for p, when in zip(posts, ig_schedule):
        msg = p["ig_fb_threads"] or p["linkedin"] or p["x_main"] or ""
        link = RAW_IMAGE_URL.format(n=p["n"])
        ig_rows.append([msg, "image", link, fmt(when)])
    write_csv(BASE_DIR / f"{args.prefix}instagram.csv", ig_rows, ["message", "type", "link", "time"])

    # Facebook CSV
    fb_schedule = generate_schedule(start, FB_SLOTS, len(posts))
    fb_rows = []
    for p, when in zip(posts, fb_schedule):
        msg = p["ig_fb_threads"] or p["linkedin"] or p["x_main"] or ""
        link = RAW_IMAGE_URL.format(n=p["n"])
        fb_rows.append([msg, "image", link, fmt(when)])
    write_csv(BASE_DIR / f"{args.prefix}facebook.csv", fb_rows, ["message", "type", "link", "time"])

    # LinkedIn CSV
    li_schedule = generate_schedule(start, LI_SLOTS, len(posts))
    li_rows = []
    for p, when in zip(posts, li_schedule):
        msg = p["linkedin"] or p["ig_fb_threads"] or p["x_main"] or ""
        link = RAW_IMAGE_URL.format(n=p["n"])
        li_rows.append([msg, "image", link, fmt(when)])
    write_csv(BASE_DIR / f"{args.prefix}linkedin.csv", li_rows, ["message", "type", "link", "time"])

    # X / Threads / Bluesky CSV
    x_schedule = generate_schedule(start, X_SLOTS, len(posts))
    x_rows = []
    for p, when in zip(posts, x_schedule):
        msg = p["x_main"] or p["linkedin"] or p["ig_fb_threads"] or ""
        link = RAW_IMAGE_URL.format(n=p["n"])
        comments = p["x_comments"][:10]
        comments += [""] * (10 - len(comments))
        x_rows.append([msg, "image", link, fmt(when), *comments])
    write_csv(
        BASE_DIR / f"{args.prefix}twitter_threads_bluesky.csv",
        x_rows,
        [
            "message", "type", "link", "time",
            "comment1", "comment2", "comment3", "comment4", "comment5",
            "comment6", "comment7", "comment8", "comment9", "comment10",
        ],
    )

    # Bluesky CSV (dedicated — uses the Bluesky-native version when present, else falls
    # back to the X main post). Upload this to the Bluesky profile only; the combined
    # twitter_threads_bluesky.csv above should target X + Threads once Bluesky has its own file.
    bs_schedule = generate_schedule(start, X_SLOTS, len(posts))
    bs_rows = []
    for p, when in zip(posts, bs_schedule):
        msg = p["bluesky"] or p["x_main"] or p["ig_fb_threads"] or p["linkedin"] or ""
        link = RAW_IMAGE_URL.format(n=p["n"])
        bs_rows.append([msg, "image", link, fmt(when)])
    write_csv(BASE_DIR / f"{args.prefix}bluesky.csv", bs_rows, ["message", "type", "link", "time"])

    print(f"Generated CSVs from {args.input} (start {args.start}, prefix '{args.prefix}'):")
    print(f"  {args.prefix}instagram.csv ({len(ig_rows)} rows)")
    print(f"  {args.prefix}facebook.csv ({len(fb_rows)} rows)")
    print(f"  {args.prefix}linkedin.csv ({len(li_rows)} rows)")
    print(f"  {args.prefix}twitter_threads_bluesky.csv ({len(x_rows)} rows)")
    print(f"  {args.prefix}bluesky.csv ({len(bs_rows)} rows)")
    print(f"  Last scheduled date: {max(ig_schedule[-1], fb_schedule[-1], li_schedule[-1], x_schedule[-1]).date()}")


if __name__ == "__main__":
    main()
