import React, { useState } from 'react';
import api from '../api';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  const submit = async e => {
    e.preventDefault();
    try {
      const form = new URLSearchParams();
      form.append('username', username);
      form.append('password', password);

      const { data } = await api.post('/token', form);
      localStorage.setItem('access_token', data.access_token);
      onLoginSuccess();
    } catch {
      setErr('Неверный логин или пароль');
    }
  };

  return (
    <form onSubmit={submit}>
      <h2>Вход</h2>
      {err && <div style={{ color: 'red' }}>{err}</div>}
      <div>
        <label>Логин:</label>
        <input value={username} onChange={e => setUsername(e.target.value)} required />
      </div>
      <div>
        <label>Пароль:</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
      </div>
      <button type="submit">Войти</button>
    </form>
  );
}
