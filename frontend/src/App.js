import React, { useState } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import BookingList from './components/BookingList';
import useCurrentUser from './hooks/useCurrentUser';

function App() {
  // всегда стартуем с false
  const [authed, setAuthed] = useState(false);
  const [mode, setMode] = useState('login');
  const [user, loading, reloadUser] = useCurrentUser(authed);

  const handleLoginSuccess = () => {
    setAuthed(true);
    // после поднятия authed, прокинем запрос на /users/me
    reloadUser();
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setAuthed(false);
    setMode('login');
  };

  if (authed && loading) {
    return <div style={{ padding: 20 }}>Загрузка…</div>;
  }

  if (authed && user) {
    return (
      <div style={{ padding: 20 }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>Вы вошли как <strong>{user.full_name}</strong></div>
          <button onClick={handleLogout}>Выйти</button>
        </header>
        <BookingList />
      </div>
    );
  }

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: '0 auto' }}>
      <h1>Restaurant Booking Client</h1>
      {mode === 'login' ? (
        <Login
          onLoginSuccess={handleLoginSuccess}
          switchToRegister={() => setMode('register')}
        />
      ) : (
        <Register
          onRegisterSuccess={() => setMode('login')}
          switchToLogin={() => setMode('login')}
        />
      )}
    </div>
  );
}

export default App;
