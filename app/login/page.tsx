'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/hook/useAuth';
import UserLogin from '@/app/components/UserLogin';
import AuthGuard from '@/app/components/AuthGuard';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const handleLoginSuccess = async () => {
    try {
      // Redirigir a la página principal de ciompi
      router.push('/ciompi');
    } catch (error) {
      console.error('Error en redirección:', error);
    }
  };

  return (
    <AuthGuard requireAuth={false}>
      <UserLogin onLoginSuccess={handleLoginSuccess} />
    </AuthGuard>
  );
}
