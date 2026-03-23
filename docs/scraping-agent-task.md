# Scraping Agent Task — Enrich Course Resources

**Purpose:** Visit each URL from `deep-research-report.md`, extract relevant content, and produce a structured output (`docs/scraped-resources.md`) that maps each source to one or more course modules with a suggested `<ResourceCard>` snippet ready to paste into the MDX files.

**Date created:** 2026-03-22
**Run independently** — does not require the Next.js dev server to be running.

---

## How to run

### Option A — Claude Code in a new terminal

```bash
cd "/Users/rlabrao/Documents/Proyectos AI/Capacitaciones AI"
claude "Follow the instructions in docs/scraping-agent-task.md exactly. Use WebFetch to visit each URL, extract the relevant content, and write the output file docs/scraped-resources.md as specified."
```

### Option B — Dispatch as a background agent from Claude Code

In any Claude Code session in this project, say:
> "Dispatch a background agent to execute docs/scraping-agent-task.md"

---

## Input sources

All URLs come from `deep-research-report.md` in the project root. The full list:

### YouTube channels (fetch channel /videos page for recent titles + descriptions)
| Handle | URL |
|--------|-----|
| Jeff Su | https://www.youtube.com/@JeffSu/videos |
| Kevin Stratvert | https://www.youtube.com/@KevinStratvert/videos |
| Peter Yang | https://www.youtube.com/@PeterYangYT/videos |
| BridgeMind | https://www.youtube.com/@BridgeMindAI/videos |
| n8n tutorials playlist | https://www.youtube.com/playlist?list=PLlET0GsrLUL5HKJk1rb7t32sAs_iAlpZe |
| Mike Tholfsen | https://www.youtube.com/@miketholfsen/videos |
| David Fortin | https://www.youtube.com/@davidfortin/videos |
| Your 365 Coach | https://www.youtube.com/@your365coach/videos |
| Eduardo Vázquez IA | https://www.youtube.com/@eduardovazquezIA/videos |

### Newsletters / blogs (fetch homepage or archive page)
| Name | URL |
|------|-----|
| The Rundown AI | https://www.therundown.ai |
| Ben's Bites | https://www.bensbites.com/archive |
| TLDR AI | https://tldr.tech/ai |
| The Batch (DeepLearning.AI) | https://www.deeplearning.ai/the-batch/ |
| Peter Yang Substack | https://substack.com/@petergyang |
| Holistic AI Brief | https://www.holisticai.com/holistic-ai-brief |
| Simon Willison's Blog | https://simonwillison.net |
| Aceleradora AI newsletter | https://aceleradoraai.com/newsletter-ia-generativa-marzo-2026/ |

### Reports / papers (fetch landing page; try PDF only if landing page lacks description)
| Name | URL |
|------|-----|
| LexisNexis Future of Work 2026 | https://www.lexisnexis.com/en-us/products/nexis-plus-ai/future-of-work.page |
| International AI Safety Report 2026 | https://internationalaisafetyreport.org/publication/international-ai-safety-report-2026 |
| Singapore MinLaw GenAI Legal Guide | https://www.mlaw.gov.sg/launch-of-guide-for-using-generative-artificial-intelligence-in-the-legal-sector/ |
| Vodafone Spain — Vibe Coding | https://www.vodafone.es/c/empresas/grandes-clientes/es/nuestra-vision/vibe-coding/ |
| BBVA Research — AI & Productivity | https://www.bbvaresearch.com/wp-content/uploads/2026/03/BBVA_Research_Forinvest_AI_Productivity_employment_and_growth.pdf |
| Superpowers (GitHub) | https://github.com/obra/superpowers |
| NIST AI RMF | https://www.nist.gov/system/files/documents/2023/01/26/AI%20RMF%201.0.pdf |
| Anthropic Responsible Scaling Policy | https://www.anthropic.com/news/anthropics-responsible-scaling-policy |

---

## Instructions for the agent

### Step 1 — Fetch each URL

Use `WebFetch` on each URL above. For each page:
- Extract: page title, publication date (if visible), a 1–3 sentence description of what the resource covers
- Note if the fetch fails (HTTP error, paywalled, redirect loop) — mark as `FETCH_FAILED` and skip

### Step 2 — Map to module

For each successfully fetched resource, assign it to **one or more** of these modules based on content relevance:

| Module slug | Topic |
|-------------|-------|
| `ai-fundamentals` | How LLMs work, model ecosystem (Claude/GPT/Gemini/Copilot), hallucinations, context windows |
| `prompting-fundamentals` | Prompt engineering, few-shot, chain of thought, prompt structure |
| `vibe-coding` | Vibe coding, automation without code, no-code workflows, practical AI scripts |
| `legal-ai-risks` | Privacy, IP/copyright, regulation (EU AI Act, GDPR), AI governance, enterprise risk |
| `agents-and-skills` | AI agents, plugins/skills/MCP, multi-step automation, n8n/Make/Zapier, agentic workflows |

If a resource doesn't fit any module well, mark it `UNASSIGNED`.

### Step 3 — Generate ResourceCard snippets

For each resource, produce a ready-to-paste `<ResourceCard>` JSX snippet using this exact format:

```mdx
<ResourceCard
  title="[Title — keep under 60 chars, descriptive]"
  url="[canonical URL]"
  description="[1–2 sentences, what it covers and why it's useful for this audience]"
  type="[video | article | doc]"
/>
```

Type mapping:
- YouTube videos/channels → `video`
- Newsletters, blog posts → `article`
- PDFs, official docs, reports → `doc`

### Step 4 — Write output file

Write everything to `docs/scraped-resources.md` with this structure:

```markdown
# Scraped Resources — Course Enrichment
Generated: [date]

## Module: ai-fundamentals
[ResourceCard snippets]

## Module: prompting-fundamentals
[ResourceCard snippets]

## Module: vibe-coding
[ResourceCard snippets]

## Module: legal-ai-risks
[ResourceCard snippets]

## Module: agents-and-skills
[ResourceCard snippets]

## UNASSIGNED
[Any resources that didn't fit a module]

## FETCH_FAILED
[URLs that could not be fetched, with reason]
```

### Step 5 — Summary

After writing the file, output a brief summary:
- Total URLs attempted
- Total successfully fetched
- Total ResourceCard snippets generated
- Any notable findings (e.g., "LexisNexis report has strong fit for legal-ai-risks module")

---

## Output file location

```
docs/scraped-resources.md
```

Do NOT modify any existing source files. Only write to `docs/scraped-resources.md`.

---

## Notes for the human reviewer

After the agent completes:
1. Open `docs/scraped-resources.md`
2. Review each snippet — remove any that are low quality or off-topic
3. Copy the approved snippets into the relevant MDX files in `content/`
4. The `agents-and-skills` snippets are for the new Module 5 (not yet created at time of this task)
