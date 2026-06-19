import { buttonVariants } from '@/components/ui/button'
import { Typography } from '@/components/ui/typography'
import { Link } from '@tanstack/react-router'
import { ArrowLeftIcon } from 'lucide-react'
import LoginForm from './login-form'

const LoginPage: React.FC = () => {
  return (
    <div className="h-screen w-screen overflow-hidden bg-muted p-2 md:max-xl:p-4 xl:p-6">
      <div className="mx-auto grid h-full max-w-7xl grid-cols-1 overflow-clip rounded-lg border bg-background lg:grid-cols-2">
        <div className="relative hidden flex-col justify-end p-6 lg:flex">
          <div className="absolute inset-0 hidden h-full w-full bg-[url(/our-story.jpg)] bg-cover bg-bottom-right bg-no-repeat lg:block">
            <div className=" backdrop-grayscale-[200] inset-0 absolute" />
          </div>
          <Typography
            variant="blockquote"
            className="relative z-10 text-white animate-in fade-in-50 blur-in-sm duration-500 slide-in-from-bottom-10 ease-out"
          >
            Trang phục đẹp không chỉ làm nổi bật dáng hình, mà còn kể câu chuyện văn hoá của chính bạn.
          </Typography>
        </div>
        <div className="relative scrollbar-none flex flex-col items-center justify-between overflow-auto p-6">
          <div className="place-content-end self-end">
            <Link to="/" className={buttonVariants({ variant: 'ghost' })}>
              <ArrowLeftIcon /> Quay lại
            </Link>
          </div>
          <div className="w-full max-w-lg mx-auto px-6 relative h-full flex-1 place-content-center space-y-10">
            <div className="flex justify-center flex-col text-center gap-2">
              <img src="/logo.svg" className="size-12 object-contain self-center mb-4" alt="Diamond Studio Logo" />
              <Typography variant="h1" color="primary" className="font-serif">
                Diamond Studio
              </Typography>
              <Typography variant="small" className="text-pretty max-w-sm mx-auto">
                Hệ thống quản lý cho thuê áo dài thiết kế và trang phục truyền thống cao cấp.
              </Typography>
            </div>
            <LoginForm />
          </div>
          <div className="flex flex-col items-center gap-6 p-6">
            <Typography color="muted" variant="small" className="text-center">
              &copy; {new Date().getFullYear()} copyright by FIT Vimaru. All rights reserved.
            </Typography>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
