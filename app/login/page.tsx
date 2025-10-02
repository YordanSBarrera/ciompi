'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/hook/useAuth';
import UserLogin from '@/app/components/UserLogin';
import { routes } from '@/lib/rutas';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const handleLoginSuccess = async () => {
    try {
      // La lógica de login se manejaría en el componente Login con los datos del formulario
      router.push(`${routes.home}`);
    } catch (error) {
      console.error('Error en redirección:', error);
    }
  };

  return <UserLogin onLoginSuccess={handleLoginSuccess} />;
}
