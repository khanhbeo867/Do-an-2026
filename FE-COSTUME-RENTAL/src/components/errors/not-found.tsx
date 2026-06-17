import { HttpStatusCode } from '@/common/constants/http-code'
import { ArrowLeft } from 'lucide-react'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'
import { Typography } from '../ui/typography'

export const NotFoundPage: React.FC = () => {
  return (
    <div className="grid min-h-screen place-items-center px-6 py-24 sm:py-32 xl:px-8">
      <div>
        <div className="flex items-center gap-x-4">
          <Typography color="destructive" className="font-semibold">
            {HttpStatusCode.NOT_FOUND}
          </Typography>
          <Separator orientation="vertical" className="h-5 w-0.5" />
          <Typography variant="h4">Không tìm thấy trang bạn yêu cầu</Typography>
        </div>
        <Typography variant="p" className="mt-2 mb-6 text-base leading-7" color="muted">
          Trang không tồn tại. Vui lòng kiểm tra lại đường dẫn.
        </Typography>
        <Button variant="link" onClick={() => window.history.back()} className="p-0">
          <ArrowLeft />
          Quay lại
        </Button>
      </div>
    </div>
  )
}
