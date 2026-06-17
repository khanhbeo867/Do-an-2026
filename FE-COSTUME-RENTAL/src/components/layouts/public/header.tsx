import useAuth from '@/apis/auth/hooks/use-auth-request'
import { useGetCategoriesQuery } from '@/apis/category/hooks/use-category-request'
import { FaceBookIcon } from '@/assets/svg/facebook-icon'
import { InstagramIcon } from '@/assets/svg/instagram-icon'
import { ITEM_TYPE_MAP } from '@/common/constants/const'
import type { ItemType } from '@/common/constants/enums'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Typography } from '@/components/ui/typography'
import { useCartStore } from '@/hooks/use-cart-store'
import { cn } from '@/lib/utils'
import { Link } from '@tanstack/react-router'
import { groupBy } from 'lodash-es'
import {
  ArrowUpRightIcon,
  FileTextIcon,
  GiftIcon,
  HomeIcon,
  LogInIcon,
  MenuIcon,
  NotepadTextIcon,
  SparklesIcon,
  ShoppingBagIcon,
  UserIcon,
} from 'lucide-react'
import React, { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { SearchDialog } from './search-dialog'
import { EditProfileDialog } from './edit-profile-dialog'


const Header: React.FC = () => {
  const { data: categories } = useGetCategoriesQuery()
  const { user, isAuthenticated, logout } = useAuth()
  const cartItems = useCartStore((state) => state.items)
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const categoryGroups = useMemo(() => {
    if (!Array.isArray(categories)) return []
    return Object.entries(groupBy(categories, (item) => item.type)).map(([type, items]) => {
      return {
        id: type,
        label: ITEM_TYPE_MAP.get(type as ItemType)!.label,
        icon: ITEM_TYPE_MAP.get(type as ItemType)!.icon,
        items: items.map((item) => ({
          id: item.id,
          title: item.name,
          href: `/products`,
          slug: item.slug,
        })),
      }
    })
  }, [categories])

  return (
    <header className="border-b sticky top-0 z-50">
      {/* Top header nav */}
      <nav className="hidden bg-primary p-2 text-primary-foreground md:block">
        <ul className="container mx-auto flex items-center">
          {!isAuthenticated && (
            <li>
              <Link
                to="/login"
                className={buttonVariants({ variant: 'link', size: 'sm', className: 'text-primary-foreground!' })}
              >
                Đăng nhập hệ thống <ArrowUpRightIcon size={14} />
              </Link>
            </li>
          )}
          <li>
            <Link
              to="/"
              hash="about-us"
              className={buttonVariants({ variant: 'link', size: 'sm', className: 'text-primary-foreground!' })}
            >
              Về chúng tôi <ArrowUpRightIcon size={14} />
            </Link>
          </li>
          <li>
            <Link
              to="/"
              hash="contact-us"
              className={buttonVariants({ variant: 'link', size: 'sm', className: 'text-primary-foreground!' })}
            >
              Liên hệ <ArrowUpRightIcon size={14} />
            </Link>
          </li>
          <li>
            <Link
              to="/policies"
              className={buttonVariants({ variant: 'link', size: 'sm', className: 'text-primary-foreground!' })}
            >
              Chính sách <ArrowUpRightIcon size={14} />
            </Link>
          </li>
          <li className="ml-auto">
            <a
              href="https://www.facebook.com/su.studio.dance"
              aria-label="Theo dõi Diamond Studio trên Facebook"
              title="Facebook"
              className={buttonVariants({
                variant: 'ghost',
                size: 'icon',
                className: 'focus-visible:ring-2 focus-visible:ring-offset-2',
              })}
            >
              <FaceBookIcon className="size-5" strokeWidth={2} aria-hidden="true" />
            </a>
          </li>
          <li>
            <a
              href="#"
              aria-label="Theo dõi Diamond Studio trên Instagram"
              title="Instagram"
              className={buttonVariants({
                variant: 'ghost',
                size: 'icon',
                className: 'focus-visible:ring-2 focus-visible:ring-offset-2',
              })}
            >
              <InstagramIcon className="size-5" strokeWidth={2} aria-hidden="true" />
            </a>
          </li>
        </ul>
      </nav>
      {/* Main header nav */}
      <nav className="bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center gap-2 p-2 sm:gap-4">
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger
                render={
                  <Button size="icon" variant="ghost" aria-label="Mở menu điều hướng">
                    <MenuIcon className="size-5" />
                  </Button>
                }
              />
              <SheetContent side="left" className="w-[min(92vw,420px)] p-0">
                <SheetHeader>
                  <SheetTitle className="font-serif text-2xl text-primary font-medium">Diamond Studio</SheetTitle>
                </SheetHeader>
                <nav className="space-y-6 px-4 pb-6">
                  <ul className="space-y-1">
                    <li>
                      <Link to="/" className={buttonVariants({ variant: 'ghost', className: 'w-full justify-start' })}>
                        <HomeIcon size={16} /> Trang chủ
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/products"
                        className={buttonVariants({ variant: 'ghost', className: 'w-full justify-start' })}
                      >
                        <SparklesIcon className="size-4" /> Sản phẩm
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/"
                        hash="xu-huong"
                        className={buttonVariants({ variant: 'ghost', className: 'w-full justify-start' })}
                      >
                        <GiftIcon className="size-4" /> Ưu đãi
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/policies"
                        className={buttonVariants({ variant: 'ghost', className: 'w-full justify-start' })}
                      >
                        <FileTextIcon />
                        Chính sách
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/login"
                        className={buttonVariants({ variant: 'ghost', className: 'w-full justify-start' })}
                      >
                        <LogInIcon />
                        Đăng nhập hệ thống
                      </Link>
                    </li>
                  </ul>
                  <Separator />
                  <div className="flex flex-col space-y-6">
                    <Typography variant="h4" className="font-medium">
                      Danh mục sản phẩm
                    </Typography>
                    <div className="space-y-6">
                      {categoryGroups.map((group) => (
                        <div className="flex flex-col space-y-2" key={group.id}>
                          <Typography variant="small" className="text-muted-foreground">
                            {group.label}
                          </Typography>
                          <ul className="space-y-px">
                            {group.items.map((item) => (
                              <li key={item.id}>
                                <Link
                                  to={item.href}
                                  search={{ item_type: group.id as ItemType, 'category_slug:eq': item.slug }}
                                  className={buttonVariants({ variant: 'ghost', className: 'w-full justify-start' })}
                                >
                                  {item.title}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          <Link
            to="/"
            className="inline-flex items-center gap-1 px-1 text-lg font-bold font-serif text-primary hover:drop-shadow-[0_0_4px_var(--primary-foreground)] sm:px-2 sm:text-xl"
          >
            Diamond Studio
          </Link>
          {/* Navigation menu */}
          <NavigationMenu className="hidden lg:block">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink render={<Link to="/" className="font-medium" />}>
                  <HomeIcon size={16} /> Trang chủ
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="gap-2">
                  <NotepadTextIcon size={16} /> Danh mục
                </NavigationMenuTrigger>
                <NavigationMenuContent
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${categoryGroups.length}, 1fr)`,
                    gap: 24,
                    width: 'fit-content',
                  }}
                >
                  {categoryGroups.map((group) => (
                    <div className="space-y-3" key={group.id}>
                      <Typography variant="small" className="inline-flex items-center gap-2 font-medium px-2">
                        {group.label}
                      </Typography>

                      <ul>
                        {group.items.map((item) => (
                          <li key={item.id}>
                            <NavigationMenuLink
                              render={
                                <Link
                                  to={item.href}
                                  search={{ item_type: group.id as ItemType, 'category_slug:eq': item.slug }}
                                />
                              }
                              className="text-muted-foreground hover:text-primary"
                            >
                              {item.title}
                            </NavigationMenuLink>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink render={<Link to="/products" className="font-medium" preload="render" />}>
                  <SparklesIcon className="size-4" />
                  Sản phẩm
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink render={<Link to="/" hash="xu-huong" className="font-medium" />}>
                  <GiftIcon className="size-4" />
                  Ưu đãi
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          {/* Search command dialog and Cart / User controls */}
          <div className="ml-auto flex items-center gap-2">
            <SearchDialog />

            <Link
              to={isAuthenticated ? '/cart' : '/login'}
              onClick={() => {
                if (!isAuthenticated) {
                  toast.error('Vui lòng đăng nhập để xem giỏ hàng.')
                }
              }}
              className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), "relative")}
              aria-label="Xem giỏ hàng"
            >
              <ShoppingBagIcon className="size-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {cartCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button size="icon" variant="ghost" className="rounded-full overflow-hidden border size-8 p-0">
                      {user?.avatar ? (
                        <img src={user.avatar} alt={user.display_name} className="size-full object-cover" />
                      ) : (
                        <UserIcon className="size-5" />
                      )}
                    </Button>
                  }
                />
                <DropdownMenuContent align="end" className="min-w-48">
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-b mb-1">
                    Xin chào, {user?.display_name || user?.username}
                  </div>
                  <DropdownMenuItem
                    onClick={() => setIsProfileOpen(true)}
                    className="cursor-pointer"
                  >
                    Chỉnh sửa thông tin
                  </DropdownMenuItem>
                  {user?.role === 'USER' ? (
                    <>
                      <DropdownMenuItem render={<Link to="/my-orders" search={{ method: 'RENT' }} />}>
                        Lịch sử thuê đồ
                      </DropdownMenuItem>
                      <DropdownMenuItem render={<Link to="/my-orders" search={{ method: 'BUY' }} />}>
                        Lịch sử mua hàng
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem render={<Link to="/statistics" />}>
                      Quản trị hệ thống
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => logout()} variant="destructive">
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </div>
        </div>
      </nav>
      <EditProfileDialog open={isProfileOpen} onOpenChange={setIsProfileOpen} />
    </header>
  )
}

export default Header
