'use client';
import { blanco, grisClaro, grisMedio } from '@/lib/color';
import { ClienteType, RouteParams } from '@/lib/types';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function ClienteDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [cliente, setCliente] = useState<ClienteType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCliente = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/ciompi/api/clientes/${id}`);

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
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Button
          component={Link}
          href="/clientes"
          variant="outlined"
          sx={{ mb: 2 }}
        >
          ← Volver al listado de clientes
        </Button>

        <Typography
          variant="h5"
          component="h4"
          gutterBottom
          color="textDisabled"
        >
          Detalles del Cliente
        </Typography>
      </Box>

      <Paper
        elevation={3}
        sx={{ p: 3, bgcolor: grisClaro, border: `1px solid ${grisMedio}` }}
      >
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}
            >
              <Typography variant="h5" component="h2" gutterBottom>
                {cliente.NOMBRE}
              </Typography>
              <Chip
                label={`Código: ${cliente.CODCLI}`}
                color="primary"
                variant="outlined"
              />
            </Box>
            <Divider sx={{ my: 2 }} />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle1" color="textSecondary" gutterBottom>
              Información General
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Typography variant="body1" gutterBottom>
                <strong>Nombre:</strong> {cliente.NOMBRE}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Código:</strong> {cliente.CODCLI}
              </Typography>
              {cliente.TELEFONO && (
                <Typography variant="body1" gutterBottom>
                  <strong>Teléfono:</strong> {cliente.TELEFONO}
                </Typography>
              )}
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle1" color="textSecondary" gutterBottom>
              Dirección
            </Typography>
            {cliente.DIRECCION ? (
              <Typography variant="body1" sx={{ mt: 1 }}>
                {cliente.DIRECCION}
              </Typography>
            ) : (
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                No especificada
              </Typography>
            )}
          </Grid>

          {/* {(cliente.createdAt || cliente.updatedAt) && (
            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 2 }} />
              <Typography
                variant="subtitle1"
                color="textSecondary"
                gutterBottom
              >
                Información del Sistema
              </Typography>
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                {cliente.createdAt && (
                  <Typography variant="body2" color="textSecondary">
                    <strong>Creado:</strong>{' '}
                    {new Date(cliente.createdAt).toLocaleDateString()}
                  </Typography>
                )}
                {cliente.updatedAt && (
                  <Typography variant="body2" color="textSecondary">
                    <strong>Actualizado:</strong>{' '}
                    {new Date(cliente.updatedAt).toLocaleDateString()}
                  </Typography>
                )}
              </Box>
            </Grid>
          )} */}

          <Grid size={{ xs: 12 }}>
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                justifyContent: 'flex-end',
                mt: 2,
              }}
            >
              <Button
                component={Link}
                href={`/clientes/${id}/editar`}
                variant="contained"
                color="primary"
              >
                Editar
              </Button>
              <Button component={Link} href="/clientes" variant="outlined">
                Volver
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
    // </Stack>
  );
}
