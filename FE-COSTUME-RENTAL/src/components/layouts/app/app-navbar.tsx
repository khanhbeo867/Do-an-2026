import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import useMediaQuery from '@/hooks/use-media-query'

import useAuth from '@/apis/auth/hooks/use-auth-request'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '../../ui/sidebar'
import AppNavUser from './app-nav-user'

const AppNavbar: React.FC = () => {
  const isMobile = useMediaQuery('(min-width: 320px) and (max-width: 1200px)')
  const { user } = useAuth()

  if (!isMobile) return null

  return (
    <header className="bg-card sticky top-0 z-20 h-(--header-height) border-b px-(--outlet-padding-y) shadow-lg">
      <nav className="flex h-full items-center justify-center gap-x-4">
        <AppNavUser user={user} />
        <div className="py-3">
          <Separator orientation="vertical" className="h-6 min-w-0.5 self-center" />
        </div>
        <SidebarTrigger
          className="mr-auto"
          render={
            <Button size="icon" variant="ghost">
              <Icon name="Menu" />
            </Button>
          }
        />
      </nav>
    </header>
  )
}

export default AppNavbar
