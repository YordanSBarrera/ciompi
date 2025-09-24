import { useState, useEffect } from 'react';

interface User {
  id: string;
  usuario: string;
  nombre: string;
  role: 'user' | 'admin';
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay un usuario en localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (usuario: string, password: string) => {
    // Aquí iría tu lógica real de autenticación con tu API
    const userData: User = {
      id: '1',
      usuario,
      nombre: usuario === 'admin' ? 'Administrador' : 'Usuario',
      role: usuario === 'admin' ? 'admin' : 'user',
    };

    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    return userData;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
  };
}
