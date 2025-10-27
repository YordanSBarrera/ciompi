'use client';
import { grisClaro, grisMedio } from '@/lib/color';
import { ClienteFormType } from '@/lib/types';
import {
  validateCedula,
  handleCedulaInput,
  cleanCedula,
  getAuthHeaders,
} from '@/lib/utils';
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
} from '@mui/material';
import Link from 'next/link';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NuevoClientePage() {
  const router = useRouter();

  const [formData, setFormData] = useState<ClienteFormType>({
    NOMBRE: '',
    cedula: '',
    correo: '',
    profesion: '',
    DIRECCION: '',
    TELEFONO: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [cedulaError, setCedulaError] = useState<string | null>(null);

  // Manejar cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Manejo especial para cédula
    if (name === 'cedula') {
      const formattedValue = handleCedulaInput(value);
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue,
      }));

      // Validar cédula en tiempo real
      if (formattedValue && formattedValue.length > 0) {
        const cleanValue = cleanCedula(formattedValue);
        if (cleanValue.length === 8) {
          if (!validateCedula(cleanValue)) {
            setCedulaError('La cédula debe tener exactamente 8 dígitos');
          } else {
            setCedulaError(null);
          }
        } else if (cleanValue.length > 0) {
          setCedulaError('La cédula debe tener exactamente 8 dígitos');
        } else {
          setCedulaError(null);
        }
      } else {
        setCedulaError(null);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Validar formulario
  const validateForm = (): boolean => {
    if (!formData.NOMBRE.trim()) {
      setError('El nombre es obligatorio');
      return false;
    }

    // Validar cédula si se proporciona
    if (formData.cedula && formData.cedula.trim()) {
      const cleanCedulaValue = cleanCedula(formData.cedula);
      if (!validateCedula(cleanCedulaValue)) {
        setError('La cédula debe tener exactamente 8 dígitos');
        setCedulaError('La cédula debe tener exactamente 8 dígitos');
        return false;
      }
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

      // Preparar datos para envío, limpiando la cédula
      const dataToSend = {
        ...formData,
        cedula: formData.cedula
          ? cleanCedula(formData.cedula)
          : formData.cedula,
      };

      const response = await fetch('/api/clientes', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear el cliente');
      }

      const nuevoCliente = await response.json();

      setSuccess(true);
      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push(`/ciompi/clientes/${nuevoCliente._id}`);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AuthGuard>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Button
            component={Link}
            href="/ciompi/clientes"
            variant="outlined"
            sx={{ mb: 2 }}
          >
            ← Volver a la lista
          </Button>

          <Typography variant="h4" component="h1" gutterBottom>
            Nuevo Cliente
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Completa los datos del nuevo cliente
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
                  label="Nombre completo "
                  name="NOMBRE"
                  value={formData.NOMBRE}
                  onChange={handleChange}
                  required
                  sx={{ mb: 2 }}
                />
              </Grid>

              {/* Información Personal */}
              <Grid size={{ xs: 12 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ color: 'primary.main', mt: 2 }}
                >
                  Información Personal
                </Typography>
                <Divider sx={{ mb: 3 }} />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Cédula"
                  name="cedula"
                  value={formData.cedula}
                  onChange={handleChange}
                  error={!!cedulaError}
                  helperText={cedulaError || 'Formato: 1.234.567-8'}
                  placeholder="12345678"
                  inputProps={{
                    maxLength: 12, // #.###.###-# = 12 caracteres
                  }}
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Profesión"
                  name="profesion"
                  value={formData.profesion}
                  onChange={handleChange}
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
                  name="TELEFONO"
                  value={formData.TELEFONO}
                  onChange={handleChange}
                  sx={{ mb: 2 }}
                  placeholder="Ej: 3001234567"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Correo Electrónico"
                  name="correo"
                  type="email"
                  value={formData.correo}
                  onChange={handleChange}
                  sx={{ mb: 2 }}
                  placeholder="ejemplo@correo.com"
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Dirección"
                  name="DIRECCION"
                  value={formData.DIRECCION}
                  onChange={handleChange}
                  multiline
                  rows={3}
                  sx={{ mb: 2 }}
                />
              </Grid>

              {/* Botones de acción */}
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 2 }} />
                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    justifyContent: 'flex-end',
                    flexWrap: 'wrap',
                  }}
                >
                  <Button
                    component={Link}
                    href="/ciompi/clientes"
                    variant="outlined"
                    disabled={saving}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={saving}
                    sx={{ minWidth: 120 }}
                  >
                    {saving ? <CircularProgress size={24} /> : 'Crear Cliente'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>

        {/* Mensajes de feedback */}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        <Snackbar
          open={success}
          autoHideDuration={6000}
          onClose={() => setSuccess(false)}
          message="Cliente creado correctamente"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        />
      </Container>
    </AuthGuard>
  );
}
