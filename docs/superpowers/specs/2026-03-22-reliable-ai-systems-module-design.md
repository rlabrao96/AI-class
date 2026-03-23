# Diseño: Módulo "Sistemas de IA Confiables"

**Fecha:** 2026-03-22
**Estado:** Aprobado para implementación

---

## Contexto

El curso de capacitación en IA para Novartis tiene actualmente 5 módulos. Se detectó un gap pedagógico: después de aprender a escribir prompts (M2), los alumnos no tienen ningún framework para entender por qué los LLMs solos no son confiables en producción ni cómo diseñar sistemas que lo sean. Este módulo cierra ese gap.

**Fuentes de contenido:** Clases S06, S07 y S08 del curso OIDD6670 "AI and Business Workflows" (Wharton). Los conceptos centrales son: hard/soft verifiers (S06), Schema-Guided Reasoning y LLM-Modulo (S07), evaluación y HELM/HCAT (S08).

---

## Posición en el curso

**Insertar como Módulo 3**, entre Prompting Fundamentals (M2) y Vibe-coding (M3 actual).

Renumeración resultante:
| # | Slug | Título |
|---|------|--------|
| 1 | `ai-fundamentals` | Fundamentos de IA |
| 2 | `prompting-fundamentals` | Prompting Fundamentals |
| **3** | **`reliable-ai-systems`** | **Sistemas de IA Confiables** |
| 4 | `vibe-coding` | Vibe-coding: Automatiza Sin Código |
| 5 | `agents-and-skills` | Agentes de IA, Skills y Extensibilidad |
| 6 | `legal-ai-risks` | Riesgos Legales y Gobernanza de la IA |

**Rationale de posición:** El arco pedagógico queda: fundamentos → prompts → por qué los prompts solos no bastan → automatización → agentes → legal. El concepto de "verificar el output antes de que llegue al usuario" se absorbe mejor justo después de aprender prompting y antes de construir flujos completos.

---

## Audiencia

Técnica/semi-técnica. Personas que:
- Entienden qué es una API
- Saben leer código Python aunque no lo escriban de memoria
- Ya completaron M1 (LLMs, contexto, alucinaciones) y M2 (prompting)

No requiere escribir código — los ejemplos son conceptuales con diagramas y pseudoesquemas.

---

## Especificación del módulo

**Slug:** `reliable-ai-systems`
**Número:** 3
**Título:** Sistemas de IA Confiables
**Tiempo estimado:** 40 min
**Idioma:** Español

### Secciones (H2)

#### 1. Por qué los LLMs solos fallan en producción

**ID de anchor (rehype-slug):** `por-qué-los-llms-solos-fallan-en-producción`

**Contenido (~400 palabras):**
- El problema central: un LLM predice texto probable, no ejecuta lógica verificada. La "confiabilidad" no es una propiedad del modelo — es una propiedad del sistema que lo rodea.
- Dos casos reales de falla:
  1. **Epic Sepsis Model**: prometía AUC 0.76-0.83, validación externa mostró ~0.60. Retirado en 2022. Lección: rendimiento reportado ≠ rendimiento en tu contexto.
  2. **Abogados y jurisprudencia inventada**: dos abogados en NYC presentaron casos inexistentes generados por ChatGPT. El modelo los fabricó con total confianza.
- La pregunta que guía el módulo: *¿cómo diseñas un sistema donde los errores del LLM se detectan antes de llegar al usuario?*
- Introducción al framework base: **hard verifiers** vs **soft verifiers**:
  - Hard verifiers: checks automáticos y deterministas (validadores de schema, unit tests, calculadoras, solvers). Pasan o fallan. Se ejecutan siempre.
  - Soft verifiers: revisión humana sobre un subset de casos. No automáticos, no corren siempre, pero siguen siendo valiosos.
  - Regla: preferir hard verifiers siempre que sea posible. Los soft verifiers cubren lo que no se puede automatizar.

#### 2. LLM-Modulo: orquestación con critics

**ID de anchor:** `llm-modulo-orquestación-con-critics`

**Contenido (~500 palabras):**
- Framework central del módulo, originado en investigación de planificación con LLMs.
- Arquitectura conceptual:
  ```
  Problema / Especificación
          ↓
      LLM genera candidato
          ↓
    Critics evalúan candidato
    ┌─────────────────────┐
    │ ¿Pasa todos los     │
    │ critics?            │
    └──────┬──────────────┘
        No │              Sí
           ↓              ↓
    Meta-controller   Output aprobado
    agrega feedback        ↓
           ↓          Siguiente paso
    LLM refina
  ```
- Tipos de critics (de más confiable a menos):
  1. **Deterministas**: funciones matemáticas, validadores de schema, solvers. Resultado binario.
  2. **LLM-as-critic**: un segundo LLM evalúa el output del primero. Más flexible, menos confiable que los deterministas.
  3. **Humano en el loop**: revisión humana cuando los critics anteriores no son suficientes.
- Caso de estudio: planificación de supply chain (del PDF S07). El ops manager define reglas de negocio (capacity constraints, costs). El engineer las codifica como critics. El LLM genera planes de envío. Los critics verifican feasibility antes de que el plan llegue al sistema de ejecución. El meta-controller agrega los failures y pide al LLM que itere.
- Distinción de roles — crítica para la implementación real:
  - **Domain expert** (ej. ops manager): dueño de la lógica de negocio, edge cases, definición de correcto/incorrecto.
  - **Engineer**: dueño de hacer esos criterios observables, testeables, auditables. Dueño de schemas, checks, monitoring, fallback paths.
  - **Modelo**: no es dueño de la lógica de negocio. Su rol es **escalar** la expertise del domain expert.

