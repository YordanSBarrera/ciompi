'use client';
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  Alert,
  Snackbar,
  Avatar,
  Fade,
  Slide,
  Paper,
  InputAdornment,
  Tooltip,
  IconButton,
  LinearProgress,
  Collapse,
  Zoom,
  Grow,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Description as DescriptionIcon,
  Phone as PhoneIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Edit as EditIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { EmpresaType, EmpresaFormType } from '@/lib/types';
import {
  azulBase,
  azulOscuro,
  azulClaro,
  blanco,
  grisClaro,
  grisMedio,
  verde,
  naranja,
} from '@/lib/color';

interface FormularioEmpresaProps {
  open: boolean;
  onClose: () => void;
  onSave: (
    empresaData: EmpresaFormType
  ) => Promise<{ success: boolean; error?: string }>;
  empresa?: EmpresaType | null;
  title: string;
}

export default function FormularioEmpresa({
  open,
  onClose,
  onSave,
  empresa,
  title,
}: FormularioEmpresaProps) {
  const [formData, setFormData] = useState<EmpresaFormType>({
    nombre: '',
    descripcion: '',
    telefono: '',
  });

  const [errors, setErrors] = useState<Partial<EmpresaFormType>>({});
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    if (empresa) {
      setFormData({
        nombre: empresa.nombre || '',
        descripcion: empresa.descripcion || '',
        telefono: empresa.telefono || '',
      });
    } else {
      setFormData({
        nombre: '',
        descripcion: '',
        telefono: '',
      });
    }
    setErrors({});
  }, [empresa, open]);

  const validateForm = (): boolean => {
    const newErrors: Partial<EmpresaFormType> = {};

    // Validación de nombre
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre de la empresa es requerido';
    } else if (formData.nombre.trim().length < 2) {
      newErrors.nombre = 'El nombre debe tener al menos 2 caracteres';
    } else if (formData.nombre.trim().length > 100) {
      newErrors.nombre = 'El nombre no puede exceder 100 caracteres';
    }

    // Validación de descripción
    if (formData.descripcion && formData.descripcion.length > 500) {
      newErrors.descripcion = 'La descripción no puede exceder 500 caracteres';
    }

    // Validación de teléfono
    if (formData.telefono && formData.telefono.length > 20) {
      newErrors.telefono = 'El teléfono no puede exceder 20 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof EmpresaFormType, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const result = await onSave(formData);
      if (result.success) {
        setSnackbar({
          open: true,
          message: empresa
            ? 'Empresa actualizada exitosamente'
            : 'Empresa creada exitosamente',
          severity: 'success',
        });
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        setSnackbar({
          open: true,
          message: result.error || 'Error al guardar empresa',
          severity: 'error',
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error inesperado',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: { xs: 0, sm: 3 },
            boxShadow: { xs: 'none', sm: '0 20px 40px rgba(0,0,0,0.15)' },
            overflow: 'hidden',
            minHeight: { xs: '100vh', sm: '500px' },
            maxHeight: { xs: '100vh', sm: '90vh' },
            margin: { xs: 0, sm: 2 },
            width: { xs: '100%', sm: 'auto' },
            height: { xs: '100%', sm: 'auto' },
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        {/* Header mejorado con diseño moderno */}
        <DialogTitle
          sx={{
            background: `linear-gradient(135deg, ${azulBase} 0%, ${azulOscuro} 50%, ${azulClaro} 100%)`,
            color: blanco,
            fontWeight: 600,
            fontSize: '1.5rem',
            py: 4,
            px: 4,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)',
              pointerEvents: 'none',
            },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              position: 'relative',
              zIndex: 1,
            }}
          >
            <Zoom in={open} timeout={600}>
              <Avatar
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.25)',
                  width: 56,
                  height: 56,
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(255,255,255,0.3)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                }}
              >
                {empresa ? (
                  <EditIcon sx={{ fontSize: 28 }} />
                ) : (
                  <AddIcon sx={{ fontSize: 28 }} />
                )}
              </Avatar>
            </Zoom>

            <Grow in={open} timeout={800}>
              <Box>
                <Typography
                  variant="h4"
                  component="div"
                  sx={{ fontWeight: 700, mb: 0.5 }}
                >
                  {title}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ opacity: 0.9, fontSize: '1rem' }}
                >
                  {empresa
                    ? 'Modifica los datos de la empresa'
                    : 'Completa la información de la nueva empresa'}
                </Typography>
              </Box>
            </Grow>
          </Box>

          {/* Decoración de fondo mejorada */}
          <Box
            sx={{
              position: 'absolute',
              top: -40,
              right: -40,
              width: 120,
              height: 120,
              borderRadius: '50%',
              background:
                'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
              animation: 'float 6s ease-in-out infinite',
              '@keyframes float': {
                '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
                '50%': { transform: 'translateY(-20px) rotate(180deg)' },
              },
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: -50,
              left: -50,
              width: 100,
              height: 100,
              borderRadius: '50%',
              background:
                'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
              animation: 'float 8s ease-in-out infinite reverse',
            }}
          />

          <Zoom in={open} timeout={1000}>
            <IconButton
              onClick={onClose}
              sx={{
                position: 'absolute',
                top: 20,
                right: 20,
                color: blanco,
                backgroundColor: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                width: 48,
                height: 48,
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.25)',
                  transform: 'scale(1.05)',
                  transition: 'all 0.2s ease-in-out',
                },
              }}
            >
              <CloseIcon sx={{ fontSize: 24 }} />
            </IconButton>
          </Zoom>
        </DialogTitle>

        <DialogContent
          sx={{
            p: 0,
            backgroundColor: '#f8fafc',
            overflow: 'auto',
            flex: '1 1 auto',
          }}
        >
          <Box sx={{ p: { xs: 2, sm: 4 } }}>
            {/* Barra de progreso */}
            {loading && (
              <Fade in={loading}>
                <LinearProgress
                  sx={{
                    mb: 3,
                    borderRadius: 2,
                    height: 6,
                    backgroundColor: 'rgba(0,0,0,0.1)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: azulBase,
                    },
                  }}
                />
              </Fade>
            )}

            {/* Información de la Empresa */}
            <Fade in={open} timeout={600}>
              <div>
                <Paper
                  sx={{
                    mb: 4,
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                    border: '1px solid rgba(0,0,0,0.05)',
                    background:
                      'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    overflow: 'hidden',
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: `linear-gradient(90deg, ${azulBase} 0%, ${azulClaro} 100%)`,
                    },
                  }}
                >
                  <Box sx={{ p: { xs: 2, sm: 4 } }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mb: { xs: 3, sm: 4 },
                        flexDirection: { xs: 'column', sm: 'row' },
                        textAlign: { xs: 'center', sm: 'left' },
                      }}
                    >
                      <Avatar
                        sx={{
                          backgroundColor: azulBase,
                          mr: { xs: 0, sm: 3 },
                          mb: { xs: 2, sm: 0 },
                          width: { xs: 40, sm: 48 },
                          height: { xs: 40, sm: 48 },
                          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                        }}
                      >
                        <BusinessIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
                      </Avatar>
                      <Box>
                        <Typography
                          variant="h5"
                          sx={{
                            fontWeight: 700,
                            color: azulOscuro,
                            mb: 0.5,
                            fontSize: { xs: '1.25rem', sm: '1.5rem' },
                          }}
                        >
                          Información de la Empresa
                        </Typography>
                        <Typography variant="body2" sx={{ color: grisMedio }}>
                          Datos básicos de la empresa
                        </Typography>
                      </Box>
                    </Box>

                    <Grid container spacing={{ xs: 2, sm: 3 }}>
                      {/* Nombre */}
                      <Grid size={{ xs: 12 }}>
                        <TextField
                          fullWidth
                          label="Nombre de la Empresa *"
                          value={formData.nombre}
                          onChange={e =>
                            handleInputChange('nombre', e.target.value)
                          }
                          error={!!errors.nombre}
                          helperText={
                            errors.nombre || `${formData.nombre.length}/100`
                          }
                          inputProps={{ maxLength: 100 }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              backgroundColor: 'rgba(255,255,255,0.8)',
                              transition: 'all 0.2s ease-in-out',
                              '&:hover': {
                                backgroundColor: 'rgba(255,255,255,1)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                              },
                              '&.Mui-focused': {
                                backgroundColor: 'rgba(255,255,255,1)',
                                boxShadow: `0 0 0 2px ${azulBase}20`,
                              },
                            },
                            '& .MuiInputLabel-root': {
                              fontWeight: 600,
                            },
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <BusinessIcon sx={{ color: azulBase }} />
                              </InputAdornment>
                            ),
                          }}
                        />
                        <Collapse in={!!errors.nombre}>
                          <Box
                            sx={{
                              mt: 1,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            <ErrorIcon
                              sx={{ fontSize: 16, color: 'error.main' }}
                            />
                            <Typography
                              variant="caption"
                              color="error"
                              sx={{ fontWeight: 500 }}
                            >
                              {errors.nombre}
                            </Typography>
                          </Box>
                        </Collapse>
                        {!errors.nombre && formData.nombre && (
                          <Box
                            sx={{
                              mt: 1,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            <CheckIcon
                              sx={{ fontSize: 16, color: 'success.main' }}
                            />
                            <Typography
                              variant="caption"
                              sx={{ color: 'success.main', fontWeight: 500 }}
                            >
                              Nombre válido
                            </Typography>
                          </Box>
                        )}
                      </Grid>

                      {/* Descripción */}
                      <Grid size={{ xs: 12 }}>
                        <TextField
                          fullWidth
                          label="Descripción"
                          multiline
                          rows={3}
                          value={formData.descripcion}
                          onChange={e =>
                            handleInputChange('descripcion', e.target.value)
                          }
                          error={!!errors.descripcion}
                          helperText={
                            errors.descripcion ||
                            `${formData.descripcion?.length || 0}/500`
                          }
                          placeholder="Descripción de la empresa..."
                          inputProps={{ maxLength: 500 }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              backgroundColor: 'rgba(255,255,255,0.8)',
                              transition: 'all 0.2s ease-in-out',
                              '&:hover': {
                                backgroundColor: 'rgba(255,255,255,1)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                              },
                              '&.Mui-focused': {
                                backgroundColor: 'rgba(255,255,255,1)',
                                boxShadow: `0 0 0 2px ${azulBase}20`,
                              },
                            },
                            '& .MuiInputLabel-root': {
                              fontWeight: 600,
                            },
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment
                                position="start"
                                sx={{ alignSelf: 'flex-start', mt: 1 }}
                              >
                                <DescriptionIcon sx={{ color: azulBase }} />
                              </InputAdornment>
                            ),
                          }}
                        />
                        <Collapse in={!!errors.descripcion}>
                          <Box
                            sx={{
                              mt: 1,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            <ErrorIcon
                              sx={{ fontSize: 16, color: 'error.main' }}
                            />
                            <Typography
                              variant="caption"
                              color="error"
                              sx={{ fontWeight: 500 }}
                            >
                              {errors.descripcion}
                            </Typography>
                          </Box>
                        </Collapse>
                        {!errors.descripcion && formData.descripcion && (
                          <Box
                            sx={{
                              mt: 1,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            <CheckIcon
                              sx={{ fontSize: 16, color: 'success.main' }}
                            />
                            <Typography
                              variant="caption"
                              sx={{ color: 'success.main', fontWeight: 500 }}
                            >
                              Descripción válida
                            </Typography>
                          </Box>
                        )}
                      </Grid>

                      {/* Teléfono */}
                      <Grid size={{ xs: 12 }}>
                        <TextField
                          fullWidth
                          label="Teléfono"
                          value={formData.telefono}
                          onChange={e =>
                            handleInputChange('telefono', e.target.value)
                          }
                          error={!!errors.telefono}
                          helperText={
                            errors.telefono ||
                            `${formData.telefono?.length || 0}/20`
                          }
                          placeholder="Ej: +598 99 123 456"
                          inputProps={{ maxLength: 20 }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              backgroundColor: 'rgba(255,255,255,0.8)',
                              transition: 'all 0.2s ease-in-out',
                              '&:hover': {
                                backgroundColor: 'rgba(255,255,255,1)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                              },
                              '&.Mui-focused': {
                                backgroundColor: 'rgba(255,255,255,1)',
                                boxShadow: `0 0 0 2px ${azulBase}20`,
                              },
                            },
                            '& .MuiInputLabel-root': {
                              fontWeight: 600,
                            },
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <PhoneIcon sx={{ color: azulBase }} />
                              </InputAdornment>
                            ),
                          }}
                        />
                        <Collapse in={!!errors.telefono}>
                          <Box
                            sx={{
                              mt: 1,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            <ErrorIcon
                              sx={{ fontSize: 16, color: 'error.main' }}
                            />
                            <Typography
                              variant="caption"
                              color="error"
                              sx={{ fontWeight: 500 }}
                            >
                              {errors.telefono}
                            </Typography>
                          </Box>
                        </Collapse>
                        {!errors.telefono && formData.telefono && (
                          <Box
                            sx={{
                              mt: 1,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            <CheckIcon
                              sx={{ fontSize: 16, color: 'success.main' }}
                            />
                            <Typography
                              variant="caption"
                              sx={{ color: 'success.main', fontWeight: 500 }}
                            >
                              Teléfono válido
                            </Typography>
                          </Box>
                        )}
                      </Grid>
                    </Grid>
                  </Box>
                </Paper>
              </div>
            </Fade>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            p: { xs: 2, sm: 4 },
            gap: { xs: 1, sm: 2 },
            backgroundColor: '#f8fafc',
            borderTop: '1px solid rgba(0,0,0,0.08)',
            justifyContent: { xs: 'center', sm: 'space-between' },
            flexDirection: { xs: 'column', sm: 'row' },
            flex: '0 0 auto',
            minHeight: '80px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Button
            onClick={onClose}
            variant="outlined"
            disabled={loading}
            startIcon={<CloseIcon />}
            sx={{
              borderRadius: 2,
              px: { xs: 2, sm: 3 },
              py: { xs: 1, sm: 1.5 },
              fontWeight: 600,
              textTransform: 'none',
              fontSize: { xs: '0.9rem', sm: '1rem' },
              borderColor: grisMedio,
              color: grisMedio,
              backgroundColor: 'rgba(255,255,255,0.8)',
              width: { xs: '100%', sm: 'auto' },
              '&:hover': {
                borderColor: azulOscuro,
                color: azulOscuro,
                backgroundColor: 'rgba(255,255,255,1)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                transform: 'translateY(-1px)',
                transition: 'all 0.2s ease-in-out',
              },
              '&:disabled': {
                opacity: 0.6,
                transform: 'none',
              },
            }}
          >
            Cancelar
          </Button>

          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            startIcon={loading ? null : empresa ? <EditIcon /> : <SaveIcon />}
            sx={{
              borderRadius: 2,
              px: { xs: 3, sm: 4 },
              py: { xs: 1, sm: 1.5 },
              fontWeight: 700,
              textTransform: 'none',
              fontSize: { xs: '0.9rem', sm: '1rem' },
              backgroundColor: azulBase,
              background: `linear-gradient(135deg, ${azulBase} 0%, ${azulOscuro} 100%)`,
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              width: { xs: '100%', sm: 'auto' },
              '&:hover': {
                backgroundColor: azulOscuro,
                background: `linear-gradient(135deg, ${azulOscuro} 0%, ${azulBase} 100%)`,
                boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                transform: 'translateY(-2px)',
                transition: 'all 0.2s ease-in-out',
              },
              '&:disabled': {
                backgroundColor: grisMedio,
                background: grisMedio,
                boxShadow: 'none',
                transform: 'none',
                opacity: 0.7,
              },
              '&:active': {
                transform: 'translateY(0px)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              },
            }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    '@keyframes spin': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' },
                    },
                  }}
                />
                Guardando...
              </Box>
            ) : empresa ? (
              'Actualizar Empresa'
            ) : (
              'Crear Empresa'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificaciones mejorado */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        TransitionComponent={Slide}
        TransitionProps={{ direction: 'up' } as any}
        sx={{
          '& .MuiSnackbarContent-root': {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          },
        }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{
            width: '100%',
            borderRadius: 2,
            fontWeight: 600,
            fontSize: '0.95rem',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            '& .MuiAlert-icon': {
              fontSize: '1.2rem',
            },
            '& .MuiAlert-message': {
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            },
          }}
          iconMapping={{
            success: <CheckIcon sx={{ fontSize: '1.2rem' }} />,
            error: <ErrorIcon sx={{ fontSize: '1.2rem' }} />,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
