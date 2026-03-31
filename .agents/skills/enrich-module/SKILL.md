---
name: enrich-module
description: Enriches course modules with rich media (screenshots, infographics, mind maps, podcasts, cinematic videos) by orchestrating browser-use and notebooklm in a 9-phase pipeline. Use when the user wants to add visual/audio content to a course module.
---

# Enrich Module

Orchestrates `/browser-use` and `/notebooklm` to produce rich media content for a course module. Runs a 9-phase pipeline: Research → Collect → Notebook → Generate → Generate Video → Download → Images → Integrate → Paginate.

## Prerequisites

Before running, verify both tools are available:

```bash
notebooklm status          # Must show "Authenticated as: ..."
browser-use doctor         # Must show green checks
```

If `notebooklm status` fails, run `notebooklm login`.

## Invocation

```
/enrich-module <slug> [--phase research|collect|notebook|generate|generate-video|download|images|integrate|paginate] [--sources url1,url2,...] [--lang es_419] [--duration 2h]
```

**Arguments:**
- `<slug>` — Required. One of: `ai-fundamentals`, `prompting-fundamentals`, `reliable-ai-systems`, `vibe-coding`, `agents-and-skills`, `legal-ai-risks`, `copilot-m365`, `microsoft-fabric`, `azure-ai-foundry`, `aws-bedrock`
- `--phase` — Optional. Run only one phase. Omit to run all 9 sequentially.
- `--sources` — Optional. Additional source URLs (comma-separated), added on top of the base mapping.
- `--lang` — Optional. Output language for NotebookLM artifacts. Default: `es` (Spanish).
- `--duration` — Optional. Target duration for the module. Controls content density and pagination. Default: `1h`. Examples: `30m`, `1h`, `2h`, `3h`.

## Argument Parsing

1. Parse the `<slug>` from the user's message. It must match a key in `module-sources.json`.
2. If `--phase` is provided, run only that phase. Otherwise run all phases in order.
3. If `--sources` is provided, split by comma and add to the source list.
4. If `--lang` is provided, use that language code. Otherwise default to `es`.

## Duration Scaling

The `--duration` flag determines content density and structure:

| Duration | Words (total) | Pages | Words/page | Images/page | Mini-quizzes/page | Callouts/page |
|----------|--------------|-------|------------|-------------|-------------------|---------------|
| `30m` | ~3,000 | 1 (no pagination) | ~3,000 | 2-3 total | 1 final quiz only | 2-3 |
| `1h` | ~6,000 | 3-4 | ~1,500-2,000 | 1-2 | 1 | 2-3 |
| `2h` | ~10,000 | 4-6 | ~2,000-2,500 | 2-3 | 1-2 | 3-4 |
| `3h` | ~15,000 | 6-8 | ~2,000-2,500 | 2-3 | 2 | 4-5 |

Use this table when:
- Expanding content (Phase 5 Integrate): target the word count for the duration
- Deciding whether to paginate (Phase 6): only paginate if duration >= 1h
- Setting component density: use the targets for the chosen duration

## Directory Setup

Before any phase, ensure the output directories exist:

```bash
mkdir -p "media/<slug>/screenshots"
mkdir -p "media/<slug>/infographics"
mkdir -p "media/<slug>/audio"
mkdir -p "media/<slug>/video"
```

## State File: sources.json

All phases read and write `media/<slug>/sources.json`. This file tracks:
- Discovered sources (Phase 0)
- Screenshot paths and text extracts (Phase 1)
- NotebookLM notebook ID and source IDs (Phase 2)
- Artifact IDs and generation status (Phases 3a, 3b)
- Local download paths (Phase 4)

**Initialize** `sources.json` if it doesn't exist:

```json
{
  "module_slug": "<slug>",
  "module_title": "<title from module-sources.json>",
  "created_at": "<ISO timestamp>",
  "notebook_id": null,
  "research_notebook_id": null,
  "sources": [],
  "artifacts": [],
  "downloads": []
}
```

**Idempotency:** Each phase checks `sources.json` before starting. If prior work exists, ask the user whether to reuse or redo.

## Progress Logging

Print progress at each step:

