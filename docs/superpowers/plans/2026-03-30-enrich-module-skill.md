# Enrich Module Skill — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a Claude Code skill that enriches course modules with rich media (screenshots, infographics, mind maps, podcasts, cinematic videos) by orchestrating browser-use and notebooklm in a 6-phase pipeline.

**Architecture:** A single SKILL.md file acts as the orchestrator, reading a JSON source mapping and delegating work to existing `/browser-use` and `/notebooklm` skills in a 7-phase pipeline. State is persisted in `media/<slug>/sources.json` between phases for resilience and idempotent re-execution. A Next.js API route streams heavy media (audio/video) from `media/` without bloating the static build.

**Tech Stack:** Claude Code skills (Markdown), NotebookLM CLI (`notebooklm`), browser-use CLI (`browser-use`), Next.js API routes (TypeScript), JSON for config and state.

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `.agents/skills/enrich-module/SKILL.md` | Create | Skill definition — orchestrator instructions for all 7 phases |
| `.agents/skills/enrich-module/module-sources.json` | Create | Base source mapping per module (PDFs, URLs, YouTube) |
| `app/api/media/[...path]/route.ts` | Create | API route to stream heavy media (audio/video) from `media/` |

No test files — SKILL.md is a skill (Markdown instructions + JSON config), not executable code. The API route is a simple file server.

---

## Task 1: Create module-sources.json

**Files:**
- Create: `.agents/skills/enrich-module/module-sources.json`

- [ ] **Step 1: Create the directory**

```bash
mkdir -p ".agents/skills/enrich-module"
```

- [ ] **Step 2: Write module-sources.json**

Create `.agents/skills/enrich-module/module-sources.json` with the following content. This maps each module slug to its base sources — PDFs from `Teoria/` and `Legal/`, web URLs, and YouTube links.

