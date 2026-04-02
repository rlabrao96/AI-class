---
name: enrich-module
description: Enriches course modules with rich media (screenshots, infographics, mind maps, podcasts, explainer videos) by orchestrating browser-use and notebooklm in a 10-phase pipeline. Use when the user wants to add visual/audio content to a course module.
---

# Enrich Module

Orchestrates `/browser-use` and `/notebooklm` to produce rich media content for a course module. Runs a 10-phase pipeline: Research → Collect → Notebook → Generate → Generate Video → Download → Images → Integrate → Paginate → Verify Images.

## Prerequisites

Before running, verify both tools are available:

```bash
notebooklm status          # Must show "Authenticated as: ..."
browser-use doctor         # Must show green checks
```

If `notebooklm status` fails, run `notebooklm login`.

## Invocation

```
/enrich-module <slug> [--phase research|collect|notebook|generate|generate-video|download|images|integrate|paginate|verify-images] [--sources url1,url2,...] [--lang es_419] [--duration 2h]
```

**Arguments:**
- `<slug>` — Required. One of: `ai-fundamentals`, `prompting-fundamentals`, `reliable-ai-systems`, `vibe-coding`, `agents-and-skills`, `legal-ai-risks`, `copilot-m365`, `microsoft-fabric`, `azure-ai-foundry`, `aws-bedrock`
- `--phase` — Optional. Run only one phase. Omit to run all 10 sequentially.
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
[Phase 5/8] Generating explainer video... (polling, 6m elapsed)
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

**Purpose:** Generate audio podcast, mind map, and infographics from the notebook. These are relatively fast and run together, separate from video which can take 5-10 minutes.

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

**Purpose:** Generate an explainer video in classic style. This is separated from Phase 3a because video generation can take 5-10 minutes and must not block or be blocked by other artifacts.

**Steps:**

1. **Check idempotency:** If `sources.json` already has a video artifact with `"status": "completed"`, ask the user:
   > "An explainer video already exists. Regenerate or keep existing?"
   If keep, skip to end.

2. **Set active notebook:**
   ```bash
   notebooklm use <notebook_id>
   ```

3. **Generate explainer video:**
   ```bash
   notebooklm generate video "Video explicativo del módulo <module_title>" --format explainer --style classic --language <lang> --json
   ```
   Parse `task_id` from output. Record in `sources.json`:
   ```json
   {
     "artifact_id": "<task_id>",
     "type": "video",
     "format": "explainer",
     "style": "classic",
     "status": "pending"
   }
   ```

4. **Poll for completion with backoff:**
   ```bash
   notebooklm artifact wait <artifact_id> --timeout 600
   ```
   - Intervals: 10s → 30s → 60s → 60s (repeating)
   - Timeout: **10 minutes**
   - On timeout (exit code 2): mark as `"status": "timeout"`, report to user.

5. **Update sources.json** with final status.

