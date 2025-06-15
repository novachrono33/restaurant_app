import React, { useState } from 'react';
import api from '../api';
import './AuthForms.css';

export default function Register({ onRegisterSuccess, switchToLogin }) {
  const [username, setUsername]     = useState('');
  const [fullName, setFullName]     = useState('');
  const [password, setPassword]     = useState('');
  const [isAdmin, setIsAdmin]       = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError]           = useState(null);

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
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка регистрации');
    }
  };

  return (
    <form onSubmit={submit} className="form-container">
      <h2>Регистрация</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label htmlFor="reg-username">Логин:</label>
        <input
          id="reg-username"
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Выберите логин"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="reg-fullname">Имя и фамилия:</label>
        <input
          id="reg-fullname"
          type="text"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          placeholder="Ваше имя и фамилия"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="reg-password">Пароль:</label>
        <input
          id="reg-password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Придумайте пароль"
          required
        />
      </div>

      <div className="form-group checkbox-group">
        <input
          id="is-admin"
          type="checkbox"
          checked={isAdmin}
          onChange={e => setIsAdmin(e.target.checked)}
        />
        <label htmlFor="is-admin">Администратор</label>
      </div>

      <div className="form-group">
        <label htmlFor="invite-code">Код приглашения:</label>
        <input
          id="invite-code"
          type="text"
          value={inviteCode}
          onChange={e => setInviteCode(e.target.value)}
          placeholder="Введите код приглашения"
          required
        />
      </div>

      <button type="submit" className="btn">Зарегистрироваться</button>

      <p className="switch-text">
        Уже есть аккаунт?{' '}
        <button
          type="button"
          onClick={switchToLogin}
          className="link-button"
        >
          Войти
        </button>
      </p>
    </form>
  );
}
