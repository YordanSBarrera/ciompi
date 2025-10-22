'use client';
import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  FormHelperText,
  Card,
  CardContent,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  Save as SaveIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
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
import { Usuario } from '@/lib/types';
import { Roles } from '@/lib/utils';

interface FormularioUsuarioProps {
  usuarioExistente?: Usuario;
  onSubmit: (usuarioData: Partial<Usuario>) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

export default function FormularioUsuario({
  usuarioExistente,
  onSubmit,
  onCancel,
  loading = false,
}: FormularioUsuarioProps) {
  const [formData, setFormData] = useState<Partial<Usuario>>({
    usuario: '',
    password: '',
    email: '',
    nombre: '',
    rol: Roles.Usuario,
    estado: 'activo',
    cargo: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const roleValues = Object.values(Roles);

  // Si es edición, cargar datos existentes
  useEffect(() => {
    if (usuarioExistente) {
      setFormData({
        usuario: usuarioExistente.usuario || '',
        password: '', // No mostrar password existente por seguridad
        email: usuarioExistente.email || '',
        nombre: usuarioExistente.nombre || '',
        rol: usuarioExistente.rol || 'Usuario',
        estado: usuarioExistente.estado || 'activo',
        cargo: usuarioExistente.cargo || '',
      });
    }
  }, [usuarioExistente]);

  const handleChange = (field: string) => (event: any) => {
    const value = event.target.value;

    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof Usuario] as any),
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }

    // Limpiar error del campo al modificar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSwitchChange =
    (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.checked;
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.usuario || formData.usuario.length < 3) {
      newErrors.usuario = 'El usuario debe tener al menos 3 caracteres';
    }

    if (!formData.password && !usuarioExistente) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.nombre || formData.nombre.length < 2) {
      newErrors.nombre = 'El nombre es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) return;

    try {
      // Preparar datos para envío
      const usuarioData: Partial<Usuario> = {
        usuario: formData.usuario,
        email: formData.email,
        nombre: formData.nombre,
        rol: formData.rol,
        estado: formData.estado,
        cargo: formData.cargo,
      };

      // Solo incluir password si se está creando un nuevo usuario o si se proporcionó uno nuevo
      if (!usuarioExistente || formData.password) {
        usuarioData.password = formData.password;
      }

      await onSubmit(usuarioData);
      setSuccessMessage(
        usuarioExistente
          ? 'Usuario actualizado exitosamente'
          : 'Usuario creado exitosamente'
      );

      // Limpiar formulario si es creación nueva
      if (!usuarioExistente) {
        setFormData({
          usuario: '',
          password: '',
          email: '',
          nombre: '',
          rol: Roles.Usuario,
          estado: 'activo',
          cargo: '',
        });
      }
    } catch (error) {
      console.error('Error al guardar usuario:', error);
    }
  };

  const handleReset = () => {
    setFormData({
      usuario: '',
      password: '',
      email: '',
      nombre: '',
      rol: Roles.Usuario,
      estado: 'activo',
      cargo: '',
    });
    setErrors({});
    setSuccessMessage('');
  };

