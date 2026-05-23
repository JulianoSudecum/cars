import { QueryClient } from '@tanstack/react-query';

/**
 * Cliente único do React Query. Os dados do catálogo mudam pouco,
 * então usamos um staleTime generoso para evitar refetches desnecessários.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 min
      gcTime: 1000 * 60 * 30, // 30 min
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
