import { useMutation } from '@tanstack/react-query';
import type { ProfileRecommendRequest } from '@/domain/ai';
import { requestProfileRecommendation } from '@/services/aiClient';

export function useProfileRecommendation() {
  return useMutation({
    mutationFn: (payload: ProfileRecommendRequest) => requestProfileRecommendation(payload),
  });
}
