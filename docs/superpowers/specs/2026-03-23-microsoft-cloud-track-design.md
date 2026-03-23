# Microsoft + Cloud Track — Design Spec
**Date:** 2026-03-23
**Status:** Draft

## Overview

Add a second course track "Aplicaciones Microsoft + Cloud" to the existing AI course website. The site currently has one track ("Fundamentos de IA") with 6 modules. This new track has 3 modules targeting Novartis Business Execution team (and reusable for any Microsoft-heavy enterprise client). Users complete tracks sequentially: Fundamentos first, then Microsoft + Cloud.

## Architecture

### Track concept

Introduce a `Track` interface in `lib/modules.ts`:

```ts
export interface Track {
  slug: string
  title: string
  description: string
  modules: Module[]
}
```

`Module` gains one new field: `track: string` (value matches the parent track's slug).

The `number` field resets per track — Copilot+M365 is Module 1 within the Microsoft track, Fabric is Module 2, Bedrock is Module 3.

Export a `tracks: Track[]` array alongside the existing `modules: Module[]` flat array (kept for backwards compatibility with existing code).

### Routing

No routing changes. All modules still live at `/modules/[slug]`. Slugs are globally unique. The static import map in `app/modules/[slug]/page.tsx` gets 3 new entries.

Two new certificate routes: `/certificate/fundamentos` and `/certificate/microsoft-cloud`. The existing `/certificate` route redirects to `/certificate/fundamentos` for backwards compatibility.

### Progress tracking

localStorage keys per track:
- Track 1 (existing): `progress_[slug]`, `quiz_[slug]_completed` — no change
- Track 2 (new): same keys, same format — no schema change needed since slugs are unique

Helper functions in `lib/progress.ts`: add `getTrackProgress(track: Track): number` that returns the integer count of completed modules in that track (e.g., 2 out of 3). The homepage divides this by `track.modules.length` to derive the progress bar width percentage.

### Homepage (`/`)

Single page, two sections separated by a `<hr>` divider with a section label. Each section has:
- Track header: title + description + progress bar (for that track's modules only)
- Module cards (same design as today)
- Certificate banner when track 100% complete (links to `/certificate/[track-slug]`)

The existing "Seis módulos para entender..." tagline becomes the track 1 description.

### Module page & sidebar

The module page looks up the current module's `track` field and passes `trackSlug` to both `ModuleSidebar` and `MarkCompleteButton`.

**`ModuleSidebar` new prop interface:** `{ currentSlug: string; trackSlug: string }`. `currentSlug` is retained (needed for active highlight, TOC section, and progress re-read effect). `trackSlug` is used to filter `modules` to only that track's modules for the nav list.

**`MarkCompleteButton` new prop interface:** `{ slug: string; trackSlug: string }`. The component must compute `nextModule` by filtering `modules` to the current track first, then finding the next entry — not from the global `modules` array. Without this, the last module of track 1 would always find track 2's first module as "next" and the celebration banner would never appear. Celebration banner links to `/certificate/[trackSlug]`.

**"MÓDULO X" badge:** `mod.number` already holds the within-track number (new modules have `number: 1`, `2`, `3`). The existing `mod.number` render requires no code change.

### Certificate page

Generalize `app/certificate/page.tsx` → `app/certificate/[trackSlug]/page.tsx`. Reads `trackSlug` param, loads the matching track from `lib/modules.ts`, checks all modules in that track are complete, renders certificate for that track.

Must include `generateStaticParams` returning both track slugs to satisfy Next.js static generation:
```ts
export function generateStaticParams() {
  return tracks.map((t) => ({ trackSlug: t.slug }))
}
```

The certificate shows:
- Track title
- "Participante del Programa"
- List of completed modules in that track with green checkmarks
- Completion date
- Print/download button

## New Modules

### Module 1 · Copilot + M365 — "IA en tu día a día Microsoft"
**Slug:** `copilot-m365`
**Estimated time:** 60 min
**Track:** `microsoft-cloud`

**Intro:** Copilot está integrado en las herramientas que ya usas. Este módulo explica cómo funciona dentro de M365, cómo prompting en este contexto es diferente al chat libre, y cómo sacarle el máximo provecho en escenarios reales de trabajo — con atención especial a qué datos es seguro usar y cuáles no.

**H2 sections (rehype-slug IDs):**
1. `## Cómo funciona Copilot en M365` → `cómo-funciona-copilot-en-m365`
   - LLM + Microsoft Graph: Copilot no solo usa el modelo, usa tu contexto organizacional (emails, documentos, chats). Semantic indexing. Diferencia entre M365 Copilot (licencia adicional, datos org) vs Copilot Chat (gratuito, solo web).
   - Compliance note: Copilot solo puede acceder a datos a los que el usuario ya tiene permiso. No "ve" todo SharePoint — solo lo que tú puedes ver. Microsoft Purview controla qué se indexa.

2. `## Prompting en el contexto M365` → `prompting-en-el-contexto-m365`
   - Diferencias con chat libre: en M365 el contexto ya está cargado (el documento abierto, los emails recientes). No necesitas pegar todo el contexto — pero sí necesitas ser específico sobre qué parte quieres trabajar.
   - Ejemplos: en Word ("resume los tres puntos de acción de este documento en formato bullet"), en Outlook ("redacta una respuesta confirmando la reunión pero pide que se mande el deck previo"), en Teams ("¿cuáles fueron los acuerdos de la reunión del martes sobre Fabric?").
   - Compliance note: no pegues datos de pacientes/HCP ni información de ventas confidencial en el chat de Copilot Chat (web). M365 Copilot con datos internos es el canal correcto para eso.

3. `## Casos prácticos: Excel, Teams, Outlook, Word` → `casos-prácticos-excel-teams-outlook-word`
   - Excel: análisis de datos de ventas con lenguaje natural ("¿cuáles son los 5 mercados con mayor crecimiento YoY?"). Fórmulas explicadas. Resúmenes de tablas.
   - Teams: resumen de reuniones, action items automáticos, búsqueda semántica en el historial.
   - Outlook: drafting, resumen de hilos largos, respuestas con tono ajustado.
   - Word: generación de reportes desde outline, mejora de redacción, resumen ejecutivo.
   - Compliance note: para datos de SAP/Salesforce, exporta primero a Excel/SharePoint — Copilot puede leer archivos en tu OneDrive/SharePoint, no conecta directo a SAP.

4. `## Copilot Agents: más allá del chat` → `copilot-agents-más-allá-del-chat`
   - Qué son los agents en M365 (diferente de AI agents del módulo de Agentes de track 1): automatizaciones declarativas que responden a triggers en M365.
   - Ejemplo: agente de resumen semanal de ventas que lee el SharePoint del equipo cada lunes y genera un reporte.
   - Compliance note: los agents tienen el mismo scope de permisos que el usuario que los crea. No pueden acceder a más datos de los que tú ya ves.

**Quiz:** 5 questions about M365 Copilot architecture, prompting differences, Excel use cases, compliance boundaries, and agents.

**ResourceCards:**
- Microsoft 365 Copilot Overview (MS Learn) — `https://learn.microsoft.com/en-us/copilot/microsoft-365/microsoft-365-copilot-overview` — doc
- Microsoft Graph y Copilot (MS Learn) — `https://learn.microsoft.com/en-us/microsoft-365-copilot/microsoft-365-copilot-architecture` — doc
- Copilot en Excel: prompts y ejemplos — `https://support.microsoft.com/en-us/topic/get-started-with-copilot-in-excel-d7110502-0334-4b4f-a175-a73abdfc118a` — doc
- Microsoft Purview y Copilot: datos seguros — `https://learn.microsoft.com/en-us/purview/ai-microsoft-purview` — doc
- Copilot Adoption Hub (Microsoft) — `https://adoption.microsoft.com/en-us/copilot/` — article

---

### Module 2 · Microsoft Fabric — "Tu plataforma de datos unificada"
**Slug:** `microsoft-fabric`
**Estimated time:** 60 min
**Track:** `microsoft-cloud`

**Intro:** Los datos de Novartis viven en SAP, Salesforce, SharePoint y Power BI — sin conectarse entre sí. Microsoft Fabric es la plataforma que los unifica. Este módulo explica qué es Fabric, cómo conecta tus fuentes de datos existentes, cómo construir un pipeline básico, y cómo Copilot en Fabric acelera el trabajo con datos. Con atención especial a governance y seguridad de datos.

**H2 sections (rehype-slug IDs):**
1. `## Qué es Microsoft Fabric y por qué importa` → `qué-es-microsoft-fabric-y-por-qué-importa`
   - SaaS analytics platform end-to-end: ingestion → transformation → BI, todo en un solo tenant. Los 8 workloads (Power BI, Data Factory, Data Engineering, Data Science, Data Warehouse, Real-Time Intelligence, Databases, IQ).
   - OneLake: el data lake único del tenant. Zero-copy access — todos los workloads leen del mismo dato sin duplicarlo. Construido sobre ADLS Gen2.
   - Data mesh: cada equipo/dominio puede tener su workspace con sus datos, pero con governance centralizada.
   - Antes de Fabric: SAP → Excel → Power BI manualmente. Con Fabric: SAP → pipeline automatizado → OneLake → Power BI directo.
   - Compliance note: Fabric hereda las políticas de Microsoft Purview del tenant. Sensitivity labels aplicadas en Power BI se propagan a todos los workloads.

2. `## Conectar tus datos: pipelines con Data Factory` → `conectar-tus-datos-pipelines-con-data-factory`
   - Data Factory en Fabric: connectors para SAP, Salesforce, SharePoint, y +150 fuentes. No necesitas código para conectores estándar.
   - Concepto de pipeline: source → transformation → destination (OneLake lakehouse).
   - Ejemplo práctico: pipeline SAP ventas → OneLake → Power BI semantic model.
   - Dataflows Gen2 para transformaciones con UI (Power Query-style).
   - Compliance note: los pipelines corren con las credenciales del service principal configurado por el equipo de IT. No conectes fuentes con tus credenciales personales en producción.

3. `## Analizar con lenguaje natural: Copilot en Fabric` → `analizar-con-lenguaje-natural-copilot-en-fabric`
   - Copilot en Fabric es diferente por workload: en Power BI genera visualizaciones y reportes desde descripción. En Data Engineering completa código Spark. En Data Warehouse genera SQL desde lenguaje natural.
   - Ejemplo Power BI: "muestra las ventas por país del último trimestre comparadas con el año anterior" → Copilot genera el visual directo.
   - Ejemplo Data Warehouse: "¿cuáles son los 10 HCPs con mayor volumen de prescripciones en Q1?" → Copilot escribe la query SQL.
   - Requiere F2+ SKU o Premium. Compliance note: Copilot en Fabric puede procesar prompts en US/EU datacenters según configuración del tenant — revisar con IT antes de usar con datos sensibles.

4. `## Governance y seguridad en Fabric` → `governance-y-seguridad-en-fabric`
   - Workspaces y roles: Admin, Member, Contributor, Viewer. El control de acceso es por workspace.
   - Sensitivity labels: heredadas de Microsoft Purview. Un dataset marcado como "Confidential" no puede ser exportado sin aprobación.
   - Endorsement: Certified vs Promoted datasets — señal de calidad para consumidores internos.
   - Lineage view: ver de dónde viene cada dato y qué reportes lo consumen.
   - Compliance note: para datos de HCP/pacientes, configurar Row-Level Security (RLS) en el semantic model. Nunca usar datos clínicos en workspaces de desarrollo — solo en workspaces con clasificación aprobada.

**Quiz:** 5 questions about OneLake, Data Factory pipelines, Copilot in Fabric per-workload differences, workspace roles, and sensitivity labels.

**ResourceCards:**
- What is Microsoft Fabric (MS Learn) — `https://learn.microsoft.com/en-us/fabric/fundamentals/microsoft-fabric-overview` — doc
- Overview of Copilot in Fabric (MS Learn) — `https://learn.microsoft.com/en-us/fabric/get-started/copilot-fabric-overview` — doc
- Microsoft Fabric end-to-end tutorial — `https://learn.microsoft.com/en-us/fabric/get-started/end-to-end-tutorials` — doc
- Data Factory in Fabric — `https://learn.microsoft.com/en-us/fabric/data-factory/data-factory-overview` — doc
- Microsoft Fabric community blog — `https://blog.fabric.microsoft.com/` — article

---

### Module 3 · Azure AI Foundry — "Construye tu propio asistente de IA"
**Slug:** `azure-ai-foundry`
**Estimated time:** 60 min
**Track:** `microsoft-cloud`

**Intro:** Azure AI Foundry es la plataforma de Microsoft para que equipos con bajo o nulo código construyan chatbots y asistentes de IA conectados a sus propios datos internos. Está habilitada por DD&IT en Novartis y es la opción natural para quien ya trabaja en el ecosistema Microsoft. Este módulo explica cómo funciona, cómo conectar datos internos con Prompt Flow, cómo crear un asistente que responda sobre tus documentos, y cómo desplegarlo de forma segura.

**H2 sections (rehype-slug IDs):**
1. `## Qué es Azure AI Foundry y cómo encaja en el ecosistema` → `qué-es-azure-ai-foundry-y-cómo-encaja-en-el-ecosistema`
   - Foundry (antes Azure AI Studio) es el hub central de Microsoft para desarrollo de IA: acceso a modelos (GPT-4, Llama, Mistral, Phi), Prompt Flow para orquestar flujos, connections para datos internos, y deployment a Azure.
   - Diferencia con Copilot: Copilot es consumo de IA en apps existentes. Foundry es construcción de tus propias apps de IA.
   - Diferencia con Azure AI Foundry vs AWS Bedrock: mismo concepto, distinto cloud. Foundry se integra con Azure AD, SharePoint, Teams. Bedrock con S3, IAM, VPC. Para Novartis con stack Microsoft, Foundry es el punto de partida natural.
   - Compliance note: Foundry corre dentro del tenant de Azure de Novartis. Los datos nunca salen del perímetro corporativo. DD&IT habilita el acceso y gestiona las políticas.

2. `## Prompt Flow: orquestar tu asistente paso a paso` → `prompt-flow-orquestar-tu-asistente-paso-a-paso`
   - Prompt Flow es el motor de orquestación visual de Foundry: defines un grafo de pasos (input → retrieve → prompt → output) y cada paso tiene inputs/outputs tipados.
   - Conexión con track 1 (Sistemas Confiables + Agentes): Prompt Flow implementa LLM-Modulo visualmente — cada nodo puede ser un critic, una herramienta, o el LLM generador.
   - Tipos de nodos: LLM (llamada al modelo), Python (código arbitrario), Prompt (template), Tool (función externa), Retrieval (búsqueda en índice).
   - Ejemplo: flujo de Q&A sobre reportes de ventas: input pregunta → retrieve fragmentos relevantes de SharePoint → prompt con contexto → output respuesta con citas.
   - Compliance note: los flows solo pueden acceder a las connections configuradas por el admin. No puedes conectar fuentes de datos sin aprobación previa de DD&IT.

3. `## Conectar tus datos: Azure AI Search + SharePoint` → `conectar-tus-datos-azure-ai-search--sharepoint`
   - Azure AI Search es el motor de búsqueda vectorial que indexa tus documentos para RAG. Se conecta directamente a SharePoint, Blob Storage, y otras fuentes Azure.
   - Cómo funciona: tus documentos se dividen en chunks → se convierten en embeddings → se almacenan en el índice. Cuando el usuario pregunta, el sistema recupera los chunks más relevantes y los pasa al LLM.
   - Ejemplo práctico: indexar el SharePoint del equipo de Business Execution (reportes de ventas, análisis de mercado, guías de proceso) para que el asistente pueda responder preguntas específicas del negocio.
   - Compliance note: el índice hereda los permisos de SharePoint — si un usuario no tiene acceso a un documento, el asistente tampoco puede usarlo para responder sus preguntas (security trimming).

4. `## Desplegar y monitorear tu asistente` → `desplegar-y-monitorear-tu-asistente`
   - Deployment en Foundry: el flow se despliega como un endpoint REST. Puede integrarse en Teams (como bot), en una web app, o consumirse desde Power Apps.
   - Evaluation integrada: Foundry incluye evaluadores automáticos (groundedness, relevance, coherence) — conexión directa con LLM-as-judge del track 1.
   - Monitoreo: métricas de uso (llamadas por día, latencia, tokens consumidos), trazas de cada conversación para debugging, alertas configurables.
   - Compliance note: los endpoints deben configurarse con autenticación Azure AD. No uses endpoints públicos sin autenticación para datos internos.

**Quiz:** 5 questions about Foundry vs Copilot distinction, Prompt Flow node types, RAG with Azure AI Search, security trimming, and deployment options.

**ResourceCards:**
- Azure AI Foundry overview (MS Learn) — `https://learn.microsoft.com/en-us/azure/ai-studio/what-is-ai-studio` — doc
- Prompt Flow documentation (MS Learn) — `https://learn.microsoft.com/en-us/azure/machine-learning/prompt-flow/overview-what-is-prompt-flow` — doc
- Azure AI Search for RAG (MS Learn) — `https://learn.microsoft.com/en-us/azure/search/retrieval-augmented-generation-overview` — doc
- Build a RAG solution with Foundry (MS Learn) — `https://learn.microsoft.com/en-us/azure/ai-studio/tutorials/deploy-chat-web-app` — doc
- Azure AI Foundry pricing — `https://azure.microsoft.com/en-us/pricing/details/ai-studio/` — doc

---

### Module 4 · AWS Bedrock — "Modelos de IA en la infraestructura de AWS"
**Slug:** `aws-bedrock`
**Estimated time:** 60 min
**Track:** `microsoft-cloud`

**Intro:** El equipo tiene acceso a AWS con Bedrock. Bedrock es la plataforma managed de AWS para acceder a modelos de fundación (incluyendo Claude de Anthropic, Llama, Mistral y otros) sin gestionar infraestructura. Este módulo explica cómo funciona, cómo llamar modelos desde Python o la consola, cómo construir un RAG con Knowledge Bases, y qué garantías de privacidad ofrece para datos sensibles.

**H2 sections (rehype-slug IDs):**
1. `## Qué es Amazon Bedrock y por qué usarlo` → `qué-es-amazon-bedrock-y-por-qué-usarlo`
   - Managed service: accedes a 100+ modelos de fundación (Amazon Nova, Anthropic Claude, Meta Llama, Mistral, DeepSeek) sin gestionar GPUs ni infraestructura.
   - Model-agnostic: puedes cambiar de modelo sin cambiar tu arquitectura. Converse API unifica todos los modelos con la misma interfaz.
   - Enterprise-grade: FedRAMP High, HIPAA eligible. AWS no usa tus datos para entrenar modelos por defecto.
   - Por qué importa para Novartis: pueden usar Claude (el mismo modelo detrás de Claude.ai) pero con sus datos dentro del perímetro de AWS — no salen a Internet.
   - Compliance note: Bedrock tiene VPC isolation — el tráfico nunca sale a Internet público. Los prompts y respuestas no se usan para mejorar modelos base.

2. `## Llamar modelos: consola y API` → `llamar-modelos-consola-y-api`
   - AWS Console: playground para explorar modelos, comparar outputs, ajustar parámetros (temperatura, max tokens).
   - Converse API: la API recomendada. Misma interfaz para todos los modelos. Ejemplo Python básico:
   ```python
   import boto3
   client = boto3.client('bedrock-runtime', region_name='us-east-1')
   response = client.converse(
       modelId='anthropic.claude-3-5-sonnet-20241022-v2:0',
       messages=[{'role': 'user', 'content': [{'text': 'Resume este reporte en 3 puntos'}]}]
   )
   print(response['output']['message']['content'][0]['text'])
   ```
   - InvokeModel API para casos donde necesitas parámetros específicos del modelo.
   - Compliance note: las credenciales AWS deben configurarse con IAM roles de mínimo privilegio — solo acceso a los modelos necesarios, no a toda la cuenta.

3. `## RAG con Bedrock Knowledge Bases` → `rag-con-bedrock-knowledge-bases`
   - Qué es RAG (referencia a Fundamentos track 1): recuperar información de tus documentos antes de generar la respuesta. Evita alucinaciones con datos propios.
   - Knowledge Bases en Bedrock: conectas S3 buckets con tus documentos. Bedrock los indexa automáticamente. Cuando el usuario hace una pregunta, Bedrock recupera los fragmentos relevantes y los pasa al modelo.
   - Fuentes soportadas: S3, Confluence, SharePoint, Salesforce, y más.
   - Ejemplo: base de conocimiento con los reportes de ventas de los últimos 12 meses. Pregunta: "¿qué países tuvieron mejor performance en oncología en Q3?" → Bedrock busca en los reportes y responde con fuentes.
   - Compliance note: los documentos en Knowledge Bases se almacenan encriptados en S3 dentro de tu cuenta AWS. Los embeddings se guardan en tu propio vector store (OpenSearch Serverless o Pinecone). Nada sale de tu infraestructura.

4. `## Guardrails y uso responsable en Bedrock` → `guardrails-y-uso-responsable-en-bedrock`
   - Bedrock Guardrails: capa de filtros aplicada a todas las llamadas del modelo. Bloquea hasta 88% de contenido dañino.
   - Tipos de filtros: content filters (violencia, lenguaje inapropiado), topic denial (bloquear preguntas fuera de scope), sensitive information filters (PII: nombres, emails, números de documento), grounding (verificar que las respuestas se basan en los documentos de contexto).
   - Conexión con track 1 (Sistemas Confiables): Guardrails son hard verifiers automáticos. Grounding check es un critic determinista que verifica que el output está anclado en los documentos.
   - Ejemplo práctico: configurar un guardrail que bloquee cualquier respuesta que mencione nombres de pacientes o números de identificación, y que solo responda preguntas sobre los documentos de la Knowledge Base.
   - Compliance note: para datos HIPAA-eligible, habilitar HIPAA BAA con AWS. Para datos de Novartis, usar AWS PrivateLink para acceso sin Internet público.

**Quiz:** 5 questions about Bedrock model access, Converse API, RAG with Knowledge Bases, Guardrails types, and compliance features (VPC isolation, data training policy).

**ResourceCards:**
- What is Amazon Bedrock (AWS Docs) — `https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html` — doc
- Amazon Bedrock Converse API — `https://docs.aws.amazon.com/bedrock/latest/userguide/conversation-inference-call.html` — doc
- Bedrock Knowledge Bases — `https://docs.aws.amazon.com/bedrock/latest/userguide/knowledge-base.html` — doc
- Bedrock Guardrails — `https://docs.aws.amazon.com/bedrock/latest/userguide/guardrails.html` — doc
- AWS Bedrock pricing and model list — `https://aws.amazon.com/bedrock/pricing/` — doc

---

## File Map

| File | Action | Notes |
|------|--------|-------|
| `lib/modules.ts` | Modify | Add `Track` interface, `track: string` field to `Module`, add `tracks` array, add 3 new module entries with `track: 'microsoft-cloud'`. Add `track: 'fundamentos'` to all 6 existing modules. |
| `lib/progress.ts` | Modify | Add `getTrackProgress(track: Track): number` helper returning count of completed modules in that track |
| `app/page.tsx` | Modify | Two-section layout with track headers, per-track progress bars, per-track certificate banners |
| `app/modules/[slug]/page.tsx` | Modify | (1) Add 4 new entries to `moduleMap` static import map (`copilot-m365`, `microsoft-fabric`, `azure-ai-foundry`, `aws-bedrock`). (2) Pass `trackSlug={mod.track}` to `ModuleSidebar`. (3) Pass `trackSlug={mod.track}` to `MarkCompleteButton`. |
| `components/ModuleSidebar.tsx` | Modify | New prop interface: `{ currentSlug: string; trackSlug: string }`. Filter module nav list to `modules.filter(m => m.track === trackSlug)`. |
| `components/MarkCompleteButton.tsx` | Modify | New prop interface: `{ slug: string; trackSlug: string }`. Compute `nextModule` from `modules.filter(m => m.track === trackSlug)` not global array. Celebration banner links to `/certificate/${trackSlug}`. |
| `app/certificate/[trackSlug]/page.tsx` | Create | Parameterized certificate page. Must include `generateStaticParams` returning `tracks.map(t => ({ trackSlug: t.slug }))`. |
| `app/certificate/page.tsx` | Modify | Server-side redirect to `/certificate/fundamentos` using Next.js `redirect()` from `next/navigation`. Remove `'use client'` directive. Replace entire file body with `export default function CertificatePage() { redirect('/certificate/fundamentos') }`. |
| `content/copilot-m365.mdx` | Create | Module 1 of track 2 |
| `content/microsoft-fabric.mdx` | Create | Module 2 of track 2 |
| `content/azure-ai-foundry.mdx` | Create | Module 3 of track 2 |
| `content/aws-bedrock.mdx` | Create | Module 4 of track 2 |

## TOC IDs (rehype-slug, Unicode preserved)

### copilot-m365
- `cómo-funciona-copilot-en-m365`
- `prompting-en-el-contexto-m365`
- `casos-prácticos-excel-teams-outlook-word`
- `copilot-agents-más-allá-del-chat`

### microsoft-fabric
- `qué-es-microsoft-fabric-y-por-qué-importa`
- `conectar-tus-datos-pipelines-con-data-factory`
- `analizar-con-lenguaje-natural-copilot-en-fabric`
- `governance-y-seguridad-en-fabric`

### azure-ai-foundry
- `qué-es-azure-ai-foundry-y-cómo-encaja-en-el-ecosistema`
- `prompt-flow-orquestar-tu-asistente-paso-a-paso`
- `conectar-tus-datos-azure-ai-search--sharepoint`
- `desplegar-y-monitorear-tu-asistente`

### aws-bedrock
- `qué-es-amazon-bedrock-y-por-qué-usarlo`
- `llamar-modelos-consola-y-api`
- `rag-con-bedrock-knowledge-bases`
- `guardrails-y-uso-responsable-en-bedrock`

## Tracks array for lib/modules.ts

```ts
export const tracks: Track[] = [
  {
    slug: 'fundamentos',
    title: 'Fundamentos de IA',
    description: 'Seis módulos para entender, usar y aprovechar la IA en tu trabajo de forma responsable.',
    modules: modules.filter(m => m.track === 'fundamentos'),
  },
  {
    slug: 'microsoft-cloud',
    title: 'Aplicaciones Microsoft + Cloud',
    description: 'Cuatro módulos para aplicar lo aprendido en las herramientas Microsoft y AWS que ya usas en tu trabajo.',
    modules: modules.filter(m => m.track === 'microsoft-cloud'),
  },
]
```

## Homepage layout sketch

```
[Fundamentos de IA]
Seis módulos para entender, usar y aprovechar la IA...
[████████████░░] 4 de 6 módulos
[M1 card] [M2 card] [M3 card] [M4 card] [M5 card] [M6 card]

────────────────────────────────────

[Aplicaciones Microsoft + Cloud]
Cuatro módulos para aplicar lo aprendido...
[░░░░░░░░░░░░░░] 0 de 4 módulos
[M1 card] [M2 card] [M3 card] [M4 card]
```
