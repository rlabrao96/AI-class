# Enrich Module Skill — Design Spec

**Date:** 2026-03-30
**Status:** Draft
**Author:** Claude (brainstorming session)

---

## Overview

A Claude Code skill (`/enrich-module`) that takes a course module slug and produces rich media content — screenshots, infographics, mind maps, podcasts, and cinematic videos — by orchestrating `/browser-use` and `/notebooklm` in a phased pipeline. Content is stored locally in `media/<slug>/` outside the Next.js build to minimize disk usage.

## Motivation

The current course website is text-heavy (MDX only). Adding visual and audio content (screenshots of real platforms, NotebookLM-generated videos/podcasts, mind maps, embeddable YouTube tutorials) will make modules more engaging and professional without manual content creation.

## Invocation

```
/enrich-module <slug> [--phase research|collect|notebook|generate|generate-video|download|integrate|paginate] [--sources url1,url2,...] [--lang es] [--duration 2h]
```

- `<slug>` — required, one of the 10 module slugs (e.g., `ai-fundamentals`)
- `--phase` — optional, run a single phase; omit to run all 8 phases sequentially
- `--sources` — optional, additional source URLs (comma-separated) added on top of the base mapping
- `--lang` — optional, output language for NotebookLM artifacts (default: `es_419` Spanish Latino)
- `--duration` — optional, target duration for the module. Controls content density. Default: `1h`. Examples: `30m`, `1h`, `2h`, `3h`

### Duration Scaling

The `--duration` flag determines how much content to generate and how to structure it:

| Duration | Words (total) | Sections/Pages | Words/page | Images/page | Mini-quizzes | Callouts/page |
|----------|--------------|----------------|------------|-------------|--------------|---------------|
| `30m` | ~3,000 | Keep as single page | ~3,000 | 2-3 total | 1 final quiz only | 2-3 |
| `1h` | ~6,000 | 3-4 pages | ~1,500-2,000 | 1-2 | 1 per page | 2-3 |
| `2h` | ~10,000 | 4-6 pages | ~2,000-2,500 | 2-3 | 1-2 per page | 3-4 |
| `3h` | ~15,000 | 6-8 pages | ~2,000-2,500 | 2-3 | 2 per page | 4-5 |

The skill uses this table to:
- Control the depth of content expansion in Phase 5 (Integrate)
- Decide whether to paginate or keep as single page in Phase 6 (Paginate)
- Set the density of interactive components per page
- Determine how many AI illustrations to generate

## File Structure

```
.agents/skills/enrich-module/
  SKILL.md                ← Skill definition (orchestrator)
  module-sources.json     ← Base source mapping per module

media/                    ← Output directory (outside public/, not in Next.js build)
  <slug>/
    screenshots/          ← Browser-use captures
    infographics/         ← Infographics, mind maps from NotebookLM
    audio/                ← Podcasts
    video/                ← Cinematic videos
    sources.json          ← Registry of all sources used + artifacts generated
```

## Pipeline: 7 Phases

### Phase 0 — Research

**Tool:** `notebooklm` (deep research) + `browser-use` (validation)

**Purpose:** Discover the best available sources for the module topic beyond the base mapping.

**Steps:**

1. Read `module-sources.json` to get the module's topic and existing sources.
2. Create a temporary research notebook: `notebooklm create "Research: <module_title>" --json`
3. Run deep research: `notebooklm source add-research "<module topic> tutorials guides papers" --mode deep --json`
   - This ingests research results directly as notebook sources.
4. Wait for research to complete: `notebooklm research wait --import-all --json`
5. List all discovered sources: `notebooklm source list --json`
6. Classify each result by type: `youtube | paper | article | docs`.
7. For YouTube results: navigate with browser-use to validate quality, extract thumbnail screenshots.
8. For papers/articles: capture URL and metadata (title, author, date).
9. Save all discovered sources to `media/<slug>/sources.json` with fields:
   - `url`, `title`, `type`, `embeddable` (true for YouTube), `discovered_at`
10. Merge discovered sources with base mapping + user-provided `--sources`.

**Output:** Updated `sources.json` with all sources classified and ready for subsequent phases.

### Phase 1 — Collect

