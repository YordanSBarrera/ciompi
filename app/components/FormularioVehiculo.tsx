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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Divider,
  Chip,
  Avatar,
  Fade,
  Slide,
  InputAdornment,
  IconButton,
  LinearProgress,
  Collapse,
  Zoom,
  Grow,
} from '@mui/material';
import {
  DirectionsCar as CarIcon,
  Palette as ColorIcon,
  CalendarToday as YearIcon,
  Description as DescriptionIcon,
  ConfirmationNumber as LicenseIcon,
  Build as BuildIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Edit as EditIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { VehiculoType, VehiculoFormType } from '@/lib/types';
import {
  azulBase,
  azulOscuro,
  azulClaro,
  blanco,
  grisMedio,
  verde,
  grisTexto,
} from '@/lib/color';

interface FormularioVehiculoProps {
  open: boolean;
  onClose: () => void;
  onSave: (
    vehiculoData: VehiculoFormType
  ) => Promise<{ success: boolean; error?: string }>;
  vehiculo?: VehiculoType | null;
  title: string;
}

const marcasComunes = [
  'Toyota',
  'Honda',
  'Ford',
  'Chevrolet',
  'Nissan',
  'Hyundai',
  'Kia',
  'Volkswagen',
  'BMW',
  'Mercedes-Benz',
  'Audi',
  'Mazda',
  'Subaru',
  'Mitsubishi',
  'Suzuki',
  'Peugeot',
  'Renault',
  'Fiat',
  'Volvo',
  'Jeep',
];

const coloresComunes = [
  'Blanco',
  'Negro',
  'Gris',
  'Plateado',
  'Azul',
  'Rojo',
  'Verde',
  'Amarillo',
  'Naranja',
  'Marrón',
  'Beige',
  'Dorado',
  'Violeta',
  'Rojo Oscuro',
  'Verde Oscuro',
  'Azul Oscuro',
  'Gris Oscuro',
];

export default function FormularioVehiculo({
  open,
  onClose,
  onSave,
  vehiculo,
  title,
}: FormularioVehiculoProps) {
  const [formData, setFormData] = useState<VehiculoFormType>({
    Marca: '',
    Modelo: '',
    Matricula: '',
    Padron: undefined,
    Descripcion: '',
    Año: undefined,
    Color: '',
  });

  const [errors, setErrors] = useState<Partial<VehiculoFormType>>({});
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    if (vehiculo) {
      setFormData({
        Marca: vehiculo.Marca || '',
        Modelo: vehiculo.Modelo || '',
        Matricula: vehiculo.Matricula || '',
        Padron: vehiculo.Padron || undefined,
        Descripcion: vehiculo.Descripcion || '',
        Año: vehiculo.Año || undefined,
        Color: vehiculo.Color || '',
      });
    } else {
      setFormData({
        Marca: '',
        Modelo: '',
        Matricula: '',
        Padron: undefined,
        Descripcion: '',
        Año: undefined,
        Color: '',
      });
    }
    setErrors({});
  }, [vehiculo, open]);

  const validateForm = (): boolean => {
    const newErrors: Partial<VehiculoFormType> = {};

    // Validación de marca
    if (!formData.Marca.trim()) {
      newErrors.Marca = 'La marca es requerida';
    } else if (formData.Marca.trim().length < 2) {
      newErrors.Marca = 'La marca debe tener al menos 2 caracteres';
    } else if (formData.Marca.trim().length > 50) {
      newErrors.Marca = 'La marca no puede exceder 50 caracteres';
    }

    // Validación de modelo
    if (!formData.Modelo.trim()) {
      newErrors.Modelo = 'El modelo es requerido';
    } else if (formData.Modelo.trim().length < 1) {
      newErrors.Modelo = 'El modelo debe tener al menos 1 carácter';
    } else if (formData.Modelo.trim().length > 50) {
      newErrors.Modelo = 'El modelo no puede exceder 50 caracteres';
    }

    // Validación de matrícula
    if (!formData.Matricula.trim()) {
      newErrors.Matricula = 'La matrícula es requerida';
    } else {
      const matriculaRegex = /^[A-Z0-9-]{3,10}$/;
      if (!matriculaRegex.test(formData.Matricula.trim())) {
        newErrors.Matricula =
          'La matrícula debe tener entre 3 y 10 caracteres alfanuméricos y guiones';
      }
    }

    // Validación de año
    if (formData.Año) {
      const currentYear = new Date().getFullYear();
      if (formData.Año < 1900 || formData.Año > currentYear + 1) {
        newErrors.Año =
          `El año debe estar entre 1900 y ${currentYear + 1}` as any;
      }
    }

    // Validación de padrón
    if (formData.Padron !== undefined && formData.Padron !== null) {
      if (formData.Padron < 0) {
        newErrors.Padron = 'El padrón debe ser un número positivo' as any;
      } else if (formData.Padron > 999999999) {
        newErrors.Padron = 'El padrón no puede exceder 999,999,999' as any;
      }
    }

    // Validación de descripción
    if (formData.Descripcion && formData.Descripcion.length > 500) {
      newErrors.Descripcion = 'La descripción no puede exceder 500 caracteres';
    }

    // Validación de color
    if (formData.Color && formData.Color.length > 30) {
      newErrors.Color = 'El color no puede exceder 30 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof VehiculoFormType, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }

    // Validación en tiempo real para algunos campos
    if (field === 'Matricula' && value) {
      const matriculaRegex = /^[A-Z0-9-]{3,10}$/;
      if (!matriculaRegex.test(value.trim())) {
        setErrors(prev => ({
          ...prev,
          Matricula:
            'Formato inválido. Use letras, números y guiones (3-10 caracteres)',
        }));
      }
    }

    if (field === 'Año' && value) {
      const currentYear = new Date().getFullYear();
      if (value < 1900 || value > currentYear + 1) {
        setErrors(prev => ({
          ...prev,
          Año: `El año debe estar entre 1900 y ${currentYear + 1}` as any,
        }));
      }
    }

    if (field === 'Padron' && value !== undefined && value !== null) {
      if (value < 0) {
        setErrors(prev => ({
          ...prev,
          Padron: 'El padrón debe ser un número positivo' as any,
        }));
      } else if (value > 999999999) {
        setErrors(prev => ({
          ...prev,
          Padron: 'El padrón no puede exceder 999,999,999' as any,
        }));
      }
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
          message: vehiculo
            ? 'Vehículo actualizado exitosamente'
            : 'Vehículo creado exitosamente',
          severity: 'success',
        });
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        setSnackbar({
          open: true,
          message: result.error || 'Error al guardar vehículo',
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

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: { xs: 0, sm: 3 },
            boxShadow: { xs: 'none', sm: '0 20px 40px rgba(0,0,0,0.15)' },
            overflow: 'hidden',
            minHeight: { xs: '100vh', sm: '600px' },
            maxHeight: { xs: '100vh', sm: '90vh' },
            margin: { xs: 0, sm: 2 },
            width: { xs: '100%', sm: 'auto' },
            height: { xs: '100%', sm: 'auto' },
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
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
                {vehiculo ? (
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
                  {vehiculo
                    ? 'Modifica los datos del vehículo'
                    : 'Completa la información del nuevo vehículo'}
                </Typography>
              </Box>
            </Grow>
          </Box>

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

            {/* Información Básica */}
            <Fade in={open} timeout={600}>
              <div>
                <Card
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
                  <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
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
                        <CarIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
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
                          Información Básica
                        </Typography>
                        <Typography variant="body2" sx={{ color: grisTexto }}>
                          Datos principales del vehículo
                        </Typography>
                      </Box>
                    </Box>
                    <Divider
                      sx={{
                        mb: { xs: 3, sm: 4 },
                        borderColor: 'rgba(0,0,0,0.08)',
                      }}
                    />

                    <Grid container spacing={{ xs: 2, sm: 3 }}>
                      {/* Marca */}
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FormControl
                          fullWidth
                          error={!!errors.Marca}
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
                          }}
                        >
                          <InputLabel sx={{ fontWeight: 600 }}>
                            Marca *
                          </InputLabel>
                          <Select
                            value={formData.Marca}
                            onChange={e =>
                              handleInputChange('Marca', e.target.value)
                            }
                            label="Marca *"
                            startAdornment={
                              <InputAdornment position="start">
                                <BuildIcon sx={{ color: azulBase }} />
                              </InputAdornment>
                            }
                          >
                            {marcasComunes.map(marca => (
                              <MenuItem
                                key={marca}
                                value={marca}
                                sx={{ py: 1.5 }}
                              >
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                  }}
                                >
                                  <Chip
                                    label={marca.charAt(0)}
                                    size="small"
                                    sx={{
                                      backgroundColor: azulBase,
                                      color: blanco,
                                      fontWeight: 600,
                                      width: 32,
                                      height: 32,
                                    }}
                                  />
                                  <Typography sx={{ fontWeight: 500 }}>
                                    {marca}
                                  </Typography>
                                </Box>
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <Collapse in={!!errors.Marca}>
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
                              {errors.Marca}
                            </Typography>
                          </Box>
                        </Collapse>
                        {!errors.Marca && formData.Marca && (
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
                              Marca válida
                            </Typography>
                          </Box>
                        )}
                      </Grid>

                      {/* Modelo */}
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          label="Modelo *"
                          value={formData.Modelo}
                          onChange={e =>
                            handleInputChange('Modelo', e.target.value)
                          }
                          error={!!errors.Modelo}
                          helperText={
                            errors.Modelo || `${formData.Modelo.length}/50`
                          }
                          inputProps={{ maxLength: 50 }}
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
                                <CarIcon sx={{ color: azulBase }} />
                              </InputAdornment>
                            ),
                          }}
                        />
                        <Collapse in={!!errors.Modelo}>
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
                              {errors.Modelo}
                            </Typography>
                          </Box>
                        </Collapse>
                        {!errors.Modelo && formData.Modelo && (
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
                              Modelo válido
                            </Typography>
                          </Box>
                        )}
                      </Grid>

                      {/* Matrícula */}
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          label="Matrícula *"
                          value={formData.Matricula}
                          onChange={e =>
                            handleInputChange(
                              'Matricula',
                              e.target.value.toUpperCase()
                            )
                          }
                          error={!!errors.Matricula}
                          helperText={
                            errors.Matricula ||
                            `${formData.Matricula.length}/10`
                          }
                          placeholder="ABC-1234"
                          inputProps={{ maxLength: 10 }}
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
                                <LicenseIcon sx={{ color: azulBase }} />
                              </InputAdornment>
                            ),
                          }}
                        />
                        <Collapse in={!!errors.Matricula}>
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
                              {errors.Matricula}
                            </Typography>
                          </Box>
                        </Collapse>
                        {!errors.Matricula && formData.Matricula && (
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
                              Matrícula válida
                            </Typography>
                          </Box>
                        )}
                      </Grid>

                      {/* Año */}
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FormControl
                          fullWidth
                          error={!!errors.Año}
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
                          }}
                        >
                          <InputLabel sx={{ fontWeight: 600 }}>Año</InputLabel>
                          <Select
                            value={formData.Año || ''}
                            onChange={e =>
                              handleInputChange(
                                'Año',
                                e.target.value
                                  ? Number(e.target.value)
                                  : undefined
                              )
                            }
                            label="Año"
                            startAdornment={
                              <InputAdornment position="start">
                                <YearIcon sx={{ color: azulBase }} />
                              </InputAdornment>
                            }
                          >
                            {years.map(year => (
                              <MenuItem
                                key={year}
                                value={year}
                                sx={{ py: 1.5 }}
                              >
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                  }}
                                >
                                  <Chip
                                    label={year}
                                    size="small"
                                    sx={{
                                      backgroundColor:
                                        year >= currentYear - 5
                                          ? verde
                                          : grisMedio,
                                      color: blanco,
                                      fontWeight: 600,
                                      width: 48,
                                      height: 28,
                                    }}
                                  />
                                  <Typography sx={{ fontWeight: 500 }}>
                                    {year >= currentYear - 5
                                      ? `${year} (Reciente)`
                                      : year}
                                  </Typography>
                                </Box>
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <Collapse in={!!errors.Año}>
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
                              {errors.Año}
                            </Typography>
                          </Box>
                        </Collapse>
                        {!errors.Año && formData.Año && (
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
                              Año válido
                            </Typography>
                          </Box>
                        )}
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </div>
            </Fade>

            {/* Información Adicional */}
            <Fade in={open} timeout={800}>
              <div>
                <Card
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
                      background: `linear-gradient(90deg, ${verde} 0%, ${azulClaro} 100%)`,
                    },
                  }}
                >
                  <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
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
                          backgroundColor: verde,
                          mr: { xs: 0, sm: 3 },
                          mb: { xs: 2, sm: 0 },
                          width: { xs: 40, sm: 48 },
                          height: { xs: 40, sm: 48 },
                          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                        }}
                      >
                        <ColorIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
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
                          Información Adicional
                        </Typography>
                        <Typography variant="body2" sx={{ color: grisTexto }}>
                          Detalles complementarios del vehículo
                        </Typography>
                      </Box>
                    </Box>
                    <Divider
                      sx={{
                        mb: { xs: 3, sm: 4 },
                        borderColor: 'rgba(0,0,0,0.08)',
                      }}
                    />

                    <Grid container spacing={{ xs: 2, sm: 3 }}>
                      {/* Color */}
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FormControl
                          fullWidth
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
                                boxShadow: `0 0 0 2px ${verde}20`,
                              },
                            },
                          }}
                        >
                          <InputLabel sx={{ fontWeight: 600 }}>
                            Color
                          </InputLabel>
                          <Select
                            value={formData.Color}
                            onChange={e =>
                              handleInputChange('Color', e.target.value)
                            }
                            label="Color"
                            startAdornment={
                              <InputAdornment position="start">
                                <ColorIcon sx={{ color: verde }} />
                              </InputAdornment>
                            }
                          >
                            {coloresComunes.map(color => {
                              const getColorValue = (colorName: string) => {
                                const colorMap: { [key: string]: string } = {
                                  Blanco: '#FFFFFF',
                                  Negro: '#000000',
                                  Gris: '#808080',
                                  Plateado: '#C0C0C0',
                                  Azul: '#0000FF',
                                  Rojo: '#FF0000',
                                  Verde: '#00FF00',
                                  Amarillo: '#FFFF00',
                                  Naranja: '#FFA500',
                                  Marrón: '#8B4513',
                                  Beige: '#F5F5DC',
                                  Dorado: '#FFD700',
                                  Violeta: '#8A2BE2',
                                  'Rojo Oscuro': '#8B0000',
                                  'Verde Oscuro': '#006400',
                                  'Azul Oscuro': '#000080',
                                  'Gris Oscuro': '#696969',
                                };
                                return (
                                  colorMap[colorName] || colorName.toLowerCase()
                                );
                              };

                              return (
                                <MenuItem
                                  key={color}
                                  value={color}
                                  sx={{ py: 1.5 }}
                                >
                                  <Box
                                    display="flex"
                                    alignItems="center"
                                    gap={2}
                                  >
                                    <Box
                                      width={24}
                                      height={24}
                                      borderRadius="50%"
                                      sx={{
                                        backgroundColor: getColorValue(color),
                                        border:
                                          color === 'Blanco'
                                            ? '2px solid #ccc'
                                            : '2px solid rgba(0,0,0,0.1)',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                      }}
                                    />
                                    <Typography sx={{ fontWeight: 500 }}>
                                      {color}
                                    </Typography>
                                  </Box>
                                </MenuItem>
                              );
                            })}
                          </Select>
                        </FormControl>
                        {formData.Color && (
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
                              Color seleccionado
                            </Typography>
                          </Box>
                        )}
                      </Grid>

                      {/* Padrón */}
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          label="Padrón"
                          type="number"
                          value={formData.Padron || ''}
                          onChange={e =>
                            handleInputChange(
                              'Padron',
                              e.target.value
                                ? Number(e.target.value)
                                : undefined
                            )
                          }
                          error={!!errors.Padron}
                          helperText={errors.Padron}
                          placeholder="123456"
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
                                boxShadow: `0 0 0 2px ${verde}20`,
                              },
                            },
                            '& .MuiInputLabel-root': {
                              fontWeight: 600,
                            },
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <InfoIcon sx={{ color: verde }} />
                              </InputAdornment>
                            ),
                          }}
                        />
                        <Collapse in={!!errors.Padron}>
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
                              {errors.Padron}
                            </Typography>
                          </Box>
                        </Collapse>
                        {!errors.Padron && formData.Padron && (
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
                              Padrón válido
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
                          value={formData.Descripcion}
                          onChange={e =>
                            handleInputChange('Descripcion', e.target.value)
                          }
                          error={!!errors.Descripcion}
                          helperText={
                            errors.Descripcion ||
                            `${formData.Descripcion?.length || 0}/500`
                          }
                          placeholder="Detalles adicionales del vehículo..."
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
                                boxShadow: `0 0 0 2px ${verde}20`,
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
                                <DescriptionIcon sx={{ color: verde }} />
                              </InputAdornment>
                            ),
                          }}
                        />
                        <Collapse in={!!errors.Descripcion}>
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
                              {errors.Descripcion}
                            </Typography>
                          </Box>
                        </Collapse>
                        {!errors.Descripcion && formData.Descripcion && (
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
                    </Grid>
                  </CardContent>
                </Card>
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
            startIcon={loading ? null : vehiculo ? <EditIcon /> : <SaveIcon />}
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
            ) : vehiculo ? (
              'Actualizar Vehículo'
            ) : (
              'Crear Vehículo'
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
            warning: <InfoIcon sx={{ fontSize: '1.2rem' }} />,
            info: <InfoIcon sx={{ fontSize: '1.2rem' }} />,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
