'use client';
import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Person as PersonIcon,
  Lock as LockIcon,
  Badge as BadgeIcon,
} from '@mui/icons-material';
import {
  azulBase,
  azulClaro,
  azulOscuro,
  blanco,
  grisMedio,
  grisTexto,
  naranja,
  turquesa,
  coral1,
} from '@/lib/color';
import imgLocal from '@/public/ciompiLocal.webp';

interface LoginForm {
  usuario: string;
  password: string;
  rememberMe: boolean;
}

interface UserLoginProps {
  onLoginSuccess?: () => void;
}

export default function UserLogin({ onLoginSuccess }: UserLoginProps) {
  const [formData, setFormData] = useState<LoginForm>({
    usuario: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange =
    (field: keyof LoginForm) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value =
        field === 'rememberMe' ? event.target.checked : event.target.value;
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
      // Limpiar error cuando el usuario empiece a escribir
      if (error) setError('');
    };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    // Validaciones básicas
    if (!formData.usuario || !formData.password) {
      setError('Por favor, completa todos los campos');
      setLoading(false);
      return;
    }

    if (formData.usuario.length < 3) {
      setError('El usuario debe tener al menos 3 caracteres');
      setLoading(false);
      return;
    }

    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Aquí iría tu lógica real de autenticación
      console.log('Login attempt:', {
        usuario: formData.usuario,
        password: '***',
      });

      // Simular éxito
      onLoginSuccess?.();
    } catch (err) {
      setError('Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        //   minHeight: '100vh',
        //   background: `linear-gradient(135deg, ${azulBase} 0%, ${azulOscuro} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // p: 2,

        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: `url(${imgLocal.src})`,
        backgroundPosition: 'top center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(255, 255, 255, 0.5)', // 50% de transparencia
          backdropFilter: 'blur(1px)', // Opcional: efecto de desenfoque sutil
        },
      }}
    >
      <Paper
        elevation={8}
        sx={{
          maxWidth: 400,
          width: '100%',
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
          <Box
            sx={{
              width: 80,
              height: 80,
              background: `linear-gradient(135deg, ${azulBase} 0%, ${turquesa} 100%)`,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: blanco,
            }}
          >
            <PersonIcon sx={{ fontSize: 40 }} />
          </Box>

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
            Iniciar Sesión
          </Typography>

          <Typography variant="body1" color={grisTexto}>
            Ingresa tus credenciales
          </Typography>
        </Box>

        {/* Formulario */}
        <Box component="form" onSubmit={handleSubmit} noValidate>
          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 2,
                borderRadius: 2,
                border: `1px solid ${coral1}20`,
              }}
            >
              {error}
            </Alert>
          )}

          {/* Campo Usuario */}
          <TextField
            fullWidth
            label="Usuario"
            value={formData.usuario}
            onChange={handleChange('usuario')}
            margin="normal"
            variant="outlined"
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <BadgeIcon sx={{ color: grisTexto }} />
                </InputAdornment>
              ),
            }}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover fieldset': {
                  borderColor: azulClaro,
                },
                '&.Mui-focused fieldset': {
                  borderColor: azulBase,
                },
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: azulBase,
              },
            }}
            placeholder="Ingresa tu usuario"
          />

          {/* Campo Contraseña */}
          <TextField
            fullWidth
            label="Contraseña"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange('password')}
            margin="normal"
            variant="outlined"
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon sx={{ color: grisTexto }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    sx={{ color: grisTexto }}
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover fieldset': {
                  borderColor: azulClaro,
                },
                '&.Mui-focused fieldset': {
                  borderColor: azulBase,
                },
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: azulBase,
              },
            }}
            placeholder="Ingresa tu contraseña"
          />

          {/* Checkbox Recordarme */}
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.rememberMe}
                onChange={handleChange('rememberMe')}
                sx={{
                  color: azulBase,
                  '&.Mui-checked': {
                    color: azulBase,
                  },
                }}
              />
            }
            label="Recordar usuario"
            sx={{
              color: grisTexto,
              mb: 3,
              display: 'block',
            }}
          />

          {/* Botón de Login */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1.1rem',
              fontWeight: 600,
              background: `linear-gradient(45deg, ${azulBase} 0%, ${azulClaro} 100%)`,
              boxShadow: `0 4px 15px ${azulBase}40`,
              '&:hover': {
                background: `linear-gradient(45deg, ${azulOscuro} 0%, ${azulBase} 100%)`,
                boxShadow: `0 6px 20px ${azulBase}60`,
                transform: 'translateY(-1px)',
              },
              '&:disabled': {
                background: grisMedio,
                color: grisTexto,
              },
              transition: 'all 0.3s ease',
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: blanco }} />
            ) : (
              'Iniciar Sesión'
            )}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
