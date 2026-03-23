'use client'

import Link from 'next/link'

interface Term {
  acronym?: string
  term: string
  definition: string
  category: 'fundamentos' | 'sistemas' | 'legal' | 'herramientas'
}

const glossary: Term[] = [
  // Fundamentos
  {
    acronym: 'LLM',
    term: 'Large Language Model',
    definition:
      'Modelo de lenguaje de gran escala entrenado con enormes cantidades de texto para predecir y generar lenguaje natural. La tecnología subyacente de herramientas como ChatGPT, Claude y Gemini.',
    category: 'fundamentos',
  },
  {
    term: 'Token',
    definition:
      'Unidad mínima de texto que procesa un LLM. Puede ser una palabra completa, parte de una palabra, o un signo de puntuación. Los modelos leen y generan texto token por token, no caracter por caracter.',
    category: 'fundamentos',
  },
  {
    term: 'Contexto (Context Window)',
    definition:
      'La cantidad máxima de texto que un LLM puede leer y considerar en una sola conversación. Todo lo que está fuera de la ventana de contexto es invisible para el modelo — no tiene memoria de conversaciones anteriores.',
    category: 'fundamentos',
  },
  {
    term: 'Alucinación',
    definition:
      'Cuando un LLM genera información falsa o inexistente con total confianza. El modelo no "sabe" que está equivocado — simplemente predice el texto más probable según sus patrones de entrenamiento.',
    category: 'fundamentos',
  },
  {
    term: 'Prompt',
    definition:
      'La instrucción o entrada de texto que le das a un LLM para obtener una respuesta. La calidad y estructura del prompt tiene un impacto directo en la calidad del output.',
    category: 'fundamentos',
  },
  {
    term: 'Few-shot prompting',
    definition:
      'Técnica de prompting que incluye 2–5 ejemplos del formato o estilo de respuesta deseado directamente en el prompt. Ayuda al modelo a entender exactamente qué se espera de él.',
    category: 'fundamentos',
  },
  {
    term: 'Chain of Thought (CoT)',
    definition:
      'Técnica que le pide al LLM que razone paso a paso antes de dar una respuesta final. Mejora la precisión en tareas de lógica o múltiples pasos. Se activa con frases como "piensa paso a paso".',
    category: 'fundamentos',
  },
  {
    acronym: 'RAG',
    term: 'Retrieval-Augmented Generation',
    definition:
      'Arquitectura que combina un LLM con una base de conocimiento externa. En lugar de depender solo del conocimiento del modelo, el sistema busca información relevante y se la pasa al LLM como contexto antes de generar la respuesta.',
    category: 'fundamentos',
  },
  {
    term: 'Fine-tuning',
    definition:
      'Proceso de re-entrenar un modelo pre-existente con un conjunto de datos específico para especializarlo en una tarea o dominio. Es costoso y generalmente innecesario para casos de uso empresariales estándar.',
    category: 'fundamentos',
  },
  {
    term: 'Temperatura',
    definition:
      'Parámetro que controla cuánta aleatoriedad o creatividad usa el modelo al generar texto. Temperatura baja (cercana a 0) = respuestas más deterministas y consistentes. Temperatura alta = respuestas más creativas y variadas.',
    category: 'fundamentos',
  },
  // Sistemas confiables
  {
    term: 'Hard Verifier',
    definition:
      'Check automático y determinista que valida el output de un LLM. Pasa o falla sin ambigüedad. Ejemplos: validador de schema JSON, función matemática, solver. El tipo de verificación más confiable.',
    category: 'sistemas',
  },
  {
    term: 'Soft Verifier',
    definition:
      'Revisión humana sobre un subconjunto de outputs del sistema. No es automático ni corre en cada request, pero cubre lo que no se puede verificar algorítmicamente.',
    category: 'sistemas',
  },
  {
    term: 'LLM-Modulo',
    definition:
      'Framework de orquestación que separa generación y verificación. El LLM genera un candidato → critics lo evalúan → si falla, el meta-controller agrega feedback y el LLM refina. El output solo sale si pasa todos los critics.',
    category: 'sistemas',
  },
  {
    term: 'Critic',
    definition:
      'En LLM-Modulo, un componente que evalúa si el output del LLM cumple con ciertos criterios. Puede ser un check determinista, un segundo LLM, o un humano en el loop.',
    category: 'sistemas',
  },
  {
    term: 'Meta-controller',
    definition:
      'Componente de LLM-Modulo que agrega el feedback de los critics cuando un candidato falla, y se lo pasa al LLM para que genere un candidato mejorado.',
    category: 'sistemas',
  },
  {
    acronym: 'SGR',
    term: 'Schema-Guided Reasoning',
    definition:
      'Patrón de diseño donde el LLM toma decisiones en pasos conocidos entre alternativas tipadas (boolean, enum, lista de strings de una ontología). Los outputs son verificables automáticamente en lugar de texto libre.',
    category: 'sistemas',
  },
  {
    term: 'LLM-as-judge',
    definition:
      'Patrón donde un segundo LLM evalúa el output del primero. Útil para outputs semánticos sin ground truth fácil. Tiene sesgos conocidos: favorece respuestas largas y del mismo proveedor.',
    category: 'sistemas',
  },
  {
    term: 'Tool use / Function calling',
    definition:
      'Capacidad de un LLM para invocar funciones o herramientas externas (buscar en la web, leer un archivo, llamar una API). El modelo decide qué herramienta usar, el código del usuario la ejecuta y devuelve el resultado al modelo.',
    category: 'sistemas',
  },
  {
    term: 'Agente de IA',
    definition:
      'Sistema donde un LLM opera en un loop autónomo: recibe una tarea, razona qué herramienta usar, ejecuta la acción, observa el resultado, y repite hasta completar el objetivo.',
    category: 'sistemas',
  },
  // Herramientas y frameworks
  {
    acronym: 'API',
    term: 'Application Programming Interface',
    definition:
      'Interfaz que permite a dos sistemas de software comunicarse. En el contexto de IA, la API de un proveedor (OpenAI, Anthropic, Google) permite integrar sus modelos en aplicaciones propias.',
    category: 'herramientas',
  },
  {
    acronym: 'MCP',
    term: 'Model Context Protocol',
    definition:
      'Protocolo abierto de Anthropic que estandariza cómo los LLMs se conectan a herramientas, datos y servicios externos. Permite construir integraciones una vez y usarlas con cualquier modelo compatible.',
    category: 'herramientas',
  },
  {
    term: 'Vibe-coding',
    definition:
      'Enfoque de desarrollo donde se describe lo que se quiere construir en lenguaje natural y se itera con IA hasta que funcione, sin necesidad de escribir código manualmente. El foco está en describir bien el objetivo y evaluar el resultado.',
    category: 'herramientas',
  },
  // Legal y gobernanza
  {
    acronym: 'GDPR',
    term: 'General Data Protection Regulation',
    definition:
      'Reglamento europeo de protección de datos vigente desde 2018. Regula cómo las organizaciones recopilan, procesan y almacenan datos personales de ciudadanos de la UE. Base de la mayoría de las leyes de privacidad modernas.',
    category: 'legal',
  },
  {
    term: 'EU AI Act',
    definition:
      'Regulación de la Unión Europea que clasifica los sistemas de IA por nivel de riesgo (inaceptable, alto, limitado, mínimo) y establece requisitos de transparencia, auditoría y supervisión humana según esa clasificación. Vigente desde 2024.',
    category: 'legal',
  },
  {
    acronym: 'NIST AI RMF',
    term: 'NIST AI Risk Management Framework',
    definition:
      'Marco voluntario del gobierno de EE.UU. para gestionar riesgos de IA en organizaciones. Organizado en cuatro funciones: Govern (gobernanza), Map (mapear riesgos), Measure (medir), Manage (gestionar).',
    category: 'legal',
  },
  {
    term: 'Automation bias',
    definition:
      'Tendencia humana a confiar excesivamente en sistemas automatizados o de IA, incluso cuando el sistema se equivoca. Es un riesgo especialmente alto cuando el output de la IA tiene alta confianza aparente.',
    category: 'legal',
  },
  {
    term: 'Brussels Effect',
    definition:
      'Fenómeno por el cual las regulaciones de la UE terminan siendo adoptadas globalmente porque las empresas multinacionales prefieren tener un solo estándar en lugar de sistemas distintos por región.',
    category: 'legal',
  },
]

