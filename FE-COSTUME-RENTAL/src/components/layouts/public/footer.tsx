import { contactInfo } from '@/assets/data/contact-us'
import { FaceBookIcon } from '@/assets/svg/facebook-icon'
import { InstagramIcon } from '@/assets/svg/instagram-icon'
import { buttonVariants } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Separator } from '@/components/ui/separator'
import { Link } from '@tanstack/react-router'
import React from 'react'

const Footer: React.FC = () => {
  return (
    <footer className="mt-auto grid overflow-hidden border-primary lg:grid-cols-2">
      {/* Footer main */}
      <div className="space-y-6 bg-primary p-4 text-primary-foreground sm:p-6 lg:p-8 xl:p-10 xxl:p-16">
        <div className="space-y-6 mb-12!">
          <h1 className="text-2xl font-semibold font-serif sm:text-3xl">Diamond Studio</h1>
          <p className="text-sm text-input">
            Tôn vinh bản sắc văn hóa Việt Nam qua từng bộ sưu tập áo dài độc đáo và chất lượng hàng đầu. Hãy để chúng
            tôi giúp bạn tỏa sáng và thể hiện bản sắc riêng của mình qua những thiết kế áo dài tinh tế và đẳng cấp.
          </p>
        </div>
        {/* Contact */}
        <ul className="mb-12! grid grid-cols-1 gap-x-4 gap-y-2 text-sm sm:grid-cols-2 xl:mb-16! xl:grid-cols-2">
          {contactInfo.map((info) => (
            <li key={info.title} className="flex items-start gap-x-2">
              <Icon name={info.icon} /> {info.description}
            </li>
          ))}
        </ul>
        <Separator />
        {/* Navigation */}
        <nav>
          <ul className="flex flex-wrap items-center gap-x-1 gap-y-1 sm:gap-x-2">
            <li>
              <Link
                to="/"
                className={buttonVariants({ variant: 'link', className: 'text-input! hover:text-primary-foreground!' })}
              >
                Trang chủ
              </Link>
            </li>
            <li>
              <Link
                to="/products"
                className={buttonVariants({ variant: 'link', className: 'text-input! hover:text-primary-foreground!' })}
              >
                Sản phẩm
              </Link>
            </li>
            <li>
              <Link
                to="/"
                hash="about-us"
                className={buttonVariants({ variant: 'link', className: 'text-input! hover:text-primary-foreground!' })}
              >
                Về chúng tôi
              </Link>
            </li>
            <li>
              <Link
                to="/"
                hash="contact-us"
                className={buttonVariants({ variant: 'link', className: 'text-input! hover:text-primary-foreground!' })}
              >
                Liên hệ
              </Link>
            </li>
            <li>
              <Link
                to="/policies"
                className={buttonVariants({ variant: 'link', className: 'text-input! hover:text-primary-foreground!' })}
              >
                Chính sách
              </Link>
            </li>
            <li>
              <Link
                to="/login"
                className={buttonVariants({ variant: 'link', className: 'text-input! hover:text-primary-foreground!' })}
              >
                Đăng nhập
              </Link>
            </li>
          </ul>
        </nav>
        <Separator />
        {/* Copyright & Social */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <small>© Copyright 2026, Diamond Studio</small>
          <ul className="flex items-center sm:ml-auto">
            <li>
              <a
                href=""
                className={buttonVariants({
                  variant: 'ghost',
                  size: 'icon',
                  className: 'hover:bg-primary [&:hover_svg]:stroke-primary-foreground',
                })}
              >
                <FaceBookIcon className="size-5" strokeWidth={2} />
              </a>
            </li>
            <li>
              <a
                href=""
                className={buttonVariants({
                  variant: 'ghost',
                  size: 'icon',
                  className: 'hover:bg-primary [&:hover_svg]:stroke-primary-foreground',
                })}
              >
                <InstagramIcon className="size-5" strokeWidth={2} />
              </a>
            </li>
          </ul>
        </div>
      </div>
      {/* Footer image */}
      <div className="relative hidden h-full w-full bg-[url(/footer-img.jpg)] bg-cover bg-bottom bg-no-repeat lg:block">
        <div className="bg-white/30 backdrop-sepia-[2] inset-0 absolute" />
      </div>
    </footer>
  )
}

export default Footer
