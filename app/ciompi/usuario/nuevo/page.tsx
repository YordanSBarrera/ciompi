'use client';
import { useRouter } from 'next/navigation';
import FormularioUsuario from '@/app/components/FormularioUsuario';
import { Usuario } from '@/lib/types';
import { getAuthHeaders } from '@/lib/utils';

export default function NuevoUsuarioPage() {
  const router = useRouter();

  const handleSubmit = async (usuarioData: Partial<Usuario>) => {
    try {
      console.log('Creando usuario:', usuarioData);

      const response = await fetch('/api/usuarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(usuarioData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear el usuario');
      }

      const nuevoUsuario = await response.json();
      console.log('Usuario creado exitosamente:', nuevoUsuario);

      // Redirigir después de crear
      router.push('/ciompi/usuario');
    } catch (error) {
      console.error('Error creando usuario:', error);
      throw error;
    }
  };

  const handleCancel = () => {
    router.push('/ciompi/usuario');
  };

  return <FormularioUsuario onSubmit={handleSubmit} onCancel={handleCancel} />;
}
