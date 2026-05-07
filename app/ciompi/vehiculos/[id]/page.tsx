'use client';
import React, { useState, useEffect } from 'react';
import { grisClaro, grisMedio, azulBase } from '@/lib/color';
import { VehiculoType, VehiculoFormType } from '@/lib/types';
import { getAuthHeaders, isAdmin } from '@/lib/utils';
import AuthGuard from '@/app/components/AuthGuard';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Paper,
  Snackbar,
  Typography,
} from '@mui/material';
import Link from 'next/link';

interface VehiculoDetallePageProps {
  params: Promise<{ id: string }>;
}

async function cargarVehiculo(id: string): Promise<VehiculoType> {
  try {
    const response = await fetch(`/api/vehiculos/${id}`);
    if (!response.ok) {
      throw new Error('Error al cargar vehículo');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error cargando vehículo:', error);
    throw error;
  }
}

export default function VehiculoDetallePage({
  params,
}: VehiculoDetallePageProps) {
  const [vehiculo, setVehiculo] = useState<VehiculoType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    vehiculoId: null as string | null,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning',
  });

  useEffect(() => {
    const loadVehiculo = async () => {
      try {
        const { id } = await params;
        setLoading(true);
        setError(null);
        const datosVehiculo = await cargarVehiculo(id);
        setVehiculo(datosVehiculo);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    loadVehiculo();
  }, [params]);

  const handleEliminar = async () => {
    if (!confirmDialog.vehiculoId) return;

    try {
      const response = await fetch(
        `/api/vehiculos/${confirmDialog.vehiculoId}`,
        {
          method: 'DELETE',
          headers: getAuthHeaders(),
        }
      );

      if (response.ok) {
        setSnackbar({
          open: true,
          message: 'Vehículo eliminado exitosamente',
          severity: 'success',
        });
        setTimeout(() => {
          window.location.href = '/ciompi/vehiculos';
        }, 2000);
      } else {
        setSnackbar({
          open: true,
          message: 'Error al eliminar vehículo',
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
      setConfirmDialog({ open: false, vehiculoId: null });
    }
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
        <Link href="/ciompi/vehiculos">
          <Button variant="contained">Volver a la lista</Button>
        </Link>
      </Container>
    );
  }

  if (!vehiculo) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning">
          No se encontró información del vehículo
        </Alert>
      </Container>
    );
  }

  return (
    <AuthGuard>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Button
            component={Link}
            href="/ciompi/vehiculos"
            variant="outlined"
            sx={{ mb: 2 }}
          >
            ← Volver al listado de vehículos
          </Button>

          <Typography variant="h4" component="h1" gutterBottom>
            Detalles del Vehículo
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
                {vehiculo.Marca} {vehiculo.Modelo}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Matrícula: {vehiculo.Matricula} | ID: {vehiculo._id}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Grid container spacing={4}>
            {/* Información del Vehículo */}
            <Grid size={{ xs: 12 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ color: 'primary.main', fontWeight: 600 }}
              >
                Información del Vehículo
              </Typography>

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      gutterBottom
                    >
                      Marca
                    </Typography>
                    <Typography
                      variant="body1"
                      gutterBottom
                      sx={{ fontWeight: 500 }}
                    >
                      {vehiculo.Marca}
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
                      Modelo
                    </Typography>
                    <Typography
                      variant="body1"
                      gutterBottom
                      sx={{ fontWeight: 500 }}
                    >
                      {vehiculo.Modelo}
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
                      Matrícula
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {vehiculo.Matricula}
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
                      Año
                    </Typography>
                    <Typography variant="body1">
                      {vehiculo.Año || 'No especificado'}
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
                      Color
                    </Typography>
                    <Typography variant="body1">
                      {vehiculo.Color || 'No especificado'}
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
                      Padrón
                    </Typography>
                    <Typography variant="body1">
                      {vehiculo.Padron || 'No especificado'}
                    </Typography>
                  </Box>
                </Grid>

                {vehiculo.Descripcion && (
                  <Grid size={{ xs: 12 }}>
                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        gutterBottom
                      >
                        Descripción
                      </Typography>
                      <Typography variant="body1">
                        {vehiculo.Descripcion}
                      </Typography>
                    </Box>
                  </Grid>
                )}
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
                      {typeof vehiculo.usuarioCreacion === 'object' &&
                      vehiculo.usuarioCreacion?.nombre
                        ? vehiculo.usuarioCreacion.nombre
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
                      {vehiculo.createdAt
                        ? new Date(vehiculo.createdAt).toLocaleString('es-ES', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
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
                      {typeof vehiculo.usuarioModificacion === 'object' &&
                      vehiculo.usuarioModificacion?.nombre
                        ? vehiculo.usuarioModificacion.nombre
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
                      {vehiculo.updatedAt
                        ? new Date(vehiculo.updatedAt).toLocaleString('es-ES', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'No disponible'}
                    </Typography>
                  </Box>
                </Grid>

                {/* Fila 3: ID de Base de Datos */}
                <Grid size={{ xs: 12 }}>
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
                      {vehiculo._id}
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
              {isAdmin() && (
                <Button
                  onClick={() =>
                    setConfirmDialog({ open: true, vehiculoId: vehiculo._id! })
                  }
                  variant="contained"
                  color="error"
                  size="large"
                >
                  Eliminar Vehículo
                </Button>
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              {isAdmin() && (
                <Button
                  component={Link}
                  href={`/ciompi/vehiculos/${vehiculo._id}/editar`}
                  variant="contained"
                  color="primary"
                  size="large"
                >
                  Editar Vehículo
                </Button>
              )}

              <Button
                component={Link}
                href="/ciompi/vehiculos"
                variant="outlined"
                size="large"
              >
                Volver al Listado
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Dialog de confirmación de eliminación */}
        <Dialog
          open={confirmDialog.open}
          onClose={() => setConfirmDialog({ open: false, vehiculoId: null })}
        >
          <DialogTitle>Confirmar eliminación</DialogTitle>
          <DialogContent>
            <Typography>
              ¿Estás seguro de que deseas eliminar el vehículo{' '}
              <strong>
                {vehiculo.Marca} {vehiculo.Modelo} - {vehiculo.Matricula}
              </strong>
              ? Esta acción no se puede deshacer.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() =>
                setConfirmDialog({ open: false, vehiculoId: null })
              }
            >
              Cancelar
            </Button>
            <Button onClick={handleEliminar} color="error" variant="contained">
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
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
