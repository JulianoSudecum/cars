import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { NormalizedCar } from '@/domain/types';

interface UserCarsState {
  cars: NormalizedCar[];
  addCar: (car: NormalizedCar) => void;
  removeCar: (id: number) => void;
  reset: () => void;
}

export const useUserCarsStore = create<UserCarsState>()(
  persist(
    (set) => ({
      cars: [],
      addCar: (car) => set((state) => ({ cars: [car, ...state.cars] })),
      removeCar: (id) => set((state) => ({ cars: state.cars.filter((c) => c.id !== id) })),
      reset: () => set({ cars: [] }),
    }),
    { name: 'autocatalogo:user-cars', version: 1 },
  ),
);
