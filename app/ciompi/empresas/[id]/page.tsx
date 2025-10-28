'use client';
import {
  blanco,
  grisClaro,
  grisMedio,
  azulBase,
  azulOscuro,
} from '@/lib/color';
import { EmpresaType } from '@/lib/types';
import { useEliminarEmpresa } from '@/app/hook/useEliminarEmpresa';
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
  Avatar,
} from '@mui/material';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Business as BusinessIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function EmpresaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [empresa, setEmpresa] = useState<EmpresaType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hook para eliminar empresa
  const {
    confirmDialog,
    loading: deleting,
    snackbar,
    handleClickEliminar,
    handleConfirmEliminar,
    handleCancelEliminar,
    handleCloseSnackbar,
  } = useEliminarEmpresa({
    onEmpresaEliminada: () => {
      // Redirigir a la lista de empresas después de eliminar
      router.push('/ciompi/empresas');
    },
  });

  useEffect(() => {
    const fetchEmpresa = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/empresas/${id}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Empresa no encontrada');
          }
          throw new Error('Error al cargar la empresa');
        }

        const result = await response.json();
        const data = result.success ? result.data : result;
        setEmpresa(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEmpresa();
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
        <Link href="/ciompi/empresas">
          <Button variant="contained">Volver a la lista</Button>
        </Link>
      </Container>
    );
  }

  if (!empresa) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning">
          No se encontró información de la empresa
        </Alert>
      </Container>
    );
  }

  const usuarioRegistro =
    typeof empresa.usuarioRegistro === 'object'
      ? empresa.usuarioRegistro
      : null;

  return (
    <AuthGuard>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Button
            component={Link}
            href="/ciompi/empresas"
            variant="outlined"
            sx={{ mb: 2 }}
          >
            ← Volver al listado de empresas
          </Button>

          <Typography variant="h4" component="h1" gutterBottom>
            Detalles de la Empresa
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                sx={{
                  backgroundColor: azulBase,
                  width: 64,
                  height: 64,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                }}
              >
                <BusinessIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography
                  variant="h4"
                  component="h2"
                  gutterBottom
                  sx={{ fontWeight: 600 }}
                >
                  {empresa.nombre}
                </Typography>
                <Chip
                  label={
                    empresa.estado === 'activa'
                      ? 'Empresa Activa'
                      : 'Empresa Inactiva'
                  }
                  color={empresa.estado === 'activa' ? 'success' : 'default'}
                  variant="filled"
                  sx={{ fontWeight: 600 }}
                />
              </Box>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Grid container spacing={4}>
            {/* Columna 1: Información Básica */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ color: azulOscuro, fontWeight: 600 }}
              >
                Información Básica
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Nombre de la Empresa
                </Typography>
                <Typography
                  variant="body1"
                  gutterBottom
                  sx={{ fontWeight: 500 }}
                >
                  {empresa.nombre}
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Estado
                </Typography>
                <Chip
                  label={empresa.estado === 'activa' ? 'Activa' : 'Inactiva'}
                  color={empresa.estado === 'activa' ? 'success' : 'default'}
                  sx={{ fontWeight: 600 }}
                />
              </Box>

              {empresa.descripcion && (
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    gutterBottom
                  >
                    Descripción
                  </Typography>
                  <Typography
                    variant="body1"
                    gutterBottom
                    sx={{ lineHeight: 1.6 }}
                  >
                    {empresa.descripcion}
                  </Typography>
                </Box>
              )}
            </Grid>

            {/* Columna 2: Información de Contacto */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ color: azulOscuro, fontWeight: 600 }}
              >
                Información de Contacto
              </Typography>

              {empresa.telefono && (
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    gutterBottom
                  >
                    Teléfono
                  </Typography>
                  <Typography
                    variant="body1"
                    gutterBottom
                    sx={{ fontFamily: 'monospace' }}
                  >
                    {empresa.telefono}
                  </Typography>
                </Box>
              )}

              {!empresa.telefono && (
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    gutterBottom
                  >
                    Teléfono
                  </Typography>
                  <Typography
                    variant="body1"
                    gutterBottom
                    sx={{ fontStyle: 'italic' }}
                  >
                    No especificado
                  </Typography>
                </Box>
              )}
            </Grid>

            {/* Columna 3: Información del Sistema */}
            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 2 }} />
              <Typography
                variant="h6"
                gutterBottom
                sx={{ color: azulOscuro, fontWeight: 600 }}
              >
                Información del Sistema
              </Typography>

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
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
                      {empresa._id}
                    </Typography>
                  </Box>
                </Grid>

                {usuarioRegistro && (
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        gutterBottom
                      >
                        Registrado por
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {usuarioRegistro.nombre ||
                          usuarioRegistro.usuario ||
                          'N/A'}
                      </Typography>
                    </Box>
                  </Grid>
                )}

                {empresa.createdAt && (
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        gutterBottom
                      >
                        Fecha de Registro
                      </Typography>
                      <Typography variant="body2">
                        {format(new Date(empresa.createdAt), 'dd/MM/yyyy', {
                          locale: es,
                        })}
                      </Typography>
                    </Box>
                  </Grid>
                )}

                {empresa.updatedAt && (
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        gutterBottom
                      >
                        Última Actualización
                      </Typography>
                      <Typography variant="body2">
                        {format(new Date(empresa.updatedAt), 'dd/MM/yyyy', {
                          locale: es,
                        })}
                      </Typography>
                    </Box>
                  </Grid>
                )}
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
                onClick={() => handleClickEliminar(id, empresa.nombre)}
                variant="contained"
                color="error"
                size="large"
                disabled={deleting}
              >
                {deleting ? 'Eliminando...' : 'Eliminar Empresa'}
              </Button>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                component={Link}
                href={`/ciompi/empresas/${id}/editar`}
                variant="contained"
                color="primary"
                size="large"
              >
                Editar Empresa
              </Button>

              <Button
                component={Link}
                href="/ciompi/empresas"
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
              ¿Estás seguro de que deseas eliminar la empresa "
              {confirmDialog.empresaNombre}"? Esta acción no se puede deshacer.
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