6. Print summary:
   ```
   [Phase 5/8] Video generation complete:
     - Explainer video: ✓ completed (7 min)
   ```
   Or if timeout:
   ```
   [Phase 5/8] Video generation timed out after 10 min.
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

   d. **Explainer video** (only if Phase 3b completed):
   ```bash
   notebooklm download video "media/<slug>/video/explainer.mp4" -a <artifact_id>
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
     Video:         media/<slug>/video/explainer.mp4 (45.1 MB)

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

   **CRITICAL: Labels are HTML overlays, NOT generated in the image.**

   AI image models hallucinate text — they produce gibberish like "Tolqules de assistantos" instead of real words. This is especially bad in non-English languages. Therefore:

   - Generate images **WITHOUT any text, labels, or words** in the image itself
   - Add all labels as HTML overlays using the `labels` prop on `<ModuleImage>`
   - The image provides the visual concept; the HTML provides perfect text in Spanish

   **3-STEP PROCESS:**
   1. **Plan labels first:** Decide what labels the image needs and where they go (top-left, bottom-center, etc.)
   2. **Generate image:** Prompt describes visual layout with empty spaces for labels
   3. **Add HTML labels:** Use `<ModuleImage labels={[...]}/>` in the MDX

   **PROMPT RULES — MANDATORY:**
   - Every prompt MUST end with "NO TEXT, NO LABELS, NO WORDS anywhere in the image"
   - Every prompt MUST say "Leave empty space at [position] for overlay labels"
   - Every prompt MUST describe the **layout/structure** (left vs right, top vs bottom, grid, flow)
   - Every prompt MUST end with "Clean professional infographic style, white background"
   - NEVER use vague prompts like "abstract visualization of X"
   - NEVER request dark/gradient backgrounds (they don't match the course's white design)

   **PROMPT TEMPLATE:**
   ```
   An educational diagram showing [WHAT THE CONCEPT IS].
   [LAYOUT: left side shows X, right side shows Y / top-to-bottom flow / 2x2 grid].
   [SPECIFIC VISUAL ELEMENTS: describe shapes, colors, arrows, icons — NOT text].
   [RELATIONSHIPS: arrows, dotted lines, groupings between elements].
   Leave empty space at [positions] for overlay labels.
   Clean professional infographic style, white background. NO TEXT, NO LABELS, NO WORDS anywhere in the image.
   ```

   **GOOD prompt example:**
   ```
   An educational diagram showing word embedding clusters in AI.
   Left cluster: three warm-colored circles close together (representing similar positive emotions).
   Right cluster: three cool-colored circles close together (representing similar negative emotions).
   Center: two identical circles in different clusters (representing a word with two meanings).
   Dotted lines show distances between clusters.
   Leave empty space at top-left and top-right for overlay labels.
   Clean professional infographic style, white background. NO TEXT, NO LABELS, NO WORDS anywhere in the image.
   ```

   Then in MDX, add the labels:
   ```jsx
   <ModuleImage
     src="/media/<slug>/diagrams/embeddings-space.png"
     alt="Espacio de embeddings"
     caption="Los embeddings organizan palabras por significado."
     labels={[
       { text: "Feliz · Alegría · Contento", position: "top-left", style: "success" },
       { text: "Triste · Sombrío · Deprimido", position: "top-right", style: "danger" },
       { text: "Significados similares = cercanía", position: "bottom-center", style: "dark" }
     ]}
   />
   ```

   **Label styles available:** `default` (white), `accent` (blue), `dark` (black), `success` (green), `warning` (amber), `danger` (red)
   **Label positions available:** `top-left`, `top-center`, `top-right`, `center-left`, `center`, `center-right`, `bottom-left`, `bottom-center`, `bottom-right`

   **BAD prompt example:**
   ```
   An educational infographic with labels showing feliz, alegría, contento...
   Clean professional infographic style, clear readable labels in Spanish.
   ```
   This produces hallucinated gibberish text. NEVER ask the model to generate text.

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

6. **Record in sources.json:**
   ```json
   {
     "type": "generated-image",
     "path": "public/media/<slug>/diagrams/<name>.png",
     "prompt": "<the prompt used>",
     "model": "imagen-4.0-generate-001",
     "concept": "<what this image explains>",
     "labels": [{ "text": "...", "position": "...", "style": "..." }]
   }
   ```

7. Print summary:
   ```
   [Phase 5/10] Image generation complete:
     - 7 images generated (no text baked in)
     - 7 label sets planned for HTML overlay
     - Model: imagen-4.0-generate-001
     - Cost: ~$0.28
   ```

---

## Phase 5b — Verify Images (browser-use)

**When:** `--phase verify-images` or running all phases (after Phase 5 Images, after Phase 7 Integrate + Phase 8 Paginate).

**Purpose:** Use browser-use to visually inspect each generated image as it appears on the live page. Detect hallucinated text baked into images and flag for regeneration. This is the final quality gate before the module is considered done.

**Why this phase exists:** AI image models frequently ignore "NO TEXT" instructions and bake in gibberish text (e.g., "EDUSIATIONAY AI BIAS", "Corem Ipsem", "FILTER"). This text is undetectable from the prompt or file alone — you must visually inspect the rendered page.

**Steps:**

1. **Start the dev server** (if not already running):
   ```bash
   npm run dev
   ```

2. **Navigate to each section page:**
   ```bash
   browser-use open "http://localhost:3000/modules/<slug>/1"
   ```

