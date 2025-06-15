import React, { useState } from 'react';
import api from '../api';
import './AuthForms.css';

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
      onLoginSuccess();
    } catch {
      setError('Неверный логин или пароль');
    }
  };

  return (
    <form onSubmit={submit} className="form-container">
      <h2>Войти</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label htmlFor="login-username">Логин:</label>
        <input
          id="login-username"
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Введите ваш логин"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="login-password">Пароль:</label>
        <input
          id="login-password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Введите ваш пароль"
          required
        />
      </div>

      <button type="submit" className="btn">Войти</button>

      <p className="switch-text">
        Нет аккаунта?{' '}
        <button
          type="button"
          onClick={switchToRegister}
          className="link-button"
        >
          Зарегистрироваться
        </button>
      </p>
    </form>
  );
}
