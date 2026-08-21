'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/hook/useAuth';
import { UsuarioRoles } from '@/lib/const';
import { Box, CircularProgress } from '@mui/material';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
}

export default function AuthGuard({
  children,
  requireAuth = true,
  requireAdmin = false,
}: AuthGuardProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  const esAdmin = user?.rol === UsuarioRoles.Administrativo;

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !isAuthenticated) {
        // Usuario no autenticado, redirigir al login
        router.replace('/login');
      } else if (requireAuth && isAuthenticated && requireAdmin && !esAdmin) {
        // Usuario autenticado sin rol Administrativo en una página de
        // administración: redirigir al panel de control
        router.replace('/ciompi');
      } else if (!requireAuth && isAuthenticated) {
        // Usuario autenticado en página de login, redirigir al home
        router.push('/ciompi');
      }
    }
  }, [loading, isAuthenticated, requireAuth, requireAdmin, esAdmin, router]);

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

  // Si la página exige rol Administrativo y no lo tiene, no mostrar contenido
  if (requireAuth && requireAdmin && !esAdmin) {
    return null;
  }

  // Si no requiere autenticación y está autenticado, no mostrar contenido
  if (!requireAuth && isAuthenticated) {
    return null;
  }

  // Mostrar contenido
  return <>{children}</>;
}
