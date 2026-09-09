export type Tab = 'dashboard' | 'food' | 'exercise' | 'progress' | 'profile';

const TABS: { id: Tab; label: string }[] = [
  { id: 'dashboard', label: 'Resumen' },
  { id: 'food', label: 'Comida' },
  { id: 'exercise', label: 'Ejercicio' },
  { id: 'progress', label: 'Progreso' },
  { id: 'profile', label: 'Perfil' },
];

export default function Nav({
  active,
  onChange,
}: {
  active: Tab;
  onChange: (tab: Tab) => void;
}) {
  return (
    <nav className="nav">
      {TABS.map((t) => (
        <button
          key={t.id}
          type="button"
          className={active === t.id ? 'nav-btn active' : 'nav-btn'}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </nav>
  );
}