**Tool:** `browser-use`

**Purpose:** Extract screenshots and text from web sources.

**Steps:**

1. Read `sources.json` (populated by Phase 0 or base mapping).
2. For each URL source:
   - Navigate to the page with browser-use.
   - Take full-page screenshot → `media/<slug>/screenshots/<domain>-<timestamp>.png`.
   - Extract main content text → save as `.txt` for loading into NotebookLM.
3. For YouTube sources marked `embeddable`:
   - Take screenshot of video player at key moments.
   - Record embed URL (`youtube.com/embed/<id>`) for future MDX insertion.
4. Update `sources.json` with local screenshot paths and extracted text file paths.

**Output:** `screenshots/` populated, text extracts ready for Phase 2.

### Phase 2 — Notebook

**Tool:** `notebooklm`

**Purpose:** Create a NotebookLM notebook and load all sources.

**Steps:**

1. Set output language: `notebooklm language set <lang>` (default: `es`).
2. Create notebook: `notebooklm create "Módulo: <module_title>" --json` → capture notebook ID.
3. Set active notebook: `notebooklm use <notebook_id>`
4. Load sources in order (all commands use `--json` for parseable output):
   - PDFs from `Teoria/` mapped to this module → `notebooklm source add "<path>" --type file --json`
   - PDFs from `Legal/` (for `legal-ai-risks` module) → `notebooklm source add "<path>" --type file --json`
   - Web URLs from base mapping → `notebooklm source add "<url>" --json` (auto-detects type)
   - YouTube links → `notebooklm source add "<url>" --json` (auto-detects YouTube, extracts transcription)
   - Text extracts from Phase 1 → `notebooklm source add "<path>" --type text --json`
   - User-provided `--sources` URLs → `notebooklm source add "<url>" --json`
5. **Wait for source indexing:** Sources must be indexed before generation (10-60s per source). Run `notebooklm source wait <source_id>` for each source, or wait for all: poll `notebooklm source list --json` until all sources show `"status": "ready"`.
6. Save notebook ID and source IDs to `sources.json`.

**Output:** Fully loaded and indexed NotebookLM notebook ready for generation.

### Phase 3a — Generate (non-video artifacts)

**Tool:** `notebooklm`

**Purpose:** Generate audio, mind maps, and infographics from the notebook. These are fast and run together.

**Steps:**

1. Ensure active notebook is set: `notebooklm use <notebook_id>`
2. Generate artifacts (all commands use `--json`):
   - **1 podcast/audio** (5-10 min): `notebooklm generate audio --json`
   - **1 mind map** (synchronous, no polling needed): `notebooklm generate mind-map --json`
   - **1-2 infographics**: `notebooklm generate infographic --json`
3. Poll for completion with backoff:
   - **Audio/podcast:** 10s → 30s → 60s → 120s, timeout at **20 minutes**
   - **Infographics:** 10s → 30s → 60s, timeout at **15 minutes**
   - **Mind map:** synchronous (instant), no polling needed
4. Record artifact IDs and status in `sources.json`.

**Partial failure handling:** If one artifact fails, continue generating the rest. Report what succeeded and what failed at the end.

**Output:** Non-video artifact IDs recorded, ready for download.

### Phase 3b — Generate Video (separate, long-running)

**Tool:** `notebooklm`

**Purpose:** Generate cinematic video independently. This phase runs separately because video generation can take 30+ minutes and must not block or be blocked by other artifacts.

**Steps:**

1. Ensure active notebook is set: `notebooklm use <notebook_id>`
2. Generate: `notebooklm generate video --format cinematic --json`
3. Poll for completion with backoff: 10s → 30s → 60s → 120s → 120s (repeating), timeout at **45 minutes**.
4. Record artifact ID and status in `sources.json`.

**Invocation:** Can be run:
- Automatically after Phase 3a completes (default when running all phases)
- Independently via `--phase generate-video`
- In parallel with Phase 4 downloading non-video artifacts (if user prefers)

**Output:** Video artifact ID recorded, ready for download.

### Phase 4 — Download

**Tool:** `notebooklm`

**Purpose:** Download all generated artifacts to local storage.

**Steps:**

