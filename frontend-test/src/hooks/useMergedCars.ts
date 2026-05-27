import { useMemo } from 'react';
import { useUserCarsStore } from '@/store/userCarsStore';
import type { NormalizedCar } from '@/domain/types';
import { useCars } from './useCars';

export function useMergedCars() {
  const query = useCars();
  const userCars = useUserCarsStore((s) => s.cars);

  const cars = useMemo<NormalizedCar[]>(
    () => [...userCars, ...(query.data ?? [])],
    [query.data, userCars],
  );

  return {
    cars,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