```
[Phase 1/8] Researching sources for "<module_title>"...
[Phase 2/8] Collecting screenshots (3/8): anthropic.com...
[Phase 3/8] Loading source 5/12: S02 Understanding LLMs.pdf...
[Phase 4/8] Generating audio, mind map, infographics...
[Phase 5/8] Generating cinematic video... (polling, 12m elapsed)
[Phase 6/8] Downloading artifacts to media/<slug>/...
```

---

## Phase 0 — Research

**When:** `--phase research` or running all phases.

**Purpose:** Discover additional sources (YouTube tutorials, papers, articles) beyond the base mapping using NotebookLM's deep research.

**Steps:**

1. Read `module-sources.json` to get the module's `research_query`.

2. **Check idempotency:** If `sources.json` already has `research_notebook_id` set, ask the user:
   > "Research was already run for this module. Reuse existing results or re-run?"
   If reuse, skip to step 8.

3. Create a temporary research notebook:
   ```bash
   notebooklm create "Research: <module_title>" --json
   ```
   Parse `id` from JSON output. Save as `research_notebook_id` in `sources.json`.

4. Set context:
   ```bash
   notebooklm use <research_notebook_id>
   ```

5. Start deep research (non-blocking):
   ```bash
   notebooklm source add-research "<research_query>" --mode deep --no-wait
   ```

6. Wait for research to complete and import sources:
   ```bash
   notebooklm research wait --import-all --timeout 1800
   ```
   Exit code 2 = timeout. If timeout, report to user and continue with base mapping only.

7. List discovered sources:
   ```bash
   notebooklm source list --json
   ```
   Parse the `sources` array from JSON output.

8. **Classify each source** by inspecting its URL and title:
   - URL contains `youtube.com` or `youtu.be` → type: `youtube`, `embeddable: true`
   - URL contains `arxiv.org` → type: `paper`
   - URL contains `learn.microsoft.com`, `docs.aws.amazon.com`, `docs.anthropic.com` → type: `docs`
   - Everything else → type: `article`

9. **Validate YouTube sources with browser-use:**
   For each YouTube source:
   ```bash
   browser-use open "<youtube_url>"
   browser-use screenshot "media/<slug>/screenshots/yt-<video_id>.png"
   browser-use close
   ```
   Record the embed URL: `https://www.youtube.com/embed/<video_id>`

10. **Merge sources:** Combine discovered sources with base mapping URLs/YouTube and any `--sources` from the user. Deduplicate by URL.

11. **Save to sources.json:** Add each source to the `sources` array:
    ```json
    {
      "url": "https://...",
      "title": "Source Title",
      "type": "youtube|paper|article|docs",
      "embeddable": true,
      "embed_url": "https://www.youtube.com/embed/...",
      "discovered_at": "<ISO timestamp>",
      "origin": "research|base_mapping|user_provided"
    }
    ```

12. **Delete research notebook** (temporary, no longer needed):
    ```bash
    notebooklm notebook delete <research_notebook_id>
    ```
    Confirm when prompted.

13. Print summary:
    ```
    [Phase 1/8] Research complete. Found:
      - 3 YouTube tutorials (embeddable)
      - 2 academic papers
      - 4 articles
      - 5 base mapping sources
      Total: 14 sources
    ```

---

## Phase 1 — Collect

**When:** `--phase collect` or running all phases.

**Purpose:** Extract screenshots and text content from web sources using browser-use.

**Steps:**

1. Read `sources.json` to get the list of sources.

2. **Check idempotency:** For each source, check if a `screenshot_path` already exists. Skip sources that have already been collected unless the user requests a redo.

3. **For each non-YouTube URL source:**

   a. Navigate:
   ```bash
   browser-use open "<url>"
   ```

   b. Wait for page load:
   ```bash
   browser-use wait text "" --timeout 5000
   ```

   c. Take full-page screenshot:
   ```bash
   browser-use screenshot --full "media/<slug>/screenshots/<domain>-<timestamp>.png"
   ```

   d. Extract page text:
   ```bash
   browser-use get html --selector "main, article, .content, body" > /tmp/enrich-<slug>-<n>.html
   ```
   Then extract text content:
   ```bash
   browser-use eval "document.querySelector('main, article, .content, body')?.innerText || document.body.innerText"
   ```
   Save the text output to `media/<slug>/screenshots/<domain>-extract.txt`.

   e. Update the source entry in `sources.json`:
   ```json
   {
     "screenshot_path": "media/<slug>/screenshots/<domain>-<timestamp>.png",
     "text_extract_path": "media/<slug>/screenshots/<domain>-extract.txt"
   }
   ```

