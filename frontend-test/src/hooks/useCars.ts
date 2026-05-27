import { useQuery } from '@tanstack/react-query';
import { fetchCars } from '@/services/carsApi';

export const carsQueryKey = ['cars'] as const;

export function useCars() {
  return useQuery({
    queryKey: carsQueryKey,
    queryFn: ({ signal }) => fetchCars(signal),
  });
}
