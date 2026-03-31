import type { Track } from './modules'

const PREFIX = 'progress_'
const QUIZ_PREFIX = 'quiz_'
const QUIZ_SUFFIX = '_completed'

export type ModuleStatus = 'completed' | 'not-started'

export function getModuleProgress(slug: string): ModuleStatus {
  if (typeof window === 'undefined') return 'not-started'
  return localStorage.getItem(`${PREFIX}${slug}`) === 'completed'
    ? 'completed'
    : 'not-started'
}

export function setModuleCompleted(slug: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(`${PREFIX}${slug}`, 'completed')
}

export function getAllModulesProgress(): Record<string, ModuleStatus> {
  if (typeof window === 'undefined') return {}
  const result: Record<string, ModuleStatus> = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith(PREFIX)) {
      const slug = key.slice(PREFIX.length)
      result[slug] = localStorage.getItem(key) === 'completed' ? 'completed' : 'not-started'
    }
  }
  return result
}

export function getQuizCompleted(slug: string): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(`${QUIZ_PREFIX}${slug}${QUIZ_SUFFIX}`) === 'true'
}

export function setQuizCompleted(slug: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(`${QUIZ_PREFIX}${slug}${QUIZ_SUFFIX}`, 'true')
}

export function getTrackProgress(track: Track): number {
  if (typeof window === 'undefined') return 0
  return track.modules.filter(
    (m) => localStorage.getItem(`${PREFIX}${m.slug}`) === 'completed'
  ).length
}

const SECTION_PREFIX = 'section_visited_'

export function getSectionVisited(slug: string, page: number): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(`${SECTION_PREFIX}${slug}_${page}`) === 'true'
}

export function setSectionVisited(slug: string, page: number): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(`${SECTION_PREFIX}${slug}_${page}`, 'true')
}

export function getModuleSectionsVisited(slug: string, totalSections: number): number {
  if (typeof window === 'undefined') return 0
  let count = 0
  for (let i = 1; i <= totalSections; i++) {
    if (localStorage.getItem(`${SECTION_PREFIX}${slug}_${i}`) === 'true') {
      count++
    }
  }
  return count
}