```json
{
  "ai-fundamentals": {
    "title": "Cómo Funcionan los LLMs",
    "research_query": "How LLMs work tokenization context windows transformer architecture tutorial",
    "teoria_pdfs": [
      "Teoria/S01 Intro (OIDD6670).pdf",
      "Teoria/S02 Understanding LLMs (OIDD6670).pdf"
    ],
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
    "research_query": "prompt engineering techniques few-shot chain-of-thought structured prompting tutorial",
    "teoria_pdfs": [
      "Teoria/S02 Understanding LLMs (OIDD6670).pdf",
      "Teoria/S07 Prompts to APIs (OIDD6670).pdf"
    ],
    "legal_pdfs": [],
    "urls": [
      "https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview"
    ],
    "youtube": []
  },
  "reliable-ai-systems": {
    "title": "Sistemas de IA Confiables",
    "research_query": "reliable AI systems LLM production failures evaluation guardrails schema-guided reasoning",
    "teoria_pdfs": [
      "Teoria/S03 Understanding LRMs (OIDD6670).pdf",
      "Teoria/S05 Compound AI Systems (OIDD6670).pdf",
      "Teoria/S08 Evaluation Parts 1 and 2 (OIDD6670).pdf"
    ],
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
    "research_query": "vibe coding AI-assisted programming no-code automation Claude Code tutorial",
    "teoria_pdfs": [
      "Teoria/S07 Prompts to APIs (OIDD6670).pdf"
    ],
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
    "research_query": "AI agents tool use orchestration skills plugins n8n automation tutorial",
    "teoria_pdfs": [
      "Teoria/S05 Compound AI Systems (OIDD6670).pdf",
      "Teoria/S06 AI and Business Workflows (OIDD6670).pdf"
    ],
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
    "research_query": "AI legal risks governance EU AI Act privacy intellectual property compliance",
    "teoria_pdfs": [
      "Teoria/S04 Strategy (OIDD6670).pdf"
    ],
    "legal_pdfs": [
      "Legal/LGST 6420 S26 classes 1-4.pdf",
      "Legal/LGST 6420 S26 classes 5-6.pdf",
      "Legal/LGST 6420 S26 classes 7-10.pdf",
      "Legal/LGST 6420 S26 classes 11-12.pdf"
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
    "research_query": "Microsoft 365 Copilot tutorial Excel Teams Outlook Word Copilot Studio agents",
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
    "research_query": "Microsoft Fabric tutorial data pipelines Copilot Power BI Data Factory OneLake",
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
    "research_query": "Azure AI Foundry tutorial Prompt Flow RAG Azure AI Search deployment",
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
    "research_query": "Amazon Bedrock tutorial Knowledge Bases RAG Guardrails Claude on AWS",
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

- [ ] **Step 3: Validate JSON is parseable**

```bash
python3 -c "import json; json.load(open('.agents/skills/enrich-module/module-sources.json')); print('Valid JSON')"
```

Expected: `Valid JSON`

- [ ] **Step 4: Commit**

```bash
git add .agents/skills/enrich-module/module-sources.json
git commit -m "feat: add module source mapping for enrich-module skill"
```

---

## Task 2: Create SKILL.md — Header, Metadata, and Invocation

**Files:**
- Create: `.agents/skills/enrich-module/SKILL.md`

This task creates the skill file with frontmatter, overview, invocation syntax, and the directory setup instructions. Subsequent tasks append each phase to this file.

- [ ] **Step 1: Write SKILL.md with header and invocation section**

Create `.agents/skills/enrich-module/SKILL.md`:

````markdown
---
name: enrich-module
description: Enriches course modules with rich media (screenshots, infographics, mind maps, podcasts, cinematic videos) by orchestrating browser-use and notebooklm in a 6-phase pipeline. Use when the user wants to add visual/audio content to a course module.
---

# Enrich Module

Orchestrates `/browser-use` and `/notebooklm` to produce rich media content for a course module. Runs a 6-phase pipeline: Research → Collect → Notebook → Generate → Generate Video → Download.

## Prerequisites

Before running, verify both tools are available:

```bash
notebooklm status          # Must show "Authenticated as: ..."
browser-use doctor         # Must show green checks
```

If `notebooklm status` fails, run `notebooklm login`.

## Invocation

```
/enrich-module <slug> [--phase research|collect|notebook|generate|generate-video|download] [--sources url1,url2,...] [--lang es]
```

**Arguments:**
- `<slug>` — Required. One of: `ai-fundamentals`, `prompting-fundamentals`, `reliable-ai-systems`, `vibe-coding`, `agents-and-skills`, `legal-ai-risks`, `copilot-m365`, `microsoft-fabric`, `azure-ai-foundry`, `aws-bedrock`
- `--phase` — Optional. Run only one phase. Omit to run all 6 sequentially.
- `--sources` — Optional. Additional source URLs (comma-separated), added on top of the base mapping.
- `--lang` — Optional. Output language for NotebookLM artifacts. Default: `es` (Spanish).

## Argument Parsing

1. Parse the `<slug>` from the user's message. It must match a key in `module-sources.json`.
2. If `--phase` is provided, run only that phase. Otherwise run all phases in order.
3. If `--sources` is provided, split by comma and add to the source list.
4. If `--lang` is provided, use that language code. Otherwise default to `es`.

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
[Phase 1/7] Researching sources for "<module_title>"...
[Phase 2/7] Collecting screenshots (3/7): anthropic.com...
[Phase 3/7] Loading source 5/12: S02 Understanding LLMs.pdf...
[Phase 4/7] Generating audio, mind map, infographics...
[Phase 5/7] Generating cinematic video... (polling, 12m elapsed)
[Phase 6/7] Downloading artifacts to media/<slug>/...
```
````

- [ ] **Step 2: Commit**

```bash
git add .agents/skills/enrich-module/SKILL.md
git commit -m "feat: add enrich-module skill header and invocation"
```

---

## Task 3: SKILL.md — Phase 0 (Research)

**Files:**
- Modify: `.agents/skills/enrich-module/SKILL.md` (append after Progress Logging section)

- [ ] **Step 1: Append Phase 0 to SKILL.md**

Append the following to the end of `SKILL.md`:

````markdown

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
    [Phase 1/7] Research complete. Found:
      - 3 YouTube tutorials (embeddable)
      - 2 academic papers
      - 4 articles
      - 5 base mapping sources
      Total: 14 sources
    ```
````

- [ ] **Step 2: Commit**

```bash
git add .agents/skills/enrich-module/SKILL.md
git commit -m "feat: add Phase 0 (Research) to enrich-module skill"
```

---

## Task 4: SKILL.md — Phase 1 (Collect)

**Files:**
- Modify: `.agents/skills/enrich-module/SKILL.md` (append after Phase 0)

- [ ] **Step 1: Append Phase 1 to SKILL.md**

Append the following:

````markdown

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
   [Phase 2/7] Collection complete:
     - 5 web pages screenshotted
     - 3 YouTube videos captured
     - 8 text extracts saved
   ```
