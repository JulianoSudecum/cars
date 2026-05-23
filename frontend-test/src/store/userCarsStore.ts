import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { NormalizedCar } from '@/domain/types';

interface UserCarsState {
  /** Carros cadastrados localmente pelo usuário (source: 'local'). */
  cars: NormalizedCar[];
  addCar: (car: NormalizedCar) => void;
  removeCar: (id: number) => void;
  reset: () => void;
}

/**
 * Persistência dos cadastros via localStorage (middleware persist do Zustand).
 * A abstração concentra o ponto de troca: para usar uma API real no futuro,
 * basta substituir as ações por mutations sem mudar os consumidores.
 */
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
