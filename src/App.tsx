import { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Nav, { type Tab } from './components/Nav';
import Dashboard from './components/Dashboard';
import FoodTab from './components/FoodTab';
import ExerciseTab from './components/ExerciseTab';
import ProgressTab from './components/ProgressTab';
import ProfileForm from './components/ProfileForm';
import './App.css';

function AppShell() {
  const { state } = useApp();
  const [tab, setTab] = useState<Tab>('dashboard');

  if (!state.profile) {
    return (
      <div className="app">
        <header className="header">
          <h1>Balance</h1>
          <p className="muted">Tu compañero para perder peso con calma y datos reales</p>
        </header>
        <main className="main">
          <ProfileForm onSaved={() => setTab('dashboard')} />
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Balance</h1>
        <p className="muted">Hola{state.profile.name ? `, ${state.profile.name}` : ''} 👋</p>
      </header>
      <Nav active={tab} onChange={setTab} />
      <main className="main">
        {tab === 'dashboard' && <Dashboard />}
        {tab === 'food' && <FoodTab />}
        {tab === 'exercise' && <ExerciseTab />}
        {tab === 'progress' && <ProgressTab />}
        {tab === 'profile' && <ProfileForm />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
