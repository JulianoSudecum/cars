import type { ProfileRecommendRequest, ProfileRecommendResponse } from '@/domain/ai';

export class AiRequestError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'AiRequestError';
    this.status = status;
  }
}

export async function requestProfileRecommendation(
  payload: ProfileRecommendRequest,
  signal?: AbortSignal,
): Promise<ProfileRecommendResponse> {
  const res = await fetch('/api/profile-recommend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  });

  if (!res.ok) {
    let message = 'Não foi possível gerar recomendações.';
    try {
      const data = (await res.json()) as { error?: string };
      if (data?.error) message = data.error;
    } catch {
      // sem corpo JSON
    }
    throw new AiRequestError(message, res.status);
  }

  try {
    return (await res.json()) as ProfileRecommendResponse;
  } catch {
    throw new AiRequestError('Resposta inválida do servidor.', res.status);
  }
}
