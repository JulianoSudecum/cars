import type { CarFormValues } from '@/components/form/CarForm/carFormSchema';
import type { NormalizedCar } from '@/domain/types';

function titleCase(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/(^|\s)\S/g, (m) => m.toUpperCase());
}

let localSeq = 0;
function nextLocalId(): number {
  return Date.now() * 100 + (localSeq++ % 100);
}

export function createUserCar(values: CarFormValues): NormalizedCar {
  return {
    id: nextLocalId(),
    modeloId: 0,
    nomeModelo: values.nomeModelo.trim(),
    ano: values.ano,
    combustivel: values.combustivel.toUpperCase(),
    numPortas: values.numPortas,
    cor: titleCase(values.cor),
    valor: values.valor,
    quilometragem: values.quilometragem,
    descricao: values.descricao?.trim() || undefined,
    timestampCadastro: Math.floor(Date.now() / 1000),
    brandId: null,
    brandName: titleCase(values.marca),
    source: 'local',
  };
}