1. Ensure active notebook is set: `notebooklm use <notebook_id>`
2. For each artifact in `sources.json`, download using `notebooklm download -a <artifact_id> --output <path>`:
   - Video → `media/<slug>/video/<title>.mp4`
   - Audio/podcast → `media/<slug>/audio/<title>.mp3`
   - Mind map → `media/<slug>/infographics/mindmap.json`
   - Infographics → `media/<slug>/infographics/infographic-<n>.png`
3. Update `sources.json` with local file paths and file sizes.
4. Print summary:
   ```
   Módulo: AI Fundamentals — Enriquecimiento completo
     Screenshots: 5 archivos (2.3 MB)
     Video: 1 archivo (45 MB)
     Audio: 1 archivo (12 MB)
     Infografías: 3 archivos (1.1 MB)
     Total: 60.4 MB
   ```

**Output:** All assets downloaded and organized in `media/<slug>/`.

## Source Mapping: module-sources.json

```json
{
  "ai-fundamentals": {
    "title": "Cómo Funcionan los LLMs",
    "teoria_pdfs": ["S01 Intro (OIDD6670).pdf", "S02 Understanding LLMs (OIDD6670).pdf"],
    "legal_pdfs": [],
    "urls": [
      "https://www.anthropic.com/research",
      "https://www.deeplearning.ai/the-batch/",
      "https://internationalaisafetyreport.org/publication/international-ai-safety-report-2026"
    ],
    "youtube": [
      "https://www.youtube.com/watch?v=zjkBMFhNj_g"
    ]
  },
  "prompting-fundamentals": {
    "title": "Prompting Efectivo",
    "teoria_pdfs": ["S02 Understanding LLMs (OIDD6670).pdf", "S07 Prompts to APIs (OIDD6670).pdf"],
    "legal_pdfs": [],
    "urls": [
      "https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview"
    ],
    "youtube": []
  },
  "reliable-ai-systems": {
    "title": "Sistemas de IA Confiables",
    "teoria_pdfs": ["S03 Understanding LRMs (OIDD6670).pdf", "S05 Compound AI Systems (OIDD6670).pdf", "S08 Evaluation Parts 1 and 2 (OIDD6670).pdf"],
    "legal_pdfs": [],
    "urls": [
      "https://arxiv.org/abs/2402.01817",
      "https://docs.anthropic.com/en/docs/test-and-evaluate/strengthen-guardrails/increase-consistency",
      "https://www.anthropic.com/research/building-effective-agents",
      "https://crfm.stanford.edu/helm/"
    ],
    "youtube": []
  },
  "vibe-coding": {
    "title": "Vibe-Coding",
    "teoria_pdfs": ["S07 Prompts to APIs (OIDD6670).pdf"],
    "legal_pdfs": [],
    "urls": [
      "https://docs.anthropic.com/en/docs/claude-code/overview",
      "https://simonwillison.net",
      "https://www.vodafone.es/c/empresas/grandes-clientes/es/nuestra-vision/vibe-coding/"
    ],
    "youtube": []
  },
  "agents-and-skills": {
    "title": "Agentes y Skills de IA",
    "teoria_pdfs": ["S05 Compound AI Systems (OIDD6670).pdf", "S06 AI and Business Workflows (OIDD6670).pdf"],
    "legal_pdfs": [],
    "urls": [
      "https://github.com/obra/superpowers",
      "https://docs.anthropic.com/en/docs/build-with-claude/tool-use",
      "https://docs.anthropic.com/en/docs/claude-code/mcp"
    ],
    "youtube": [
      "https://www.youtube.com/playlist?list=PLlET0GsrLUL5HKJk1rb7t32sAs_iAlpZe"
    ]
  },
  "legal-ai-risks": {
    "title": "Riesgos Legales de la IA",
    "teoria_pdfs": ["S04 Strategy (OIDD6670).pdf"],
    "legal_pdfs": [
      "LGST 6420 S26 classes 1-4.pdf",
      "LGST 6420 S26 classes 5-6.pdf",
      "LGST 6420 S26 classes 7-10.pdf",
      "LGST 6420 S26 classes 11-12.pdf"
    ],
    "urls": [
      "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689",
      "https://www.anthropic.com/news/anthropics-responsible-scaling-policy",
      "https://www.lexisnexis.com/en-us/products/nexis-plus-ai/future-of-work.page",
      "https://internationalaisafetyreport.org/publication/international-ai-safety-report-2026",
      "https://www.mlaw.gov.sg/launch-of-guide-for-using-generative-artificial-intelligence-in-the-legal-sector/"
    ],
    "youtube": []
  },
  "copilot-m365": {
    "title": "Copilot en Microsoft 365",
    "teoria_pdfs": [],
    "legal_pdfs": [],
    "urls": [
      "https://learn.microsoft.com/en-us/copilot/microsoft-365/microsoft-365-copilot-overview",
      "https://copilot.cloud.microsoft/en-US/prompts",
      "https://learn.microsoft.com/en-us/microsoft-copilot-studio/fundamentals-what-is-copilot-studio",
      "https://learn.microsoft.com/en-us/copilot/microsoft-365/microsoft-365-copilot-privacy"
    ],
    "youtube": []
  },
  "microsoft-fabric": {
    "title": "Microsoft Fabric",
    "teoria_pdfs": [],
    "legal_pdfs": [],
    "urls": [
      "https://learn.microsoft.com/en-us/fabric/get-started/microsoft-fabric-overview",
      "https://learn.microsoft.com/en-us/fabric/get-started/copilot-fabric-overview",
      "https://learn.microsoft.com/en-us/fabric/governance/microsoft-purview-fabric"
    ],
    "youtube": []
  },
  "azure-ai-foundry": {
    "title": "Azure AI Foundry",
    "teoria_pdfs": [],
    "legal_pdfs": [],
    "urls": [
      "https://learn.microsoft.com/en-us/azure/ai-foundry/what-is-azure-ai-foundry",
      "https://learn.microsoft.com/en-us/azure/ai-foundry/how-to/flow-develop",
      "https://learn.microsoft.com/en-us/azure/search/search-get-started-rag",
      "https://learn.microsoft.com/en-us/azure/ai-foundry/concepts/evaluation-approach-gen-ai"
    ],
    "youtube": []
  },
  "aws-bedrock": {
    "title": "AWS Bedrock",
    "teoria_pdfs": [],
    "legal_pdfs": [],
    "urls": [
      "https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html",
      "https://docs.aws.amazon.com/bedrock/latest/userguide/knowledge-base.html",
      "https://docs.aws.amazon.com/bedrock/latest/userguide/guardrails.html",
      "https://docs.anthropic.com/en/api/claude-on-amazon-bedrock"
    ],
    "youtube": []
  }
}
```