#### 3. Schema-Guided Reasoning: hacer el output verificable

**ID de anchor:** `schema-guided-reasoning-hacer-el-output-verificable`

**Contenido (~450 palabras):**
- SGR como aplicación concreta de LLM-Modulo: en lugar de pedir texto libre, defines un schema con pasos intermedios tipados.
- Por qué el texto libre es el enemigo de la verificación: si el output es "el contrato parece estar en compliance", no puedes testearlo automáticamente. Si el output es `{"clause_3_2": {"compliant": true, "reason": null}}`, sí puedes.
- Principios de SGR:
  1. El LLM toma decisiones en **pasos conocidos** entre **alternativas conocidas**
  2. Cada output intermedio tiene un tipo (booleano, enum, lista de strings de un ontología definida, número)
  3. La lógica de negocio vive en el schema y en los checks — no en el prompt libre
  4. El razonamiento intermedio es visible y auditable
- Caso de estudio: compliance de contratos (del PDF S07). Jane (domain expert, abogada) describe su workflow:
  1. ¿Aplica esta cláusula al contrato? → `boolean`
  2. ¿Está en compliance? → `boolean`
  3. Razones de no-compliance → `List[str]` de una ontología predefinida (no texto libre)
  4. Cláusulas del contrato que abordan el requisito → `List[str]` (citas textuales verificables)
  5. Cambios mínimos necesarios → `List[str]`
  - Cada step es checkeable automáticamente. El output final es auditable.
- Qué SGR NO es: no es un modelo nuevo, no da capacidades nuevas al LLM, no reemplaza el pensamiento sobre el problema de negocio. Es una forma de **empaquetar** las respuestas del LLM de forma consistente y verificable.
- Comparación con texto libre: tabla antes/después mostrando el mismo workflow con output libre vs con SGR.

#### 4. Evaluar si tu sistema funciona

**ID de anchor:** `evaluar-si-tu-sistema-funciona`

**Contenido (~350 palabras):**
- Tres niveles de evaluación, de más a menos confiable:
  1. **Hard verifiers en producción**: si diseñaste bien el schema, muchos checks corren automáticamente en cada request. Unit tests sobre los outputs estructurados.
  2. **Soft verifiers sobre muestra**: revisión humana periódica sobre N% de los casos. Cómo elegir qué revisar: casos borderline (cerca del threshold), casos con feedback negativo del usuario, sample aleatorio.
  3. **LLM-as-judge**: usar un segundo LLM para evaluar outputs del primero. Útil cuando el output es semántico y no hay ground truth fácil. Limitaciones: sesgo a favor de respuestas largas y del mismo proveedor, posible contaminación de datos.
- Pitfalls de evaluación que todo equipo comete:
  - Evaluar en datos de desarrollo, no de producción
  - Asumir que un benchmark público transfiere a tu contexto (el modelo de sepsis)
  - Leakage temporal: entrenar con datos de 2024 y testear con datos de 2023
  - "Teach-cheat-repeat": usar el dataset de evaluación para ajustar el sistema
- Framework HELM mencionado como referencia para evaluación holística (accuracy + robustness + fairness + efficiency + calibration) — para equipos que quieran ir más profundo.

---

## Componentes embebibles en MDX

### Quiz
5 preguntas enfocadas en:
1. Hard vs soft verifiers — cuál es la diferencia y cuál preferir
2. Rol del domain expert vs el engineer en LLM-Modulo
3. Por qué SGR mejora la auditabilidad respecto a texto libre
4. Qué hace el meta-controller en el loop de LLM-Modulo
5. Cuándo es válido usar LLM-as-judge y cuál es su principal limitación

### ResourceCards (4)
1. **LLM-Modulo Framework** (paper) — `doc` — referencia académica del framework
2. **Anthropic — Structured Outputs** — `doc` — cómo implementar outputs estructurados en la API de Claude
3. **HELM: Holistic Evaluation of Language Models** — `doc` — framework de evaluación de Stanford
4. **Epic Sepsis Model Rollback** — `article` — caso real de falla de modelo en producción (STAT News)

---

## Cambios en archivos existentes

### `lib/modules.ts`
- Agregar entrada para `reliable-ai-systems` con número 3
- Renumerar `vibe-coding` → 4, `agents-and-skills` → 5, `legal-ai-risks` → 6

### `app/modules/[slug]/page.tsx`
- Agregar `'reliable-ai-systems': () => import('@/content/reliable-ai-systems.mdx')` al moduleMap

### `app/page.tsx`
- Actualizar tagline: "Seis módulos para..."

### `app/certificate/page.tsx`
- Sin cambios — itera sobre `modules` dinámicamente, se actualiza solo

---

## Archivos nuevos

| Archivo | Descripción |
|---------|-------------|
| `content/reliable-ai-systems.mdx` | Contenido completo del módulo |

---

## Criterios de éxito

- Un alumno que completa el módulo puede explicar la diferencia entre hard y soft verifiers
- Puede describir el loop de LLM-Modulo (LLM → critics → meta-controller → iterate/approve)
- Entiende por qué el output estructurado es más confiable que el texto libre
- Sabe qué preguntas hacerle a un domain expert para traducir su workflow a un sistema verificable
