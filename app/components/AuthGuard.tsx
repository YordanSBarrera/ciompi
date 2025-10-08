'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/hook/useAuth';
import { Box, CircularProgress } from '@mui/material';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export default function AuthGuard({
  children,
  requireAuth = true,
}: AuthGuardProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !isAuthenticated) {
        // Usuario no autenticado, redirigir al login
        router.push('/login');
      } else if (!requireAuth && isAuthenticated) {
        // Usuario autenticado en página de login, redirigir al home
        router.push('/ciompi');
      }
    }
  }, [loading, isAuthenticated, requireAuth, router]);

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor="background.default"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  // Si requiere autenticación y no está autenticado, no mostrar contenido
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // Si no requiere autenticación y está autenticado, no mostrar contenido
  if (!requireAuth && isAuthenticated) {
    return null;
  }

  // Mostrar contenido
  return <>{children}</>;
}