  return (
    <Box sx={{ maxWidth: 1000, margin: '0 auto', p: 3 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 3,
          background: blanco,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: `linear-gradient(90deg, ${naranja} 0%, ${turquesa} 100%)`,
          },
        }}
      >
        {/* Header */}
        <Box textAlign="center" mb={4}>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              color: azulOscuro,
              fontWeight: 700,
              background: `linear-gradient(45deg, ${azulOscuro} 30%, ${azulBase} 90%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {usuarioExistente ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
          </Typography>
          <Typography variant="body1" color={grisTexto}>
            Complete la información del usuario
          </Typography>
        </Box>

        {successMessage && (
          <Alert
            severity="success"
            sx={{
              mb: 3,
              borderRadius: 2,
              border: `1px solid ${turquesa}20`,
            }}
          >
            {successMessage}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={4}>
            {/* Información Básica */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                sx={{ background: grisClaro, border: `1px solid ${grisMedio}` }}
              >
                <CardContent>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                      color: azulBase,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <PersonIcon /> Información Básica
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        label="Nombre Completo *"
                        value={formData.nombre || ''}
                        onChange={handleChange('nombre')}
                        error={!!errors.nombre}
                        helperText={errors.nombre}
                        disabled={loading}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover fieldset': { borderColor: azulClaro },
                            '&.Mui-focused fieldset': { borderColor: azulBase },
                          },
                        }}
                      />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        label="Usuario *"
                        value={formData.usuario || ''}
                        onChange={handleChange('usuario')}
                        error={!!errors.usuario}
                        helperText={errors.usuario}
                        disabled={loading}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover fieldset': { borderColor: azulClaro },
                            '&.Mui-focused fieldset': { borderColor: azulBase },
                          },
                        }}
                      />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        label="Email *"
                        type="email"
                        value={formData.email || ''}
                        onChange={handleChange('email')}
                        error={!!errors.email}
                        helperText={errors.email}
                        disabled={loading}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <EmailIcon sx={{ color: grisTexto }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover fieldset': { borderColor: azulClaro },
                            '&.Mui-focused fieldset': { borderColor: azulBase },
                          },
                        }}
                      />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        label={
                          usuarioExistente
                            ? 'Nueva Contraseña (opcional)'
                            : 'Contraseña'
                        }
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password || ''}
                        onChange={handleChange('password')}
                        error={!!errors.password}
                        helperText={
                          usuarioExistente
                            ? 'Dejar vacío para mantener la contraseña actual'
                            : errors.password || 'Mínimo 6 caracteres'
                        }
                        required={!usuarioExistente}
                        disabled={loading}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                                sx={{ color: grisTexto }}
                              >
                                {showPassword ? (
                                  <VisibilityOffIcon />
                                ) : (
                                  <VisibilityIcon />
                                )}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover fieldset': { borderColor: azulClaro },
                            '&.Mui-focused fieldset': { borderColor: azulBase },
                          },
                        }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Configuración y Roles */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                sx={{ background: grisClaro, border: `1px solid ${grisMedio}` }}
              >
                <CardContent>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                      color: azulBase,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <BusinessIcon /> Configuración y Roles
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormControl fullWidth error={!!errors.rol}>
                        <InputLabel>Rol *</InputLabel>
                        <Select
                          value={formData.rol || 'usuario'}
                          onChange={handleChange('rol')}
                          label="Rol *"
                          disabled={loading}
                          sx={{ borderRadius: 2 }}
                        >
                          {roleValues.map(role => (
                            <MenuItem key={role} value={role}>
                              {role}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.rol && (
                          <FormHelperText>{errors.rol}</FormHelperText>
                        )}
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormControl fullWidth>
                        <InputLabel>Estado</InputLabel>
                        <Select
                          value={formData.estado || 'activo'}
                          onChange={handleChange('estado')}
                          label="Estado"
                          disabled={loading}
                          sx={{ borderRadius: 2 }}
                        >
                          <MenuItem value="activo">Activo</MenuItem>
                          <MenuItem value="inactivo">Inactivo</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Cargo"
                        value={formData.cargo || ''}
                        onChange={handleChange('cargo')}
                        disabled={loading}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover fieldset': { borderColor: azulClaro },
                            '&.Mui-focused fieldset': { borderColor: azulBase },
                          },
                        }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Botones de Acción */}
          <Box
            sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 4 }}
          >
            <Button
              variant="outlined"
              onClick={onCancel || handleReset}
              disabled={loading}
              startIcon={<ClearIcon />}
              sx={{
                px: 4,
                borderRadius: 2,
                textTransform: 'none',
                borderColor: grisMedio,
                color: grisTexto,
                '&:hover': {
                  borderColor: naranja,
                  color: naranja,
                },
              }}
            >
              {onCancel ? 'Cancelar' : 'Limpiar'}
            </Button>

            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={
                loading ? <CircularProgress size={20} /> : <SaveIcon />
              }
              sx={{
                px: 4,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                background: `linear-gradient(45deg, ${azulBase} 0%, ${azulClaro} 100%)`,
                boxShadow: `0 4px 15px ${azulBase}40`,
                '&:hover': {
                  background: `linear-gradient(45deg, ${azulOscuro} 0%, ${azulBase} 100%)`,
                  boxShadow: `0 6px 20px ${azulBase}60`,
                },
                '&:disabled': {
                  background: grisMedio,
                  color: grisTexto,
                },
              }}
            >
              {loading
                ? 'Guardando...'
                : usuarioExistente
                  ? 'Actualizar Usuario'
                  : 'Crear Usuario'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