4. **For each YouTube source:**

   a. Navigate to the video page:
   ```bash
   browser-use open "<youtube_url>"
   ```

   b. Take screenshot of the video player:
   ```bash
   browser-use screenshot "media/<slug>/screenshots/yt-<video_id>-player.png"
   ```

   c. Extract the video title and description:
   ```bash
   browser-use get text 0
   ```
   (Index 0 is typically the title element — verify with `browser-use state` first.)

   d. Record embed URL in `sources.json`:
   ```json
   {
     "embed_url": "https://www.youtube.com/embed/<video_id>",
     "embeddable": true,
     "screenshot_path": "media/<slug>/screenshots/yt-<video_id>-player.png"
   }
   ```

5. Close the browser when done:
   ```bash
   browser-use close
   ```

6. Print summary:
   ```
   [Phase 2/8] Collection complete:
     - 5 web pages screenshotted
     - 3 YouTube videos captured
     - 8 text extracts saved
   ```

---

## Phase 2 — Notebook

**When:** `--phase notebook` or running all phases.

**Purpose:** Create a NotebookLM notebook for this module and load all sources.

**Steps:**

1. **Check idempotency:** If `sources.json` has a `notebook_id` set, ask the user:
   > "A notebook already exists for this module (ID: <id>). Reuse it or create a new one?"
   If reuse, skip to step 6 (source indexing wait).

2. **Set output language:**
   ```bash
   notebooklm language set <lang>
   ```
   Default: `es`. Override with `--lang` flag.

3. **Create the module notebook:**
   ```bash
   notebooklm create "Módulo: <module_title>" --json
   ```
   Parse `id` from JSON output. Save as `notebook_id` in `sources.json`.

4. **Set active notebook:**
   ```bash
   notebooklm use <notebook_id>
   ```