## Error Handling & Resilience

### Persistent State

`sources.json` is updated at the end of each phase. If a phase fails mid-execution, all previous phases' work is preserved. Each phase reads `sources.json` on startup to determine what has already been done.

### Idempotent Re-execution

Each phase checks `sources.json` before starting:
- **Phase 0:** If research results exist, asks whether to re-run or reuse.
- **Phase 1:** If screenshots exist for a URL, skips it (unless forced).
- **Phase 2:** If a notebook ID exists, asks whether to reuse or create new.
- **Phase 3a:** If non-video artifact IDs exist, asks whether to regenerate or keep.
- **Phase 3b:** If video artifact ID exists, asks whether to regenerate or keep.
- **Phase 4:** If local files exist, asks whether to re-download or skip.

### Timeouts (with exponential backoff)

| Artifact Type | Polling Intervals | Max Timeout |
|---|---|---|
| Cinematic video | 10s → 30s → 60s → 120s | **45 minutes** |
| Audio/podcast | 10s → 30s → 60s → 120s | **20 minutes** |
| Infographic | 10s → 30s → 60s | **15 minutes** |
| Mind map | synchronous (instant) | **no polling** |

### Partial Failure

If one artifact fails to generate or download:
- Continue with remaining artifacts.
- Mark the failed artifact in `sources.json` with `"status": "failed"` and error message.
- Print a clear report at the end showing what succeeded and what failed.
- User can re-run `--phase generate` to retry only failed artifacts.

### Progress Logging

