'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { blanco, grisClaro, grisMedio } from '@/lib/color';
import { Usuario } from '@/lib/types';
import AuthGuard from '@/app/components/AuthGuard';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  Paper,
  Snackbar,
  Typography,
} from '@mui/material';
import Link from 'next/link';

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

export default function UsuarioDetallesPage() {
  const params = useParams();
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    usuarioId: null as string | null,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning',
  });

  const usuarioId = params.id as string;

  useEffect(() => {
    const cargarDatosUsuario = async () => {
      try {
        setLoading(true);
        setError(null);
        const datosUsuario = await cargarUsuario(usuarioId);
        setUsuario(datosUsuario);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    if (usuarioId) {
      cargarDatosUsuario();
    }
  }, [usuarioId]);

  const handleEliminar = async () => {
    if (!confirmDialog.usuarioId) return;

    try {
      const response = await fetch(`/api/usuarios/${confirmDialog.usuarioId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: 'Usuario eliminado exitosamente',
          severity: 'success',
        });
        setTimeout(() => {
          router.push('/ciompi/usuario');
        }, 2000);
      } else {
        setSnackbar({
          open: true,
          message: 'Error al eliminar usuario',
          severity: 'error',
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error de conexión',
        severity: 'error',
      });
    } finally {
      setConfirmDialog({ open: false, usuarioId: null });
    }
  };

  const getRolColor = (rol: string) => {
    switch (rol) {
      case 'admin':
      case 'Administrativo':
        return 'error';
      case 'Usuario':
        return 'info';
      default:
        return 'default';
    }
  };

  const getEstadoColor = (estado: string) => {
    return estado === 'activo' ? 'success' : 'error';
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="50vh"
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Link href="/usuarios">
          <Button variant="contained">Volver a la lista</Button>
        </Link>
      </Container>
    );
  }

  if (!usuario) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning">No se encontró información del usuario</Alert>
      </Container>
    );
  }

  return (
    <AuthGuard>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Button
            component={Link}
            href="/ciompi/usuario"
            variant="outlined"
            sx={{ mb: 2 }}
          >
            ← Volver al listado de usuarios
          </Button>

          <Typography variant="h4" component="h1" gutterBottom>
            Detalles del Usuario
          </Typography>
        </Box>

        <Paper
          elevation={3}
          sx={{ p: 4, bgcolor: grisClaro, border: `1px solid ${grisMedio}` }}
        >
          {/* Header con información principal */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              mb: 3,
            }}
          >
            <Box>
              <Typography
                variant="h4"
                component="h2"
                gutterBottom
                sx={{ fontWeight: 600 }}
              >
                {usuario.nombre}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Usuario: {usuario.usuario} | ID: {usuario._id}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Grid container spacing={4}>
            {/* Columna 1: Información Personal */}
            <Grid size={{ xs: 12 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ color: 'primary.main', fontWeight: 600 }}
              >
                Información Personal
              </Typography>

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      gutterBottom
                    >
                      Nombre Completo
                    </Typography>
                    <Typography
                      variant="body1"
                      gutterBottom
                      sx={{ fontWeight: 500 }}
                    >
                      {usuario.nombre}
                    </Typography>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      gutterBottom
                    >
                      Usuario
                    </Typography>
                    <Typography
                      variant="body1"
                      gutterBottom
                      sx={{ fontFamily: 'monospace' }}
                    >
                      {usuario.usuario}
                    </Typography>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      gutterBottom
                    >
                      Email
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {usuario.email}
                    </Typography>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      gutterBottom
                    >
                      Cargo
                    </Typography>
                    <Typography variant="body1">
                      {usuario.cargo || 'No especificado'}
                    </Typography>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      gutterBottom
                    >
                      Rol
                    </Typography>
                    <Chip
                      label={usuario.rol}
                      color={getRolColor(usuario.rol) as any}
                      size="small"
                    />
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      gutterBottom
                    >
                      Estado
                    </Typography>
                    <Chip
                      label={usuario.estado}
                      color={getEstadoColor(usuario.estado) as any}
                      size="small"
                    />
                  </Box>
                </Grid>
              </Grid>
            </Grid>

            {/* Información del Sistema */}
            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 2 }} />
              <Typography
                variant="h6"
                gutterBottom
                sx={{ color: 'primary.main', fontWeight: 600 }}
              >
                Información del Sistema
              </Typography>

              <Grid container spacing={3}>
                {/* Fila 1: Creado por y Fecha de Creación */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      gutterBottom
                    >
                      Creado por
                    </Typography>
                    <Typography variant="body2">
                      {typeof usuario.usuarioCreacion === 'object' &&
                      usuario.usuarioCreacion?.nombre
                        ? usuario.usuarioCreacion.nombre
                        : '-'}
                    </Typography>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Box>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      gutterBottom
                    >
                      Fecha de Creación
                    </Typography>
                    <Typography variant="body2">
                      {usuario.fechaCreacion
                        ? new Date(usuario.fechaCreacion).toLocaleString(
                            'es-ES',
                            {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )
                        : 'No disponible'}
                    </Typography>
                  </Box>
                </Grid>

                {/* Fila 2: Modificado por y Última Actualización */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      gutterBottom
                    >
                      Modificado por
                    </Typography>
                    <Typography variant="body2">
                      {typeof usuario.usuarioModificacion === 'object' &&
                      usuario.usuarioModificacion?.nombre
                        ? usuario.usuarioModificacion.nombre
                        : '-'}
                    </Typography>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Box>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      gutterBottom
                    >
                      Última Actualización
                    </Typography>
                    <Typography variant="body2">
                      {usuario.fechaActualizacion
                        ? new Date(usuario.fechaActualizacion).toLocaleString(
                            'es-ES',
                            {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )
                        : 'No disponible'}
                    </Typography>
                  </Box>
                </Grid>

                {/* Fila 3: ID de Base de Datos */}
                <Grid size={{ xs: 12, md: 12 }}>
                  <Box>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      gutterBottom
                    >
                      ID de Base de Datos
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
                    >
                      {usuario._id}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          {/* Botones de acción */}
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              justifyContent: 'space-between',
              mt: 4,
              pt: 3,
              borderTop: `1px solid ${grisMedio}`,
            }}
          >
            <Box>
              <Button
                onClick={() =>
                  setConfirmDialog({
                    open: true,
                    usuarioId: usuario._id || null,
                  })
                }
                variant="contained"
                color="error"
                size="large"
              >
                Eliminar Usuario
              </Button>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                component={Link}
                href={`/ciompi/usuario/${usuarioId}/editar`}
                variant="contained"
                color="primary"
                size="large"
              >
                Editar Usuario
              </Button>

              <Button
                component={Link}
                href="/ciompi/usuario"
                variant="outlined"
                size="large"
              >
                Volver al Listado
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Diálogo de confirmación */}
        <Dialog
          open={confirmDialog.open}
          onClose={() => setConfirmDialog({ open: false, usuarioId: null })}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            Confirmar eliminación
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              ¿Estás seguro de que deseas eliminar el usuario "{usuario.nombre}
              "? Esta acción no se puede deshacer.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setConfirmDialog({ open: false, usuarioId: null })}
            >
              Cancelar
            </Button>
            <Button onClick={handleEliminar} color="error" variant="contained">
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar para notificaciones */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </AuthGuard>
  );
}
