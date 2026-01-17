# PsiAN Social Media Workflow Documentation

## Overview
This document captures the decisions and processes for bulk scheduling PsiAN social media posts using Vista Social.

---

## Platforms
| Platform | Account Name | Image Required? | Character Limit |
|----------|--------------|-----------------|-----------------|
| Instagram | PsiAN IG | **YES** | 2,200 |
| Facebook | PsiAN Facebook | No (but recommended) | 63,206 |
| LinkedIn | PsiAN LinkedIn | No (but recommended) | 3,000 |
| X/Twitter | PsiAN X | No | 280 per tweet |
| Threads | PsiAN Threads | No (but recommended) | 500 |
| Bluesky | PsiAN Bluesky | No | 300 |
| YouTube | PsiAN YouTube | Video only | N/A |

---

## Optimal Posting Times (2025-2026 Research)

| Platform | Best Days | Best Times |
|----------|-----------|------------|
| Instagram | Monday, Friday | 7:00 AM or 7:00 PM |
| Facebook | Monday, Wednesday | 9:00 AM - 12:00 PM |
| LinkedIn | Tuesday, Wednesday, Thursday | 10:00 AM |
| X/Twitter | Tuesday, Wednesday | 9:00 PM |
| Threads | Monday, Friday | 11:00 AM |
| Bluesky | Tuesday, Wednesday | 9:00 PM |

---

## Image Hosting Setup

### GitHub Repository
- **Repo**: https://github.com/topher416/psian-social-media
- **Image folder**: `/images/`
- **Raw URL pattern**: `https://raw.githubusercontent.com/topher416/psian-social-media/main/images/FILENAME.png`

### Uploading New Images
```bash
cd "/Users/topher416/PsiAN Social Media"
# Copy images to the images folder first, then:
git add -A
git commit -m "Add images for [date/batch description]"
git push
```

---

## CSV Format for Vista Social

### Required Columns (in order)
1. `message` - Post text/caption
2. `type` - One of: `image`, `video`, `article`, `message`
3. `link` - URL to media (image/video) or article link
4. `time` - Schedule time (format: `2026-01-21 10:00 am` or `2026-01-21 10:00`)

### Optional Columns (for threads/comments)
- `comment1` - First reply (for Twitter threads)
- `comment2` - Second reply
- `comment3`, `comment4`, `comment5` - Additional replies

### Multi-Image Posts
For carousel posts, use multiple rows with identical `message`, `type`, and `time` values, each with a different image `link`.

### Example CSV Structure
```csv
message,type,link,time,comment1,comment2,comment3
"Main post text here",image,https://raw.githubusercontent.com/topher416/psian-social-media/main/images/01.png,2026-01-21 10:00 am,,,
"Twitter thread opener",image,https://raw.githubusercontent.com/topher416/psian-social-media/main/images/02.png,2026-01-21 9:00 pm,"Second tweet here","Third tweet here","Fourth tweet here"
```

---

## Post Content Types

### Standard Posts (Instagram, Facebook, LinkedIn, Threads, Bluesky)
- Full caption with hashtags
- Single image
- One row per platform in CSV

### Twitter/X Threads
- Main tweet in `message` column (under 280 chars)
- Subsequent tweets in `comment1`, `comment2`, etc.
- Image attached to main tweet only

---

## Tone Guidelines

### PsiAN Voice
- Professional and measured
- Educational, not alarmist
- Avoid multiple exclamation points
- Cite research when possible
- End with clear calls to action

### Avoid
- ALL CAPS warnings
- Excessive punctuation (!!!)
- Fear-based language
- Overly casual tone

---

## Workflow Steps

### 1. Content Preparation
1. Export post backlog from Google Form responses
2. Categorize posts: Evergreen / Time-Sensitive / Needs Revision / Skip
3. Remove date-specific references from time-sensitive posts
4. Revise any posts with tone issues
5. Convert each post to platform-native versions

### 2. Image Creation (Canva)
1. See `CANVA_INSTRUCTIONS.md` for detailed steps
2. Create images as pages in a single Canva project
3. Export all pages as separate PNGs
4. Use naming convention: `01.png`, `02.png`, etc. (matching post numbers)

### 3. Image Upload
1. Move exported PNGs to `/Users/topher416/PsiAN Social Media/images/`
2. Run git commands to push to GitHub
3. Verify images are accessible via raw URLs

### 4. CSV Generation
1. Build CSV with all posts and scheduled times
2. Insert GitHub raw URLs for each image
3. Verify CSV format matches Vista requirements

### 5. Vista Upload
1. Log into Vista Social
2. Go to Publishing > Bulk Schedule
3. Select target profiles (platforms)
4. Upload CSV
5. Review and confirm scheduled posts

---

## File Locations

| File | Purpose |
|------|---------|
| `/PsiAN Social Media/post_analysis.md` | Categorized backlog analysis |
| `/PsiAN Social Media/converted_posts.md` | All posts in platform-native formats |
| `/PsiAN Social Media/WORKFLOW.md` | This documentation |
| `/PsiAN Social Media/CANVA_INSTRUCTIONS.md` | Image creation guide |
| `/PsiAN Social Media/images/` | Image files for upload |
| `/PsiAN Social Media/instagram.csv` | Instagram posts (Mon 7am, Fri 7pm) |
| `/PsiAN Social Media/facebook.csv` | Facebook posts (Mon & Wed 10am) |
| `/PsiAN Social Media/linkedin.csv` | LinkedIn posts (Tues/Wed/Thurs 10am) |
| `/PsiAN Social Media/twitter_threads_bluesky.csv` | X, Threads, Bluesky (Tues & Wed 9pm) |

## CSV Upload Process

Upload each CSV separately to Vista Social, selecting the appropriate profiles:

1. **instagram.csv** → Select: PsiAN IG
2. **facebook.csv** → Select: PsiAN Facebook
3. **linkedin.csv** → Select: PsiAN LinkedIn
4. **twitter_threads_bluesky.csv** → Select: PsiAN X, PsiAN Threads, PsiAN Bluesky

---

## Scheduling Cadence

**Current plan**: 3x per week per platform concept, spread across platforms daily

| Day | Platform | Time | Post Type |
|-----|----------|------|-----------|
| Monday | Instagram | 7:00 AM | Visual post |
| Monday | Facebook | 10:00 AM | Same content |
| Monday | Threads | 11:00 AM | Same content |
| Tuesday | LinkedIn | 10:00 AM | Professional version |
| Tuesday | X/Twitter | 9:00 PM | Thread format |
| Tuesday | Bluesky | 9:00 PM | Short version |
| Wednesday | LinkedIn | 10:00 AM | Next post |
| Wednesday | X/Twitter | 9:00 PM | Next thread |
| Thursday | LinkedIn | 10:00 AM | Third post |
| Friday | Instagram | 7:00 PM | Next visual post |
| Friday | Facebook | 10:00 AM | Same content |

---

## Notes & Decisions Log

### January 2026 Batch
- Start date: Wednesday, January 21, 2026
- Total posts in backlog: 30 usable
- Platforms: All 7 (excluding YouTube for text posts)
- 3 posts required tone revision (Lisa's AI warning posts)
- 7 posts required date reference removal (awareness month posts)
- 4 posts skipped (expired surveys, already posted)

---

*Last updated: January 17, 2026*
