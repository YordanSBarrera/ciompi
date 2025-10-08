'use client';
import { blanco, grisClaro, grisMedio } from '@/lib/color';
import { ClienteType, ClienteFormType } from '@/lib/types';
import { validateCedula, handleCedulaInput, cleanCedula } from '@/lib/utils';
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
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function EditarClientePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [cliente, setCliente] = useState<ClienteType | null>(null);
  const [formData, setFormData] = useState<ClienteFormType>({
    NOMBRE: '',
    cedula: '',
    correo: '',
    profesion: '',
    DIRECCION: '',
    CODCLI: '',
    TELEFONO: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [cedulaError, setCedulaError] = useState<string | null>(null);

  // Cargar datos del cliente
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
        setFormData({
          NOMBRE: data.NOMBRE || '',
          cedula: data.cedula ? handleCedulaInput(data.cedula) : '',
          correo: data.correo || '',
          profesion: data.profesion || '',
          DIRECCION: data.DIRECCION || '',
          CODCLI: data.CODCLI || '',
          TELEFONO: data.TELEFONO || '',
        });
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
    if (!formData.CODCLI.trim()) {
      setError('El código de cliente es obligatorio');
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

      const response = await fetch(`/ciompi/api/clientes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar el cliente');
      }

      setSuccess(true);
      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push(`/ciompi/clientes/${id}`);
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

  if (error && !cliente) {
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
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Button
            component={Link}
            href={`/ciompi/clientes/${id}`}
            variant="outlined"
            sx={{ mb: 2 }}
          >
            ← Volver a detalles
          </Button>

          <Typography variant="h4" component="h1" gutterBottom>
            Editar Cliente
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Editando: {cliente.NOMBRE}
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
                  label="Nombre *"
                  name="NOMBRE"
                  value={formData.NOMBRE}
                  onChange={handleChange}
                  required
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Código de Cliente *"
                  name="CODCLI"
                  value={formData.CODCLI}
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
                    href={`/ciompi/clientes/${id}`}
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
                    {saving ? (
                      <CircularProgress size={24} />
                    ) : (
                      'Guardar Cambios'
                    )}
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
          message="Cliente actualizado correctamente"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        />
      </Container>
    </AuthGuard>
  );
}
