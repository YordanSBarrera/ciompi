import { useState, useEffect } from 'react';

interface User {
  id: string;
  usuario: string;
  nombre: string;
  email: string;
  avatar: string;
  rol: 'user' | 'admin';
  estado: string;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay un token y usuario en localStorage
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      // Verificar si el token sigue siendo válido
      verifyToken(token).then(isValid => {
        if (isValid) {
          setUser(JSON.parse(savedUser));
        } else {
          // Token inválido, limpiar localStorage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (token: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Actualizar datos del usuario
          setUser(data.usuario);
          localStorage.setItem('user', JSON.stringify(data.usuario));
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error verificando token:', error);
      return false;
    }
  };

  const login = async (usuario: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usuario, password }),
      });

      // Verificar si la respuesta es HTML (error 404 o similar)
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Respuesta no es JSON:', text.substring(0, 200));
        throw new Error('Error del servidor: La respuesta no es JSON válido');
      }

      const data = await response.json();

      if (response.ok && data.success) {
        // Guardar token y datos del usuario
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.usuario));
        setUser(data.usuario);
        return data.usuario;
      } else {
        throw new Error(data.error || 'Error al iniciar sesión');
      }
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
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