3. **For each ModuleImage on the page:**

   a. Scroll to the image:
   ```bash
   browser-use scroll down
   ```

   b. Take a screenshot of the image area:
   ```bash
   browser-use screenshot "media/<slug>/verify/page-<N>-img-<M>.png"
   ```

   c. **Visually inspect the screenshot.** Look for:
   - Any text baked INTO the image (not the HTML overlay labels — those are fine)
   - Gibberish words, lorem ipsum, partial words, misspelled labels
   - "FILTER", "LOREM", "TEXT", or any recognizable but wrong text
   - Characters that look like text but aren't real words

   d. **Classify the image:**
   - `clean` — no baked-in text visible, only HTML overlays → PASS
   - `minor-text` — small/subtle text that doesn't distract → PASS with note
   - `hallucinated-text` — obvious fake text visible → FAIL, must regenerate

4. **For each FAIL image, regenerate with a stronger prompt:**

   Add these reinforcements to the original prompt:
   ```
   CRITICAL: This image must contain ZERO text, ZERO letters, ZERO numbers, ZERO words.
   Do not render any characters, labels, captions, titles, watermarks, or annotations.
   The image should be purely visual — shapes, colors, icons, arrows only.
   ```

   Then re-run steps 5-6 from Phase 5 (save + record).

5. **Repeat verification** for regenerated images. Max 3 attempts per image. If still failing after 3 attempts, report to user:
   ```
   ⚠️ Image <name>.png still has hallucinated text after 3 regeneration attempts.
   Options:
     a) Keep it — the HTML overlay labels partially cover the bad text
     b) Replace with a pure SVG/HTML diagram (no AI image)
     c) Use a different visual concept that's less prone to text generation
   ```

6. **Navigate through all section pages** (repeat for /1, /2, /3, /4, etc.)

7. **Also verify:**
   - HTML overlay labels are positioned correctly (not overlapping, not off-screen)
   - Labels are readable against the image background
   - Captions match the image content

8. **Close the browser:**
   ```bash
   browser-use close
   ```

9. **Print verification report:**
   ```
   [Phase 5b/10] Image verification complete:
     - Page 1: 3 images — 2 clean, 1 regenerated (now clean)
     - Page 2: 1 image — clean
     - Page 3: 2 images — 1 clean, 1 minor-text (acceptable)
     - Page 4: 1 image — clean
     - Total: 7 images verified, 1 regenerated, 0 failures
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
   - [Ver video explicativo (MP4)](/api/media/<slug>/video/explainer.mp4)
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

10. **Update `lib/modules.ts`:** Make TWO changes to the module entry:

    a. **Set `estimatedTime`** to match the `--duration` flag:
    ```typescript
    estimatedTime: '2 hrs',  // or '45 min', '1 hr', '3 hrs' depending on --duration
    ```

    b. **Add `sections` array** (required for pagination routing):
    ```typescript
    sections: [
      { id: '<section-id>', title: '<Section Title>', file: 'NN-<section-id>' },
      ...
    ],
    ```

    c. **Update `toc` array** to match the new section names.

11. **Register section imports in `app/modules/[slug]/[page]/page.tsx`:**

    **CRITICAL:** Without this step, paginated pages will 404. Add an entry to the `sectionMap` object:

    ```typescript
    const sectionMap: Record<string, Record<string, () => Promise<{ default: React.ComponentType }>>> = {
      // ... existing modules ...
      '<slug>': {
        'NN-<section-id>': () => import('@/content/<slug>/NN-<section-id>.mdx'),
        // ... one entry per section file ...
      },
    }
    ```

    Each key must match the `file` value from the `sections` array in `lib/modules.ts`.

12. **Verify the build passes:**
    ```bash
    npx next build --no-lint
    ```
    Check that the new paginated routes appear in the build output (e.g., `/modules/<slug>/1`, `/modules/<slug>/2`, etc.).

13. **Print summary:**
    ```
    [Phase 8/8] Pagination complete — content/<slug>/:
      - 4 section files created
      - 8 MiniQuiz components inserted
      - 12 Callout components inserted
      - 3 Accordion components inserted
      - 2 BeforeAfter components inserted
      - Module definition updated
    ```
