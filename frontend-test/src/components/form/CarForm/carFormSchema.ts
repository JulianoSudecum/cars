import { z } from 'zod';
import { DOOR_OPTIONS, FUEL_OPTIONS } from '@/domain/constants';

const currentYear = new Date().getFullYear();

export const carFormSchema = z.object({
  marca: z.string().trim().min(2, 'Informe a marca').max(40, 'Máximo de 40 caracteres'),
  nomeModelo: z.string().trim().min(1, 'Informe o modelo').max(60, 'Máximo de 60 caracteres'),
  ano: z
    .number({ required_error: 'Informe o ano', invalid_type_error: 'Informe o ano' })
    .int('Ano inválido')
    .min(1900, 'Ano muito antigo')
    .max(currentYear + 1, `No máximo ${currentYear + 1}`),
  valor: z
    .number({ required_error: 'Informe o valor', invalid_type_error: 'Informe o valor' })
    .positive('O valor deve ser maior que zero')
    .max(100_000_000, 'Valor muito alto'),
  combustivel: z
    .string()
    .min(1, 'Selecione o combustível')
    .refine((v) => (FUEL_OPTIONS as readonly string[]).includes(v), 'Combustível inválido'),
  numPortas: z
    .number({ required_error: 'Selecione o nº de portas', invalid_type_error: 'Selecione o nº de portas' })
    .refine((n) => (DOOR_OPTIONS as readonly number[]).includes(n), 'Selecione o nº de portas'),
  cor: z.string().trim().min(2, 'Informe a cor').max(30, 'Máximo de 30 caracteres'),
  quilometragem: z
    .number({ invalid_type_error: 'Quilometragem inválida' })
    .int('Quilometragem inválida')
    .min(0, 'Não pode ser negativa')
    .max(2_000_000, 'Valor muito alto')
    .optional(),
  descricao: z.string().trim().max(500, 'Máximo de 500 caracteres').optional(),
});

export type CarFormValues = z.infer<typeof carFormSchema>;
