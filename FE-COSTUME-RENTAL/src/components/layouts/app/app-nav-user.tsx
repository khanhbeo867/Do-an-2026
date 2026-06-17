import { useLogOutMutation } from '@/apis/auth/hooks/use-auth-request'
import type { IUser } from '@/apis/user/types'
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item'
import { Skeleton } from '@/components/ui/skeleton'
import generateAvatar from '@/lib/generate-avatar'
import { isNil } from 'lodash-es'
import { ChevronsUpDown } from 'lucide-react'
import type React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu'
import { Icon } from '../../ui/icon'
import { SidebarMenu, SidebarMenuItem, useSidebar } from '../../ui/sidebar'

const AppNavUser: React.FC<{ user: Nullable<IUser> }> = ({ user }) => {
  const { mutateAsync: logout } = useLogOutMutation()
  // const { data: user, isLoading } = useGetAuthUserQuery()
  const { isMobile } = useSidebar()

  if (isNil(user)) return <NavUserSkeleton />

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            // disabled={isLoading}
            // aria-disabled={isLoading}
            className="w-full cursor-pointer"
            role="button"
            nativeButton={true}
          >
            <NavUserItem user={user} />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <NavUserItem user={user} showIcon={false} />
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Icon name="BadgeCheck" />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => logout()}>
                <Icon name="LogOut" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

const NavUserSkeleton: React.FC = () => {
  return (
    <Item size="xs" className="flex-nowrap">
      <ItemMedia>
        <Skeleton className="size-7 rounded-full" />
      </ItemMedia>
      <ItemContent className="space-y-2">
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-2" />
      </ItemContent>
      <ItemActions>
        <ChevronsUpDown size={14} />
      </ItemActions>
    </Item>
  )
}

const NavUserItem: React.FC<{ user: IUser | null | undefined; showIcon?: boolean }> = ({ user, showIcon = true }) => {
  return (
    <Item size="xs" className="flex-nowrap hover:bg-accent">
      <ItemMedia>
        <Avatar className="size-8 rounded-lg">
          <AvatarImage
            src={user?.avatar ?? generateAvatar({ name: user?.employee?.full_name! })}
            alt={user?.employee?.full_name}
          />
          <AvatarFallback className="rounded-lg">{user?.employee?.full_name.at(0)}</AvatarFallback>
        </Avatar>
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{user?.employee?.full_name}</ItemTitle>
        <ItemDescription className="line-clamp-1 text-xs">{user?.employee?.email}</ItemDescription>
      </ItemContent>
      {showIcon && (
        <ItemActions>
          <ChevronsUpDown size={14} />
        </ItemActions>
      )}
    </Item>
  )
}

export default AppNavUser
