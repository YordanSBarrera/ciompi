'use client';
import { blanco, grisClaro, grisMedio } from '@/lib/color';
import { ClienteType } from '@/lib/types';
import { formatCedula } from '@/lib/utils';
import { useEliminarCliente } from '@/app/hook/useEliminarCliente';
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
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function ClienteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [cliente, setCliente] = useState<ClienteType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hook para eliminar cliente
  const {
    confirmDialog,
    loading: deleting,
    snackbar,
    handleClickEliminar,
    handleConfirmEliminar,
    handleCancelEliminar,
    handleCloseSnackbar,
  } = useEliminarCliente({
    onClienteEliminado: () => {
      // Redirigir a la lista de clientes después de eliminar
      router.push('/ciompi/clientes');
    },
  });

  useEffect(() => {
    const fetchCliente = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/clientes/${id}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Cliente no encontrado');
          }
          throw new Error('Error al cargar el cliente');
        }

        const data = await response.json();
        setCliente(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCliente();
    }
  }, [id]);

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
        <Link href="/clientes">
          <Button variant="contained">Volver a la lista</Button>
        </Link>
      </Container>
    );
  }

  if (!cliente) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning">No se encontró información del cliente</Alert>
      </Container>
    );
  }

  return (
    <AuthGuard>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Button
            component={Link}
            href="/ciompi/clientes"
            variant="outlined"
            sx={{ mb: 2 }}
          >
            ← Volver al listado de clientes
          </Button>

          <Typography variant="h4" component="h1" gutterBottom>
            Detalles del Cliente
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
                {cliente.NOMBRE}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                ID: {cliente._id}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Grid container spacing={4}>
            {/* Columna 1: Información Personal */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ color: 'primary.main', fontWeight: 600 }}
              >
                Información Personal
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Nombre Completo
                </Typography>
                <Typography
                  variant="body1"
                  gutterBottom
                  sx={{ fontWeight: 500 }}
                >
                  {cliente.NOMBRE}
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Cédula
                </Typography>
                <Typography
                  variant="body1"
                  gutterBottom
                  sx={{ fontFamily: 'monospace' }}
                >
                  {cliente.cedula
                    ? formatCedula(cliente.cedula)
                    : 'No especificada'}
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Profesión
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {cliente.profesion || 'No especificada'}
                </Typography>
              </Box>
            </Grid>

            {/* Columna 2: Información de Contacto */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ color: 'primary.main', fontWeight: 600 }}
              >
                Información de Contacto
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Teléfono
                </Typography>
                <Typography
                  variant="body1"
                  gutterBottom
                  sx={{ fontFamily: 'monospace' }}
                >
                  {cliente.TELEFONO}
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Correo Electrónico
                </Typography>
                <Typography
                  variant="body1"
                  gutterBottom
                  sx={{ wordBreak: 'break-word' }}
                >
                  {cliente.correo || 'No especificado'}
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Dirección
                </Typography>
                <Typography
                  variant="body1"
                  gutterBottom
                  sx={{ lineHeight: 1.6 }}
                >
                  {cliente.DIRECCION || 'No especificada'}
                </Typography>
              </Box>
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
                      {typeof cliente.usuarioCreacion === 'object' &&
                      cliente.usuarioCreacion?.nombre
                        ? cliente.usuarioCreacion.nombre
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
                      {cliente.createdAt
                        ? new Date(cliente.createdAt).toLocaleString('es-ES', {
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
                      {typeof cliente.usuarioModificacion === 'object' &&
                      cliente.usuarioModificacion?.nombre
                        ? cliente.usuarioModificacion.nombre
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
                      {cliente.updatedAt
                        ? new Date(cliente.updatedAt).toLocaleString('es-ES', {
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
                      {cliente._id}
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
                onClick={() => handleClickEliminar(cliente._id, cliente.NOMBRE)}
                variant="contained"
                color="error"
                size="large"
                disabled={deleting}
              >
                {deleting ? 'Eliminando...' : 'Eliminar Cliente'}
              </Button>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                component={Link}
                href={`/ciompi/clientes/${id}/editar`}
                variant="contained"
                color="primary"
                size="large"
              >
                Editar Cliente
              </Button>

              <Button
                component={Link}
                href="/ciompi/clientes"
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
          onClose={handleCancelEliminar}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            Confirmar eliminación
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              ¿Estás seguro de que deseas eliminar al cliente "
              {confirmDialog.clienteNombre}"? Esta acción no se puede deshacer.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelEliminar} disabled={deleting}>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmEliminar}
              color="error"
              variant="contained"
              disabled={deleting}
            >
              {deleting ? 'Eliminando...' : 'Eliminar'}
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
