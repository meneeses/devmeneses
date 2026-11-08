import { links } from './content'

export type ProjectLinks = { live?: string; code?: string }

/** Order matches `work.projects` in content.ts. */
export const projectLinks: ProjectLinks[] = [
  { live: 'https://meneeses.github.io/cloudthreat-atlas/', code: 'https://github.com/meneeses/cloudthreat-atlas' },
  { code: 'https://github.com/meneeses/novae-universe' },
  { code: 'https://github.com/meneeses/gestao-usuarios' },
  { code: 'https://github.com/meneeses/ci-cd-bot-project' },
]

/** Landing page of the ICone product (icone.academy). */
export const iconeShots: { src: string; alt: string }[] = [
  { src: '/img/icone-hero.jpg', alt: 'ICone landing page — Gelato balanceado. Custo sob controle.' },
]

export const iconeLinks = { site: links.icone, videos: links.youtube }
