import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="text-6xl font-extrabold text-brand-600">404</p>
      <h1 className="mt-4 text-xl font-semibold text-slate-900">Página não encontrada</h1>
      <p className="mt-1 text-sm text-slate-500">O endereço acessado não existe.</p>
      <Button asChild className="mt-6">
        <Link to="/">Voltar ao catálogo</Link>
      </Button>
    </div>
  );
}
