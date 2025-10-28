'use client';
import React, { useState, useEffect } from 'react';
import { Usuario } from '@/lib/types';
import ListaUsuarios from '@/app/components/ListaUsuarios';
import AuthGuard from '@/app/components/AuthGuard';
import { Box, CircularProgress, Alert, Button, Fab } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { routes } from '@/lib/rutas';

async function cargarUsuarios(): Promise<Usuario[]> {
  try {
    const response = await fetch('/api/usuarios');
    if (!response.ok) {
      throw new Error('Error al cargar usuarios');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error cargando usuarios:', error);
    return [];
  }
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const cargarListaUsuarios = async () => {
    try {
      setLoading(true);
      setError(null);
      const listaUsuarios = await cargarUsuarios();
      setUsuarios(listaUsuarios);
    } catch (err) {
      setError('Error al cargar la lista de usuarios');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarListaUsuarios();
  }, []);

  const handleUsuarioEliminado = () => {
    // Recargar la lista después de eliminar un usuario
    cargarListaUsuarios();
  };

  const handleAgregarUsuario = () => {
    // Redirigir a la página de crear nuevo usuario
    router.push(`/${routes.newUsuario}`);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button onClick={cargarListaUsuarios} variant="outlined">
          Reintentar
        </Button>
      </Box>
    );
  }

  return (
    <AuthGuard>
      <ListaUsuarios
        usuarios={usuarios}
        onUsuarioEliminado={handleUsuarioEliminado}
        onAgregarUsuario={handleAgregarUsuario}
      />
    </AuthGuard>
  );
}
