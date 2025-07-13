"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { useState } from "react"

interface QueryProviderProps {
  children: React.ReactNode
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Stale time for agent responses (5 minutes)
            staleTime: 5 * 60 * 1000,
            // Cache time for agent responses (10 minutes)
            gcTime: 10 * 60 * 1000,
            // Don't retry failed requests by default for agents
            retry: (failureCount, error: any) => {
              // Don't retry 4xx errors
              if (error?.status >= 400 && error?.status < 500) {
                return false
              }
              // Retry up to 2 times for other errors
              return failureCount < 2
            },
            // Refetch on window focus for real-time updates
            refetchOnWindowFocus: false,
            // Don't refetch on reconnect for agents
            refetchOnReconnect: false,
          },
          mutations: {
            // Retry mutations once for network errors
            retry: (failureCount, error: any) => {
              if (error?.status >= 400 && error?.status < 500) {
                return false
              }
              return failureCount < 1
            },
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}