````

- [ ] **Step 2: Commit**

```bash
git add .agents/skills/enrich-module/SKILL.md
git commit -m "feat: add Phase 1 (Collect) to enrich-module skill"
```

---

## Task 5: SKILL.md — Phase 2 (Notebook)

**Files:**
- Modify: `.agents/skills/enrich-module/SKILL.md` (append after Phase 1)

- [ ] **Step 1: Append Phase 2 to SKILL.md**

Append the following:

````markdown

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
   [Phase 3/7] Notebook created and loaded:
     - Notebook ID: <id>
     - Sources loaded: 12 (8 ready, 4 processing...)
     - All sources indexed ✓
   ```
````

- [ ] **Step 2: Commit**

```bash
git add .agents/skills/enrich-module/SKILL.md
git commit -m "feat: add Phase 2 (Notebook) to enrich-module skill"
```

---

## Task 6: SKILL.md — Phase 3a (Generate Non-Video)

**Files:**
- Modify: `.agents/skills/enrich-module/SKILL.md` (append after Phase 2)

- [ ] **Step 1: Append Phase 3a to SKILL.md**

Append the following:

````markdown

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
   [Phase 4/7] Non-video generation complete:
     - Mind map: ✓ completed
     - Audio podcast: ✓ completed (12 min)
     - Infographic: ✓ completed
   ```
````

- [ ] **Step 2: Commit**

```bash
git add .agents/skills/enrich-module/SKILL.md
git commit -m "feat: add Phase 3a (Generate Non-Video) to enrich-module skill"
```

---

## Task 7: SKILL.md — Phase 3b (Generate Video)

**Files:**
- Modify: `.agents/skills/enrich-module/SKILL.md` (append after Phase 3a)

- [ ] **Step 1: Append Phase 3b to SKILL.md**

Append the following:

````markdown

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
   [Phase 5/7] Video generation complete:
     - Cinematic video: ✓ completed (23 min)
   ```
   Or if timeout:
   ```
   [Phase 5/7] Video generation timed out after 45 min.
     Check status with: notebooklm artifact list
     Re-run with: /enrich-module <slug> --phase generate-video
   ```

**Note:** When running all phases sequentially, Phase 3b runs after Phase 3a completes. The user can also run `--phase download` in parallel while waiting for video generation, to download the already-completed non-video artifacts from Phase 3a.
````

- [ ] **Step 2: Commit**

```bash
git add .agents/skills/enrich-module/SKILL.md
git commit -m "feat: add Phase 3b (Generate Video) to enrich-module skill"
```

---

## Task 8: SKILL.md — Phase 4 (Download)

**Files:**
- Modify: `.agents/skills/enrich-module/SKILL.md` (append after Phase 3b)

- [ ] **Step 1: Append Phase 4 to SKILL.md**

Append the following:

````markdown

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
   [Phase 6/7] Download complete — Módulo: <module_title>

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
````

- [ ] **Step 2: Commit**

```bash
git add .agents/skills/enrich-module/SKILL.md
git commit -m "feat: add Phase 4 (Download) to enrich-module skill"
```

---

## Task 9: Create API Route for Heavy Media Assets

**Files:**
- Create: `app/api/media/[...path]/route.ts`

This API route streams audio/video files from the `media/` directory so they don't need to live in `public/`.

- [ ] **Step 1: Create the API route directory**

```bash
mkdir -p "app/api/media/[...path]"
```

- [ ] **Step 2: Write the API route**

Create `app/api/media/[...path]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { readFile, stat } from 'fs/promises'
import path from 'path'

const MEDIA_DIR = path.join(process.cwd(), 'media')

