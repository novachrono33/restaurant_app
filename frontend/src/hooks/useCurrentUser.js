import { useState, useEffect, useCallback } from 'react';
import api from '../api';

export default function useCurrentUser(authed) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(() => {
    if (!authed) {
      setUser(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    api.get('/users/me')
      .then(res => setUser(res.data))
      .catch(() => {
        localStorage.removeItem('access_token');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [authed]);

  useEffect(() => {
    load();
  }, [load]);

  return [user, loading, load];
}
