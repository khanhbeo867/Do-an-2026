import { UserRole } from '@/apis/auth/constants'
import useAuth, { useGetAuthUserQuery } from '@/apis/auth/hooks/use-auth-request'
import { Item, ItemContent, ItemDescription, ItemTitle } from '@/components/ui/item'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar'
import type { TNavigationConfig } from '@/configs/navigation.config'
import navigationConfig from '@/configs/navigation.config'
import useMediaQuery from '@/hooks/use-media-query'
import { Link } from '@tanstack/react-router'
import { GemIcon } from 'lucide-react'
import { Fragment, useEffect, useLayoutEffect, useRef } from 'react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../ui/collapsible'
import { Icon } from '../../ui/icon'
import AppNavUser from './app-nav-user'

type NavLinkProps = Pick<TNavigationConfig, 'url' | 'title' | 'icon' | 'authorizedRoles'> & {
  viewTransition?: boolean
}

const AppSidebar: React.FC = () => {
  const { user } = useAuth()

  const isMobile = useMediaQuery('(min-width: 320px) and (max-width: 1200px)')
  const { setOpen } = useSidebar()

  useLayoutEffect(() => {
    if (isMobile) setOpen(false)
  }, [isMobile])

  return (
    <Sidebar
      variant="inset"
      side="left"
      collapsible={isMobile ? 'offcanvas' : 'none'}
      className="h-screen border-r"
      suppressHydrationWarning
    >
      <SidebarHeader>
        <Link to="/" className="hover:opacity-80 transition-opacity block w-full">
          <Item size="xs">
            <GemIcon size={32} strokeWidth={1} className="self-center fill-primary/10" />
            <ItemContent>
              <ItemTitle>Diamond Studio</ItemTitle>
              <ItemDescription>Hệ thống quản lý thuê đạo cụ</ItemDescription>
            </ItemContent>
          </Item>
        </Link>
      </SidebarHeader>
      <SidebarContent className="overflow-x-hidden">
        {!user ? (
          <Fragment>
            <SidebarGroup>
              <SidebarGroupLabel>
                <SidebarMenuSkeleton className="h-4" />
              </SidebarGroupLabel>
              <SidebarMenu role="menu" aria-label="Administration">
                {Array.from({ length: 4 }).map((_, index) => (
                  <SidebarMenuSkeleton key={index} />
                ))}
              </SidebarMenu>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>
                <SidebarMenuSkeleton className="h-4" />
              </SidebarGroupLabel>
              <SidebarMenu role="menu" aria-label="Administration">
                {Array.from({ length: 4 }).map((_, index) => (
                  <SidebarMenuSkeleton key={index} />
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </Fragment>
        ) : (
          <>
            <SidebarGroup>
              <SidebarGroupLabel>Menu chính</SidebarGroupLabel>
              <SidebarMenu role="menu" aria-label="Main menu">
                {navigationConfig.main.map((item, index) => {
                  if (!Array.isArray(item.items)) return <SidebarMenuLink key={index.toString()} {...item} />
                  return (
                    <Collapsible key={index.toString()} defaultOpen={true} className="group/collapsible w-full">
                      <CollapsibleTrigger
                        render={
                          <SidebarMenuButton
                            size="default"
                            className="[&[aria-expanded=true]_svg:last-child]:rotate-90"
                            aria-disabled={item.items.every(
                              (subItem) =>
                                user &&
                                subItem.authorizedRoles !== '*' &&
                                Array.isArray(subItem.authorizedRoles) &&
                                !subItem.authorizedRoles.includes(user?.role)
                            )}
                            onClick={() => {
                              if (isMobile) return
                              setOpen(true)
                            }}
                          >
                            {item.icon && <Icon name={item.icon} />}
                            <span className="font-medium">{item.title}</span>
                            <Icon name="ChevronRight" className="ml-auto" />
                          </SidebarMenuButton>
                        }
                      />
                      <CollapsibleContent className="scrollbar-none! w-full overflow-auto transition-none data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                        <SidebarMenuSub>
                          {item.items?.map((subItem, subIndex) => (
                            <SidebarMenuSubLink key={`${index + 1}.${subIndex + 1}`} {...subItem} />
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </Collapsible>
                  )
                })}
              </SidebarMenu>
            </SidebarGroup>
            {user?.role === UserRole.ADMIN && (
              <Fragment>
                <SidebarSeparator className="max-w-full" />
                <SidebarGroup>
                  <SidebarGroupLabel>Quản lý</SidebarGroupLabel>
                  <SidebarMenu role="menu" aria-label="Administration">
                    {navigationConfig.administration.map((item, index) => {
                      return <SidebarMenuLink key={index.toString()} {...item} />
                    })}
                  </SidebarMenu>
                </SidebarGroup>
              </Fragment>
            )}
          </>
        )}
      </SidebarContent>
      <SidebarFooter>
        <AppNavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

const SidebarMenuLink: React.FC<NavLinkProps> = ({ url, title, icon, viewTransition, authorizedRoles }) => {
  const isMobile = useMediaQuery('(min-width: 320px) and (max-width: 767px)')
  const { open, openMobile, setOpenMobile } = useSidebar()
  // const location = useRouterState({ select: (s) => s.location })
  const ref = useRef<HTMLLIElement>(null)
  const { data: user } = useGetAuthUserQuery()

  const isLinkActive =
    (user && Array.isArray(authorizedRoles) && authorizedRoles.includes(user?.role)) || authorizedRoles === '*'

  // const isActive = location?.pathname?.match?.(new RegExp(`^${url}$`))

  useEffect(() => {
    if (open && ref.current) {
      ref.current.scrollIntoView({ behavior: 'auto', block: 'center' })
    }
  }, [open])

  return (
    <SidebarMenuItem
      role="menuitem"
      aria-disabled={!isLinkActive}
      className="group/menuitem aria-disabled:opacity-50"
      ref={ref}
      onClick={() => {
        if (isMobile && isLinkActive) setOpenMobile(!openMobile)
      }}
    >
      <SidebarMenuButton
        size="default"
        className="group-aria-disabled/menuitem:cursor-not-allowed"
        tooltip={title}
        render={
          <Link
            to={url!}
            viewTransition={viewTransition}
            disabled={!isLinkActive}
            onClick={(e) => {
              if (!isLinkActive) e.preventDefault()
            }}
            activeProps={{
              className: 'text-primary hover:text-primary bg-primary/10 ',
            }}
          >
            {icon && <Icon name={icon} size={20} />}
            <span className="font-medium">{title}</span>
            {!isLinkActive && <Icon name="Lock" size={14} className="ml-auto size-3.5 stroke-muted-foreground" />}
          </Link>
        }
      />
    </SidebarMenuItem>
  )
}

const SidebarMenuSubLink: React.FC<Omit<NavLinkProps, 'icon'>> = ({ url, title, viewTransition, authorizedRoles }) => {
  const ref = useRef<HTMLLIElement>(null)
  const isSmallScreen = useMediaQuery('(min-width: 320px) and (max-width: 1365px)')
  const { open, openMobile, setOpenMobile } = useSidebar()
  // const location = useRouterState({ select: (s) => s.location })
  const { user } = useAuth()

  const isAccessible =
    (user && Array.isArray(authorizedRoles) && authorizedRoles.includes(user?.role)) || authorizedRoles === '*'

  // const isActive = location?.pathname?.match?.(new RegExp(`^${url}$`))

  useEffect(() => {
    if (open && ref.current) {
      ref.current.scrollIntoView({ behavior: 'auto', block: 'center' })
    }
  }, [open])

  return (
    <SidebarMenuSubItem
      role="menuitem"
      ref={ref}
      aria-disabled={!isAccessible}
      className="group/menuitem relative aria-disabled:cursor-help aria-disabled:opacity-50"
      onClick={() => {
        if (isSmallScreen && isAccessible) setOpenMobile(!openMobile)
      }}
    >
      <SidebarMenuSubButton
        size="md"
        className="group-aria-disabled/menuitem:cursor-not-allowed"
        render={
          <Link
            to={url!}
            preload="intent"
            viewTransition={viewTransition}
            disabled={!isAccessible}
            onClick={(e) => {
              if (!isAccessible) e.preventDefault()
            }}
            activeProps={{
              className: 'text-primary hover:text-primary bg-primary/10',
            }}
          >
            <span className="font-medium ">{title}</span>
          </Link>
        }
      />
      {!isAccessible && (
        <Icon
          name="Lock"
          size={14}
          className="absolute top-1/2 right-0 translate-x-3.5 -translate-y-1/2 stroke-muted-foreground"
        />
      )}
    </SidebarMenuSubItem>
  )
}

// const SidebarMenuTitle: React.FC<React.ComponentProps<'span'>> = tw.span`
// 	font-medium
// `

export default AppSidebar
