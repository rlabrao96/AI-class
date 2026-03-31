export interface TocItem {
  id: string
  label: string
}

export interface Section {
  id: string
  title: string
  file: string
}

export interface Module {
  slug: string
  number: number
  title: string
  estimatedTime: string
  track: string
  sections?: Section[]
  toc: TocItem[]
}

export interface Track {
  slug: string
  title: string
  description: string
  modules: Module[]
}

export const modules: Module[] = [
  {
    slug: 'ai-fundamentals',
    number: 1,
    title: 'Fundamentos de IA',
    estimatedTime: '2 hrs',
    track: 'fundamentos',
    sections: [
      { id: 'como-funcionan-los-llms', title: 'Cómo funcionan los LLMs', file: '01-como-funcionan-los-llms' },
      { id: 'ecosistema-de-herramientas', title: 'El ecosistema de herramientas', file: '02-ecosistema-de-herramientas' },
      { id: 'limites-reales', title: 'Límites reales', file: '03-limites-reales' },
      { id: 'el-mindset-correcto', title: 'El mindset correcto', file: '04-el-mindset-correcto' },
    ],
    toc: [
      { id: 'cómo-funcionan-los-llms', label: 'Cómo funcionan los LLMs' },
      { id: 'el-ecosistema-de-herramientas', label: 'El ecosistema de herramientas' },
      { id: 'límites-reales', label: 'Límites reales' },
      { id: 'el-mindset-correcto', label: 'El mindset correcto' },
    ],
  },
  {
    slug: 'prompting-fundamentals',
    number: 2,
    title: 'Prompting Fundamentals',
    estimatedTime: '45 min',
    track: 'fundamentos',
    toc: [
      { id: 'estructura-del-prompt', label: 'Estructura del prompt' },
      { id: 'especificidad--brevedad', label: 'Especificidad > brevedad' },
      { id: 'few-shot-prompting', label: 'Few-shot prompting' },
      { id: 'chain-of-thought', label: 'Chain of thought' },
    ],
  },
  {
    slug: 'reliable-ai-systems',
    number: 3,
    title: 'Sistemas de IA Confiables',
    estimatedTime: '40 min',
    track: 'fundamentos',
    toc: [
      { id: 'por-qué-los-llms-solos-fallan-en-producción', label: 'Por qué los LLMs solos fallan' },
      { id: 'llm-modulo-orquestación-con-critics', label: 'LLM-Modulo: orquestación con critics' },
      { id: 'schema-guided-reasoning-hacer-el-output-verificable', label: 'Schema-Guided Reasoning' },
      { id: 'evaluar-si-tu-sistema-funciona', label: 'Evaluar si tu sistema funciona' },
    ],
  },
  {
    slug: 'vibe-coding',
    number: 4,
    title: 'Vibe-coding: Automatiza Sin Código',
    estimatedTime: '45 min',
    track: 'fundamentos',
    toc: [
      { id: 'qué-es-el-vibe-coding', label: 'Qué es el vibe-coding' },
      { id: 'el-loop-de-iteración', label: 'El loop de iteración' },
      { id: 'casos-de-uso-prácticos', label: 'Casos de uso prácticos' },
      { id: 'cómo-ir-más-lejos', label: 'Cómo ir más lejos' },
    ],
  },
  {
    slug: 'agents-and-skills',
    number: 5,
    title: 'Agentes de IA, Skills y Extensibilidad',
    estimatedTime: '40 min',
    track: 'fundamentos',
    toc: [
      { id: 'qué-es-un-agente-de-ia', label: 'Qué es un agente de IA' },
      { id: 'skills-y-plugins-extender-el-modelo-sin-fine-tuning', label: 'Skills y plugins' },
      { id: 'caso-de-estudio-superpowers', label: 'Caso de estudio: superpowers' },
      { id: 'construir-un-agente-con-tool-use-ejemplo-hands-on', label: 'Agente hands-on con tool use' },
      { id: 'conectar-agentes-con-flujos-de-trabajo-n8n-como-capa-de-orquestación', label: 'Orquestación con n8n' },
    ],
  },
  {
    slug: 'legal-ai-risks',
    number: 6,
    title: 'Riesgos Legales y Gobernanza de la IA',
    estimatedTime: '25 min',
    track: 'fundamentos',
    toc: [
      { id: 'los-riesgos-reales-del-uso-de-ia-en-la-empresa', label: 'Los riesgos reales del uso de IA' },
      { id: 'privacidad-y-propiedad-intelectual', label: 'Privacidad y propiedad intelectual' },
      { id: 'el-panorama-regulatorio', label: 'El panorama regulatorio' },
      { id: 'gobernanza-práctica-qué-hace-una-organización-responsable', label: 'Gobernanza práctica' },
    ],
  },
  {
    slug: 'copilot-m365',
    number: 1,
    title: 'Copilot en Microsoft 365',
    estimatedTime: '60 min',
    track: 'microsoft-cloud',
    toc: [
      { id: 'cómo-funciona-copilot-en-m365', label: 'Cómo funciona Copilot en M365' },
      { id: 'prompting-en-el-contexto-m365', label: 'Prompting en el contexto M365' },
      { id: 'casos-prácticos-excel-teams-outlook-word', label: 'Casos prácticos: Excel, Teams, Outlook, Word' },
      { id: 'copilot-agents-más-allá-del-chat', label: 'Copilot Agents: más allá del chat' },
    ],
  },
  {
    slug: 'microsoft-fabric',
    number: 2,
    title: 'Microsoft Fabric: Datos con IA',
    estimatedTime: '60 min',
    track: 'microsoft-cloud',
    toc: [
      { id: 'qué-es-microsoft-fabric-y-por-qué-importa', label: 'Qué es Microsoft Fabric y por qué importa' },
      { id: 'conectar-tus-datos-pipelines-con-data-factory', label: 'Conectar tus datos: pipelines con Data Factory' },
      { id: 'analizar-con-lenguaje-natural-copilot-en-fabric', label: 'Analizar con lenguaje natural: Copilot en Fabric' },
      { id: 'governance-y-seguridad-en-fabric', label: 'Governance y seguridad en Fabric' },
    ],
  },
  {
    slug: 'azure-ai-foundry',
    number: 3,
    title: 'Azure AI Foundry: Construye tu Asistente',
    estimatedTime: '60 min',
    track: 'microsoft-cloud',
    toc: [
      { id: 'qué-es-azure-ai-foundry-y-cómo-encaja-en-el-ecosistema', label: 'Qué es Azure AI Foundry y cómo encaja en el ecosistema' },
      { id: 'prompt-flow-orquestar-tu-asistente-paso-a-paso', label: 'Prompt Flow: orquestar tu asistente paso a paso' },
      { id: 'conectar-tus-datos-azure-ai-search--sharepoint', label: 'Conectar tus datos: Azure AI Search + SharePoint' },
      { id: 'desplegar-y-monitorear-tu-asistente', label: 'Desplegar y monitorear tu asistente' },
    ],
  },
  {
    slug: 'aws-bedrock',
    number: 4,
    title: 'Amazon Bedrock: IA en AWS',
    estimatedTime: '60 min',
    track: 'microsoft-cloud',
    toc: [
      { id: 'qué-es-amazon-bedrock-y-por-qué-usarlo', label: 'Qué es Amazon Bedrock y por qué usarlo' },
      { id: 'llamar-modelos-consola-y-api', label: 'Llamar modelos: consola y API' },
      { id: 'rag-con-bedrock-knowledge-bases', label: 'RAG con Bedrock Knowledge Bases' },
      { id: 'guardrails-y-uso-responsable-en-bedrock', label: 'Guardrails y uso responsable en Bedrock' },
    ],
  },
]

export const tracks: Track[] = [
  {
    slug: 'fundamentos',
    title: 'Fundamentos de IA',
    description: 'Los conceptos, herramientas y técnicas esenciales para trabajar con IA generativa.',
    modules: modules.filter((m) => m.track === 'fundamentos'),
  },
  {
    slug: 'microsoft-cloud',
    title: 'IA en Microsoft Cloud',
    description: 'Copilot, Microsoft Fabric, Azure AI Foundry y Amazon Bedrock para el ecosistema Novartis.',
    modules: modules.filter((m) => m.track === 'microsoft-cloud'),
  },
]

export function getModule(slug: string): Module | undefined {
  return modules.find((m) => m.slug === slug)
}

export function getTrack(slug: string): Track | undefined {
  return tracks.find((t) => t.slug === slug)
}

export function getModuleSections(slug: string): Section[] {
  const mod = getModule(slug)
  return mod?.sections ?? []
}
