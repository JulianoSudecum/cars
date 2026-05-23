import { useNavigate } from 'react-router-dom';
import { CarForm } from '@/components/form/CarForm/CarForm';

export default function NewCarPage() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Cadastrar veículo</h1>
        <p className="mt-1 text-slate-500">
          Preencha os dados abaixo. O veículo é salvo no seu navegador e entra no catálogo
          imediatamente.
        </p>
      </header>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <CarForm onSuccess={() => navigate('/')} />
      </div>
    </div>
  );
}
