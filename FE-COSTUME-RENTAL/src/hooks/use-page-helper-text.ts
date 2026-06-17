import navigationConfig from '@/configs/navigation.config'
import { useLocation } from '@tanstack/react-router'
import { pick } from 'lodash-es'

export const usePageHelperText = (appNavSection: keyof typeof navigationConfig) => {
  const pathname = useLocation({ select: (state) => state.pathname, structuralSharing: true })
  const currentNavItem = navigationConfig[appNavSection]?.find((navItem) =>
    !Array.isArray(navItem?.items) ? navItem.url === pathname : navItem?.items.some((i) => i.url === pathname)
  )

  return (
    Array.isArray(currentNavItem?.items)
      ? currentNavItem.items.find(({ url }) => url === pathname)
      : pick(currentNavItem, ['title', 'description'])
  ) as { title: string; description: string }
}
