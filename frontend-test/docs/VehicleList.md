# `<VehicleList />`

Listagem de veículos **agrupada por marca** (ou por qualquer chave), responsiva e acessível.

É um componente **apresentacional puro**: ele não busca dados nem conhece React Query, localStorage ou rotas. Recebe a lista e os estados de UI por props. Isso o torna reutilizável em qualquer tela ou projeto — basta fornecer os dados no formato `NormalizedCar`.

> Há uma demonstração interativa rodando em `/componente` na aplicação.

---

## Importação

```tsx
import { VehicleList } from '@/components/vehicle/VehicleList';
import type { VehicleListProps, VehicleListColumns } from '@/components/vehicle/VehicleList';
```

## Uso básico

```tsx
function MinhaTela() {
  const { data, isLoading } = useCars(); // sua fonte de dados

  return (
    <VehicleList
      cars={data ?? []}
      loading={isLoading}
      onSelect={(car) => console.log('selecionado', car)}
    />
  );
}
```

Por padrão, o componente agrupa por marca, renderiza em até 3 colunas e usa o card interno `<VehicleCard />`.

---

## Propriedades

| Prop            | Tipo                                        | Padrão        | Descrição                                                                 |
| --------------- | ------------------------------------------- | ------------- | ------------------------------------------------------------------------- |
| `cars`          | `NormalizedCar[]`                           | — (obrigatório) | Veículos a serem exibidos.                                              |
| `groupBy`       | `'brand' \| 'none' \| (car) => string`      | `'brand'`     | Estratégia de agrupamento. `'none'` exibe um grid único; uma função define a chave. |
| `columns`       | `1 \| 2 \| 3 \| 4`                          | `3`           | Máximo de colunas no grid (responsivo, mobile-first).                     |
| `loading`       | `boolean`                                   | `false`       | Exibe esqueletos de carregamento.                                        |
| `skeletonCount` | `number`                                    | `6`           | Quantidade de skeletons exibidos no loading.                             |
| `error`         | `ReactNode`                                 | —             | Conteúdo de erro. Quando definido, **tem precedência** sobre todo o resto. |
| `emptyState`    | `ReactNode`                                 | `<EmptyState>`| Exibido quando `cars` está vazio e não está carregando.                  |
| `renderCard`    | `(car: NormalizedCar) => ReactNode`         | `<VehicleCard>` | Renderização customizada de cada card.                                 |
| `groupHeader`   | `(key: string, cars: NormalizedCar[]) => ReactNode` | —     | Cabeçalho customizado de cada grupo.                                      |
| `onSelect`      | `(car: NormalizedCar) => void`              | —             | Disparado ao acionar um card (repassado ao card padrão).                |
| `className`     | `string`                                    | —             | Classes adicionais no container.                                         |

### O tipo `NormalizedCar`

```ts
interface NormalizedCar {
  id: number;
  modeloId: number;
  nomeModelo: string;
  ano: number;
  combustivel: string;
  numPortas: number;
  cor: string;
  valor: number;            // em reais
  quilometragem?: number;
  descricao?: string;
  timestampCadastro?: number;
  brandId: number | null;
  brandName: string;
  source: 'remote' | 'local';
}
```

---

## Comportamento esperado

A renderização segue esta precedência:

1. **`error`** definido → renderiza apenas o conteúdo de erro.
2. **`loading`** verdadeiro → renderiza `skeletonCount` esqueletos no grid.
3. **`cars` vazio** → renderiza `emptyState` (ou um vazio padrão).
4. Caso contrário → renderiza os grupos.

Outros detalhes:

- **Agrupamento**: grupos são ordenados alfabeticamente; o grupo `"Marca não informada"` sempre vai por último.
- **Acessibilidade**: cada grupo é uma `<section aria-label>` com um `<h2>`; a grade de cards usa marcação de lista (`<ul>/<li>`). No loading, o container expõe `aria-busy`.
- **Responsividade**: `columns` define o máximo em telas grandes; em telas menores o grid reduz automaticamente (1 coluna no mobile).
- **Performance**: o agrupamento é memoizado (`useMemo`) e recalculado apenas quando `cars` ou `groupBy` mudam.

---

## Exemplos

### Estados de carregamento e erro

```tsx
<VehicleList
  cars={data ?? []}
  loading={isLoading}
  error={isError ? <ErrorState onRetry={refetch} /> : undefined}
  emptyState={<EmptyState title="Nenhum veículo" />}
/>
```

### Sem agrupamento, em 4 colunas

```tsx
<VehicleList cars={cars} groupBy="none" columns={4} />
```

### Agrupando por uma chave customizada

```tsx
<VehicleList cars={cars} groupBy={(car) => `${car.ano}`} />
```

### Card e cabeçalho de grupo customizados

```tsx
<VehicleList
  cars={cars}
  groupBy={(car) => car.combustivel}
  renderCard={(car) => <MeuCardPremium car={car} />}
  groupHeader={(combustivel, itens) => (
    <header className="mb-2">
      <h2>{combustivel}</h2>
      <span>{itens.length} disponíveis</span>
    </header>
  )}
/>
```

> Ao usar `renderCard`, o `onSelect` deixa de ser cabeado automaticamente — chame-o dentro do seu card, se necessário.

---

## Possibilidades de customização

- **Visual dos cards**: via `renderCard` (controle total) ou estilizando o `<VehicleCard />` interno.
- **Layout**: `columns` e `className`.
- **Agrupamento**: por marca, sem agrupamento, ou qualquer função `(car) => string` (ano, faixa de preço, combustível…).
- **Estados**: `loading`, `error` e `emptyState` totalmente plugáveis com seus próprios componentes.
- **Cabeçalhos de grupo**: via `groupHeader` (ex.: adicionar contagem, ações, ícones).

---

## Dependências internas

O componente reutiliza `groupCars` (`src/domain/grouping.ts`) para a lógica de agrupamento — uma função pura e testada, que pode ser usada isoladamente caso você precise dos grupos sem a UI.
