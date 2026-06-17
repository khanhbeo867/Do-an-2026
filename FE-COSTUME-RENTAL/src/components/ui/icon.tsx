import type { LucideProps } from 'lucide-react'
import { icons } from 'lucide-react'
import React from 'react'

export type IconProps = {
  name: keyof typeof icons
  color?: string
  size?: number
  ref?: React.RefAttributes<SVGSVGElement>
} & React.HTMLAttributes<HTMLOrSVGElement> &
  LucideProps

export const Icon: React.FC<IconProps> = ({ name, color, size = 16, ...props }) => {
  const LucideIcon = icons[name]

  if (!LucideIcon) {
    console.warn(`Icon "${name}" not found in lucide-react.`)
    const iconsMap = icons as any
    const FallbackIcon =
      iconsMap['CircleHelp'] ||
      iconsMap['CircleAlert'] ||
      iconsMap['Info'] ||
      iconsMap['HelpCircle'] ||
      iconsMap['AlertCircle']
    if (FallbackIcon) {
      return <FallbackIcon color={color} size={size} {...props} />
    }
    return null
  }

  return <LucideIcon color={color} size={size} {...props} />
}
