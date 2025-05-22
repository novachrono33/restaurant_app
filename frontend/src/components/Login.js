import React, { useState } from 'react';
import api from '../api';

export default function Login({ onLoginSuccess, switchToRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const submit = async e => {
    e.preventDefault();
    try {
      const form = new URLSearchParams();
      form.append('username', username);
      form.append('password', password);
      const { data } = await api.post('/token', form);
      localStorage.setItem('access_token', data.access_token);
      onLoginSuccess();  // теперь токен записан, подтягиваем /users/me
    } catch {
      setError('Неверный логин или пароль');
    }
  };

  return (
    <form onSubmit={submit} style={{ maxWidth: 400, margin: '0 auto' }}>
      <h2>Войти</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <div>
        <label>Логин:</label><br/>
        <input value={username} onChange={e => setUsername(e.target.value)} required />
      </div>
      <div>
        <label>Пароль:</label><br/>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
      </div>
      <button type="submit">Войти</button>
      <p style={{ marginTop: 10 }}>
        Нет аккаунта?{' '}
        <button type="button" onClick={switchToRegister}
                style={{ textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}>
          Зарегистрироваться
        </button>
      </p>
    </form>
  );
}
