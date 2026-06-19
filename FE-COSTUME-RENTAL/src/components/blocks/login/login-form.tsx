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

type PrefillCredentials = { username: string; password: string } | null

const LoginFormContent = ({
  onSwitchToRegister,
  prefillCredentials,
}: {
  onSwitchToRegister: () => void
  prefillCredentials: PrefillCredentials
}) => {
  const [isPending, setIsPending] = useState(false)
  const loginFn = useServerFn(loginRpc)
  const router = useRouter()

  const form = useForm({
    defaultValues: {
      username: prefillCredentials?.username || '',
      password: prefillCredentials?.password || '',
    },
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

const RegisterFormContent = ({
  onSwitchToLogin,
}: {
  onSwitchToLogin: (credentials: PrefillCredentials) => void
}) => {
  const [isPending, setIsPending] = useState(false)
  const registerFn = useServerFn(registerRpc)

  const form = useForm({
    defaultValues: { email: '', phone: '', username: '', password: '', confirmPassword: '' },
    validators: { onSubmit: registerSchema },
    onSubmit: async ({ value }) => {
      try {
        setIsPending(true)
        await registerFn({ data: value })
        toast.success('Đăng ký tài khoản thành công! Vui lòng đăng nhập.')
        onSwitchToLogin({ username: value.username, password: value.password })
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
            <InputFieldControl field={field} type="text" label="Email" placeholder="example@gmail.com" />
          )}
        </FormField>
        <FormField name="phone">
          {(field) => (
            <InputFieldControl field={field} type="tel" label="Số điện thoại" placeholder="Nhập số điện thoại" />
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
          onClick={() => onSwitchToLogin(null)}
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
  const [isRegistering, setIsRegistering] = useState(false)
  const [prefillCredentials, setPrefillCredentials] = useState<PrefillCredentials>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSwitchToLogin = (credentials: PrefillCredentials) => {
    setIsRegistering(false)
    setPrefillCredentials(credentials)
  }

  const handleSwitchToRegister = () => {
    setIsRegistering(true)
    setPrefillCredentials(null)
  }

  if (!mounted) {
    return (
      <div className="h-40 flex items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (isRegistering) {
    return <RegisterFormContent onSwitchToLogin={handleSwitchToLogin} />
  }

  return (
    <LoginFormContent
      key={prefillCredentials?.username ?? 'empty'}
      onSwitchToRegister={handleSwitchToRegister}
      prefillCredentials={prefillCredentials}
    />
  )
}

export default LoginForm

