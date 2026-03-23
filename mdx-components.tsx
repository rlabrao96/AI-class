import type { MDXComponents } from 'mdx/types'
import { Quiz } from '@/components/Quiz'
import { AnimatedDiagram } from '@/components/AnimatedDiagram'
import { ResourceCard } from '@/components/ResourceCard'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    Quiz,
    AnimatedDiagram,
    ResourceCard,
  }
}
