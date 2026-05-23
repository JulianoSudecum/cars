import { useState, type ReactNode } from 'react';
import { VehicleList, type VehicleListColumns } from '@/components/vehicle/VehicleList';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/toast/toastStore';
import { cn } from '@/lib/cn';
import type { NormalizedCar } from '@/domain/types';

const SAMPLE_CARS: NormalizedCar[] = [
  { id: 1, modeloId: 12, nomeModelo: 'Corolla', ano: 2021, combustivel: 'FLEX', numPortas: 4, cor: 'Prata', valor: 115000, brandId: 1, brandName: 'Toyota', source: 'remote' },
  { id: 2, modeloId: 13, nomeModelo: 'Hilux SW4', ano: 2020, combustivel: 'DIESEL', numPortas: 4, cor: 'Preto', valor: 290000, brandId: 1, brandName: 'Toyota', source: 'remote' },
  { id: 3, modeloId: 14, nomeModelo: 'Onix Plus', ano: 2022, combustivel: 'FLEX', numPortas: 4, cor: 'Branco', valor: 78000, brandId: 2, brandName: 'Chevrolet', source: 'remote' },
  { id: 4, modeloId: 15, nomeModelo: 'Jetta', ano: 2019, combustivel: 'GASOLINA', numPortas: 4, cor: 'Cinza', valor: 95000, brandId: 3, brandName: 'Volkswagen', source: 'local' },
];

export default function ComponentDocsPage() {
  const [columns, setColumns] = useState<VehicleListColumns>(2);
  const [grouped, setGrouped] = useState(true);

  return (
    <div className="flex flex-col gap-10">
      <header>
        <Badge variant="brand">Componente reutilizável</Badge>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">&lt;VehicleList /&gt;</h1>
        <p className="mt-1 max-w-2xl text-slate-500">
          Listagem de veículos agrupada e responsiva. Componente apresentacional: recebe os dados e
          os estados por props, sem buscar nada — o que o torna reutilizável em qualquer tela. A
          documentação completa está em <code className="text-brand-700">docs/VehicleList.md</code>.
        </p>
      </header>

      {/* Demo interativa */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Demonstração interativa</h2>
        <div className="mb-4 flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-600">Colunas:</span>
            {([1, 2, 3, 4] as const).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setColumns(n)}
                className={cn(
                  'h-8 w-8 rounded-md border text-sm font-medium',
                  columns === n
                    ? 'border-brand-600 bg-brand-50 text-brand-700'
                    : 'border-slate-300 text-slate-600 hover:bg-slate-50',
                )}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-600">Agrupar por marca:</span>
            <Button size="sm" variant={grouped ? 'primary' : 'outline'} onClick={() => setGrouped(true)}>
              Sim
            </Button>
            <Button size="sm" variant={!grouped ? 'primary' : 'outline'} onClick={() => setGrouped(false)}>
              Não
            </Button>
          </div>
        </div>

        <VehicleList
          cars={SAMPLE_CARS}
          columns={columns}
          groupBy={grouped ? 'brand' : 'none'}
          onSelect={(car) => toast({ title: 'onSelect', description: `${car.brandName} ${car.nomeModelo}` })}
        />
      </section>

      {/* Uso básico */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Uso básico</h2>
        <CodeBlock>{`import { VehicleList } from '@/components/vehicle/VehicleList';

<VehicleList
  cars={cars}
  loading={isLoading}
  onSelect={(car) => abrirDetalhes(car)}
/>;`}</CodeBlock>
      </section>

      {/* Props */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Propriedades</h2>
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <Th>Prop</Th>
                <Th>Tipo</Th>
                <Th>Padrão</Th>
                <Th>Descrição</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <PropRow name="cars" type="NormalizedCar[]" def="—" desc="Veículos a exibir (obrigatório)." />
              <PropRow name="groupBy" type="'brand' | 'none' | fn" def="'brand'" desc="Estratégia de agrupamento." />
              <PropRow name="columns" type="1 | 2 | 3 | 4" def="3" desc="Máximo de colunas no grid responsivo." />
              <PropRow name="loading" type="boolean" def="false" desc="Exibe esqueletos de carregamento." />
              <PropRow name="skeletonCount" type="number" def="6" desc="Qtde. de skeletons no loading." />
              <PropRow name="error" type="ReactNode" def="—" desc="Conteúdo de erro (tem precedência)." />
              <PropRow name="emptyState" type="ReactNode" def="EmptyState" desc="Exibido quando não há carros." />
              <PropRow name="renderCard" type="(car) => ReactNode" def="VehicleCard" desc="Renderização customizada do card." />
              <PropRow name="groupHeader" type="(key, cars) => ReactNode" def="—" desc="Cabeçalho de grupo customizado." />
              <PropRow name="onSelect" type="(car) => void" def="—" desc="Callback ao selecionar um card." />
            </tbody>
          </table>
        </div>
      </section>

      {/* Customização */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Customização</h2>
        <CodeBlock>{`// Card próprio + agrupamento por combustível
<VehicleList
  cars={cars}
  groupBy={(car) => car.combustivel}
  columns={4}
  renderCard={(car) => <MeuCard car={car} />}
  groupHeader={(combustivel, itens) => (
    <h3>{combustivel} ({itens.length})</h3>
  )}
/>;`}</CodeBlock>
      </section>
    </div>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-xl bg-slate-900 p-4 text-sm leading-relaxed text-slate-100">
      <code>{children}</code>
    </pre>
  );
}

function Th({ children }: { children: ReactNode }) {
  return <th className="px-4 py-2.5 font-semibold">{children}</th>;
}

function PropRow({ name, type, def, desc }: { name: string; type: string; def: string; desc: string }) {
  return (
    <tr className="text-slate-700">
      <td className="px-4 py-2.5 font-mono text-xs font-medium text-brand-700">{name}</td>
      <td className="px-4 py-2.5 font-mono text-xs text-slate-500">{type}</td>
      <td className="px-4 py-2.5 font-mono text-xs text-slate-500">{def}</td>
      <td className="px-4 py-2.5">{desc}</td>
    </tr>
  );
}
