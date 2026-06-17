import { loginRpc, registerRpc } from '@/apis/auth/rpc'
import { loginSchema } from '@/apis/auth/schemas/login.schema'
import { registerSchema } from '@/apis/auth/schemas/register.schema'
import InputFieldControl from '@/components/forms/input-field-control'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useForm } from '@tanstack/react-form'
import { useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { LogIn, UserPlus } from 'lucide-react'
import { useState, useEffect, type SubmitEventHandler } from 'react'
import { toast } from 'sonner'

const LoginFormContent = ({ onSwitchToRegister }: { onSwitchToRegister: () => void }) => {
  const [isPending, setIsPending] = useState(false)
  const loginFn = useServerFn(loginRpc)
  const router = useRouter()

  const form = useForm({
    defaultValues: { username: '', password: '' },
    validators: { onSubmit: loginSchema },
    onSubmit: async ({ value }) => {
      try {
        setIsPending(true)
        const response = await loginFn({ data: value })
        toast.success('Đăng nhập thành công')
        if (response?.user?.role === 'USER') {
          router.navigate({ to: '/' })
        } else {
          router.navigate({ to: '/statistics' })
        }
      } catch (err: any) {
        toast.error(err?.message || 'Tài khoản hoặc mật khẩu không chính xác')
      } finally {
        setIsPending(false)
      }
    },
  })

  const { Field: FormField } = form

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault()
    form.handleSubmit()
  }

  return (
    <div className="space-y-4 w-full">
      <form className="space-y-4 z-10 bg-card" onSubmit={handleSubmit}>
        <FormField name="username">
          {(field) => (
            <InputFieldControl field={field} type="text" label="Tài khoản" placeholder="Nhập email hoặc tài khoản" />
          )}
        </FormField>
        <FormField name="password">
          {(field) => (
            <InputFieldControl field={field} type="password" label="Mật khẩu" placeholder="******" />
          )}
        </FormField>
        <Button className="w-full" size="lg" type="submit" disabled={isPending}>
          {isPending ? <Spinner /> : <LogIn />}
          {isPending ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </Button>
      </form>
      <div className="text-center text-sm">
        Chưa có tài khoản?{' '}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="text-primary hover:underline font-semibold cursor-pointer"
        >
          Đăng ký tài khoản
        </button>
      </div>
    </div>
  )
}

const RegisterFormContent = ({ onSwitchToLogin }: { onSwitchToLogin: () => void }) => {
  const [isPending, setIsPending] = useState(false)
  const registerFn = useServerFn(registerRpc)

  const form = useForm({
    defaultValues: { email: '', username: '', password: '', confirmPassword: '' },
    validators: { onSubmit: registerSchema },
    onSubmit: async ({ value }) => {
      try {
        setIsPending(true)
        await registerFn({ data: value })
        toast.success('Đăng ký tài khoản thành công!')
        onSwitchToLogin()
      } catch (err: any) {
        toast.error(err?.message || 'Đăng ký tài khoản thất bại. Tài khoản hoặc email có thể đã tồn tại.')
      } finally {
        setIsPending(false)
      }
    },
  })

  const { Field: FormField } = form

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault()
    form.handleSubmit()
  }

  return (
    <div className="space-y-4 w-full">
      <form className="space-y-4 z-10 bg-card" onSubmit={handleSubmit}>
        <FormField name="email">
          {(field) => (
            <InputFieldControl field={field} type="email" label="Email" placeholder="example@gmail.com" />
          )}
        </FormField>
        <FormField name="username">
          {(field) => (
            <InputFieldControl field={field} type="text" label="Tài khoản" placeholder="Nhập tên tài khoản" />
          )}
        </FormField>
        <FormField name="password">
          {(field) => (
            <InputFieldControl field={field} type="password" label="Mật khẩu" placeholder="******" />
          )}
        </FormField>
        <FormField name="confirmPassword">
          {(field) => (
            <InputFieldControl field={field} type="password" label="Xác nhận mật khẩu" placeholder="******" />
          )}
        </FormField>
        <Button className="w-full" size="lg" type="submit" disabled={isPending}>
          {isPending ? <Spinner /> : <UserPlus />}
          {isPending ? 'Đang đăng ký...' : 'Đăng ký tài khoản'}
        </Button>
      </form>
      <div className="text-center text-sm">
        Đã có tài khoản?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-primary hover:underline font-semibold cursor-pointer"
        >
          Đăng nhập hệ thống
        </button>
      </div>
    </div>
  )
}

const LoginForm = () => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const [isRegistering, setIsRegistering] = useState(false)

  if (!mounted) {
    return (
      <div className="h-40 flex items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (isRegistering) {
    return <RegisterFormContent onSwitchToLogin={() => setIsRegistering(false)} />
  }

  return <LoginFormContent onSwitchToRegister={() => setIsRegistering(true)} />
}

export default LoginForm
