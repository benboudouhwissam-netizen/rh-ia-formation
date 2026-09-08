import Spinner from '../../../components/ui/Spinner';

export default function Loading() {
  return <main className="grid min-h-screen place-items-center bg-brume font-body text-ardoise"><span className="flex items-center gap-3"><Spinner size="md" />Chargement du quiz…</span></main>;
}
