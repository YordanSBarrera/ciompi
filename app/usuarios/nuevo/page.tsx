'use client';
import { useRouter } from 'next/navigation';
import FormularioUsuario from '@/app/components/FormularioUsuario';
import { Usuario } from '@/lib/types';

export default function NuevoUsuarioPage() {
  const router = useRouter();

  const handleSubmit = async (usuarioData: Partial<Usuario>) => {
    try {
      // Aquí va tu llamada a la API para crear el usuario
      console.log('Creando usuario:', usuarioData);

      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Redirigir después de crear
      router.push('/usuarios');
    } catch (error) {
      console.error('Error creando usuario:', error);
      throw error;
    }
  };

  const handleCancel = () => {
    router.push('/usuarios');
  };

  return <FormularioUsuario onSubmit={handleSubmit} onCancel={handleCancel} />;
}
