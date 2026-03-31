import type { MDXComponents } from 'mdx/types'
import { Quiz } from '@/components/Quiz'
import { AnimatedDiagram } from '@/components/AnimatedDiagram'
import { ResourceCard } from '@/components/ResourceCard'
import { MiniQuiz } from '@/components/MiniQuiz'
import { Callout } from '@/components/Callout'
import { Accordion } from '@/components/Accordion'
import { BeforeAfter } from '@/components/BeforeAfter'
import { ModuleImage } from '@/components/ModuleImage'
import { SectionVisitBanner } from '@/components/SectionVisitBanner'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    Quiz,
    AnimatedDiagram,
    ResourceCard,
    MiniQuiz,
    Callout,
    Accordion,
    BeforeAfter,
    ModuleImage,
    SectionVisitBanner,
  }
}
