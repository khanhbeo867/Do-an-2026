import { Button } from '@/components/ui/button'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_private-layout/dashboard')({
  head: () => ({
    meta: [
      { title: 'Dashboard vận hành' },
      {
        name: 'description',
        content: 'Tổng quan vận hành hệ thống thuê và mua trang phục theo thời gian thực.',
      },
    ],
  }),
  component: App,
})

function App() {
  return (
    <div className="flex min-h-svh p-6">
      <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
        <div>
          <h1 className="font-medium">Project ready!</h1>
          <p>You may now add components and start building.</p>
          <p>We&apos;ve already added the button component for you.</p>
          <Button className="mt-2">Button</Button>
        </div>
      </div>
    </div>
  )
}
