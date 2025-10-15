'use client';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Stack,
  Alert,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { VehiculoType, VehiculoFormType } from '@/lib/types';
import { useVehiculos } from '@/app/hook/useVehiculos';
import FormularioVehiculo from '@/app/components/FormularioVehiculo';
import {
  azulBase,
  azulClaro,
  azulOscuro,
  blanco,
  grisClaro,
  verde,
  rojo,
  naranja,
} from '@/lib/color';

interface VehiculoDetallePageProps {
  params: Promise<{ id: string }>;
}

export default function VehiculoDetallePage({
  params,
}: VehiculoDetallePageProps) {
  const router = useRouter();
  const { vehiculos, updateVehiculo, deleteVehiculo } = useVehiculos();
  const [vehiculo, setVehiculo] = useState<VehiculoType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    const loadVehiculo = async () => {
      try {
        const { id } = await params;
        const response = await fetch(`/api/vehiculos/${id}`);

        if (response.ok) {
          const vehiculoData = await response.json();
          setVehiculo(vehiculoData);
        } else {
          setError('Vehículo no encontrado');
        }
      } catch (err) {
        setError('Error al cargar el vehículo');
      } finally {
        setLoading(false);
      }
    };

    loadVehiculo();
  }, [params]);

  const handleEdit = () => {
    setEditDialogOpen(true);
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const handleSaveEdit = async (vehiculoData: VehiculoFormType) => {
    if (!vehiculo) return { success: false, error: 'Vehículo no encontrado' };

    const result = await updateVehiculo(vehiculo._id!, vehiculoData);
    if (result.success) {
      setVehiculo(result.vehiculo);
      setSnackbar({
        open: true,
        message: 'Vehículo actualizado exitosamente',
        severity: 'success',
      });
      setEditDialogOpen(false);
    }
    return result;
  };

  const handleConfirmDelete = async () => {
    if (!vehiculo) return;

    const result = await deleteVehiculo(vehiculo._id!);
    if (result.success) {
      setSnackbar({
        open: true,
        message: 'Vehículo eliminado exitosamente',
        severity: 'success',
      });
      setTimeout(() => {
        router.push('/ciompi/vehiculos');
      }, 1500);
    } else {
      setSnackbar({
        open: true,
        message: result.error || 'Error al eliminar vehículo',
        severity: 'error',
      });
    }
    setDeleteDialogOpen(false);
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !vehiculo) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Vehículo no encontrado'}
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/ciompi/vehiculos')}
        >
          Volver a Vehículos
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Paper
        elevation={2}
        sx={{
          p: 3,
          mb: 3,
          background: `linear-gradient(135deg, ${azulBase} 0%, #1976d2 100%)`,
          color: blanco,
          borderRadius: 2,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <IconButton
            onClick={() => router.push('/ciompi/vehiculos')}
            sx={{ color: blanco }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Detalles del Vehículo
          </Typography>
        </Stack>
        <Typography variant="h5" sx={{ opacity: 0.9 }}>
          {vehiculo.Marca} {vehiculo.Modelo}
        </Typography>
      </Paper>

      {/* Información del vehículo */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ boxShadow: 2 }}>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ color: azulBase, mb: 2 }}
              >
                Información General
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    Marca
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {vehiculo.Marca}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    Modelo
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {vehiculo.Modelo}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    Matrícula
                  </Typography>
                  <Chip
                    label={vehiculo.Matricula}
                    sx={{
                      backgroundColor: azulBase,
                      color: blanco,
                      fontWeight: 'bold',
                      mt: 0.5,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    Año
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {vehiculo.Año || 'No especificado'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    Color
                  </Typography>
                  {vehiculo.Color ? (
                    <Box
                      display="flex"
                      alignItems="center"
                      gap={1}
                      sx={{ mt: 0.5 }}
                    >
                      <Box
                        width={20}
                        height={20}
                        borderRadius="50%"
                        sx={{ backgroundColor: vehiculo.Color }}
                        border="1px solid #ccc"
                      />
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {vehiculo.Color}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      No especificado
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    Padrón
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {vehiculo.Padron || 'No especificado'}
                  </Typography>
                </Grid>
                {vehiculo.Descripcion && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">
                      Descripción
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 'bold', mt: 0.5 }}
                    >
                      {vehiculo.Descripcion}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ boxShadow: 2 }}>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ color: azulBase, mb: 2 }}
              >
                Acciones
              </Typography>
              <Stack spacing={2}>
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={handleEdit}
                  sx={{
                    backgroundColor: naranja,
                    '&:hover': {
                      backgroundColor: '#e65100',
                    },
                  }}
                >
                  Editar Vehículo
                </Button>
                <Button
                  variant="contained"
                  startIcon={<DeleteIcon />}
                  onClick={handleDelete}
                  sx={{
                    backgroundColor: rojo,
                    '&:hover': {
                      backgroundColor: '#c62828',
                    },
                  }}
                >
                  Eliminar Vehículo
                </Button>
              </Stack>
            </CardContent>
          </Card>

          {/* Información adicional */}
          <Card sx={{ boxShadow: 2, mt: 2 }}>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ color: azulBase, mb: 2 }}
              >
                Información del Sistema
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">
                    ID del Vehículo
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {vehiculo._id}
                  </Typography>
                </Grid>
                {vehiculo.createdAt && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">
                      Fecha de Creación
                    </Typography>
                    <Typography variant="body2">
                      {new Date(vehiculo.createdAt).toLocaleDateString(
                        'es-ES',
                        {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        }
                      )}
                    </Typography>
                  </Grid>
                )}
                {vehiculo.updatedAt && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">
                      Última Actualización
                    </Typography>
                    <Typography variant="body2">
                      {new Date(vehiculo.updatedAt).toLocaleDateString(
                        'es-ES',
                        {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        }
                      )}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog de edición */}
      <FormularioVehiculo
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onSave={handleSaveEdit}
        vehiculo={vehiculo}
        title="Editar Vehículo"
      />

      {/* Dialog de confirmación de eliminación */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Confirmar eliminación
        </DialogTitle>
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
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