Each phase prints progress updates:
```
[Phase 1/7] Researching sources for "AI Fundamentals"...
[Phase 1/7] Found 3 YouTube tutorials, 2 papers, 4 articles
[Phase 2/7] Collecting screenshots (3/7): anthropic.com...
[Phase 3/7] Loading source 5/12: S02 Understanding LLMs.pdf...
[Phase 3/7] Waiting for source indexing... (12/12 ready)
[Phase 4/7] Generating audio, mind map, infographics...
[Phase 5/7] Generating cinematic video... (polling, 12m elapsed)
[Phase 6/7] Downloading mind map → media/ai-fundamentals/infographics/mindmap.json
[Phase 7/7] Integrating into content/ai-fundamentals.mdx...
```

## Notebook Lifecycle

- **Research notebook** (Phase 0): Temporary — deleted after sources are extracted and classified.
- **Module notebook** (Phase 2): Kept after pipeline completes. Allows future re-generation of artifacts if needed, and serves as a queryable knowledge base for the module content.
- User can manually delete old notebooks via `notebooklm delete <id>`.

### Phase 5 — Integrate

**Tool:** File system + MDX editing

**Purpose:** Embed the generated media into the course website by modifying the module's MDX file and copying lightweight assets to `public/`.

**Strategy:**
- **Lightweight assets** (infographics, screenshots, mind map): Copy to `public/media/<slug>/` and reference directly in MDX with `<img>` tags.
- **YouTube videos**: Embed as `<iframe>` components in MDX using the `embeddable` URLs from `sources.json`.
- **Heavy assets** (audio .mp3, video .mp4): Served via a Next.js API route (`/api/media/[...path]`) that streams from `media/` directory. Linked in MDX as download links, not inline players.

**Steps:**

1. **Copy lightweight assets to public/:**
   - `cp media/<slug>/infographics/*.png public/media/<slug>/infographics/`
   - `cp media/<slug>/infographics/*.json public/media/<slug>/infographics/`
   - `cp` selected screenshots from `media/<slug>/screenshots/` to `public/media/<slug>/screenshots/`
   - Do NOT copy audio or video files to `public/`.

2. **Create API route for heavy assets** (if not already exists):
   - Create `app/api/media/[...path]/route.ts` — a catch-all route that streams files from the `media/` directory.
   - This serves audio/video without adding them to the Next.js static build.

3. **Modify the module MDX file** (`content/<slug>.mdx`):

   a. **Add a "Recursos Multimedia" section** at the end of the MDX (before any existing quiz), containing:

   b. **YouTube embeds** — for each source with `embeddable: true`:
   ```mdx
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
   ```

   c. **Infographics/screenshots** — as images:
   ```mdx
   ![<description>](/media/<slug>/infographics/infographic-1.png)
   ```

   d. **Audio podcast** — as download link:
   ```mdx
   [Descargar podcast del módulo (MP3)](/api/media/<slug>/audio/podcast.mp3)
   ```

   e. **Video** — as download link:
   ```mdx
   [Ver video cinemático (MP4)](/api/media/<slug>/video/cinematic.mp4)
   ```

4. **Update sources.json** with integration status:
   ```json
   {
     "integrated": true,
     "integrated_at": "<ISO timestamp>",
     "public_assets": ["public/media/<slug>/infographics/infographic-1.png"],
     "mdx_modified": "content/<slug>.mdx"
   }
   ```

5. Print summary:
   ```
   [Phase 7/7] Integration complete — content/<slug>.mdx updated:
     - 2 YouTube embeds added
     - 1 infographic embedded
     - 2 screenshots embedded
     - Audio: download link added
     - Video: download link added
     - Assets copied to public/media/<slug>/
   ```

## Dependencies

- **browser-use skill:** Must be installed and configured at `.agents/skills/browser-use/`
- **notebooklm skill:** Must be installed and configured at `.agents/skills/notebooklm/`
- **notebooklm CLI:** Must be installed (`pip install notebooklm` or from `notebooklm-py/`)
- **NotebookLM auth:** Must have valid Google authentication configured

## Out of Scope

- CDN upload or external hosting
- Batch execution across all modules (run per-module only)
- Custom image generation (DALL-E, Midjourney) — uses NotebookLM artifacts only
