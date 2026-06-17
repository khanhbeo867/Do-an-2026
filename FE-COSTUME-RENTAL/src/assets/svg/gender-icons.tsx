import { CostumeGender } from '@/apis/costume/constants'
import { MarsIcon, VenusAndMarsIcon, VenusIcon } from 'lucide-react'

export const GENDER_ICONS: ReadonlyMap<CostumeGender, React.FC<React.SVGProps<SVGSVGElement>>> = new Map([
  [CostumeGender.MALE, MarsIcon],
  [CostumeGender.FEMALE, VenusIcon],
  [CostumeGender.UNISEX, VenusAndMarsIcon],
])
