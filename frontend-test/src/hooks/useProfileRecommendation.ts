import { useMutation } from '@tanstack/react-query';
import type { ProfileRecommendRequest } from '@/domain/ai';
import { requestProfileRecommendation } from '@/services/aiClient';

/** Mutation do React Query para o assistente de perfil. */
export function useProfileRecommendation() {
  return useMutation({
    mutationFn: (payload: ProfileRecommendRequest) => requestProfileRecommendation(payload),
  });
}
