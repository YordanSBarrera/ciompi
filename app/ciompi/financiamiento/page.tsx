'use client';
import { blanco, grisClaro, grisMedio } from '@/lib/color';
import { FinanciamientoType } from '@/lib/types';
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
  Grid,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

// Función para cargar financiamientos
async function cargarFinanciamientos(): Promise<FinanciamientoType[]> {
  try {
    const response = await fetch('/api/financiamiento');
    if (!response.ok) {
      throw new Error('Error al cargar financiamientos');
    }
    return await response.json();
  } catch (error) {
    console.error('Error cargando financiamientos:', error);
    return [];
  }
}

export default function FinanciamientoPage() {
  const [financiamientos, setFinanciamientos] = useState<FinanciamientoType[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    id: '',
    clienteNombre: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await cargarFinanciamientos();
        setFinanciamientos(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleClickEliminar = (id: string, clienteNombre: string) => {
    setConfirmDialog({
      open: true,
      id,
      clienteNombre,
    });
  };

  const handleConfirmEliminar = async () => {
    try {
      const response = await fetch(`/api/financiamiento/${confirmDialog.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar financiamiento');
      }

      // Actualizar la lista
      const data = await cargarFinanciamientos();
      setFinanciamientos(data);

      setSnackbar({
        open: true,
        message: 'Financiamiento eliminado correctamente',
        severity: 'success',
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err instanceof Error ? err.message : 'Error al eliminar',
        severity: 'error',
      });
    } finally {
      setConfirmDialog({ open: false, id: '', clienteNombre: '' });
    }
  };

  const handleCancelEliminar = () => {
    setConfirmDialog({ open: false, id: '', clienteNombre: '' });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency: 'UYU',
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('es-UY');
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'activo':
        return 'success';
      case 'finalizado':
        return 'info';
      case 'cancelado':
        return 'error';
      case 'en_mora':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
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

  return (
    <AuthGuard>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Financiamiento de Vehículos
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
            Gestión de ventas financiadas de vehículos
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Button
              component={Link}
              href="/ciompi/financiamiento/nuevo"
              variant="contained"
              size="large"
            >
              Nueva Venta Financiada
            </Button>
          </Box>
        </Box>

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Lista de Financiamientos */}
        <Paper
          elevation={3}
          sx={{ bgcolor: grisClaro, border: `1px solid ${grisMedio}` }}
        >
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Vehículo</TableCell>
                  <TableCell>Costo</TableCell>
                  <TableCell>Cuotas</TableCell>
                  <TableCell>Valor Cuota</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Fecha Venta</TableCell>
                  <TableCell>Progreso</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {financiamientos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      <Typography variant="body1" color="textSecondary">
                        No hay financiamientos registrados
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  financiamientos.map(fin => (
                    <TableRow key={fin._id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {typeof fin.cliente === 'object'
                            ? fin.cliente.NOMBRE
                            : 'N/A'}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {typeof fin.cliente === 'object'
                            ? fin.cliente.CODCLI
                            : ''}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {typeof fin.vehiculo === 'object'
                            ? `${fin.vehiculo.Marca} ${fin.vehiculo.Modelo}`
                            : 'N/A'}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {typeof fin.vehiculo === 'object'
                            ? fin.vehiculo.Matricula
                            : ''}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {formatCurrency(fin.costoVehiculo)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {fin.cuotasPagadas} / {fin.cuotas}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {formatCurrency(fin.valorCuota)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={fin.estadoFinanciamiento}
                          color={
                            getEstadoColor(fin.estadoFinanciamiento) as any
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(fin.fechaVenta)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          <Typography variant="body2">
                            {fin.progresoFinanciamiento || 0}%
                          </Typography>
                          <Box
                            sx={{
                              width: 50,
                              height: 8,
                              bgcolor: 'grey.300',
                              borderRadius: 1,
                              overflow: 'hidden',
                            }}
                          >
                            <Box
                              sx={{
                                width: `${fin.progresoFinanciamiento || 0}%`,
                                height: '100%',
                                bgcolor: 'primary.main',
                                transition: 'width 0.3s ease',
                              }}
                            />
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            component={Link}
                            href={`/ciompi/financiamiento/${fin._id}`}
                            variant="outlined"
                            size="small"
                          >
                            Ver
                          </Button>
                          <Button
                            component={Link}
                            href={`/ciompi/financiamiento/${fin._id}/editar`}
                            variant="outlined"
                            size="small"
                          >
                            Editar
                          </Button>
                          <Button
                            onClick={() =>
                              handleClickEliminar(
                                fin._id || '',
                                typeof fin.cliente === 'object'
                                  ? fin.cliente.NOMBRE
                                  : 'N/A'
                              )
                            }
                            variant="outlined"
                            color="error"
                            size="small"
                          >
                            Eliminar
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Diálogo de confirmación */}
        <Dialog
          open={confirmDialog.open}
          onClose={handleCancelEliminar}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            Confirmar eliminación
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              ¿Estás seguro de que deseas eliminar el financiamiento de "
              {confirmDialog.clienteNombre}"? Esta acción no se puede deshacer.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelEliminar}>Cancelar</Button>
            <Button
              onClick={handleConfirmEliminar}
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
          onClose={handleCloseSnackbar}
        >
          <Alert
            onClose={handleCloseSnackbar}
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
