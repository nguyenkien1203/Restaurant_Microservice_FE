import {
  Outlet,
  createRootRouteWithContext,
  useRouterState,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import Header from '../components/Header'

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'
import { Footer } from '../components/footer'
import { SessionExpiredModal } from '../components/ui/session-expired-modal'
import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootComponent,
})

function RootComponent() {
  const router = useRouterState()
  const isAdminRoute = router.location.pathname.startsWith('/admin')

  return (
    <>
      {!isAdminRoute && <Header />}
      <Outlet />
      {!isAdminRoute && <Footer />}
      {/* Session Expired Modal - shows globally when session expires */}
      <SessionExpiredModal />
      <TanStackDevtools
        config={{
          position: 'bottom-right',
        }}
        plugins={[
          {
            name: 'Tanstack Router',
            render: <TanStackRouterDevtoolsPanel />,
          },
          TanStackQueryDevtools,
        ]}
      />
    </>
  )
}
