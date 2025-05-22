import React, { useState } from 'react';
import api from '../api';

export default function Register({ onRegisterSuccess, switchToLogin }) {
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState(null);

  const submit = async e => {
    e.preventDefault();
    try {
      await api.post('/users/', {
        username,
        full_name: fullName,
        password,
        is_admin: isAdmin,
        invite_code: inviteCode
      });
      onRegisterSuccess();
    } catch (e) {
      setError(e.response?.data?.detail || 'Ошибка регистрации');
    }
  };

  return (
    <form onSubmit={submit} style={{ maxWidth: 400, margin: '0 auto' }}>
      <h2>Регистрация</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <div>
        <label>Логин:</label><br/>
        <input value={username} onChange={e => setUsername(e.target.value)} required />
      </div>
      <div>
        <label>Имя и Фамилия:</label><br/>
        <input value={fullName} onChange={e => setFullName(e.target.value)} required />
      </div>
      <div>
        <label>Пароль:</label><br/>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
      </div>
      <div>
        <label><input type="checkbox" checked={isAdmin} onChange={e => setIsAdmin(e.target.checked)} /> Администратор</label>
      </div>
      <div>
        <label>Код приглашения:</label><br/>
        <input value={inviteCode} onChange={e => setInviteCode(e.target.value)} required />
      </div>
      <button type="submit">Зарегистрироваться</button>
      <p style={{ marginTop: 10 }}>
        Уже есть аккаунт?{' '}
        <button type="button" onClick={switchToLogin}
                style={{ textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}>
          Войти
        </button>
      </p>
    </form>
  );
}
