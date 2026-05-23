import { useQuery } from '@tanstack/react-query';
import { fetchCars } from '@/services/carsApi';

export const carsQueryKey = ['cars'] as const;

/** Busca o catálogo remoto (com cache do React Query). */
export function useCars() {
  return useQuery({
    queryKey: carsQueryKey,
    queryFn: ({ signal }) => fetchCars(signal),
  });
}
