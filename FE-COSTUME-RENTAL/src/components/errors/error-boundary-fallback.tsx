import { HttpStatusCode } from '@/common/constants/http-code'
import { FetchError } from '@/common/errors'
import { useRouter } from '@tanstack/react-router'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Icon } from '../ui/icon'
import { Separator } from '../ui/separator'
import { Typography } from '../ui/typography'

interface ErrorBoundaryFallbackProps {
  error: unknown
  resetError?: (...args: any[]) => void
}

export const ErrorBoundaryFallback: React.FC<ErrorBoundaryFallbackProps> = ({
  error,
  resetError,
}): React.ReactElement => {
  const router = useRouter()

  return (
    <div className="grid h-(--outlet-wrapper-height,100vh) place-items-center px-6 py-24 sm:py-32 xl:px-8">
      <div>
        <div className="flex items-center gap-x-4">
          <Typography color="destructive" className="font-semibold">
            {error instanceof FetchError ? error.status : HttpStatusCode.INTERNAL_SERVER_ERROR}
          </Typography>
          <Separator orientation="vertical" className="h-5 w-0.5" />
          <Typography variant="h4">Đã có lỗi xảy ra</Typography>
        </div>
        <Typography variant="p" className="mt-2 mb-6 text-base leading-7" color="muted">
          {error instanceof FetchError
            ? error.message
            : `Xin lỗi vì sự bất tiện này. Nếu vấn đề vẫn tiếp diễn, vui lòng liên hệ với bộ phận hỗ trợ của chúng tôi. Chúng
          tôi sẽ cố gắng khắc phục sự cố này càng sớm càng tốt. Cảm ơn bạn đã thông cảm và kiên nhẫn. Chúng tôi đánh giá
          cao sự hỗ trợ của bạn trong việc cải thiện dịch vụ của chúng tôi. Chúng tôi sẽ thông báo cho bạn khi vấn đề đã
          được giải quyết.`}
        </Typography>
        <Dialog>
          <DialogTrigger
            render={
              <Button variant="link" className="p-0">
                Chi tiết lỗi
              </Button>
            }
          />
          <DialogContent className="w-full max-w-4xl">
            <DialogHeader>
              <DialogTitle className="text-destructive">Error</DialogTitle>
            </DialogHeader>
            <div className="overflow-y-auto scrollbar-none! max-h-96 prose">
              <Typography color="muted" className="font-medium">
                {(error as Error)?.stack}
              </Typography>
            </div>
          </DialogContent>
        </Dialog>
        <div className="mt-6">
          <Button
            onClick={() => {
              if (typeof resetError === 'function') resetError()
              router.invalidate()
            }}
          >
            <Icon name={'Redo'} />
            Thử lại
          </Button>
        </div>
      </div>
    </div>
  )
}
