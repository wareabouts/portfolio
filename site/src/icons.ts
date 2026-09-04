import {
  faCamera,
  faCircle,
  faClapperboard,
  faCode,
  faCube,
  faMicrochip,
  faPenNib,
  faScrewdriverWrench,
  faTableCells,
  faUser,
  faVrCardboard,
  type IconDefinition,
} from '@fortawesome/free-solid-svg-icons'

/**
 * The icon for each nav entry, keyed by slug. Presentation, not content: the taxonomy
 * carries only the label, and a 3D version of the site can pick its own symbols.
 */
const NAV: Record<string, IconDefinition> = {
  about: faUser,
  'all-the-things': faTableCells,
  'virtual-reality': faVrCardboard,
  '3d-design': faCube,
  microcontrollers: faMicrochip,
  installation: faScrewdriverWrench,
  'web-dev': faCode,
  photography: faCamera,
  'graphic-design': faPenNib,
  animations: faClapperboard,
}

export const navIcon = (slug: string): IconDefinition => NAV[slug] ?? faCircle
