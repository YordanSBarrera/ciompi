'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Avatar,
  Divider,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Work as WorkIcon,
  Security as SecurityIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { Usuario } from '@/lib/types';
import AuthGuard from '@/app/components/AuthGuard';
import {
  azulBase,
  azulClaro,
  azulOscuro,
  blanco,
  grisClaro,
  grisMedio,
  grisTexto,
  naranja,
  turquesa,
} from '@/lib/color';

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

  const usuarioId = params.id as string;

  useEffect(() => {
    const cargarDatosUsuario = async () => {
      try {
        setLoading(true);
        setError(null);
        const datosUsuario = await cargarUsuario(usuarioId);
        setUsuario(datosUsuario);
      } catch (err) {
        setError('Error al cargar los datos del usuario');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (usuarioId) {
      cargarDatosUsuario();
    }
  }, [usuarioId]);

  const handleEditar = () => {
    router.push(`/ciompi/usuario/${usuarioId}/editar`);
  };

  const handleVolver = () => {
    router.push('/ciompi/usuario');
  };

  const getRolColor = (rol: string) => {
    switch (rol) {
      case 'admin':
        return 'error';
      case 'Administrativo':
        return 'warning';
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
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !usuario) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Usuario no encontrado'}
        </Alert>
        <Button onClick={handleVolver} variant="outlined">
          Volver
        </Button>
      </Box>
    );
  }

  return (
    <AuthGuard>
      <Box sx={{ maxWidth: 1000, margin: '0 auto', p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleVolver}
            sx={{ mb: 2 }}
          >
            Volver
          </Button>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="h4" component="h1" sx={{ color: azulOscuro }}>
              Detalles del Usuario
            </Typography>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleEditar}
              sx={{ bgcolor: azulBase }}
            >
              Editar
            </Button>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* Información Principal */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      bgcolor: azulBase,
                      fontSize: '2rem',
                      mr: 3,
                    }}
                  >
                    {usuario.nombre?.charAt(0) || <PersonIcon />}
                  </Avatar>
                  <Box>
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 600, color: azulOscuro }}
                    >
                      {usuario.nombre}
                    </Typography>
                    <Typography variant="subtitle1" color={grisTexto}>
                      {usuario.usuario}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Chip
                        label={usuario.rol}
                        color={getRolColor(usuario.rol)}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Chip
                        label={usuario.estado}
                        color={getEstadoColor(usuario.estado)}
                        size="small"
                      />
                    </Box>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <EmailIcon sx={{ color: azulBase, mr: 1 }} />
                      <Box>
                        <Typography variant="caption" color={grisTexto}>
                          Email
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {usuario.email}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <WorkIcon sx={{ color: azulBase, mr: 1 }} />
                      <Box>
                        <Typography variant="caption" color={grisTexto}>
                          Cargo
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {usuario.cargo || 'No especificado'}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Información Adicional */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ color: azulBase, mb: 2 }}>
                  Información del Sistema
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <SecurityIcon sx={{ color: azulBase, mr: 1 }} />
                  <Box>
                    <Typography variant="caption" color={grisTexto}>
                      ID del Usuario
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: 'monospace' }}
                    >
                      {usuario._id}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CalendarIcon sx={{ color: azulBase, mr: 1 }} />
                  <Box>
                    <Typography variant="caption" color={grisTexto}>
                      Fecha de Creación
                    </Typography>
                    <Typography variant="body2">
                      {usuario.fechaCreacion
                        ? new Date(usuario.fechaCreacion).toLocaleDateString(
                            'es-ES'
                          )
                        : 'No disponible'}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CalendarIcon sx={{ color: azulBase, mr: 1 }} />
                  <Box>
                    <Typography variant="caption" color={grisTexto}>
                      Última Actualización
                    </Typography>
                    <Typography variant="body2">
                      {usuario.fechaActualizacion
                        ? new Date(
                            usuario.fechaActualizacion
                          ).toLocaleDateString('es-ES')
                        : 'No disponible'}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </AuthGuard>
  );
}
