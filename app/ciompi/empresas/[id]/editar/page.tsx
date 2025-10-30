'use client';
import { blanco, grisClaro, grisMedio } from '@/lib/color';
import { EmpresaType, EmpresaFormType } from '@/lib/types';
import { getAuthHeaders } from '@/lib/utils';
import AuthGuard from '@/app/components/AuthGuard';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  TextField,
  Typography,
  Grid,
  Divider,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function EditarEmpresaPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [empresa, setEmpresa] = useState<EmpresaType | null>(null);
  const [formData, setFormData] = useState<EmpresaFormType>({
    nombre: '',
    descripcion: '',
    telefono: '',
  });
  const [estado, setEstado] = useState<'activa' | 'inactiva'>('activa');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Cargar datos de la empresa
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
        setFormData({
          nombre: data.nombre || '',
          descripcion: data.descripcion || '',
          telefono: data.telefono || '',
        });
        setEstado(data.estado || 'activa');
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

  // Manejar cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEstadoChange = (e: any) => {
    setEstado(e.target.value as 'activa' | 'inactiva');
  };

  // Validar formulario
  const validateForm = (): boolean => {
    if (!formData.nombre.trim()) {
      setError('El nombre de la empresa es requerido');
      return false;
    }
    return true;
  };

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSaving(true);
      setError(null);

      const dataToSend = {
        ...formData,
        estado,
      };

      const response = await fetch(`/api/empresas/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar la empresa');
      }

      setSuccess(true);
      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push(`/ciompi/empresas/${id}`);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setSaving(false);
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

  if (error && !empresa) {
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

  return (
    <AuthGuard>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Button
            component={Link}
            href={`/ciompi/empresas/${id}`}
            variant="outlined"
            sx={{ mb: 2 }}
          >
            ← Volver a detalles
          </Button>

          <Typography variant="h4" component="h1" gutterBottom>
            Editar Empresa
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Editando: {empresa.nombre}
          </Typography>
        </Box>

        {/* Formulario */}
        <Paper
          elevation={3}
          sx={{ p: 4, bgcolor: grisClaro, border: `1px solid ${grisMedio}` }}
        >
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Información Básica */}
              <Grid size={{ xs: 12 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ color: 'primary.main' }}
                >
                  Información Básica
                </Typography>
                <Divider sx={{ mb: 3 }} />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Nombre de la Empresa *"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Estado</InputLabel>
                  <Select
                    value={estado}
                    onChange={handleEstadoChange}
                    label="Estado"
                  >
                    <MenuItem value="activa">Activa</MenuItem>
                    <MenuItem value="inactiva">Inactiva</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Descripción"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  multiline
                  rows={4}
                  sx={{ mb: 2 }}
                />
              </Grid>

              {/* Información de Contacto */}
              <Grid size={{ xs: 12 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ color: 'primary.main', mt: 2 }}
                >
                  Información de Contacto
                </Typography>
                <Divider sx={{ mb: 3 }} />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Teléfono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  sx={{ mb: 2 }}
                />
              </Grid>
            </Grid>

            {/* Mensajes de error y éxito */}
            {error && (
              <Alert severity="error" sx={{ mt: 3 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mt: 3 }}>
                Empresa actualizada exitosamente. Redirigiendo...
              </Alert>
            )}

            {/* Botones de acción */}
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                justifyContent: 'flex-end',
                mt: 4,
                pt: 3,
                borderTop: `1px solid ${grisMedio}`,
              }}
            >
              <Button
                component={Link}
                href={`/ciompi/empresas/${id}`}
                variant="outlined"
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={saving}
                size="large"
              >
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </Box>
          </form>
        </Paper>
      </Container>
    </AuthGuard>
  );
}