const categoryLabels: Record<Term['category'], string> = {
  fundamentos: 'Fundamentos y modelos',
  sistemas: 'Sistemas confiables y arquitectura',
  herramientas: 'Herramientas y desarrollo',
  legal: 'Legal y gobernanza',
}

const categoryColors: Record<Term['category'], string> = {
  fundamentos: 'bg-blue-50 text-blue-700 border-blue-200',
  sistemas: 'bg-purple-50 text-purple-700 border-purple-200',
  herramientas: 'bg-orange-50 text-orange-700 border-orange-200',
  legal: 'bg-red-50 text-red-700 border-red-200',
}

const categories: Term['category'][] = ['fundamentos', 'sistemas', 'herramientas', 'legal']

export default function GlossaryPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="mb-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 mb-8 px-4 py-2 bg-[#18181b] text-white text-sm font-medium rounded-lg hover:bg-[#27272a] transition-colors"
          >
            ← Volver al menú principal
          </Link>
        </div>

        <div className="mb-10">
          <h1 className="text-3xl font-bold text-[#18181b] mb-2">Glosario</h1>
          <p className="text-[#71717a]">
            Términos y acrónimos clave del curso, organizados por tema.
          </p>
        </div>

        <div className="space-y-12">
          {categories.map((category) => {
            const terms = glossary.filter((t) => t.category === category)
            return (
              <section key={category}>
                <h2 className="text-xs font-semibold text-[#71717a] uppercase tracking-wider mb-4">
                  {categoryLabels[category]}
                </h2>
                <div className="space-y-4">
                  {terms.map((t) => (
                    <div
                      key={t.term}
                      className="p-4 border border-[#e4e4e7] rounded-lg bg-[#fafafa]"
                    >
                      <div className="flex items-start gap-3 mb-1.5">
                        {t.acronym && (
                          <span
                            className={`flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded border ${categoryColors[category]}`}
                          >
                            {t.acronym}
                          </span>
                        )}
                        <p className="text-sm font-semibold text-[#18181b]">
                          {t.acronym ? t.term : t.term}
                        </p>
                      </div>
                      <p className="text-sm text-[#52525b] leading-relaxed">
                        {t.definition}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      </div>
    </div>
  )
}