const MIME_TYPES: Record<string, string> = {
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.json': 'application/json',
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const segments = (await params).path
  const filePath = path.join(MEDIA_DIR, ...segments)

  // Prevent directory traversal
  if (!filePath.startsWith(MEDIA_DIR)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const fileStat = await stat(filePath)
    if (!fileStat.isFile()) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const ext = path.extname(filePath).toLowerCase()
    const contentType = MIME_TYPES[ext] || 'application/octet-stream'
    const data = await readFile(filePath)

    return new NextResponse(data, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileStat.size.toString(),
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add "app/api/media/[...path]/route.ts"
git commit -m "feat: add API route to serve media assets from media/ directory"
```

---

## Task 10: SKILL.md — Phase 5 (Integrate)

**Files:**
- Modify: `.agents/skills/enrich-module/SKILL.md` (append after Phase 4)

- [ ] **Step 1: Append Phase 5 to SKILL.md**

Append the following:

````markdown

---

## Phase 5 — Integrate

**When:** `--phase integrate` or running all phases (after Phase 4).

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
   [Phase 7/7] Integration complete — content/<slug>.mdx updated:
     - 2 YouTube embeds added
     - 1 infographic embedded
     - Audio: download link added
     - Video: download link added
     - Assets copied to public/media/<slug>/
   ```
````

- [ ] **Step 2: Commit**

```bash
git add .agents/skills/enrich-module/SKILL.md
git commit -m "feat: add Phase 5 (Integrate) to enrich-module skill"
```

---

## Task 11: Verify Skill Registration and End-to-End Dry Run

**Files:**
- Read: `.agents/skills/enrich-module/SKILL.md`
- Read: `.agents/skills/enrich-module/module-sources.json`

- [ ] **Step 1: Verify file structure exists**

```bash
ls -la ".agents/skills/enrich-module/"
```

Expected output should show:
```
SKILL.md
module-sources.json
```

- [ ] **Step 2: Verify SKILL.md frontmatter is valid**

Read the first 5 lines of `.agents/skills/enrich-module/SKILL.md` and confirm it has:
- `---` delimiter
- `name: enrich-module`
- `description: ...`
- `---` closing delimiter

- [ ] **Step 3: Verify all 10 module slugs are in module-sources.json**

```bash
python3 -c "
import json
data = json.load(open('.agents/skills/enrich-module/module-sources.json'))
slugs = sorted(data.keys())
expected = sorted(['ai-fundamentals','prompting-fundamentals','reliable-ai-systems','vibe-coding','agents-and-skills','legal-ai-risks','copilot-m365','microsoft-fabric','azure-ai-foundry','aws-bedrock'])
assert slugs == expected, f'Mismatch: {slugs} != {expected}'
print(f'All {len(slugs)} modules present')
for s in slugs:
    print(f'  {s}: {len(data[s][\"urls\"])} URLs, {len(data[s][\"teoria_pdfs\"])} PDFs, {len(data[s][\"youtube\"])} YT')
"
```

Expected: All 10 modules listed with correct source counts.

- [ ] **Step 4: Verify SKILL.md contains all 7 phases**

```bash
grep -c "^## Phase" ".agents/skills/enrich-module/SKILL.md"
```

Expected: `7` (Phase 0, 1, 2, 3a, 3b, 4, 5)

- [ ] **Step 5: Verify all PDF paths reference existing files**

```bash
python3 -c "
import json, os
data = json.load(open('.agents/skills/enrich-module/module-sources.json'))
missing = []
for slug, mod in data.items():
    for pdf in mod.get('teoria_pdfs', []) + mod.get('legal_pdfs', []):
        if not os.path.exists(pdf):
            missing.append(f'{slug}: {pdf}')
if missing:
    print('MISSING FILES:')
    for m in missing: print(f'  {m}')
else:
    print('All PDF paths valid')
"
```

Expected: `All PDF paths valid`

- [ ] **Step 6: Verify API route exists**

```bash
ls "app/api/media/[...path]/route.ts"
```

Expected: file exists.

- [ ] **Step 7: Commit final state**

```bash
git add .agents/skills/enrich-module/
git commit -m "feat: complete enrich-module skill — 7-phase media enrichment pipeline"
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Create module-sources.json | `.agents/skills/enrich-module/module-sources.json` |
| 2 | SKILL.md header, invocation, state management | `.agents/skills/enrich-module/SKILL.md` |
| 3 | Phase 0 — Research | `.agents/skills/enrich-module/SKILL.md` |
| 4 | Phase 1 — Collect | `.agents/skills/enrich-module/SKILL.md` |
| 5 | Phase 2 — Notebook | `.agents/skills/enrich-module/SKILL.md` |
| 6 | Phase 3a — Generate Non-Video | `.agents/skills/enrich-module/SKILL.md` |
| 7 | Phase 3b — Generate Video | `.agents/skills/enrich-module/SKILL.md` |
| 8 | Phase 4 — Download | `.agents/skills/enrich-module/SKILL.md` |
| 9 | API route for heavy media | `app/api/media/[...path]/route.ts` |
| 10 | Phase 5 — Integrate | `.agents/skills/enrich-module/SKILL.md` |
| 11 | Verify registration and dry run | Read-only verification |
