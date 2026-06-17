import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Icon } from '@/components/ui/icon'
import { toast } from 'sonner'
import useAuth, { useUpdateProfileMutation } from '@/apis/auth/hooks/use-auth-request'

interface EditProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const EditProfileDialog: React.FC<EditProfileDialogProps> = ({ open, onOpenChange }) => {
  const { user } = useAuth()
  const { mutateAsync: updateProfile, isPending } = useUpdateProfileMutation()

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Populate fields when dialog opens
  useEffect(() => {
    if (open && user) {
      setUsername(user.username || '')
      setEmail(user.email || user.employee?.email || '')
      setPassword('')
    }
  }, [open, user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username.trim()) {
      toast.error('Tên đăng nhập không được để trống.')
      return
    }

    try {
      await updateProfile({
        username: username.trim(),
        email: email.trim(),
        password: password ? password : null,
      })
      toast.success('Cập nhật thông tin tài khoản thành công!')
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err?.message || 'Không thể cập nhật thông tin.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] overflow-hidden border border-border/40 bg-background/95 backdrop-blur-md shadow-xl rounded-xl">
        <DialogHeader className="space-y-1">
          <DialogTitle className="font-serif text-xl font-bold flex items-center gap-2 text-foreground">
            <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Icon name="UserPen" size={16} />
            </div>
            Chỉnh sửa thông tin
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Cập nhật tên đăng nhập, email liên hệ và mật khẩu mới của bạn.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Tên đăng nhập
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground/60">
                <Icon name="User" size={16} />
              </div>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-9 h-10 border-border/40 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 bg-background/50"
                placeholder="Nhập tên đăng nhập"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Email liên hệ
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground/60">
                <Icon name="Mail" size={16} />
              </div>
              <Input
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9 h-10 border-border/40 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 bg-background/50"
                placeholder="Nhập email liên hệ (không bắt buộc)"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Mật khẩu mới
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground/60">
                <Icon name="KeyRound" size={16} />
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9 h-10 border-border/40 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 bg-background/50"
                placeholder="Để trống nếu không muốn đổi"
              />
            </div>
          </div>

          <DialogFooter className="pt-4 flex items-center justify-end gap-2 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-9 text-xs px-4 border-border/60 hover:bg-muted"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="h-9 text-xs px-4 bg-primary text-primary-foreground hover:bg-primary/95 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-sm font-semibold"
            >
              {isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