5. **Load sources in order** (all commands use `--json`):

   a. **PDFs from Teoria/:**
   For each path in `module-sources.json` → `teoria_pdfs`:
   ```bash
   notebooklm source add "<pdf_path>" --type file --json
   ```
   Parse `source_id` from output. Add to `sources.json`.

   b. **PDFs from Legal/** (only for `legal-ai-risks`):
   For each path in `module-sources.json` → `legal_pdfs`:
   ```bash
   notebooklm source add "<pdf_path>" --type file --json
   ```
   Parse `source_id`. Add to `sources.json`.

   c. **Web URLs from base mapping:**
   For each URL in `module-sources.json` → `urls`:
   ```bash
   notebooklm source add "<url>" --json
   ```
   Parse `source_id`. Add to `sources.json`.

   d. **YouTube links:**
   For each URL in `module-sources.json` → `youtube` AND any YouTube sources discovered in Phase 0:
   ```bash
   notebooklm source add "<youtube_url>" --json
   ```
   Parse `source_id`. Add to `sources.json`.

   e. **Text extracts from Phase 1:**
   For each source in `sources.json` that has a `text_extract_path`:
   ```bash
   notebooklm source add "<text_extract_path>" --type text --json
   ```
   Parse `source_id`. Add to `sources.json`.

   f. **User-provided --sources URLs:**
   For each additional URL:
   ```bash
   notebooklm source add "<url>" --json
   ```
   Parse `source_id`. Add to `sources.json`.

6. **Wait for source indexing:**
   Sources must be indexed before generation. Poll until all are ready:
   ```bash
   notebooklm source list --json
   ```
   Check that every source has `"status": "ready"`. Repeat every 15 seconds. Timeout after 10 minutes.

   Alternatively, wait per source:
   ```bash
   notebooklm source wait <source_id> --timeout 600
   ```

7. Print summary:
   ```
   [Phase 3/8] Notebook created and loaded:
     - Notebook ID: <id>
     - Sources loaded: 12 (8 ready, 4 processing...)
     - All sources indexed ✓
   ```

---

## Phase 3a — Generate (Non-Video Artifacts)

**When:** `--phase generate` or running all phases.

**Purpose:** Generate audio podcast, mind map, and infographics from the notebook. These are relatively fast and run together, separate from video which can take 30+ minutes.

**Steps:**

1. **Check idempotency:** If `sources.json` already has non-video artifacts with `"status": "completed"`, ask the user:
   > "Non-video artifacts already exist. Regenerate or keep existing?"
   If keep, skip to end.

2. **Set active notebook:**
   ```bash
   notebooklm use <notebook_id>
   ```

3. **Generate mind map** (synchronous, instant):
   ```bash
   notebooklm generate mind-map --json
   ```
   This returns immediately. Record the artifact in `sources.json`:
   ```json
   {
     "artifact_id": "<id>",
     "type": "mind-map",
     "status": "completed"
   }
   ```

4. **Generate audio podcast:**
   ```bash
   notebooklm generate audio "Resumen completo del módulo <module_title> para profesionales" --language <lang> --json
   ```
   Parse `task_id` from output. Record in `sources.json`:
   ```json
   {
     "artifact_id": "<task_id>",
     "type": "audio",
     "status": "pending"
   }
   ```

5. **Generate infographic:**
   ```bash
   notebooklm generate infographic --orientation landscape --detail detailed --style professional --language <lang> --json
   ```
   Parse `task_id`. Record in `sources.json`:
   ```json
   {
     "artifact_id": "<task_id>",
     "type": "infographic",
     "status": "pending"
   }
   ```

6. **Poll for completion with backoff:**

   **Audio:** Poll `notebooklm artifact list --json`, check for the audio artifact's status.
   - Intervals: 10s → 30s → 60s → 120s (repeating)
   - Timeout: **20 minutes**
   - On timeout (exit code 2): mark as `"status": "timeout"` in `sources.json`, continue.

   **Infographic:** Same polling pattern.
   - Intervals: 10s → 30s → 60s (repeating)
   - Timeout: **15 minutes**

   Alternatively, use `artifact wait`:
   ```bash
   notebooklm artifact wait <artifact_id> --timeout 1200
   ```

7. **Update sources.json** with final statuses.

8. **Partial failure:** If one artifact fails, continue with the rest. Mark failed artifacts:
   ```json
   {
     "artifact_id": "<id>",
     "type": "audio",
     "status": "failed",
     "error": "<error message>"
   }
   ```

9. Print summary:
   ```
   [Phase 4/8] Non-video generation complete:
     - Mind map: ✓ completed
     - Audio podcast: ✓ completed (12 min)
     - Infographic: ✓ completed
   ```

---

## Phase 3b — Generate Video (Separate, Long-Running)

**When:** `--phase generate-video` or running all phases (after Phase 3a).

**Purpose:** Generate a cinematic video independently. This is separated from Phase 3a because video generation can take 30+ minutes and must not block or be blocked by other artifacts.

**Steps:**

1. **Check idempotency:** If `sources.json` already has a video artifact with `"status": "completed"`, ask the user:
   > "A cinematic video already exists. Regenerate or keep existing?"
   If keep, skip to end.

2. **Set active notebook:**
   ```bash
   notebooklm use <notebook_id>
   ```

3. **Generate cinematic video:**
   ```bash
   notebooklm generate video "Video explicativo cinematográfico del módulo <module_title>" --format cinematic --language <lang> --json
   ```
   Parse `task_id` from output. Record in `sources.json`:
   ```json
   {
     "artifact_id": "<task_id>",
     "type": "video",
     "format": "cinematic",
     "status": "pending"
   }
   ```

4. **Poll for completion with extended backoff:**
   ```bash
   notebooklm artifact wait <artifact_id> --timeout 2700
   ```
   - Intervals: 10s → 30s → 60s → 120s → 120s (repeating)
   - Timeout: **45 minutes**
   - On timeout (exit code 2): mark as `"status": "timeout"`, report to user.

5. **Update sources.json** with final status.

6. Print summary:
   ```
   [Phase 5/8] Video generation complete:
     - Cinematic video: ✓ completed (23 min)
   ```
   Or if timeout:
   ```
   [Phase 5/8] Video generation timed out after 45 min.
     Check status with: notebooklm artifact list
     Re-run with: /enrich-module <slug> --phase generate-video
   ```

**Note:** When running all phases sequentially, Phase 3b runs after Phase 3a completes. The user can also run `--phase download` in parallel while waiting for video generation, to download the already-completed non-video artifacts from Phase 3a.

---

## Phase 4 — Download

**When:** `--phase download` or running all phases (after Phases 3a and 3b).

**Purpose:** Download all generated artifacts to local storage.

**Steps:**

1. **Check idempotency:** For each artifact in `sources.json`, check if a `local_path` already exists. Skip already-downloaded artifacts unless user requests re-download.

2. **Set active notebook:**
   ```bash
   notebooklm use <notebook_id>
   ```

3. **Download each completed artifact:**

   a. **Mind map:**
   ```bash
   notebooklm download mind-map "media/<slug>/infographics/mindmap.json" -a <artifact_id>
   ```

   b. **Audio podcast:**
   ```bash
   notebooklm download audio "media/<slug>/audio/podcast.mp3" -a <artifact_id>
   ```

   c. **Infographic:**
   ```bash
   notebooklm download infographic "media/<slug>/infographics/infographic-1.png" -a <artifact_id>
   ```

   d. **Cinematic video** (only if Phase 3b completed):
   ```bash
   notebooklm download video "media/<slug>/video/cinematic.mp4" -a <artifact_id>
   ```

4. **Update sources.json** with local paths and file sizes:
   ```json
   {
     "artifact_id": "<id>",
     "type": "audio",
     "status": "completed",
     "local_path": "media/<slug>/audio/podcast.mp3",
     "file_size_mb": 12.3
   }
   ```

5. **Skip failed/timeout artifacts.** If an artifact has `"status": "failed"` or `"status": "timeout"`, skip it and note in the summary.

6. **Print final summary:**
   ```
   [Phase 6/8] Download complete — Módulo: <module_title>

     Screenshots:   5 archivos
     Mind map:      media/<slug>/infographics/mindmap.json
     Infographic:   media/<slug>/infographics/infographic-1.png
     Audio:         media/<slug>/audio/podcast.mp3 (12.3 MB)
     Video:         media/<slug>/video/cinematic.mp4 (45.1 MB)

     Total: 60.4 MB in media/<slug>/

     Embeddable YouTube URLs:
       - https://www.youtube.com/embed/zjkBMFhNj_g
       - https://www.youtube.com/embed/abc123

     Failed artifacts: none
   ```

   If some artifacts failed:
   ```
     Failed artifacts:
       - video: timed out (re-run with --phase generate-video)
   ```

---

## Phase 5 — Generate Images (Gemini Imagen)

**When:** `--phase images` or running all phases (after Phase 4).

**Purpose:** Generate educational infographic images for the module using Google's Imagen API. Images must be **informative and descriptive**, not decorative.

**Prerequisites:**
- `GEMINI_API_KEY` environment variable must be set (from Google AI Studio)
- Model: `imagen-4.0-generate-001` (standard) or `imagen-4.0-fast-generate-001` (cheaper)
- Cost: ~$0.04/image (standard) or ~$0.02/image (fast). Choose based on budget.

**Image Targets by Duration:**

| Duration | Images total | Per section page |
|----------|-------------|-----------------|
| `30m` | 2-3 | 2-3 (single page) |
| `1h` | 4-6 | 1-2 |
| `2h` | 7-10 | 2-3 |
| `3h` | 10-14 | 2-3 |

**Steps:**

1. **Read the module content** (MDX files in `content/<slug>/` or `content/<slug>.mdx`) to understand what concepts need visual explanation.

2. **Identify image opportunities.** For each section, ask: "What concept here would a student understand better with a diagram?" Good candidates:
   - Process flows (e.g., how training works, how a prompt gets processed)
   - Comparisons (e.g., open vs closed models, API vs interface)
   - Abstract concepts that benefit from spatial representation (e.g., embeddings, attention)
   - Warning/risk scenarios (e.g., bias, prompt injection, hallucinations)
   - Before/after workflows (e.g., working with vs without AI)

3. **Write descriptive prompts** following these strict rules:

   **PROMPT RULES — MANDATORY:**
   - Every prompt MUST describe **specific labeled elements** the image should contain
   - Every prompt MUST describe the **layout/structure** (left vs right, top vs bottom, grid, flow)
   - Every prompt MUST end with "Clean professional infographic style, white background, clear readable labels in Spanish"
   - NEVER use vague prompts like "abstract visualization of X" or "conceptual illustration of X"
   - NEVER request dark/gradient backgrounds (they don't match the course's white design)
   - NEVER generate images without text labels — the image must communicate WITHOUT the caption
   - ALL text labels in the image MUST be in Spanish (matching the course language). Write the prompt in English but specify: "All labels and text in the image must be in Spanish"

   **PROMPT TEMPLATE:**
   ```
   An educational infographic showing [WHAT THE CONCEPT IS].
   [LAYOUT: left side shows X, right side shows Y / top-to-bottom flow / 2x2 grid].
   [SPECIFIC ELEMENTS: list each labeled element that must appear].
   [RELATIONSHIPS: arrows, dotted lines, groupings between elements].
   All labels and text in the image must be in Spanish.
   Clean professional infographic style, white background, [accent color] accents, clear readable labels in Spanish.
   ```

   **GOOD prompt example:**
   ```
   An educational infographic showing how word embeddings work in AI.
   On the left side, the words feliz, alegría, and contento are clustered together as colored circles.
   On the right side, triste, sombrío, and deprimido are clustered together.
   In the middle, the word banco appears twice: once near río and agua, once near dinero and finanzas.
   Dotted lines connect related words showing semantic distance.
   All labels and text in the image must be in Spanish.
   Clean professional infographic style, white background, blue accents, clear readable labels in Spanish.
   ```

   **BAD prompt example:**
   ```
   A clean minimal tech illustration of semantic embedding space with glowing nodes
   on dark blue gradient background, professional futuristic style
   ```
   This produces pretty but useless images with random gibberish labels.

4. **Generate images** using the Gemini API:

   ```bash
   curl -s "https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=$GEMINI_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "instances": [{"prompt": "<YOUR DESCRIPTIVE PROMPT>"}],
       "parameters": {"sampleCount": 1, "aspectRatio": "16:9"}
     }'
   ```

   Parse the response: `predictions[0].bytesBase64Encoded` → decode base64 → save as PNG.

5. **Save images** to `public/media/<slug>/diagrams/<descriptive-name>.png`

6. **Verify each image** before proceeding:
   - Does it have readable labels?
   - Does it communicate the concept without a caption?
   - Does it match the white/professional style of the course?
   - If not → regenerate with a more specific prompt. Do NOT keep decorative-only images.

7. **Record in sources.json:**
   ```json
   {
     "type": "generated-image",
     "path": "public/media/<slug>/diagrams/<name>.png",
     "prompt": "<the prompt used>",
     "model": "imagen-4.0-generate-001",
     "concept": "<what this image explains>"
   }
   ```

8. Print summary:
   ```
   [Phase 5/9] Image generation complete:
     - 7 educational infographics generated
     - Model: imagen-4.0-generate-001
     - Cost: ~$0.28
     - All images verified as informative (not decorative)
   ```

---

## Phase 6 — Integrate

**When:** `--phase integrate` or running all phases (after Phase 5 Images).

**Purpose:** Embed generated media into the course website by modifying the module's MDX file and copying lightweight assets to `public/`.

**Strategy:**
- **Lightweight assets** (infographics, screenshots): Copy to `public/media/<slug>/` and reference in MDX with image tags.
- **YouTube videos**: Embed as `<iframe>` in MDX using embeddable URLs from `sources.json`.
- **Heavy assets** (audio .mp3, video .mp4): Served via API route `/api/media/[...path]`. Linked in MDX as download links (not inline players).

**Steps:**

1. **Check idempotency:** If `sources.json` has `"integrated": true`, ask the user:
   > "This module was already integrated into MDX. Re-integrate (will overwrite the Recursos Multimedia section) or skip?"
   If skip, end.

2. **Create public asset directories:**
   ```bash
   mkdir -p "public/media/<slug>/infographics"
   mkdir -p "public/media/<slug>/screenshots"
   ```

3. **Copy lightweight assets to public/:**
   ```bash
   cp media/<slug>/infographics/*.png public/media/<slug>/infographics/
   cp media/<slug>/infographics/*.json public/media/<slug>/infographics/
   ```
   For screenshots, copy only the most relevant ones (ask user to select, or copy all):
   ```bash
   cp media/<slug>/screenshots/*.png public/media/<slug>/screenshots/
   ```
   Do NOT copy .mp3 or .mp4 files to public/.

4. **Read the current MDX file:** `content/<slug>.mdx`

5. **Build the "Recursos Multimedia" section** to append before any existing `<Quiz>` component (or at the end if no quiz):

   ```mdx
   ## Recursos Multimedia

   ### Videos Recomendados

   <iframe
     width="100%"
     height="400"
     src="https://www.youtube.com/embed/<video_id>"
     title="<video_title>"
     frameBorder="0"
     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
     allowFullScreen
     className="rounded-lg my-4"
   />

   ### Infografía del Módulo

   ![Infografía: <module_title>](/media/<slug>/infographics/infographic-1.png)

   ### Material Descargable

   - [Escuchar podcast del módulo (MP3)](/api/media/<slug>/audio/podcast.mp3)
   - [Ver video cinemático (MP4)](/api/media/<slug>/video/cinematic.mp4)
   ```

   **Rules for building this section:**
   - Only include YouTube iframes for sources with `"embeddable": true` in `sources.json`.
   - Only include infographic images that exist in `public/media/<slug>/infographics/`.
   - Only include audio/video download links for artifacts with `"status": "completed"`.
   - Use the existing course styling: Tailwind prose classes apply automatically via the MDX layout.

6. **Insert into the MDX file:**
   - If the MDX contains a `<Quiz` component, insert the section BEFORE the quiz.
   - Otherwise, append at the end.

7. **Update sources.json:**
   ```json
   {
     "integrated": true,
     "integrated_at": "<ISO timestamp>",
     "public_assets": [
       "public/media/<slug>/infographics/infographic-1.png"
     ],
     "mdx_modified": "content/<slug>.mdx"
   }
   ```

8. Print summary:
   ```
   [Phase 7/8] Integration complete — content/<slug>.mdx updated:
     - 2 YouTube embeds added
     - 1 infographic embedded
     - Audio: download link added
     - Video: download link added
     - Assets copied to public/media/<slug>/
   ```

---

## Phase 6 — Paginate

**When:** `--phase paginate` or running all phases (after Phase 5). Only runs if `--duration` >= `1h`.

**Purpose:** Split the expanded MDX into separate section files and add interactive components.

**Steps:**

1. **Check if pagination is needed:** If `--duration` is `30m`, skip this phase (single page is fine).

2. **Check idempotency:** If `content/<slug>/` directory already exists, ask the user:
   > "Section files already exist. Re-split (will overwrite) or skip?"

3. **Read the expanded MDX file:** `content/<slug>.mdx`

4. **Identify H2 section boundaries:** Find all `## ` headers. Each becomes a separate file.

5. **Create section directory:**
   ```bash
   mkdir -p "content/<slug>"
   ```

6. **Split into section files:** For each H2 section:
   - Name: `content/<slug>/NN-<section-id>.mdx` (zero-padded number + slugified title)
   - Content: everything from this H2 to the next H2 (or end of file)

7. **Insert interactive components** per the density targets for the chosen duration:
   - `<Callout type="tip">` after each section intro paragraph
   - `<MiniQuiz>` at the end of each section (generate question from the section content)
   - `<Accordion>` around paragraphs that contain advanced/optional detail
   - `<BeforeAfter>` where practical comparisons exist
   - `<ModuleImage>` references for any AI-generated images in `media/<slug>/`

8. **Move Quiz, Resources, and Multimedia** to the last section file.

9. **Add SectionVisitBanner** above the Quiz in the last section:
   ```jsx
   <SectionVisitBanner slug="<slug>" totalSections={N} />
   ```

10. **Update `lib/modules.ts`:** Add `sections` array to the module:
    ```typescript
    sections: [
      { id: '<section-id>', title: '<Section Title>', file: 'NN-<section-id>' },
      ...
    ]
    ```

11. **Update the section import map** in `app/modules/[slug]/[page]/page.tsx` to add the new module's MDX imports.

12. **Print summary:**
    ```
    [Phase 8/8] Pagination complete — content/<slug>/:
      - 4 section files created
      - 8 MiniQuiz components inserted
      - 12 Callout components inserted
      - 3 Accordion components inserted
      - 2 BeforeAfter components inserted
      - Module definition updated
    ```
