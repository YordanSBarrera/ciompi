'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import FormularioUsuario from '@/app/components/FormularioUsuario';
import { Usuario } from '@/lib/types';
import { CircularProgress, Alert, Box } from '@mui/material';

async function cargarUsuario(id: string): Promise<Usuario> {
  try {
    const response = await fetch(`/api/usuarios/${id}`);
    if (!response.ok) {
      throw new Error('Error al cargar usuario');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error cargando usuario:', error);
    throw error;
  }
}

export default function EditarUsuarioPage() {
  const params = useParams();
  const router = useRouter();
  const [usuarioExistente, setUsuarioExistente] = useState<Usuario | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const usuarioId = params.id as string;

  useEffect(() => {
    const cargarDatosUsuario = async () => {
      try {
        setLoading(true);
        setError(null);
        const datosUsuario = await cargarUsuario(usuarioId);
        setUsuarioExistente(datosUsuario);
      } catch (err) {
        setError('Error al cargar los datos del usuario');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (usuarioId) {
      cargarDatosUsuario();
    }
  }, [usuarioId]);

  const handleSubmit = async (usuarioData: Partial<Usuario>) => {
    try {
      console.log('Actualizando usuario:', usuarioData);

      const { getAuthHeaders } = await import('@/lib/utils');
      const authHeaders = getAuthHeaders();

      const response = await fetch(`/api/usuarios/${usuarioId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify(usuarioData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar el usuario');
      }

      const usuarioActualizado = await response.json();
      console.log('Usuario actualizado exitosamente:', usuarioActualizado);

      // Redirigir después de actualizar
      router.push(`/ciompi/usuario/${usuarioId}`);
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      throw error;
    }
  };

  const handleCancel = () => {
    router.push(`/ciompi/usuario/${usuarioId}`);
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

  if (error || !usuarioExistente) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Usuario no encontrado'}
        </Alert>
      </Box>
    );
  }

  return (
    <FormularioUsuario
      usuarioExistente={usuarioExistente}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
}
