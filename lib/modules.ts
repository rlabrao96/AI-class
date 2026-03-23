export interface TocItem {
  id: string
  label: string
}

export interface Module {
  slug: string
  number: number
  title: string
  estimatedTime: string
  toc: TocItem[]
}

export const modules: Module[] = [
  {
    slug: 'ai-fundamentals',
    number: 1,
    title: 'Fundamentos de IA',
    estimatedTime: '45 min',
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
    toc: [
      { id: 'los-riesgos-reales-del-uso-de-ia-en-la-empresa', label: 'Los riesgos reales del uso de IA' },
      { id: 'privacidad-y-propiedad-intelectual', label: 'Privacidad y propiedad intelectual' },
      { id: 'el-panorama-regulatorio', label: 'El panorama regulatorio' },
      { id: 'gobernanza-práctica-qué-hace-una-organización-responsable', label: 'Gobernanza práctica' },
    ],
  },
]

export function getModule(slug: string): Module | undefined {
  return modules.find((m) => m.slug === slug)
}
